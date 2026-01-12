import { Hono } from 'hono';

type Bindings = {
    DB: D1Database;
    FRONTEND_URL: string;
};

export const sitemap = new Hono<{ Bindings: Bindings }>();

sitemap.get('/', async (c) => {
    const baseUrl = c.env.FRONTEND_URL || 'https://junki-portfolio.com';

    // Core static pages
    const staticPages = [
        { path: '', changefreq: 'weekly', priority: '1.0' },
        { path: 'career', changefreq: 'monthly', priority: '0.8' },
        { path: 'skills', changefreq: 'monthly', priority: '0.8' },
        { path: 'projects', changefreq: 'weekly', priority: '0.9' },
        { path: 'blog', changefreq: 'weekly', priority: '0.9' },
        { path: 'contact', changefreq: 'yearly', priority: '0.7' },
    ];

    try {
        // Fetch published posts
        const result = await c.env.DB.prepare(
            'SELECT slug, updated_at FROM posts WHERE published = TRUE ORDER BY created_at DESC'
        ).all<{ slug: string; updated_at: string }>();

        const posts = result.results;

        // Generate XML
        const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- Core Pages -->
    ${staticPages.map(page => `
    <url>
        <loc>${baseUrl}/${page.path}</loc>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`).join('')}

    <!-- Blog Posts -->
    ${posts.map(post => `
    <url>
        <loc>${baseUrl}/blog/${post.slug}</loc>
        <lastmod>${new Date(post.updated_at).toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>`).join('')}
</urlset>`;

        return c.text(sitemapXml, 200, {
            'Content-Type': 'application/xml'
        });

    } catch (error) {
        console.error('Error generating sitemap:', error);
        return c.text('Error generating sitemap', 500);
    }
});
