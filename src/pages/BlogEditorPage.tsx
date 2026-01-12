import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MDEditor, { commands } from '@uiw/react-md-editor';
import { useAuth } from '../lib/AuthContext';
import { getAdminPost } from '../lib/api';
import { LoadingSpinner, PageLoader } from '../components/ui/Loading';
import { CustomSelect } from '../components/ui/CustomSelect';
import { API_BASE_URL } from '../lib/api';

interface PostFormData {
    slug: string;
    title: string;
    title_ko: string;
    excerpt: string;
    excerpt_ko: string;
    content: string;
    content_ko: string;
    category: string;
    cover_image: string;
    read_time: number;
    published: boolean;
}

const defaultFormData: PostFormData = {
    slug: '',
    title: '',
    title_ko: '',
    excerpt: '',
    excerpt_ko: '',
    content: '',
    content_ko: '',
    category: '',
    cover_image: '',
    read_time: 5,
    published: false,
};

const categories = ['AI', 'Frontend', 'Backend', 'Cloud', 'DevOps', 'Career', 'Other'];

const BlogEditorPage = () => {
    const { slug } = useParams<{ slug?: string }>();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { isAdmin } = useAuth();
    // Ref to store pending files for upload: blobUrl -> File
    const pendingUploads = useRef<Map<string, File>>(new Map());

    const [formData, setFormData] = useState<PostFormData>({
        ...defaultFormData,
    });
    const [isLoading, setIsLoading] = useState(!!slug);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const isEditing = !!slug;

    // Load existing post if editing
    useEffect(() => {
        console.log('[Editor] Slug changed:', slug);
        if (slug) {
            loadPost();
        }
    }, [slug]);

    const loadPost = async () => {
        if (!slug) return;
        console.log('[Editor] Loading post:', slug);
        try {
            setIsLoading(true);
            console.log('[Editor] Fetching from API...');
            const post = await getAdminPost(slug);
            console.log('[Editor] Post loaded:', post.slug, 'Length:', post.content?.length);

            // Auto-optimize content if it has heavy base64 images
            const optimizedContent = await optimizeContent(post.content || '');

            setFormData({
                slug: post.slug,
                title: post.title,
                title_ko: post.title_ko || '',
                excerpt: post.excerpt || '',
                excerpt_ko: post.excerpt_ko || '',
                content: optimizedContent,
                content_ko: post.content_ko || '',
                category: post.category,
                cover_image: post.cover_image || '',
                read_time: post.read_time,
                published: true, // TODO: Check if we want to force this
            });
            console.log('[Editor] Form data set');
        } catch (err) {
            console.error('[Editor] Load failed:', err);
            setError(t('editor.error.load_failed') || 'Failed to load post');
        } finally {
            console.log('[Editor] Loading finished');
            setIsLoading(false);
        }
    };

    // Auto-generate slug from title
    const generateSlug = useCallback((title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }, []);

    const handleTitleChange = (title: string) => {
        setFormData(prev => ({
            ...prev,
            title,
            slug: isEditing ? prev.slug : generateSlug(title),
        }));
    };

    const handleImageUpload = async (file: File) => {
        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_BASE_URL}/api/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            return data.url;
        } catch (error) {
            console.error('Upload error:', error);
            // Fallback to data URL only if upload fails entirely
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
        } finally {
            setUploadingImage(false);
        }
    };

    // Helper to convert base64 to File
    const base64ToFile = async (base64: string, filename: string): Promise<File> => {
        const res = await fetch(base64);
        const blob = await res.blob();
        return new File([blob], filename, { type: blob.type });
    };

    // Auto-optimize content by uploading base64 images
    const optimizeContent = async (content: string) => {
        if (!content || content.length < 5000) return content; // Skip small content

        let optimized = content;
        // Regex for markdown data URI images: ![alt](data:image/...)
        const regex = /!\[(.*?)\]\((data:image\/[^;]+;base64,[^)]+)\)/g;
        const matches = [...content.matchAll(regex)];

        if (matches.length === 0) return content;

        console.log(`[Editor] Found ${matches.length} inline images to optimize`);

        try {
            // Process sequentially to avoid overwhelming upload endpoint
            for (const match of matches) {
                const [fullMatch, alt, base64] = match;
                // Generate a filename
                const ext = base64.substring(11, base64.indexOf(';'));
                const filename = `image-${Date.now()}.${ext}`;

                try {
                    console.log('[Editor] Converting and uploading inline image...');
                    const file = await base64ToFile(base64, filename);
                    const url = await handleImageUpload(file);

                    // Replace in content
                    optimized = optimized.replace(fullMatch, `![${alt}](${url})`);
                    console.log('[Editor] Image optimized!');
                } catch (e) {
                    console.warn('[Editor] Failed to optimize image:', e);
                }
            }
        } catch (e) {
            console.error('[Editor] Optimization failed:', e);
        }

        return optimized;
    };

    const handleContentPaste = async (e: React.ClipboardEvent) => {
        // Prevent image pasting to avoid base64/blob issues
        if (e.clipboardData.files.length > 0) {
            e.preventDefault();
            alert(t('editor.error.no_image_paste') || 'Please use the image upload button. Direct pasting is disabled to prevent performance issues.');
            return;
        }
    };

    const processContentImages = async (content: string) => {
        let processedContent = content;
        // Match blob: URLs
        const imageRegex = /!\[(.*?)\]\((blob:[^)]+)\)/g;
        const matches = [...content.matchAll(imageRegex)];

        if (matches.length === 0) return content;

        setUploadingImage(true);
        try {
            for (const match of matches) {
                const [fullMatch, altText, blobUrl] = match;
                const file = pendingUploads.current.get(blobUrl);

                if (file) {
                    // Upload real file
                    const uploadedUrl = await handleImageUpload(file);
                    // Replace blob URL with real URL
                    processedContent = processedContent.replace(fullMatch, `![${altText}](${uploadedUrl})`);
                    // Clean up blob
                    URL.revokeObjectURL(blobUrl);
                    pendingUploads.current.delete(blobUrl);
                }
            }
        } finally {
            setUploadingImage(false);
        }

        return processedContent;
    };

    const handleSave = async (publish: boolean = false) => {
        if (!formData.title || !formData.content || !formData.category) {
            setError(t('editor.error.required_fields') || 'Please fill in title, content, and category');
            return;
        }

        setIsSaving(true);
        setError(null);
        const token = localStorage.getItem('auth_token');

        try {
            // Process blobs -> real URLs
            const processedContent = await processContentImages(formData.content);

            const endpoint = isEditing
                ? `${API_BASE_URL}/api/posts/${slug}`
                : `${API_BASE_URL}/api/posts`;

            const response = await fetch(endpoint, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    content: processedContent,
                    // We might still send legacy fields if backend requires them
                    content_ko: formData.content_ko || '',
                    title_ko: formData.title_ko || '',
                    excerpt_ko: formData.excerpt_ko || '',
                    published: publish ? true : formData.published,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || t('editor.error.save_failed') || 'Failed to save post');
            }

            navigate('/blog');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen pt-24 pb-20 px-4 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">
                        {i18n.language === 'ko' ? '접근 권한이 없습니다' : 'Access Denied'}
                    </h1>
                    <p className="text-white/60 mb-6">
                        {i18n.language === 'ko' ? '관리자만 접근할 수 있습니다' : 'Only admins can access this page'}
                    </p>
                    <button onClick={() => navigate('/blog')} className="glass-button">
                        {i18n.language === 'ko' ? '블로그로 돌아가기' : 'Back to Blog'}
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return <PageLoader message={t('editor.loading') || "Loading post..."} />;
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div>
                        <button
                            onClick={() => navigate('/blog')}
                            className="text-white/60 hover:text-white transition-colors mb-2 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            {t('editor.back_to_blog') || 'Back to Blog'}
                        </button>
                        <h1 className="text-3xl font-bold text-white">
                            {isEditing
                                ? (t('editor.title.edit') || 'Edit Post')
                                : (t('editor.title.create') || 'Create New Post')
                            }
                        </h1>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => handleSave(false)}
                            disabled={isSaving}
                            className="glass-button"
                        >
                            {isSaving ? <LoadingSpinner size="sm" /> : (t('editor.button.save_draft') || 'Save Draft')}
                        </button>
                        <button
                            onClick={() => handleSave(true)}
                            disabled={isSaving}
                            className="glass-button glass-button--primary"
                        >
                            {isSaving ? <LoadingSpinner size="sm" /> : (t('editor.button.publish') || 'Publish')}
                        </button>
                    </div>
                </motion.div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300"
                    >
                        {error}
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                >
                    {/* Basic Info */}
                    <div className="glass-card p-6 relative z-10">
                        <h2 className="text-lg font-semibold text-white mb-4">{t('editor.section.basic_info') || 'Basic Information'}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-white/80 text-sm font-medium mb-2">{t('editor.label.title') || 'Title'}</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    className="glass-input"
                                    placeholder={t('editor.placeholder.title') || "Enter post title"}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                                <label className="block text-white/80 text-sm font-medium mb-2">{t('editor.label.slug') || 'Slug'}</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                    className="glass-input"
                                    placeholder="post-url-slug"
                                    disabled={isEditing}
                                />
                            </div>
                            <div>
                                <label className="block text-white/80 text-sm font-medium mb-2">{t('editor.label.category') || 'Category'}</label>
                                <CustomSelect
                                    value={formData.category}
                                    onChange={(val) => setFormData(prev => ({ ...prev, category: String(val) }))}
                                    options={categories.map(cat => ({ value: cat, label: cat }))}
                                    placeholder={t('editor.placeholder.category') || "Select category"}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-white/80 text-sm font-medium mb-2">{t('editor.label.read_time') || 'Read Time (min)'}</label>
                                <input
                                    type="number"
                                    value={formData.read_time}
                                    onChange={(e) => setFormData(prev => ({ ...prev, read_time: parseInt(e.target.value) || 5 }))}
                                    className="glass-input"
                                    min={1}
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-white/80 text-sm font-medium mb-2">{t('editor.label.excerpt') || 'Excerpt'}</label>
                            <textarea
                                value={formData.excerpt}
                                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                                className="glass-input h-20 resize-none"
                                placeholder={t('editor.placeholder.excerpt') || "Brief description of the post"}
                            />
                        </div>
                    </div>

                    {/* Content Editor */}
                    <div className="glass-card p-6 relative z-0">
                        <h2 className="text-lg font-semibold text-white mb-4">{t('editor.section.content') || 'Content'}</h2>
                        <div data-color-mode="dark">
                            <MDEditor
                                value={formData.content}
                                onChange={(val) => setFormData(prev => ({ ...prev, content: val || '' }))}
                                height={500}
                                preview="live"
                                commands={[
                                    ...commands.getCommands(),
                                    {
                                        name: 'video',
                                        keyCommand: 'video',
                                        buttonProps: { 'aria-label': 'Insert Video' },
                                        icon: (
                                            <svg width="12" height="12" viewBox="0 0 20 20">
                                                <path fill="currentColor" d="M16 2.012h-12c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-12c0-1.1-.9-2-2-2zm-2 10l-6 4v-8l6 4z" />
                                            </svg>
                                        ),
                                        execute: (state, api) => {
                                            let modifyText = `<video src="url" controls="controls" style="max-width: 100%"></video>\n`;
                                            if (state.selection.start <= state.selection.end) {
                                                api.replaceSelection(modifyText);
                                            }
                                        },
                                    }
                                ]}
                                textareaProps={{
                                    placeholder: t('editor.placeholder.content') || 'Write your content here...',
                                    onPaste: handleContentPaste
                                }}
                            />
                        </div>
                        <p className="mt-3 text-white/40 text-sm">
                            {t('editor.tip') || '💡 Tip: Use Markdown syntax for formatting. Drag & drop images or paste them to upload.'}
                        </p>
                    </div>

                    {/* Cover Image */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">{t('editor.section.cover_image') || 'Cover Image'}</h2>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={formData.cover_image}
                                onChange={(e) => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
                                className="glass-input flex-1"
                                placeholder={t('editor.placeholder.cover_image') || "Enter image URL or upload"}
                            />
                            <label className="glass-button cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const url = await handleImageUpload(file);
                                            setFormData(prev => ({ ...prev, cover_image: url }));
                                        }
                                    }}
                                />
                                {uploadingImage ? <LoadingSpinner size="sm" /> : (t('editor.button.upload') || 'Upload')}
                            </label>
                        </div>
                        {formData.cover_image && (
                            <div className="mt-4 relative group">
                                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/20">
                                    <img
                                        src={formData.cover_image}
                                        alt="Cover preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={() => setFormData(prev => ({ ...prev, cover_image: '' }))}
                                    className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-opacity opacity-0 group-hover:opacity-100"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default BlogEditorPage;
