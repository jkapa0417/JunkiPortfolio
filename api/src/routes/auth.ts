import { Hono } from 'hono';
import { SignJWT, jwtVerify } from 'jose';

type Bindings = {
    DB: D1Database;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    JWT_SECRET: string;
    ADMIN_EMAILS: string;
    ENVIRONMENT: string;
};

type User = {
    id: string;
    provider: string;
    provider_id: string;
    name: string;
    email: string | null;
    avatar: string | null;
    is_admin: boolean;
    created_at: string;
};

export const auth = new Hono<{ Bindings: Bindings }>();

// Generate JWT token
async function generateToken(user: User, secret: string): Promise<string> {
    console.log('[Auth] Generating token for user:', user.id);
    console.log('[Auth] Using secret (masked):', secret.substring(0, 3) + '***');
    const secretKey = new TextEncoder().encode(secret);

    return await new SignJWT({
        sub: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isAdmin: user.is_admin,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secretKey);
}

// Verify JWT token
export async function verifyToken(token: string, secret: string) {
    try {
        const secretKey = new TextEncoder().encode(secret);
        const { payload } = await jwtVerify(token, secretKey);
        return payload;
    } catch {
        return null;
    }
}

// Generate unique user ID
function generateUserId(): string {
    return 'u_' + crypto.randomUUID().replace(/-/g, '').substring(0, 16);
}

// Check if email is admin
function isAdminEmail(email: string | null, adminEmails: string): boolean {
    if (!email) return false;
    const admins = adminEmails.split(',').map(e => e.trim().toLowerCase());
    return admins.includes(email.toLowerCase());
}

// Get current user info
auth.get('/me', async (c) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
        return c.json({ user: null });
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token, c.env.JWT_SECRET);

    if (!payload) {
        return c.json({ user: null });
    }

    return c.json({
        user: {
            id: payload.sub,
            name: payload.name,
            email: payload.email,
            avatar: payload.avatar,
            isAdmin: payload.isAdmin,
        }
    });
});

// GitHub OAuth: Get authorization URL
auth.get('/github', (c) => {
    const clientId = c.env.GITHUB_CLIENT_ID;
    const redirectUri = `${new URL(c.req.url).origin}/api/auth/github/callback`;

    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('scope', 'read:user user:email');

    return c.json({ url: url.toString() });
});

// GitHub OAuth: Callback
auth.get('/github/callback', async (c) => {
    const code = c.req.query('code');

    if (!code) {
        return c.json({ error: 'No code provided' }, 400);
    }

    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: c.env.GITHUB_CLIENT_ID,
                client_secret: c.env.GITHUB_CLIENT_SECRET,
                code,
            }),
        });

        const tokenData = await tokenResponse.json() as { access_token?: string; error?: string };

        if (tokenData.error || !tokenData.access_token) {
            return c.json({ error: 'Failed to get access token' }, 400);
        }

        // Get user info
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Accept': 'application/json',
            },
        });

        const githubUser = await userResponse.json() as {
            id: number;
            login: string;
            name: string | null;
            email: string | null;
            avatar_url: string;
        };

        // Get email if not public
        let email = githubUser.email;
        if (!email) {
            const emailsResponse = await fetch('https://api.github.com/user/emails', {
                headers: {
                    'Authorization': `Bearer ${tokenData.access_token}`,
                    'Accept': 'application/json',
                },
            });
            const emails = await emailsResponse.json() as Array<{ email: string; primary: boolean }>;
            email = emails.find(e => e.primary)?.email || null;
        }

        // Find or create user
        let user = await c.env.DB.prepare(
            'SELECT * FROM users WHERE provider = ? AND provider_id = ?'
        ).bind('github', githubUser.id.toString()).first<User>();

        if (!user) {
            const userId = generateUserId();
            const isAdmin = isAdminEmail(email, c.env.ADMIN_EMAILS);

            await c.env.DB.prepare(`
        INSERT INTO users (id, provider, provider_id, name, email, avatar, is_admin)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
                userId,
                'github',
                githubUser.id.toString(),
                githubUser.name || githubUser.login,
                email,
                githubUser.avatar_url,
                isAdmin
            ).run();

            user = {
                id: userId,
                provider: 'github',
                provider_id: githubUser.id.toString(),
                name: githubUser.name || githubUser.login,
                email,
                avatar: githubUser.avatar_url,
                is_admin: isAdmin,
                created_at: new Date().toISOString(),
            };
        }

        // Generate JWT
        const token = await generateToken(user, c.env.JWT_SECRET);

        // Redirect back to frontend with token
        const frontendUrl = c.env.ENVIRONMENT === 'production'
            ? 'https://junki-portfolio.com'
            : 'http://localhost:5173';

        return c.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
        console.error('GitHub OAuth error:', error);
        return c.json({ error: 'Authentication failed' }, 500);
    }
});

// Google OAuth: Get authorization URL
auth.get('/google', (c) => {
    const clientId = c.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${new URL(c.req.url).origin}/api/auth/google/callback`;

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('access_type', 'offline');

    return c.json({ url: url.toString() });
});

// Google OAuth: Callback
auth.get('/google/callback', async (c) => {
    const code = c.req.query('code');

    if (!code) {
        return c.json({ error: 'No code provided' }, 400);
    }

    try {
        const redirectUri = `${new URL(c.req.url).origin}/api/auth/google/callback`;

        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: c.env.GOOGLE_CLIENT_ID,
                client_secret: c.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });

        const tokenData = await tokenResponse.json() as { access_token?: string; id_token?: string; error?: string };

        if (tokenData.error || !tokenData.access_token) {
            return c.json({ error: 'Failed to get access token' }, 400);
        }

        // Get user info
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
        });

        const googleUser = await userResponse.json() as {
            id: string;
            name: string;
            email: string;
            picture: string;
        };

        // Find or create user
        let user = await c.env.DB.prepare(
            'SELECT * FROM users WHERE provider = ? AND provider_id = ?'
        ).bind('google', googleUser.id).first<User>();

        if (!user) {
            const userId = generateUserId();
            const isAdmin = isAdminEmail(googleUser.email, c.env.ADMIN_EMAILS);

            await c.env.DB.prepare(`
        INSERT INTO users (id, provider, provider_id, name, email, avatar, is_admin)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
                userId,
                'google',
                googleUser.id,
                googleUser.name,
                googleUser.email,
                googleUser.picture,
                isAdmin
            ).run();

            user = {
                id: userId,
                provider: 'google',
                provider_id: googleUser.id,
                name: googleUser.name,
                email: googleUser.email,
                avatar: googleUser.picture,
                is_admin: isAdmin,
                created_at: new Date().toISOString(),
            };
        }

        // Generate JWT
        const token = await generateToken(user, c.env.JWT_SECRET);

        // Redirect back to frontend with token
        const frontendUrl = c.env.ENVIRONMENT === 'production'
            ? 'https://junki-portfolio.com'
            : 'http://localhost:5173';

        return c.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
        console.error('Google OAuth error:', error);
        return c.json({ error: 'Authentication failed' }, 500);
    }
});

// Logout (client-side token removal)
auth.post('/logout', (c) => {
    return c.json({ success: true, message: 'Remove token from client storage' });
});
