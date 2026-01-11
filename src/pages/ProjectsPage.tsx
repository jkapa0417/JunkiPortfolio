import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '../components/ui/Loading';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://portfolio-api.jkapa0417.workers.dev';

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
    is_featured: boolean;
    sort_order: number;
    process?: string[];
    process_ko?: string[];
    developed?: string[];
    developed_ko?: string[];
    // Helper fields for mapped data
    name?: string;
    explanation?: string;
    techSkills?: string[];
    workDate?: string;
}

const ProjectsPage = () => {
    const { i18n } = useTranslation();
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [filter, setFilter] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/content/projects`);
                const data = await response.json();
                if (data.projects) {
                    setProjects(data.projects);
                }
            } catch (error) {
                console.error('Failed to fetch projects:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, []);

    // Helper to get localized field
    const getLocalized = (item: any, field: string) => {
        if (i18n.language === 'ko') {
            return item[`${field}_ko`] || item[field];
        }
        return item[field];
    };

    // Get all unique tech skills for filtering
    const allTechSkills = [...new Set(projects.flatMap(p => p.technologies || []))];

    const filteredProjects = filter === 'all'
        ? projects
        : projects.filter(p => (p.technologies || []).includes(filter));

    if (isLoading) {
        return (
            <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

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
                        {i18n.language === 'ko' ? '프로젝트' : 'Projects'}
                    </h1>
                    <p className="text-lg text-white/60 max-w-2xl mx-auto">
                        {i18n.language === 'ko'
                            ? 'LG전자에서 진행한 주요 프로젝트'
                            : 'Key projects at LG Electronics'
                        }
                    </p>
                </motion.div>

                {/* Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-12 flex flex-wrap justify-center gap-2"
                >
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'all'
                            ? 'bg-white/20 text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        All
                    </button>
                    {allTechSkills.slice(0, 8).map(skill => (
                        <button
                            key={skill}
                            onClick={() => setFilter(skill)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === skill
                                ? 'bg-white/20 text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {skill}
                        </button>
                    ))}
                </motion.div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredProjects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                onClick={() => setSelectedProject(project)}
                                className="glass-card p-6 cursor-pointer group hover:scale-[1.02] transition-transform duration-300"
                            >
                                {/* Date - Optional if we have it or reuse something else */}
                                <span className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium mb-4">
                                    Project
                                </span>

                                {/* Title */}
                                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                                    {getLocalized(project, 'title')}
                                </h3>

                                {/* Description */}
                                <p className="text-white/60 text-sm mb-4 line-clamp-3">
                                    {getLocalized(project, 'description')}
                                </p>

                                {/* Tech Stack */}
                                <div className="flex flex-wrap gap-1.5">
                                    {(project.technologies || []).slice(0, 4).map(skill => (
                                        <span
                                            key={skill}
                                            className="px-2 py-1 rounded bg-white/5 text-white/50 text-xs"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                    {(project.technologies || []).length > 4 && (
                                        <span className="px-2 py-1 rounded bg-white/5 text-white/50 text-xs">
                                            +{(project.technologies || []).length - 4}
                                        </span>
                                    )}
                                </div>

                                {/* View More Indicator */}
                                <div className="mt-4 pt-4 border-t border-white/10 flex items-center text-white/40 text-sm group-hover:text-purple-300 transition-colors">
                                    <span>{i18n.language === 'ko' ? '자세히 보기' : 'View Details'}</span>
                                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Project Modal */}
                <AnimatePresence>
                    {selectedProject && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProject(null)}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="glass-card max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8"
                            >
                                {/* Close Button */}
                                <button
                                    onClick={() => setSelectedProject(null)}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                {/* Header */}
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                    {getLocalized(selectedProject, 'title')}
                                </h2>
                                <p className="text-white/70 mb-6">{getLocalized(selectedProject, 'long_description') || getLocalized(selectedProject, 'description')}</p>

                                {/* Tech Stack */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">
                                        {i18n.language === 'ko' ? '기술 스택' : 'Tech Stack'}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(selectedProject.technologies || []).map(skill => (
                                            <span key={skill} className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-sm">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Process Steps */}
                                {(getLocalized(selectedProject, 'process') || []).length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">
                                            {i18n.language === 'ko' ? '프로세스' : 'Process'}
                                        </h4>
                                        <ul className="list-disc list-inside space-y-2 text-white/70">
                                            {(getLocalized(selectedProject, 'process') || []).map((step: string, i: number) => (
                                                <li key={i}>{step}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Developed Details */}
                                {(getLocalized(selectedProject, 'developed') || []).length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">
                                            {i18n.language === 'ko' ? '개발 내용' : 'Development Details'}
                                        </h4>
                                        <ul className="list-disc list-inside space-y-2 text-white/70">
                                            {(getLocalized(selectedProject, 'developed') || []).map((detail: string, i: number) => (
                                                <li key={i}>{detail}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Project Link */}
                                {selectedProject.demo_url && (
                                    <a
                                        href={selectedProject.demo_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="glass-button inline-flex mt-4"
                                    >
                                        {i18n.language === 'ko' ? '프로젝트 보기' : 'View Project'}
                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ProjectsPage;
