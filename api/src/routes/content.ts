import { Hono } from 'hono';
import { Resend } from 'resend';

type Bindings = {
    DB: D1Database;
    RESEND_API_KEY: string;
};

export const content = new Hono<{ Bindings: Bindings }>();



// ============ CAREERS ============

content.get('/careers', async (c) => {
    try {
        const result = await c.env.DB.prepare(
            'SELECT * FROM careers ORDER BY sort_order ASC, start_date DESC'
        ).all();

        const careers = result.results.map((career: any) => ({
            ...career,
            responsibilities: career.responsibilities ? JSON.parse(career.responsibilities) : [],
            technologies: career.technologies ? JSON.parse(career.technologies) : [],
        }));

        return c.json({ careers });
    } catch (error) {
        console.error('Error fetching careers:', error);
        return c.json({ error: 'Failed to fetch careers' }, 500);
    }
});

content.post('/careers', async (c) => {
    const isAdmin = c.req.header('X-User-Admin') === 'true';
    if (!isAdmin) return c.json({ error: 'Admin access required' }, 403);

    const body = await c.req.json();

    try {
        let sortOrder = body.sort_order;
        if (sortOrder === undefined || sortOrder === null) {
            const maxOrder = await c.env.DB.prepare('SELECT MAX(sort_order) as max_order FROM careers').first<{ max_order: number }>();
            sortOrder = (maxOrder?.max_order || 0) + 1;
        }

        await c.env.DB.prepare(`
            INSERT INTO careers (company, company_ko, position, position_ko, start_date, end_date, is_current, description, description_ko, responsibilities, technologies, logo_url, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            body.company,
            body.company_ko || null,
            body.position,
            body.position_ko || null,
            body.start_date,
            body.end_date || null,
            body.is_current ? 1 : 0,
            body.description || null,
            body.description_ko || null,
            JSON.stringify(body.responsibilities || []),
            JSON.stringify(body.technologies || []),
            body.logo_url || null,
            sortOrder
        ).run();

        return c.json({ success: true }, 201);
    } catch (error) {
        console.error('Error creating career:', error);
        return c.json({ error: 'Failed to create career' }, 500);
    }
});

content.put('/careers/:id', async (c) => {
    const isAdmin = c.req.header('X-User-Admin') === 'true';
    if (!isAdmin) return c.json({ error: 'Admin access required' }, 403);

    const id = c.req.param('id');
    const body = await c.req.json();

    try {
        await c.env.DB.prepare(`
            UPDATE careers SET
                company = ?, company_ko = ?, position = ?, position_ko = ?,
                start_date = ?, end_date = ?, is_current = ?,
                description = ?, description_ko = ?,
                responsibilities = ?, technologies = ?,
                logo_url = ?, sort_order = ?
            WHERE id = ?
        `).bind(
            body.company,
            body.company_ko || null,
            body.position,
            body.position_ko || null,
            body.start_date,
            body.end_date || null,
            body.is_current ? 1 : 0,
            body.description || null,
            body.description_ko || null,
            JSON.stringify(body.responsibilities || []),
            JSON.stringify(body.technologies || []),
            body.logo_url || null,
            body.sort_order || 0,
            id
        ).run();

        return c.json({ success: true });
    } catch (error) {
        return c.json({ error: 'Failed to update career' }, 500);
    }
});

content.delete('/careers/:id', async (c) => {
    const isAdmin = c.req.header('X-User-Admin') === 'true';
    if (!isAdmin) return c.json({ error: 'Admin access required' }, 403);

    const id = c.req.param('id');

    try {
        await c.env.DB.prepare('DELETE FROM careers WHERE id = ?').bind(id).run();
        return c.json({ success: true });
    } catch (error) {
        return c.json({ error: 'Failed to delete career' }, 500);
    }
});

// ============ SKILL CATEGORIES ============

content.get('/skills', async (c) => {
    try {
        const categoriesResult = await c.env.DB.prepare(
            'SELECT * FROM skill_categories ORDER BY sort_order ASC'
        ).all();

        const skillsResult = await c.env.DB.prepare(
            'SELECT * FROM skills ORDER BY sort_order ASC'
        ).all();

        const categories = categoriesResult.results.map((cat: any) => ({
            ...cat,
            skills: skillsResult.results.filter((s: any) => s.category_id === cat.id),
        }));

        return c.json({ categories });
    } catch (error) {
        return c.json({ error: 'Failed to fetch skills' }, 500);
    }
});

content.post('/skills/categories', async (c) => {
    const isAdmin = c.req.header('X-User-Admin') === 'true';
    if (!isAdmin) return c.json({ error: 'Admin access required' }, 403);

    const body = await c.req.json();

    try {
        let sortOrder = body.sort_order;
        if (sortOrder === undefined || sortOrder === null) {
            const maxOrder = await c.env.DB.prepare('SELECT MAX(sort_order) as max_order FROM skill_categories').first<{ max_order: number }>();
            sortOrder = (maxOrder?.max_order || 0) + 1;
        }

        const result = await c.env.DB.prepare(`
            INSERT INTO skill_categories (name, name_ko, icon, color, sort_order)
            VALUES (?, ?, ?, ?, ?)
        `).bind(body.name, body.name_ko || null, body.icon || null, body.color || null, sortOrder).run();

        return c.json({ success: true, id: result.meta.last_row_id }, 201);
    } catch (error) {
        return c.json({ error: 'Failed to create skill category' }, 500);
    }
});

content.post('/skills', async (c) => {
    const isAdmin = c.req.header('X-User-Admin') === 'true';
    if (!isAdmin) return c.json({ error: 'Admin access required' }, 403);

    const body = await c.req.json();

    try {
        let sortOrder = body.sort_order;
        if (sortOrder === undefined || sortOrder === null) {
            const maxOrder = await c.env.DB.prepare('SELECT MAX(sort_order) as max_order FROM skills WHERE category_id = ?').bind(body.category_id).first<{ max_order: number }>();
            sortOrder = (maxOrder?.max_order || 0) + 1;
        }

        await c.env.DB.prepare(`
            INSERT INTO skills (category_id, name, level, sort_order)
            VALUES (?, ?, ?, ?)
        `).bind(body.category_id, body.name, body.level || 80, sortOrder).run();

        return c.json({ success: true }, 201);
    } catch (error) {
        return c.json({ error: 'Failed to create skill' }, 500);
    }
});

content.delete('/skills/:id', async (c) => {
    const isAdmin = c.req.header('X-User-Admin') === 'true';
    if (!isAdmin) return c.json({ error: 'Admin access required' }, 403);

    const id = c.req.param('id');
    await c.env.DB.prepare('DELETE FROM skills WHERE id = ?').bind(id).run();
    return c.json({ success: true });
});

content.delete('/skills/categories/:id', async (c) => {
    const isAdmin = c.req.header('X-User-Admin') === 'true';
    if (!isAdmin) return c.json({ error: 'Admin access required' }, 403);

    const id = c.req.param('id');
    await c.env.DB.prepare('DELETE FROM skills WHERE category_id = ?').bind(id).run();
    await c.env.DB.prepare('DELETE FROM skill_categories WHERE id = ?').bind(id).run();
    return c.json({ success: true });
});

// ============ PROJECTS ============

content.get('/projects', async (c) => {
    try {
        const result = await c.env.DB.prepare(
            'SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC'
        ).all();

        const projects = result.results.map((p: any) => ({
            ...p,
            technologies: p.technologies ? JSON.parse(p.technologies) : [],
            process: p.process ? JSON.parse(p.process) : [],
            process_ko: p.process_ko ? JSON.parse(p.process_ko) : [],
            developed: p.developed ? JSON.parse(p.developed) : [],
            developed_ko: p.developed_ko ? JSON.parse(p.developed_ko) : [],
        }));

        return c.json({ projects });
    } catch (error) {
        return c.json({ error: 'Failed to fetch projects' }, 500);
    }
});

content.post('/projects', async (c) => {
    const isAdmin = c.req.header('X-User-Admin') === 'true';
    if (!isAdmin) return c.json({ error: 'Admin access required' }, 403);

    const body = await c.req.json();

    try {
        let sortOrder = body.sort_order;
        if (sortOrder === undefined || sortOrder === null) {
            const maxOrder = await c.env.DB.prepare('SELECT MAX(sort_order) as max_order FROM projects').first<{ max_order: number }>();
            sortOrder = (maxOrder?.max_order || 0) + 1;
        }

        await c.env.DB.prepare(`
            INSERT INTO projects (
                slug, title, title_ko, description, description_ko, 
                long_description, long_description_ko, image_url, demo_url, github_url, 
                technologies, category, is_featured, sort_order,
                process, process_ko, developed, developed_ko
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            body.slug,
            body.title,
            body.title_ko || null,
            body.description || null,
            body.description_ko || null,
            body.long_description || null,
            body.long_description_ko || null,
            body.image_url || null,
            body.demo_url || null,
            body.github_url || null,
            JSON.stringify(body.technologies || []),
            body.category || null,
            body.is_featured ? 1 : 0,
            sortOrder,
            JSON.stringify(body.process || []),
            JSON.stringify(body.process_ko || []),
            JSON.stringify(body.developed || []),
            JSON.stringify(body.developed_ko || [])
        ).run();

        return c.json({ success: true }, 201);
    } catch (error) {
        return c.json({ error: 'Failed to create project' }, 500);
    }
});

content.put('/projects/:id', async (c) => {
    const isAdmin = c.req.header('X-User-Admin') === 'true';
    if (!isAdmin) return c.json({ error: 'Admin access required' }, 403);

    const id = c.req.param('id');
    const body = await c.req.json();

    try {
        await c.env.DB.prepare(`
            UPDATE projects SET
                title = ?, title_ko = ?, description = ?, description_ko = ?,
                long_description = ?, long_description_ko = ?,
                image_url = ?, demo_url = ?, github_url = ?,
                technologies = ?, category = ?, is_featured = ?, sort_order = ?,
                process = ?, process_ko = ?, developed = ?, developed_ko = ?
            WHERE id = ?
        `).bind(
            body.title,
            body.title_ko || null,
            body.description || null,
            body.description_ko || null,
            body.long_description || null,
            body.long_description_ko || null,
            body.image_url || null,
            body.demo_url || null,
            body.github_url || null,
            JSON.stringify(body.technologies || []),
            body.category || null,
            body.is_featured ? 1 : 0,
            body.sort_order || 0,
            JSON.stringify(body.process || []),
            JSON.stringify(body.process_ko || []),
            JSON.stringify(body.developed || []),
            JSON.stringify(body.developed_ko || []),
            id
        ).run();

        return c.json({ success: true });
    } catch (error) {
        return c.json({ error: 'Failed to update project' }, 500);
    }
});

content.delete('/projects/:id', async (c) => {
    const isAdmin = c.req.header('X-User-Admin') === 'true';
    if (!isAdmin) return c.json({ error: 'Admin access required' }, 403);

    const id = c.req.param('id');
    await c.env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(id).run();
    return c.json({ success: true });
});

// ============ CONTACT INFO ============

content.get('/contact', async (c) => {
    try {
        const result = await c.env.DB.prepare(
            'SELECT * FROM contact_info WHERE is_visible = TRUE ORDER BY sort_order ASC'
        ).all();

        return c.json({ contacts: result.results });
    } catch (error) {
        return c.json({ error: 'Failed to fetch contact info' }, 500);
    }
});

content.post('/contact', async (c) => {
    const isAdmin = c.req.header('X-User-Admin') === 'true';
    if (!isAdmin) return c.json({ error: 'Admin access required' }, 403);

    const body = await c.req.json();

    try {
        let sortOrder = body.sort_order;
        if (sortOrder === undefined || sortOrder === null) {
            const maxOrder = await c.env.DB.prepare('SELECT MAX(sort_order) as max_order FROM contact_info').first<{ max_order: number }>();
            sortOrder = (maxOrder?.max_order || 0) + 1;
        }

        await c.env.DB.prepare(`
            INSERT OR REPLACE INTO contact_info (key, value, label, label_ko, icon, is_visible, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
            body.key,
            body.value,
            body.label || null,
            body.label_ko || null,
            body.icon || null,
            body.is_visible !== false ? 1 : 0,
            sortOrder
        ).run();

        return c.json({ success: true }, 201);
    } catch (error) {
        return c.json({ error: 'Failed to update contact' }, 500);
    }
});

content.delete('/contact/:key', async (c) => {
    const isAdmin = c.req.header('X-User-Admin') === 'true';
    if (!isAdmin) return c.json({ error: 'Admin access required' }, 403);

    return c.json({ success: true });
});

// ============ MESSAGES ============

content.post('/messages', async (c) => {
    try {
        const body = await c.req.json();
        const { name, email, subject, message } = body;

        console.log('[API] Received message from:', email);

        if (!name || !email || !message) {
            return c.json({ error: 'Missing required fields' }, 400);
        }

        // Save to Database
        await c.env.DB.prepare(
            'INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)'
        ).bind(name, email, subject || 'No Subject', message).run();

        // Send Email via Resend
        if (c.env.RESEND_API_KEY) {
            try {
                const resend = new Resend(c.env.RESEND_API_KEY);
                await resend.emails.send({
                    from: 'Portfolio Contact <onboarding@resend.dev>',
                    to: 'jkapa0417@gmail.com',
                    subject: `[Portfolio] ${subject || 'New Message'} from ${name}`,
                    html: `
                        <h2>New Contact Message</h2>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Subject:</strong> ${subject}</p>
                        <br/>
                        <p><strong>Message:</strong></p>
                        <p>${message.replace(/\n/g, '<br>')}</p>
                    `
                });
                console.log('[API] Email sent via Resend');
            } catch (emailError) {
                console.error('[API] Failed to send email:', emailError);
            }
        }

        return c.json({ success: true }, 201);
    } catch (error: any) {
        console.error('Error saving message:', error);
        return c.json({ error: error.message || 'Failed to send message' }, 500);
    }
});
