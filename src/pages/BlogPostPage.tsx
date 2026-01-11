import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPost, Post } from '../lib/api';
import MDEditor from '@uiw/react-md-editor';
import { PageLoader } from '../components/ui/Loading';
import CommentSection from '../components/blog/CommentSection';

const BlogPostPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const { i18n } = useTranslation();
    const [showComments, setShowComments] = useState(true);
    const [post, setPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (slug) {
            loadPost();
        }
    }, [slug]);

    const loadPost = async () => {
        if (!slug) return;
        try {
            setIsLoading(true);
            const data = await getPost(slug);
            setPost(data);
        } catch (err) {
            setError('Post not found');
        } finally {
            setIsLoading(false);
        }
    };



    if (isLoading) {
        return <PageLoader message={i18n.language === 'ko' ? '글을 불러오는 중...' : 'Loading post...'} />;
    }

    if (error || !post) {
        return (
            <div className="min-h-screen pt-24 pb-20 px-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-4">
                        {i18n.language === 'ko' ? '글을 찾을 수 없습니다' : 'Post Not Found'}
                    </h1>
                    <p className="text-white/60 mb-6">
                        {i18n.language === 'ko'
                            ? '요청하신 글이 존재하지 않거나 삭제되었습니다'
                            : "The post you're looking for doesn't exist or has been removed"
                        }
                    </p>
                    <Link to="/blog" className="glass-button">
                        {i18n.language === 'ko' ? '블로그로 돌아가기' : 'Back to Blog'}
                    </Link>
                </div>
            </div>
        );
    }

    const content = i18n.language === 'ko' && post.content_ko ? post.content_ko : post.content || '';
    const title = i18n.language === 'ko' && post.title_ko ? post.title_ko : post.title;

    return (
        <div className="min-h-screen pt-24 pb-20 px-4">
            <article className="max-w-3xl mx-auto">
                {/* Back Link */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {i18n.language === 'ko' ? '블로그로 돌아가기' : 'Back to Blog'}
                    </Link>
                </motion.div>

                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <span className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium mb-4">
                        {post.category}
                    </span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                        {title}
                    </h1>
                    <div className="flex items-center gap-4 text-white/60 text-sm">
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{post.read_time} min read</span>
                    </div>
                </motion.header>



                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="glass-card p-8 md:p-12 mb-12"
                >
                    <div data-color-mode="dark">
                        <MDEditor.Markdown source={content} style={{ whiteSpace: 'pre-wrap', backgroundColor: 'transparent' }} />
                    </div>
                </motion.div>

                {/* Share Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex items-center justify-between mb-12 pb-8 border-b border-white/10"
                >
                    <h3 className="text-white/60 text-sm font-medium">
                        {i18n.language === 'ko' ? '공유하기' : 'Share this post'}
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                const url = window.location.href;
                                const text = `${title} - Jun Ki Ahn's Blog`;
                                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                            }}
                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => {
                                const url = window.location.href;
                                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                            }}
                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </button>
                    </div>
                </motion.div>

                {/* Comments Toggle */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    onClick={() => setShowComments(!showComments)}
                    className="w-full glass-button justify-center mb-8"
                >
                    {showComments
                        ? (i18n.language === 'ko' ? '댓글 숨기기' : 'Hide Comments')
                        : (i18n.language === 'ko' ? '댓글 보기' : 'Show Comments')
                    }
                </motion.button>

                {/* Comments Section */}
                {showComments && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <CommentSection postId={post.id} />
                    </motion.div>
                )}
            </article>
        </div>
    );
};

export default BlogPostPage;
