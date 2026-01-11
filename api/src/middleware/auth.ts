import { Context, Next } from 'hono';
import * as jose from 'jose';

export const authMiddleware = async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const secretVal = c.env.JWT_SECRET || 'secret';
            console.log('[AuthMiddleware] Verifying token...');
            console.log('[AuthMiddleware] Secret used (masked):', secretVal.substring(0, 3) + '***');

            const secret = new TextEncoder().encode(secretVal);
            const { payload } = await jose.jwtVerify(token, secret);
            console.log('[AuthMiddleware] Payload verified:', payload.sub);

            if (payload && typeof payload.sub === 'string') {
                c.set('user', {
                    id: payload.sub,
                    name: payload.name,
                    avatar: payload.avatar,
                    isAdmin: !!payload.isAdmin
                });
            }
        } catch (e) {
            console.error('[AuthMiddleware] Verification failed:', e);
            console.error('[AuthMiddleware] Token start:', token.substring(0, 10));
        }
    } else {
        console.log('[AuthMiddleware] No Bearer token found in header');
    }

    await next();
};
