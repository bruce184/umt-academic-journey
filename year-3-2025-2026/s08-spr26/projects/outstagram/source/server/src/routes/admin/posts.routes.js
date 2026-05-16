import { Router } from 'express';
import { db as knex } from '../../db/knex.js';
import { requireAdmin } from '../../middlewares/admin-auth.js';
import { errors } from '../../utils/api-error.js';

const router = Router();

// List posts (paginated)
router.get('/', requireAdmin('moderator'), async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;

        const query = knex('posts')
            .leftJoin('profiles', 'posts.owner_id', 'profiles.user_id')
            .select(
                'posts.id', 'posts.caption', 'posts.is_deleted', 'posts.created_at',
                'profiles.username', 'profiles.avatar_url'
            )
            .orderBy('posts.created_at', 'desc');

        if (search) {
            query.where('posts.caption', 'ilike', `%${search}%`);
        }

        const [{ count }] = await query.clone().clearSelect().clearOrder().count();
        const postsList = await query.limit(limit).offset(offset);

        res.json({
            message: 'Posts fetched successfully',
            data: {
                posts: postsList,
                total: parseInt(count, 10),
                page: parseInt(page, 10),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        next(error);
    }
});

// View post details
router.get('/:id', requireAdmin('moderator'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const post = await knex('posts').where({ id }).first();
        if (!post) return next(errors.notFound('Post not found'));

        const [owner, media, likesCount, commentsCount, comments] = await Promise.all([
            knex('profiles').where({ user_id: post.owner_id }).first(),
            knex('post_media').where({ post_id: id }),
            knex('post_likes').where({ post_id: id }).count('user_id as count').first(),
            knex('comments').where({ post_id: id, is_deleted: false }).count('id as count').first(),
            knex('comments')
                .leftJoin('profiles', 'comments.user_id', 'profiles.user_id')
                .select(
                    'comments.id',
                    'comments.post_id',
                    'comments.content',
                    'comments.parent_id',
                    'comments.is_deleted',
                    'comments.created_at',
                    'profiles.username',
                    'profiles.avatar_url'
                )
                .where('comments.post_id', id)
                .orderBy('comments.created_at', 'asc')
        ]);

        res.json({
            message: 'Post details fetched successfully',
            data: {
                ...post,
                owner,
                media,
                comments,
                stats: {
                    likes: parseInt(likesCount.count, 10),
                    comments: parseInt(commentsCount.count, 10)
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// Toggle soft-delete
router.patch('/:id/soft-delete', requireAdmin('moderator'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const post = await knex('posts').where({ id }).first();
        if (!post) return next(errors.notFound('Post not found'));

        const newStatus = !post.is_deleted;
        await knex('posts').where({ id }).update({ is_deleted: newStatus });

        // Add audit log
        await knex('audit_logs').insert({
            actor_id: req.userId,
            action: newStatus ? 'post.soft_delete' : 'post.restore',
            target_type: 'post',
            target_id: id
        }).catch(err => console.error("Failed to log audit", err));

        res.json({
            message: `Post ${newStatus ? 'deleted' : 'restored'} successfully`,
            data: { is_deleted: newStatus }
        });
    } catch (error) {
        next(error);
    }
});

router.patch('/:postId/comments/:commentId/soft-delete', requireAdmin('moderator'), async (req, res, next) => {
    try {
        const { postId, commentId } = req.params;
        const comment = await knex('comments').where({ id: commentId, post_id: postId }).first();
        if (!comment) return next(errors.notFound('Comment not found'));

        const newStatus = !comment.is_deleted;
        await knex('comments').where({ id: commentId }).update({ is_deleted: newStatus });

        await knex('audit_logs').insert({
            actor_id: req.userId,
            action: newStatus ? 'comment.soft_delete' : 'comment.restore',
            target_type: 'comment',
            target_id: String(commentId),
            metadata: JSON.stringify({ post_id: postId })
        }).catch(err => console.error("Failed to log audit", err));

        res.json({
            message: `Comment ${newStatus ? 'deleted' : 'restored'} successfully`,
            data: { is_deleted: newStatus }
        });
    } catch (error) {
        next(error);
    }
});

// Hard delete (Super Admin only)
router.delete('/:id', requireAdmin('super_admin'), async (req, res, next) => {
    try {
        const { id } = req.params;
        await knex('posts').where({ id }).del();
        // Since foreign keys usually have cascade, it might delete associated records.
        // It's recommended to log this carefully.

        await knex('audit_logs').insert({
            actor_id: req.userId,
            action: 'post.hard_delete',
            target_type: 'post',
            target_id: id
        }).catch(err => console.error("Failed to log audit", err));

        res.json({ message: 'Post permanently deleted' });
    } catch (error) {
        next(error);
    }
});

export default router;
