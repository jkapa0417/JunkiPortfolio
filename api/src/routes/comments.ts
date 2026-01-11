import { Hono } from 'hono';

type Bindings = {
    DB: D1Database;
};

type Comment = {
    id: number;
    post_id: number;
    parent_id: number | null;
    author_id: string;
    author_name: string;
    author_avatar: string | null;
    content: string;
    is_hidden: boolean;
    created_at: string;
    replies?: Comment[];
};

type Variables = {
    user?: {
        id: string;
        name: string;
        avatar?: string;
        isAdmin: boolean;
    };
};

export const comments = new Hono<{ Bindings: Bindings, Variables: Variables }>();

// Get comments for a post (with nested replies)
comments.get('/post/:postId', async (c) => {
    const postId = c.req.param('postId');

    try {
        // Get all comments for the post
        const result = await c.env.DB.prepare(`
      SELECT id, post_id, parent_id, author_id, author_name, author_avatar, content, is_hidden, created_at
      FROM comments 
      WHERE post_id = ? AND is_hidden = FALSE
      ORDER BY created_at ASC
    `).bind(postId).all<Comment>();

        // Build nested structure
        const commentMap = new Map<number, Comment>();
        const rootComments: Comment[] = [];

        result.results.forEach(comment => {
            comment.replies = [];
            commentMap.set(comment.id, comment);
        });

        result.results.forEach(comment => {
            if (comment.parent_id) {
                const parent = commentMap.get(comment.parent_id);
                if (parent) {
                    parent.replies!.push(comment);
                }
            } else {
                rootComments.push(comment);
            }
        });

        return c.json({
            comments: rootComments,
            total: result.results.length
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return c.json({ error: 'Failed to fetch comments' }, 500);
    }
});

// Add a comment (requires authentication)
comments.post('/', async (c) => {
    // Get user from auth middleware
    const user = c.get('user');

    if (!user) {
        return c.json({ error: 'Authentication required' }, 401);
    }

    // Legacy support or direct access if needed
    const userId = user.id;
    const userName = user.name;
    const userAvatar = user.avatar;

    const body = await c.req.json<{
        post_id: number;
        parent_id?: number;
        content: string;
    }>();

    if (!body.post_id || !body.content?.trim()) {
        return c.json({ error: 'Missing required fields' }, 400);
    }

    try {
        const result = await c.env.DB.prepare(`
      INSERT INTO comments (post_id, parent_id, author_id, author_name, author_avatar, content)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
            body.post_id,
            body.parent_id || null,
            userId,
            userName,
            userAvatar || null,
            body.content.trim()
        ).run();

        // Fetch the created comment
        const newComment = await c.env.DB.prepare(
            'SELECT * FROM comments WHERE id = ?'
        ).bind(result.meta.last_row_id).first<Comment>();

        return c.json({ success: true, comment: newComment }, 201);
    } catch (error) {
        console.error('Error creating comment:', error);
        return c.json({ error: 'Failed to create comment' }, 500);
    }
});

// Edit comment (owner or admin only)
comments.put('/:id', async (c) => {
    const commentId = c.req.param('id');
    const userId = c.req.header('X-User-Id');
    const isAdmin = c.req.header('X-User-Admin') === 'true';

    // Try to get from context if headers are missing (fallback)
    const user = c.get('user');
    const effectiveUserId = userId || user?.id;
    const effectiveIsAdmin = isAdmin || user?.isAdmin;

    if (!effectiveUserId) {
        return c.json({ error: 'Authentication required' }, 401);
    }

    const body = await c.req.json<{ content: string }>();

    if (!body.content?.trim()) {
        return c.json({ error: 'Content is required' }, 400);
    }

    try {
        // Check if user owns the comment or is admin
        const comment = await c.env.DB.prepare(
            'SELECT author_id FROM comments WHERE id = ?'
        ).bind(commentId).first<{ author_id: string }>();

        if (!comment) {
            return c.json({ error: 'Comment not found' }, 404);
        }

        if (comment.author_id !== effectiveUserId && !effectiveIsAdmin) {
            return c.json({ error: 'Not authorized' }, 403);
        }

        await c.env.DB.prepare(
            'UPDATE comments SET content = ? WHERE id = ?'
        ).bind(body.content.trim(), commentId).run();

        return c.json({ success: true });
    } catch (error) {
        console.error('Error updating comment:', error);
        return c.json({ error: 'Failed to update comment' }, 500);
    }
});

// Delete comment (owner or admin only)
comments.delete('/:id', async (c) => {
    const commentId = c.req.param('id');
    const userId = c.req.header('X-User-Id');
    const isAdmin = c.req.header('X-User-Admin') === 'true';

    // Try to get from context if headers are missing (fallback)
    const user = c.get('user');
    const effectiveUserId = userId || user?.id;
    const effectiveIsAdmin = isAdmin || user?.isAdmin;

    if (!effectiveUserId) {
        return c.json({ error: 'Authentication required' }, 401);
    }

    try {
        // Check if user owns the comment or is admin
        const comment = await c.env.DB.prepare(
            'SELECT author_id FROM comments WHERE id = ?'
        ).bind(commentId).first<{ author_id: string }>();

        if (!comment) {
            return c.json({ error: 'Comment not found' }, 404);
        }

        if (comment.author_id !== effectiveUserId && !effectiveIsAdmin) {
            return c.json({ error: 'Not authorized' }, 403);
        }

        // Soft delete by hiding (preserves thread structure)
        await c.env.DB.prepare(
            'UPDATE comments SET is_hidden = TRUE, content = "[deleted]" WHERE id = ?'
        ).bind(commentId).run();

        return c.json({ success: true });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return c.json({ error: 'Failed to delete comment' }, 500);
    }
});

// Admin: Hide/unhide comment
comments.patch('/:id/visibility', async (c) => {
    const commentId = c.req.param('id');
    const isAdmin = c.req.header('X-User-Admin') === 'true';

    if (!isAdmin) {
        return c.json({ error: 'Admin access required' }, 403);
    }

    const body = await c.req.json<{ is_hidden: boolean }>();

    try {
        await c.env.DB.prepare(
            'UPDATE comments SET is_hidden = ? WHERE id = ?'
        ).bind(body.is_hidden, commentId).run();

        return c.json({ success: true });
    } catch (error) {
        console.error('Error updating comment visibility:', error);
        return c.json({ error: 'Failed to update comment' }, 500);
    }
});
