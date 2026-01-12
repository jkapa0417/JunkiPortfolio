import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/AuthContext';
import { getComments, createComment, deleteComment, Comment } from '../../lib/api';
import { LoadingSpinner } from '../ui/Loading';
import { API_BASE_URL } from '../../lib/api';

const CommentItem = ({ comment, depth = 0, onReply, onDelete, onEdit, isAdmin, currentUserId, replyingTo, onSubmitReply, isSubmitting }: any) => {
    const { i18n } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [replyContent, setReplyContent] = useState('');

    const canModify = isAdmin || comment.author_id === currentUserId;
    const isReplying = replyingTo === comment.id;

    const handleSaveEdit = () => {
        if (editContent.trim() && editContent !== comment.content) {
            onEdit(comment.id, editContent.trim());
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditContent(comment.content);
        setIsEditing(false);
    };

    const handleSubmitReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (replyContent.trim()) {
            onSubmitReply(comment.id, replyContent.trim());
            setReplyContent('');
        }
    };

    return (
        <div className={`${depth > 0 ? 'ml-8 border-l border-white/10 pl-4' : ''}`}>
            <div className="glass-card p-4 mb-4">
                <div className="flex items-start gap-3">
                    {/* Avatar */}
                    {comment.author_avatar ? (
                        <img
                            src={comment.author_avatar}
                            alt={comment.author_name}
                            className="w-10 h-10 rounded-full flex-shrink-0"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {comment.author_name.charAt(0).toUpperCase()}
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-white">{comment.author_name}</span>
                            <span className="text-white/40 text-sm">
                                {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                            {canModify && (
                                <span className="px-1.5 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded">
                                    {isAdmin && comment.author_id !== currentUserId ? 'Admin' : 'You'}
                                </span>
                            )}
                        </div>

                        {/* Content */}
                        {isEditing ? (
                            <div className="space-y-2">
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="glass-input w-full h-20 resize-none text-sm"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveEdit}
                                        className="px-3 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm transition-colors"
                                    >
                                        {i18n.language === 'ko' ? '저장' : 'Save'}
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors"
                                    >
                                        {i18n.language === 'ko' ? '취소' : 'Cancel'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-white/70 text-sm mb-3 whitespace-pre-wrap">{comment.content}</p>
                        )}

                        {/* Actions */}
                        {!isEditing && (
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => onReply(comment.id)}
                                    className="text-white/40 hover:text-purple-300 text-sm transition-colors"
                                >
                                    {i18n.language === 'ko' ? '답글' : 'Reply'}
                                </button>
                                {canModify && (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="text-blue-400/60 hover:text-blue-400 text-sm transition-colors"
                                        >
                                            {i18n.language === 'ko' ? '수정' : 'Edit'}
                                        </button>
                                        <button
                                            onClick={() => onDelete(comment.id)}
                                            className="text-red-400/60 hover:text-red-400 text-sm transition-colors"
                                        >
                                            {i18n.language === 'ko' ? '삭제' : 'Delete'}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Inline Reply Form */}
                        {isReplying && (
                            <motion.form
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-4 pt-4 border-t border-white/10"
                                onSubmit={handleSubmitReply}
                            >
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder={i18n.language === 'ko' ? '답글을 작성하세요...' : 'Write a reply...'}
                                    className="glass-input w-full h-20 resize-none text-sm mb-2"
                                    autoFocus
                                />
                                <div className="flex gap-2 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => onReply(null)}
                                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors"
                                    >
                                        {i18n.language === 'ko' ? '취소' : 'Cancel'}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !replyContent.trim()}
                                        className="px-3 py-1.5 rounded-lg bg-purple-500/80 hover:bg-purple-500 text-white text-sm transition-colors disabled:opacity-50"
                                    >
                                        {isSubmitting ? (i18n.language === 'ko' ? '작성 중...' : 'Posting...') : (i18n.language === 'ko' ? '답글 작성' : 'Post Reply')}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </div>
                </div>
            </div>

            {/* Replies */}
            {comment.replies?.map((reply: Comment) => (
                <CommentItem
                    key={reply.id}
                    comment={reply}
                    depth={depth + 1}
                    onReply={onReply}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    isAdmin={isAdmin}
                    currentUserId={currentUserId}
                    replyingTo={replyingTo}
                    onSubmitReply={onSubmitReply}
                    isSubmitting={isSubmitting}
                />
            ))}
        </div>
    );
};

interface CommentSectionProps {
    postId: number;
}

const CommentSection = ({ postId }: CommentSectionProps) => {
    const { i18n } = useTranslation();
    const { user, isAuthenticated, isAdmin, loginWithGitHub, loginWithGoogle } = useAuth();

    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<number | null>(null);

    useEffect(() => {
        loadComments();
    }, [postId]);

    const loadComments = async () => {
        try {
            setIsLoading(true);
            const data = await getComments(postId);
            setComments(data.comments);
        } catch (err) {
            console.error('Failed to load comments:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !isAuthenticated) return;

        try {
            setIsSubmitting(true);
            await createComment({
                post_id: postId,
                parent_id: replyingTo || undefined,
                content: newComment.trim(),
            });
            setNewComment('');
            setReplyingTo(null);
            await loadComments();
        } catch (err) {
            console.error('Failed to create comment:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (commentId: number) => {
        if (!confirm(i18n.language === 'ko' ? '정말 삭제하시겠습니까?' : 'Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            await deleteComment(commentId);
            await loadComments();
        } catch (err) {
            console.error('Failed to delete comment:', err);
        }
    };

    const handleEdit = async (commentId: number, content: string) => {
        const token = localStorage.getItem('auth_token');
        try {
            const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ content }),
            });

            if (response.ok) {
                await loadComments();
            }
        } catch (err) {
            console.error('Failed to edit comment:', err);
        }
    };

    const handleReply = (commentId: number | null) => {
        setReplyingTo(commentId);
    };

    const handleSubmitReply = async (commentId: number, content: string) => {
        if (!isAuthenticated) return;

        try {
            setIsSubmitting(true);
            await createComment({
                post_id: postId,
                parent_id: commentId,
                content: content,
            });
            setReplyingTo(null);
            await loadComments();
        } catch (err) {
            console.error('Failed to create reply:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-white mb-6">
                {i18n.language === 'ko' ? '댓글' : 'Comments'} ({comments.length})
            </h3>

            {/* Main Comment Form (Top) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 mb-8"
            >
                {isAuthenticated && user ? (
                    <form onSubmit={handleSubmit}>
                        {/* User info */}
                        <div className="flex items-center gap-3 mb-4">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-sm font-bold text-white">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="text-white/80 text-sm">{user.name}</span>
                        </div>

                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={i18n.language === 'ko' ? '댓글을 작성하세요...' : 'Write a comment...'}
                            className="glass-input w-full h-24 resize-none mb-4"
                            disabled={isSubmitting}
                        />
                        <button
                            type="submit"
                            className="glass-button glass-button--primary"
                            disabled={isSubmitting || !newComment.trim()}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <LoadingSpinner size="sm" />
                                    {i18n.language === 'ko' ? '작성 중...' : 'Posting...'}
                                </span>
                            ) : (
                                i18n.language === 'ko' ? '댓글 작성' : 'Post Comment'
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-white/60 mb-4">
                            {i18n.language === 'ko' ? '댓글을 작성하려면 로그인이 필요합니다' : 'Sign in to leave a comment'}
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={loginWithGitHub}
                                className="glass-button flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                                GitHub
                            </button>
                            <button
                                onClick={loginWithGoogle}
                                className="glass-button flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                </div>
            )}

            {/* Comments List */}
            {!isLoading && (
                <div className="space-y-4">
                    {comments.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            onReply={handleReply}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                            isAdmin={isAdmin}
                            currentUserId={user?.id}
                            replyingTo={replyingTo}
                            onSubmitReply={handleSubmitReply}
                            isSubmitting={isSubmitting}
                        />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && comments.length === 0 && (
                <div className="text-center py-12 text-white/40">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>{i18n.language === 'ko' ? '아직 댓글이 없습니다' : 'No comments yet'}</p>
                    <p className="text-sm mt-1">
                        {i18n.language === 'ko' ? '첫 번째 댓글을 남겨보세요!' : 'Be the first to comment!'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default CommentSection;
