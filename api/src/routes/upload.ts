import { Hono } from 'hono';

type Bindings = {
    DB: D1Database;
    IMAGES?: any; // Cloudflare Images binding
    R2?: any;     // R2 Bucket binding
};

type Variables = {
    user?: {
        id: string;
        name: string;
        avatar?: string;
        isAdmin: boolean;
    };
};

export const upload = new Hono<{ Bindings: Bindings, Variables: Variables }>();

upload.post('/', async (c) => {
    // Check auth
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'Authentication required' }, 401);
    }

    try {
        const body = await c.req.parseBody();
        const file = body['file'] as File;

        if (!file) {
            return c.json({ error: 'No file uploaded' }, 400);
        }

        // If Cloudflare Images is configured
        if (c.env.IMAGES) {
            // Implementation for CF Images would go here
            // usually involving a direct upload URL or passing the stream
        }

        // If R2 is configured
        if (c.env.R2) {
            const key = `uploads/${Date.now()}-${file.name}`;
            await c.env.R2.put(key, file.stream(), {
                httpMetadata: { contentType: file.type }
            });
            // Assuming R2 public access is setup or using a worker to serve
            return c.json({ url: `/api/uploads/${key}` });
        }

        // Fallback: Return Data URL (since we lack configured storage in generic env)
        // Ideally we'd store in R2. Since user wants "proper" upload and we can't fully config it blindly:
        const buffer = await file.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        const dataUrl = `data:${file.type};base64,${base64}`;

        return c.json({ url: dataUrl });

    } catch (err) {
        console.error('Upload Error:', err);
        return c.json({ error: 'Upload failed' }, 500);
    }
});
