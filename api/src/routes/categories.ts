import { Hono } from 'hono';

type Bindings = {
    DB: D1Database;
};

type Category = {
    id: number;
    slug: string;
    name: string;
    name_ko: string | null;
    description: string | null;
    description_ko: string | null;
    sort_order: number;
    created_at: string;
};

export const categories = new Hono<{ Bindings: Bindings }>();

// Get all categories
categories.get('/', async (c) => {
    try {
        const result = await c.env.DB.prepare(
            'SELECT * FROM categories ORDER BY sort_order ASC, name ASC'
        ).all<Category>();

        return c.json({ categories: result.results });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return c.json({ error: 'Failed to fetch categories' }, 500);
    }
});

// Get single category
categories.get('/:slug', async (c) => {
    const slug = c.req.param('slug');

    try {
        const category = await c.env.DB.prepare(
            'SELECT * FROM categories WHERE slug = ?'
        ).bind(slug).first<Category>();

        if (!category) {
            return c.json({ error: 'Category not found' }, 404);
        }

        return c.json(category);
    } catch (error) {
        return c.json({ error: 'Failed to fetch category' }, 500);
    }
});

// Create category (admin only)
categories.post('/', async (c) => {
    const isAdmin = c.req.header('X-User-Admin') === 'true';
    if (!isAdmin) {
        return c.json({ error: 'Admin access required' }, 403);
    }

    const body = await c.req.json<Partial<Category>>();

    if (!body.slug || !body.name) {
        return c.json({ error: 'Slug and name are required' }, 400);
    }

    try {
        let sortOrder = body.sort_order;
        if (sortOrder === undefined || sortOrder === null) {
            const maxOrder = await c.env.DB.prepare('SELECT MAX(sort_order) as max_order FROM categories').first<{ max_order: number }>();
            sortOrder = (maxOrder?.max_order || 0) + 1;
        }

        await c.env.DB.prepare(`
            INSERT INTO categories (slug, name, name_ko, description, description_ko, sort_order)
            VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
            body.slug,
            body.name,
            body.name_ko || null,
            body.description || null,
            body.description_ko || null,
            sortOrder
        ).run();

        return c.json({ success: true }, 201);
    } catch (error: any) {
        if (error.message?.includes('UNIQUE')) {
            return c.json({ error: 'Category slug already exists' }, 409);
        }
        return c.json({ error: 'Failed to create category' }, 500);
    }
});

// Update category (admin only)
categories.put('/:slug', async (c) => {
    const isAdmin = c.req.header('X-User-Admin') === 'true';
    if (!isAdmin) {
        return c.json({ error: 'Admin access required' }, 403);
    }

    const slug = c.req.param('slug');
    const body = await c.req.json<Partial<Category>>();

    try {
        await c.env.DB.prepare(`
            UPDATE categories 
            SET name = COALESCE(?, name),
                name_ko = COALESCE(?, name_ko),
                description = COALESCE(?, description),
                description_ko = COALESCE(?, description_ko),
                sort_order = COALESCE(?, sort_order)
            WHERE slug = ?
        `).bind(
            body.name || null,
            body.name_ko || null,
            body.description || null,
            body.description_ko || null,
            body.sort_order ?? null,
            slug
        ).run();

        return c.json({ success: true });
    } catch (error) {
        return c.json({ error: 'Failed to update category' }, 500);
    }
});

// Delete category (admin only)
categories.delete('/:slug', async (c) => {
    const isAdmin = c.req.header('X-User-Admin') === 'true';
    if (!isAdmin) {
        return c.json({ error: 'Admin access required' }, 403);
    }

    const slug = c.req.param('slug');

    try {
        // Check if category has posts
        const posts = await c.env.DB.prepare(
            'SELECT COUNT(*) as count FROM posts WHERE category = ?'
        ).bind(slug).first<{ count: number }>();

        if (posts && posts.count > 0) {
            return c.json({ error: 'Cannot delete category with posts' }, 400);
        }

        await c.env.DB.prepare('DELETE FROM categories WHERE slug = ?').bind(slug).run();

        return c.json({ success: true });
    } catch (error) {
        return c.json({ error: 'Failed to delete category' }, 500);
    }
});
