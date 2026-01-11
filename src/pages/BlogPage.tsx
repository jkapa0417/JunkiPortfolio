import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPosts, getCategories, Post } from '../lib/api';
import { LoadingCard } from '../components/ui/Loading';
import { useAuth } from '../lib/AuthContext';

// API URL for delete
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://portfolio-api.jkapa0417.workers.dev';

const BlogPage = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [posts, setPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<string[]>(['All']);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPosts();
        loadCategories();
    }, []);

    const loadPosts = async () => {
        try {
            setIsLoading(true);
            const data = await getPosts({
                category: selectedCategory !== 'All' ? selectedCategory : undefined
            });
            setPosts(data.posts);
        } catch (err) {
            setError('Failed to load posts');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(['All', ...data.categories]);
        } catch (err) {
            console.error('Failed to load categories:', err);
        }
    };

    useEffect(() => {
        loadPosts();
    }, [selectedCategory]);

    const handleDeletePost = async (slug: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm(i18n.language === 'ko' ? '정말 삭제하시겠습니까?' : 'Are you sure you want to delete this post?')) {
            return;
        }

        const token = localStorage.getItem('auth_token');
        try {
            const response = await fetch(`${API_BASE_URL}/api/posts/${slug}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                await loadPosts();
            } else {
                alert('Failed to delete post');
            }
        } catch (err) {
            console.error('Failed to delete post:', err);
        }
    };

    const filteredPosts = selectedCategory === 'All'
        ? posts
        : posts.filter(post => post.category === selectedCategory);

    return (
        <div className="min-h-screen pt-24 pb-20 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                        {i18n.language === 'ko' ? '블로그' : 'Blog'}
                    </h1>
                    <p className="text-lg text-white/60 max-w-2xl mx-auto">
                        {i18n.language === 'ko'
                            ? '기술에 대한 생각과 지식을 공유합니다'
                            : 'Sharing thoughts and knowledge about technology'
                        }
                    </p>

                    {/* Admin: New Post Button */}
                    {isAdmin && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-6"
                        >
                            <Link
                                to="/blog/new"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full 
                                         bg-gradient-to-r from-purple-500 to-blue-500 
                                         hover:from-purple-600 hover:to-blue-600
                                         text-white font-medium transition-all hover:scale-105"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                {i18n.language === 'ko' ? '새 글 작성' : 'New Post'}
                            </Link>
                        </motion.div>
                    )}
                </motion.div>

                {/* Category Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-wrap justify-center gap-2 mb-12"
                >
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category
                                ? 'bg-white/20 text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </motion.div>

                {/* Loading State */}
                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <LoadingCard key={i} />)}
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <div className="text-center py-20">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button
                            onClick={loadPosts}
                            className="glass-button"
                        >
                            {i18n.language === 'ko' ? '다시 시도' : 'Try Again'}
                        </button>
                    </div>
                )}

                {/* Blog Posts Grid */}
                {!isLoading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPosts.map((post, index) => (
                            <motion.div
                                key={post.slug}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="relative group"
                            >
                                <Link
                                    to={`/blog/${post.slug}`}
                                    className="block glass-card p-6 h-full group hover:scale-[1.02] transition-transform duration-300"
                                >
                                    {/* Cover Image */}
                                    {post.cover_image && (
                                        <div className="aspect-video w-full rounded-xl overflow-hidden mb-4 bg-white/5">
                                            <img
                                                src={post.cover_image}
                                                alt={post.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                loading="lazy"
                                                onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                            />
                                        </div>
                                    )}

                                    {/* Category Badge */}
                                    <span className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium mb-4">
                                        {post.category}
                                    </span>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                                        {i18n.language === 'ko' && post.title_ko ? post.title_ko : post.title}
                                    </h3>

                                    {/* Excerpt */}
                                    <p className="text-white/60 text-sm mb-4 line-clamp-3">
                                        {i18n.language === 'ko' && post.excerpt_ko ? post.excerpt_ko : post.excerpt}
                                    </p>

                                    {/* Meta */}
                                    <div className="flex items-center justify-between text-white/40 text-sm mt-auto pt-4 border-t border-white/10">
                                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                        <span>{post.read_time} min read</span>
                                    </div>
                                </Link>

                                {/* Admin Controls */}
                                {isAdmin && (
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                navigate(`/blog/edit/${post.slug}`);
                                            }}
                                            className="p-2 rounded-lg bg-blue-500/80 hover:bg-blue-500 text-white transition-colors"
                                            title="Edit"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={(e) => handleDeletePost(post.slug, e)}
                                            className="p-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                                            title="Delete"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && filteredPosts.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {i18n.language === 'ko' ? '아직 글이 없습니다' : 'No posts yet'}
                        </h3>
                        <p className="text-white/60 mb-6">
                            {i18n.language === 'ko'
                                ? '곧 새로운 글이 올라올 예정입니다'
                                : 'Check back soon for new content'
                            }
                        </p>
                        {isAdmin && (
                            <Link to="/blog/new" className="glass-button glass-button--primary">
                                {i18n.language === 'ko' ? '첫 번째 글 작성하기' : 'Write your first post'}
                            </Link>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default BlogPage;
