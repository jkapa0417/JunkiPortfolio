import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/AuthContext';
import { LoadingSpinner } from '../components/ui/Loading';
import { CustomSelect } from '../components/ui/CustomSelect';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://portfolio-api.jkapa0417.workers.dev';

type TabType = 'categories' | 'careers' | 'skills' | 'projects' | 'contact' | 'skill_category';

interface Category {
    id: number;
    slug: string;
    name: string;
    name_ko: string | null;
    description: string | null;
    sort_order: number;
}

interface Career {
    id: number;
    company: string;
    company_ko: string | null;
    position: string;
    position_ko: string | null;
    start_date: string;
    end_date: string | null;
    is_current: boolean;
    description: string | null;
    description_ko: string | null;
    responsibilities: string[];
    technologies: string[];
    sort_order: number;
}

interface SkillCategory {
    id: number;
    name: string;
    name_ko: string | null;
    icon: string | null;
    color: string | null;
    skills: { id: number; name: string; level: number }[];
}

interface Project {
    id: number;
    slug: string;
    title: string;
    title_ko: string | null;
    description: string | null;
    description_ko: string | null;
    long_description: string | null;
    long_description_ko: string | null;
    image_url: string | null;
    demo_url: string | null;
    github_url: string | null;
    technologies: string[];
    process: string[];
    process_ko: string[];
    developed: string[];
    developed_ko: string[];
    category: string | null;
    is_featured: boolean;
    sort_order: number;
}

interface ContactItem {
    id: number;
    key: string;
    value: string;
    label: string | null;
    icon: string | null;
    sort_order: number;
}

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { } = useTranslation();
    const { isAdmin, isLoading: authLoading } = useAuth();

    const [activeTab, setActiveTab] = useState<TabType>('categories');
    const [isLoading, setIsLoading] = useState(true);

    // Data states
    const [categories, setCategories] = useState<Category[]>([]);
    const [careers, setCareers] = useState<Career[]>([]);
    const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [contacts, setContacts] = useState<ContactItem[]>([]);

    // Edit states
    const [editingItem, setEditingItem] = useState<any>(null);
    const [showForm, setShowForm] = useState(false);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('auth_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-User-Admin': 'true',
        };
    };

    useEffect(() => {
        if (!authLoading && isAdmin) {
            loadData();
        }
    }, [activeTab, authLoading, isAdmin]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            switch (activeTab) {
                case 'categories':
                    const catRes = await fetch(`${API_BASE_URL}/api/categories`);
                    const catData = await catRes.json();
                    setCategories(catData.categories || []);
                    break;
                case 'careers':
                    const carRes = await fetch(`${API_BASE_URL}/api/content/careers`);
                    const carData = await carRes.json();
                    setCareers(carData.careers || []);
                    break;
                case 'skills':
                    const skillRes = await fetch(`${API_BASE_URL}/api/content/skills`);
                    const skillData = await skillRes.json();
                    setSkillCategories(skillData.categories || []);
                    break;
                case 'projects':
                    const projRes = await fetch(`${API_BASE_URL}/api/content/projects`);
                    const projData = await projRes.json();
                    setProjects(projData.projects || []);
                    break;
                case 'contact':
                    const contRes = await fetch(`${API_BASE_URL}/api/content/contact`);
                    const contData = await contRes.json();
                    setContacts(contData.contacts || []);
                    break;
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (type: string, id: string | number) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            let endpoint = '';
            switch (type) {
                case 'category': endpoint = `/api/categories/${id}`; break;
                case 'career': endpoint = `/api/content/careers/${id}`; break;
                case 'project': endpoint = `/api/content/projects/${id}`; break;
                case 'skill': endpoint = `/api/content/skills/${id}`; break;
                case 'skillCategory': endpoint = `/api/content/skills/categories/${id}`; break;
                case 'contact': endpoint = `/api/content/contact/${id}`; break;
            }

            await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            loadData();
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const handleSave = async (data: any) => {
        try {
            let endpoint = '';
            // Determine if it's an EDIT or CREATE based on presence of an identifier
            // We check for unique identifiers: id, slug (categories), or key (contact - though contact forces POST)
            // Note: When adding a skill via inline button, editingItem is set to { category_id: ... } which has no id, so it's a CREATE.
            const isEdit = editingItem && (editingItem.id || (activeTab === 'categories' && editingItem.slug));
            let method = isEdit ? 'PUT' : 'POST';

            switch (activeTab) {
                case 'categories':
                    endpoint = isEdit ? `/api/categories/${editingItem.slug}` : '/api/categories';
                    break;
                case 'careers':
                    endpoint = isEdit ? `/api/content/careers/${editingItem.id}` : '/api/content/careers';
                    break;
                case 'projects':
                    endpoint = isEdit ? `/api/content/projects/${editingItem.id}` : '/api/content/projects';
                    break;
                case 'contact':
                    endpoint = '/api/content/contact';
                    method = 'POST'; // Uses upsert
                    break;
                case 'skills': // Adding/Editing a Skill
                    endpoint = isEdit ? `/api/content/skills/${editingItem.id}` : '/api/content/skills';
                    if (editingItem && editingItem.skills) {
                        // It's actually a category if we are editing a category item via key
                        // Check if it's a category or skill.
                        endpoint = `/api/content/skills/categories/${editingItem.id}`;
                        (window as any).formOverride = 'skill_category'; // Ensure type is correct for save
                    } else if ((window as any).formOverride === 'skill_category') {
                        endpoint = isEdit ? `/api/content/skills/categories/${editingItem.id}` : '/api/content/skills/categories';
                    }
                    break;
                case 'skill_category':
                    endpoint = isEdit ? `/api/content/skills/categories/${editingItem.id}` : '/api/content/skills/categories';
                    break;
            }

            await fetch(`${API_BASE_URL}${endpoint}`, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(data),
            });

            setShowForm(false);
            setEditingItem(null);
            loadData();
        } catch (error) {
            console.error('Failed to save:', error);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen pt-24 pb-20 px-4 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
                    <p className="text-white/60 mb-6">Admin access required</p>
                    <button onClick={() => navigate('/')} className="glass-button">
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    const tabs: { key: TabType; label: string }[] = [
        { key: 'categories', label: 'Categories' },
        { key: 'careers', label: 'Career' },
        { key: 'skills', label: 'Skills' },
        { key: 'projects', label: 'Projects' },
        { key: 'contact', label: 'Contact' },
    ];

    return (
        <div className="min-h-screen pt-24 pb-20 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                    <p className="text-white/60">Manage your portfolio content</p>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-wrap gap-2 mb-8"
                >
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => {
                                setActiveTab(tab.key);
                                setShowForm(false);
                                setEditingItem(null);
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.key
                                ? 'bg-purple-500/30 text-white border border-purple-500/50'
                                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </motion.div>

                {/* Content Area */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6"
                >
                    {/* Header with Add button */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white capitalize">{activeTab}</h2>
                        <div className="flex gap-2">
                            {activeTab === 'skills' && (
                                <button
                                    onClick={() => {
                                        setEditingItem(null);
                                        (window as any).formOverride = 'skill_category';
                                        setShowForm(true);
                                    }}
                                    className="glass-button flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Category
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setEditingItem(null);
                                    (window as any).formOverride = null;
                                    setShowForm(true);
                                }}
                                className="glass-button glass-button--primary flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                {activeTab === 'skills' ? 'Add Skill' : 'Add New'}
                            </button>
                        </div>
                    </div>

                    {/* Loading */}
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : (
                        <>
                            {/* Categories Table */}
                            {activeTab === 'categories' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="text-left py-3 px-4 text-white/60 font-medium">Slug</th>
                                                <th className="text-left py-3 px-4 text-white/60 font-medium">Name</th>
                                                <th className="text-left py-3 px-4 text-white/60 font-medium">Name (KO)</th>
                                                <th className="text-left py-3 px-4 text-white/60 font-medium">Order</th>
                                                <th className="text-right py-3 px-4 text-white/60 font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {categories.map(cat => (
                                                <tr key={cat.id} className="border-b border-white/5 hover:bg-white/5">
                                                    <td className="py-3 px-4 text-white/80 font-mono text-sm">{cat.slug}</td>
                                                    <td className="py-3 px-4 text-white">{cat.name}</td>
                                                    <td className="py-3 px-4 text-white/70">{cat.name_ko || '-'}</td>
                                                    <td className="py-3 px-4 text-white/60">{cat.sort_order}</td>
                                                    <td className="py-3 px-4 text-right">
                                                        <button
                                                            onClick={() => { setEditingItem(cat); setShowForm(true); }}
                                                            className="text-blue-400 hover:text-blue-300 mr-3"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete('category', cat.slug)}
                                                            className="text-red-400 hover:text-red-300"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {categories.length === 0 && (
                                        <p className="text-center py-8 text-white/40">No categories yet</p>
                                    )}
                                </div>
                            )}

                            {/* Careers Table */}
                            {activeTab === 'careers' && (
                                <div className="space-y-4">
                                    {careers.map(career => (
                                        <div key={career.id} className="p-4 rounded-xl bg-white/5 flex items-start justify-between">
                                            <div>
                                                <h3 className="text-white font-semibold">{career.position}</h3>
                                                <p className="text-white/60">{career.company}</p>
                                                <p className="text-white/40 text-sm">
                                                    {career.start_date} - {career.is_current ? 'Present' : career.end_date}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => { setEditingItem(career); setShowForm(true); }}
                                                    className="p-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete('career', career.id)}
                                                    className="p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {careers.length === 0 && (
                                        <p className="text-center py-8 text-white/40">No careers yet</p>
                                    )}
                                </div>
                            )}

                            {/* Skills */}
                            {activeTab === 'skills' && (
                                <div className="space-y-6">
                                    {skillCategories.map(cat => (
                                        <div key={cat.id} className="p-4 rounded-xl bg-white/5">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-white font-semibold">{cat.name}</h3>
                                                <button
                                                    onClick={() => handleDelete('skillCategory', cat.id)}
                                                    className="text-red-400 hover:text-red-300 text-sm"
                                                >
                                                    Delete Category
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {cat.skills.map(skill => (
                                                    <span
                                                        key={skill.id}
                                                        className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm flex items-center gap-2 cursor-pointer hover:bg-white/20 transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingItem(skill);
                                                            (window as any).formOverride = 'skills';
                                                            setShowForm(true);
                                                        }}
                                                    >
                                                        {skill.name}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete('skill', skill.id);
                                                            }}
                                                            className="text-red-400 hover:text-red-300 ml-1"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                                <button
                                                    onClick={() => {
                                                        setEditingItem({ category_id: cat.id });
                                                        (window as any).formOverride = 'skills';
                                                        setShowForm(true);
                                                    }}
                                                    className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-sm flex items-center gap-1 transition-colors"
                                                >
                                                    <span className="text-lg leading-none">+</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {skillCategories.length === 0 && (
                                        <p className="text-center py-8 text-white/40">No skills yet</p>
                                    )}
                                </div>
                            )}

                            {/* Projects */}
                            {activeTab === 'projects' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {projects.map(project => (
                                        <div key={project.id} className="p-4 rounded-xl bg-white/5">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="text-white font-semibold">{project.title}</h3>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => { setEditingItem(project); setShowForm(true); }}
                                                        className="text-blue-400 hover:text-blue-300"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete('project', project.id)}
                                                        className="text-red-400 hover:text-red-300"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-white/60 text-sm mb-2">{project.description}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {project.technologies.map((tech, i) => (
                                                    <span key={i} className="px-2 py-0.5 rounded bg-white/10 text-white/60 text-xs">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {projects.length === 0 && (
                                        <p className="text-center py-8 text-white/40 col-span-2">No projects yet</p>
                                    )}
                                </div>
                            )}

                            {/* Contact */}
                            {activeTab === 'contact' && (
                                <ContactSettings
                                    initialContacts={contacts}
                                    onSave={async (formData) => {
                                        // Batch save contacts
                                        for (const [key, value] of Object.entries(formData)) {
                                            if (value) {
                                                await fetch(`${API_BASE_URL}/api/content/contact`, {
                                                    method: 'POST',
                                                    headers: getAuthHeaders(),
                                                    body: JSON.stringify({
                                                        key,
                                                        value: value,
                                                        label: key.charAt(0).toUpperCase() + key.slice(1),
                                                        icon: key,
                                                        is_visible: true,
                                                        sort_order: key === 'email' ? 1 : key === 'github' ? 2 : 3
                                                    }),
                                                });
                                            } else {
                                                // Optional: Delete if empty
                                                await fetch(`${API_BASE_URL}/api/content/contact/${key}`, {
                                                    method: 'DELETE',
                                                    headers: getAuthHeaders()
                                                });
                                            }
                                        }
                                        loadData();
                                    }}
                                />
                            )}
                        </>
                    )}
                </motion.div>

                {/* Form Modal */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setShowForm(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="glass-card p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
                                onClick={e => e.stopPropagation()}
                            >
                                <h3 className="text-xl font-bold text-white mb-4">
                                    {editingItem ? 'Edit' : 'Add New'} {activeTab.slice(0, -1)}
                                </h3>

                                {/* Dynamic Form based on activeTab */}
                                <FormRenderer
                                    type={(window as any).formOverride || activeTab}
                                    initialData={editingItem}
                                    contextData={{ skillCategories }}
                                    onSave={handleSave}
                                    onCancel={() => setShowForm(false)}
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// Simplified Contact Form Component
const ContactSettings = ({ initialContacts, onSave }: { initialContacts: ContactItem[], onSave: (data: any) => Promise<void> }) => {
    const [formData, setFormData] = useState<{ [key: string]: string }>({
        email: '',
        github: '',
        linkedin: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const newFormData: any = { email: '', github: '', linkedin: '' };
        initialContacts.forEach(c => {
            if (['email', 'github', 'linkedin'].includes(c.key)) {
                newFormData[c.key] = c.value;
            }
        });
        setFormData(newFormData);
    }, [initialContacts]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(formData);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
            <div className="grid gap-6">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-white font-medium">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="glass-input w-full"
                        placeholder="you@example.com"
                    />
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-white font-medium">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        GitHub Profile URL
                    </label>
                    <input
                        type="url"
                        value={formData.github}
                        onChange={e => setFormData(prev => ({ ...prev, github: e.target.value }))}
                        className="glass-input w-full"
                        placeholder="https://github.com/username"
                    />
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-white font-medium">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                        LinkedIn Profile URL
                    </label>
                    <input
                        type="url"
                        value={formData.linkedin}
                        onChange={e => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                        className="glass-input w-full"
                        placeholder="https://linkedin.com/in/username"
                    />
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="glass-button glass-button--primary px-8"
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

// Form renderer component
interface FormRendererProps {
    type: TabType;
    initialData: any;
    contextData?: any;
    onSave: (data: any) => void;
    onCancel: () => void;
}

const StringListInput = ({ items, onChange, placeholder }: { items: string[], onChange: (items: string[]) => void, placeholder?: string }) => {
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
        if (inputValue.trim()) {
            onChange([...items, inputValue.trim()]);
            setInputValue('');
        }
    };

    const handleRemove = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                    className="glass-input flex-1"
                    placeholder={placeholder || "Add item..."}
                />
                <button type="button" onClick={handleAdd} className="glass-button">Add</button>
            </div>
            <div className="space-y-1">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded bg-white/5">
                        <span className="flex-1 text-sm text-white/80">{item}</span>
                        <button type="button" onClick={() => handleRemove(index)} className="text-red-400 hover:text-red-300">×</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const FormRenderer = ({ type, initialData, contextData, onSave, onCancel }: FormRendererProps) => {
    const [formData, setFormData] = useState(initialData || {});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const updateField = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    switch (type) {
        case 'categories':
            return (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white/80 text-sm mb-1">Slug *</label>
                        <input
                            type="text"
                            value={formData.slug || ''}
                            onChange={e => updateField('slug', e.target.value)}
                            className="glass-input"
                            required
                            disabled={!!initialData}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/80 text-sm mb-1">Name (EN) *</label>
                            <input
                                type="text"
                                value={formData.name || ''}
                                onChange={e => updateField('name', e.target.value)}
                                className="glass-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-white/80 text-sm mb-1">Name (KO)</label>
                            <input
                                type="text"
                                value={formData.name_ko || ''}
                                onChange={e => updateField('name_ko', e.target.value)}
                                className="glass-input"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-white/80 text-sm mb-1">Sort Order</label>
                        <input
                            type="number"
                            value={formData.sort_order || 0}
                            onChange={e => updateField('sort_order', parseInt(e.target.value))}
                            className="glass-input"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="submit" className="glass-button glass-button--primary flex-1">
                            Save
                        </button>
                        <button type="button" onClick={onCancel} className="glass-button flex-1">
                            Cancel
                        </button>
                    </div>
                </form>
            );

        case 'careers':
            return (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/80 text-sm mb-1">Company *</label>
                            <input
                                type="text"
                                value={formData.company || ''}
                                onChange={e => updateField('company', e.target.value)}
                                className="glass-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-white/80 text-sm mb-1">Company (KO)</label>
                            <input
                                type="text"
                                value={formData.company_ko || ''}
                                onChange={e => updateField('company_ko', e.target.value)}
                                className="glass-input"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/80 text-sm mb-1">Position *</label>
                            <input
                                type="text"
                                value={formData.position || ''}
                                onChange={e => updateField('position', e.target.value)}
                                className="glass-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-white/80 text-sm mb-1">Position (KO)</label>
                            <input
                                type="text"
                                value={formData.position_ko || ''}
                                onChange={e => updateField('position_ko', e.target.value)}
                                className="glass-input"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/80 text-sm mb-1">Start Date *</label>
                            <input
                                type="text"
                                value={formData.start_date || ''}
                                onChange={e => updateField('start_date', e.target.value)}
                                className="glass-input"
                                placeholder="2023-01"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-white/80 text-sm mb-1">End Date</label>
                            <input
                                type="text"
                                value={formData.end_date || ''}
                                onChange={e => updateField('end_date', e.target.value)}
                                className="glass-input"
                                placeholder="Leave empty if current"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.is_current || false}
                            onChange={e => updateField('is_current', e.target.checked)}
                            id="is_current"
                        />
                        <label htmlFor="is_current" className="text-white/80 text-sm">Currently working here</label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/80 text-sm mb-1">Description (Team/Role)</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={e => updateField('description', e.target.value)}
                                className="glass-input h-32 resize-none"
                                placeholder="Brief description or team name..."
                            />
                        </div>
                        <div>
                            <label className="block text-white/80 text-sm mb-1">Description (KO)</label>
                            <textarea
                                value={formData.description_ko || ''}
                                onChange={e => updateField('description_ko', e.target.value)}
                                className="glass-input h-32 resize-none"
                                placeholder="Korean description..."
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-white/80 text-sm mb-1">Key Responsibilities / Achievements</label>
                        <StringListInput
                            items={formData.responsibilities || []}
                            onChange={items => updateField('responsibilities', items)}
                            placeholder="Add responsibility or achievement..."
                        />
                    </div>
                    <div>
                        <label className="block text-white/80 text-sm mb-1">Technologies (comma-separated)</label>
                        <input
                            type="text"
                            value={(formData.technologies || []).join(', ')}
                            onChange={e => updateField('technologies', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                            className="glass-input"
                            placeholder="React, TypeScript, Node.js"
                        />
                    </div>
                    <div>
                        <label className="block text-white/80 text-sm mb-1">Sort Order (Leave empty for auto)</label>
                        <input
                            type="number"
                            value={formData.sort_order ?? ''}
                            onChange={e => updateField('sort_order', e.target.value === '' ? null : parseInt(e.target.value))}
                            className="glass-input"
                            placeholder="Auto"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="submit" className="glass-button glass-button--primary flex-1">
                            Save
                        </button>
                        <button type="button" onClick={onCancel} className="glass-button flex-1">
                            Cancel
                        </button>
                    </div>
                </form>
            );

        case 'projects':
            return (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white/80 text-sm mb-1">Slug *</label>
                        <input
                            type="text"
                            value={formData.slug || ''}
                            onChange={e => updateField('slug', e.target.value)}
                            className="glass-input"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/80 text-sm mb-1">Title *</label>
                            <input
                                type="text"
                                value={formData.title || ''}
                                onChange={e => updateField('title', e.target.value)}
                                className="glass-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-white/80 text-sm mb-1">Title (KO)</label>
                            <input
                                type="text"
                                value={formData.title_ko || ''}
                                onChange={e => updateField('title_ko', e.target.value)}
                                className="glass-input"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/80 text-sm mb-1">Description (Short)</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={e => updateField('description', e.target.value)}
                                className="glass-input h-24 resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-white/80 text-sm mb-1">Description (Short - KO)</label>
                            <textarea
                                value={formData.description_ko || ''}
                                onChange={e => updateField('description_ko', e.target.value)}
                                className="glass-input h-24 resize-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/80 text-sm mb-1">Long Description</label>
                            <textarea
                                value={formData.long_description || ''}
                                onChange={e => updateField('long_description', e.target.value)}
                                className="glass-input h-40 resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-white/80 text-sm mb-1">Long Description (KO)</label>
                            <textarea
                                value={formData.long_description_ko || ''}
                                onChange={e => updateField('long_description_ko', e.target.value)}
                                className="glass-input h-40 resize-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 border-t border-white/10 pt-4">
                        <h3 className="text-white/80 font-medium">Process & Development</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-white/80 text-sm mb-1">Process Steps</label>
                                <StringListInput
                                    items={formData.process || []}
                                    onChange={items => updateField('process', items)}
                                    placeholder="Add process step..."
                                />
                            </div>
                            <div>
                                <label className="block text-white/80 text-sm mb-1">Process Steps (KO)</label>
                                <StringListInput
                                    items={formData.process_ko || []}
                                    onChange={items => updateField('process_ko', items)}
                                    placeholder="Add process step (KO)..."
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-white/80 text-sm mb-1">Development Details</label>
                                <StringListInput
                                    items={formData.developed || []}
                                    onChange={items => updateField('developed', items)}
                                    placeholder="Add development detail..."
                                />
                            </div>
                            <div>
                                <label className="block text-white/80 text-sm mb-1">Development Details (KO)</label>
                                <StringListInput
                                    items={formData.developed_ko || []}
                                    onChange={items => updateField('developed_ko', items)}
                                    placeholder="Add development detail (KO)..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block text-white/80 text-sm mb-1">Demo URL</label>
                            <input
                                type="url"
                                value={formData.demo_url || ''}
                                onChange={e => updateField('demo_url', e.target.value)}
                                className="glass-input"
                            />
                        </div>
                        <div>
                            <label className="block text-white/80 text-sm mb-1">GitHub URL</label>
                            <input
                                type="url"
                                value={formData.github_url || ''}
                                onChange={e => updateField('github_url', e.target.value)}
                                className="glass-input"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-white/80 text-sm mb-1">Technologies (comma-separated)</label>
                        <input
                            type="text"
                            value={(formData.technologies || []).join(', ')}
                            onChange={e => updateField('technologies', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                            className="glass-input"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.is_featured || false}
                            onChange={e => updateField('is_featured', e.target.checked)}
                            id="is_featured"
                        />
                        <label htmlFor="is_featured" className="text-white/80 text-sm">Featured project</label>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="submit" className="glass-button glass-button--primary flex-1">
                            Save
                        </button>
                        <button type="button" onClick={onCancel} className="glass-button flex-1">
                            Cancel
                        </button>
                    </div>
                </form>
            );

        case 'contact':
            return (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white/80 text-sm mb-1">Key *</label>
                        <input
                            type="text"
                            value={formData.key || ''}
                            onChange={e => updateField('key', e.target.value)}
                            className="glass-input"
                            placeholder="email, github, linkedin, etc."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-white/80 text-sm mb-1">Value *</label>
                        <input
                            type="text"
                            value={formData.value || ''}
                            onChange={e => updateField('value', e.target.value)}
                            className="glass-input"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/80 text-sm mb-1">Label</label>
                            <input
                                type="text"
                                value={formData.label || ''}
                                onChange={e => updateField('label', e.target.value)}
                                className="glass-input"
                                placeholder="Display Text (optional)"
                            />
                        </div>
                        <div>
                            <label className="block text-white/80 text-sm mb-1">Label (KO)</label>
                            <input
                                type="text"
                                value={formData.label_ko || ''}
                                onChange={e => updateField('label_ko', e.target.value)}
                                className="glass-input"
                                placeholder="Display Text (KO)"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-white/80 text-sm mb-1">Icon (ReactBits/Lucide Name)</label>
                        <input
                            type="text"
                            value={formData.icon || ''}
                            onChange={e => updateField('icon', e.target.value)}
                            className="glass-input"
                            placeholder="e.g., github, linkedin, mail"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.is_visible !== false}
                            onChange={e => updateField('is_visible', e.target.checked)}
                            id="contact_visible"
                        />
                        <label htmlFor="contact_visible" className="text-white/80 text-sm">Visible on site</label>
                    </div>
                    <div>
                        <label className="block text-white/80 text-sm mb-1">Sort Order (Leave empty for auto)</label>
                        <input
                            type="number"
                            value={formData.sort_order ?? ''}
                            onChange={e => updateField('sort_order', e.target.value === '' ? null : parseInt(e.target.value))}
                            className="glass-input"
                            placeholder="Auto"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="submit" className="glass-button glass-button--primary flex-1">
                            Save
                        </button>
                        <button type="button" onClick={onCancel} className="glass-button flex-1">
                            Cancel
                        </button>
                    </div>
                </form>
            );

        case 'skills':
            return (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white/80 text-sm mb-1">Category *</label>
                        <CustomSelect
                            value={formData.category_id || ''}
                            onChange={(val) => updateField('category_id', typeof val === 'string' ? parseInt(val) : val)}
                            options={(contextData?.skillCategories || []).map((cat: any) => ({
                                value: cat.id,
                                label: cat.name
                            }))}
                            placeholder="Select Category"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/80 text-sm mb-1">Name *</label>
                            <input
                                type="text"
                                value={formData.name || ''}
                                onChange={e => updateField('name', e.target.value)}
                                className="glass-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-white/80 text-sm mb-1">Proficiency (0-100)</label>
                            <input
                                type="number"
                                value={formData.level || 80}
                                onChange={e => updateField('level', parseInt(e.target.value))}
                                className="glass-input"
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-white/80 text-sm mb-1">Sort Order (Leave empty for auto)</label>
                        <input
                            type="number"
                            value={formData.sort_order ?? ''}
                            onChange={e => updateField('sort_order', e.target.value === '' ? null : parseInt(e.target.value))}
                            className="glass-input"
                            placeholder="Auto"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="submit" className="glass-button glass-button--primary flex-1">
                            Save Skill
                        </button>
                        <button type="button" onClick={onCancel} className="glass-button flex-1">
                            Cancel
                        </button>
                    </div>
                </form>
            );

        case 'skill_category':
            return (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white/80 text-sm mb-1">Category Name *</label>
                        <input
                            type="text"
                            value={formData.name || ''}
                            onChange={e => updateField('name', e.target.value)}
                            className="glass-input"
                            placeholder="e.g., Frontend, Backend, DevOps"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-white/80 text-sm mb-1">Category Name (KO)</label>
                        <input
                            type="text"
                            value={formData.name_ko || ''}
                            onChange={e => updateField('name_ko', e.target.value)}
                            className="glass-input"
                        />
                    </div>
                    <div>
                        <label className="block text-white/80 text-sm mb-1">Sort Order (Leave empty for auto)</label>
                        <input
                            type="number"
                            value={formData.sort_order ?? ''}
                            onChange={e => updateField('sort_order', e.target.value === '' ? null : parseInt(e.target.value))}
                            className="glass-input"
                            placeholder="Auto"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="submit" className="glass-button glass-button--primary flex-1">
                            Save Category
                        </button>
                        <button type="button" onClick={onCancel} className="glass-button flex-1">
                            Cancel
                        </button>
                    </div>
                </form>
            );

        default:
            return null;
    }
};

export default AdminDashboard;
