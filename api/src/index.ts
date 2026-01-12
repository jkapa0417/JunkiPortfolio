import { Hono } from 'hono';
import { sitemap } from './routes/sitemap';
import { cors } from 'hono/cors';
import { posts } from './routes/posts';
import { comments } from './routes/comments';
import { auth } from './routes/auth';
import { categories } from './routes/categories';
import { content } from './routes/content';
import { upload } from './routes/upload';
import { authMiddleware } from './middleware/auth';

type Bindings = {
    DB: D1Database;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    JWT_SECRET: string;
    ADMIN_EMAILS: string;

    ENVIRONMENT: string;
    RESEND_API_KEY: string;
};

type Variables = {
    user?: {
        id: string;
        name: string;
        avatar?: string;
        isAdmin: boolean;
    };
};

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>();

// CORS configuration
app.use('/*', cors({
    origin: (origin) => {
        // Allow localhost ports for development and preview
        if (origin.includes('localhost:5173') || origin.includes('localhost:4173')) {
            return origin;
        }
        // Allow valid production domains
        // Ideally restrict this in production, but for now matching previous '*' behavior
        // while supporting credentials (which requires explicit origin return)
        return origin;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-User-Admin'],
    credentials: true,
}));

// Auth middleware
app.use('*', authMiddleware);

// Health check
app.get('/', (c) => {
    return c.json({
        status: 'ok',
        message: 'Portfolio API',
        environment: c.env.ENVIRONMENT
    });
});

// Mount routes
app.route('/sitemap.xml', sitemap);
app.route('/api/posts', posts);
app.route('/api/comments', comments);
app.route('/api/auth', auth);
app.route('/api/categories', categories);
app.route('/api/content', content);
app.route('/api/upload', upload);

// 404 handler
app.notFound((c) => {
    return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
    console.error('API Error:', err);
    return c.json({ error: 'Internal server error' }, 500);
});

export default app;
