import { Hono } from 'hono';

type Bindings = {
    DB: D1Database;
};

type Post = {
    id: number;
    slug: string;
    title: string;
    title_ko: string | null;
    excerpt: string | null;
    excerpt_ko: string | null;
    content: string;
    content_ko: string | null;
    category: string;
    cover_image: string | null;
    read_time: number;
    published: boolean;
    created_at: string;
    updated_at: string;
};

export const posts = new Hono<{ Bindings: Bindings }>();

// Get all published posts
posts.get('/', async (c) => {
    const { category, limit = '10', offset = '0' } = c.req.query();

    let query = 'SELECT id, slug, title, title_ko, excerpt, excerpt_ko, category, cover_image, read_time, created_at FROM posts WHERE published = TRUE';
    const params: any[] = [];

    if (category && category !== 'all') {
        query += ' AND category = ?';
        params.push(category);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    try {
        const result = await c.env.DB.prepare(query).bind(...params).all<Post>();

        // Get total count
        let countQuery = 'SELECT COUNT(*) as count FROM posts WHERE published = TRUE';
        if (category && category !== 'all') {
            countQuery += ' AND category = ?';
        }
        const countResult = await c.env.DB.prepare(countQuery)
            .bind(...(category && category !== 'all' ? [category] : []))
            .first<{ count: number }>();

        return c.json({
            posts: result.results,
            total: countResult?.count || 0,
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        return c.json({ error: 'Failed to fetch posts' }, 500);
    }
});

// Get single post by slug
posts.get('/:slug', async (c) => {
    const slug = c.req.param('slug');

    try {
        const post = await c.env.DB.prepare(
            'SELECT * FROM posts WHERE slug = ? AND published = TRUE'
        ).bind(slug).first<Post>();

        if (!post) {
            return c.json({ error: 'Post not found' }, 404);
        }

        return c.json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        return c.json({ error: 'Failed to fetch post' }, 500);
    }
});

// Get single post by slug (Admin access to drafts/unpublished)
posts.get('/admin/:slug', async (c) => {
    const slug = c.req.param('slug');
    const isAdmin = c.req.header('X-User-Admin') === 'true';

    // Verify admin via header (set by middleware) or fallback
    // Note: Ideally use c.get('user') but this is quick fix for now relying on auth middleware correctly setting headers/context
    // For consistency with other routes let's check context
    const user = c.get('user');
    if (!user?.isAdmin && !isAdmin) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
        const post = await c.env.DB.prepare(
            'SELECT * FROM posts WHERE slug = ?'
        ).bind(slug).first<Post>();

        if (!post) {
            return c.json({ error: 'Post not found' }, 404);
        }

        return c.json(post);
    } catch (error) {
        console.error('Error fetching post for admin:', error);
        return c.json({ error: 'Failed to fetch post' }, 500);
    }
});

// Get categories
posts.get('/meta/categories', async (c) => {
    try {
        const result = await c.env.DB.prepare(
            'SELECT DISTINCT category FROM posts WHERE published = TRUE ORDER BY category'
        ).all<{ category: string }>();

        return c.json({ categories: result.results.map(r => r.category) });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return c.json({ error: 'Failed to fetch categories' }, 500);
    }
});

// Admin: Create post (requires auth middleware)
posts.post('/', async (c) => {
    // TODO: Add admin auth middleware
    const body = await c.req.json<Partial<Post>>();

    if (!body.slug || !body.title || !body.content || !body.category) {
        return c.json({ error: 'Missing required fields' }, 400);
    }

    let finalSlug = body.slug;
    let retries = 0;
    const maxRetries = 5;

    while (retries < maxRetries) {
        try {
            const result = await c.env.DB.prepare(`
          INSERT INTO posts (slug, title, title_ko, excerpt, excerpt_ko, content, content_ko, category, cover_image, read_time, published)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
                finalSlug,
                body.title,
                body.title_ko || null,
                body.excerpt || null,
                body.excerpt_ko || null,
                body.content,
                body.content_ko || null,
                body.category,
                body.cover_image || null,
                body.read_time || 5,
                body.published || false
            ).run();

            return c.json({ success: true, id: result.meta.last_row_id }, 201);
        } catch (error: any) {
            // Check for unique constraint violation on slug
            if (error.message && error.message.includes('UNIQUE constraint failed: posts.slug')) {
                // Generates a short random suffix (e.g., -a1b2)
                const suffix = Math.random().toString(36).substring(2, 6);
                finalSlug = `${body.slug}-${suffix}`;
                retries++;
            } else {
                console.error('Error creating post:', error);
                return c.json({ error: 'Failed to create post' }, 500);
            }
        }
    }

    return c.json({ error: 'Failed to generate unique slug' }, 409);
});

// Admin: Update post
posts.put('/:slug', async (c) => {
    // TODO: Add admin auth middleware
    const slug = c.req.param('slug');
    const body = await c.req.json<Partial<Post>>();

    try {
        const result = await c.env.DB.prepare(`
      UPDATE posts SET 
        title = COALESCE(?, title),
        title_ko = COALESCE(?, title_ko),
        excerpt = COALESCE(?, excerpt),
        excerpt_ko = COALESCE(?, excerpt_ko),
        content = COALESCE(?, content),
        content_ko = COALESCE(?, content_ko),
        category = COALESCE(?, category),
        cover_image = COALESCE(?, cover_image),
        read_time = COALESCE(?, read_time),
        published = COALESCE(?, published),
        updated_at = CURRENT_TIMESTAMP
      WHERE slug = ?
    `).bind(
            body.title || null,
            body.title_ko || null,
            body.excerpt || null,
            body.excerpt_ko || null,
            body.content || null,
            body.content_ko || null,
            body.category || null,
            body.cover_image || null,
            body.read_time || null,
            body.published !== undefined ? body.published : null,
            slug
        ).run();

        if (result.meta.changes === 0) {
            return c.json({ error: 'Post not found' }, 404);
        }

        return c.json({ success: true });
    } catch (error) {
        console.error('Error updating post:', error);
        return c.json({ error: 'Failed to update post' }, 500);
    }
});

// Admin: Delete post
posts.delete('/:slug', async (c) => {
    // TODO: Add admin auth middleware
    const slug = c.req.param('slug');

    try {
        const result = await c.env.DB.prepare(
            'DELETE FROM posts WHERE slug = ?'
        ).bind(slug).run();

        if (result.meta.changes === 0) {
            return c.json({ error: 'Post not found' }, 404);
        }

        return c.json({ success: true });
    } catch (error) {
        console.error('Error deleting post:', error);
        return c.json({ error: 'Failed to delete post' }, 500);
    }
});
