import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '../components/ui/Loading';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://portfolio-api.jkapa0417.workers.dev';

interface SkillCategory {
    id: number;
    name: string;
    name_ko: string | null;
    icon: string | null;
    color: string | null;
    skills: { id: number; name: string; level: number }[];
}

const SkillsPage = () => {
    const { i18n } = useTranslation();
    const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/content/skills`);
                const data = await response.json();
                if (data.categories) {
                    setSkillCategories(data.categories);
                }
            } catch (error) {
                console.error('Failed to fetch skills:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSkills();
    }, []);

    const categoryIcons: Record<string, React.ReactNode> = {
        'Frontend Development': (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        'Backend Development': (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
        ),
        'Data & LLM': (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        ),
        'Cloud': (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
        ),
    };

    const categoryColors: Record<string, string> = {
        'Frontend Development': 'from-pink-500 to-rose-500',
        'Backend Development': 'from-green-500 to-emerald-500',
        'Data & LLM': 'from-purple-500 to-violet-500',
        'Cloud': 'from-blue-500 to-cyan-500',
    };

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
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                        {i18n.language === 'ko' ? '기술 스택' : 'Skills'}
                    </h1>
                    <p className="text-lg text-white/60 max-w-2xl mx-auto">
                        {i18n.language === 'ko'
                            ? '풀스택 개발과 데이터 사이언스 분야의 전문 기술'
                            : 'Expertise in full-stack development and data science'
                        }
                    </p>
                </motion.div>

                {/* Skills Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {skillCategories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="glass-card relative group hover:scale-[1.02] transition-transform duration-300 h-[320px] overflow-hidden"
                        >
                            {/* Default State (Visible when not hovered) */}
                            <div className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center transition-opacity duration-300 group-hover:opacity-0">
                                <div className={`p-6 rounded-2xl bg-gradient-to-br ${categoryColors[category.name] || 'from-gray-500 to-gray-600'} text-white mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                                    {categoryIcons[category.name] || (
                                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                    )}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    {i18n.language === 'ko' ? (category.name_ko || category.name) : category.name}
                                </h3>
                                <div className="flex flex-wrap justify-center gap-2 mt-4 opacity-60">
                                    {category.skills.slice(0, 4).map(skill => (
                                        <span key={skill.id} className="text-sm text-white">{skill.name}</span>
                                    ))}
                                    {category.skills.length > 4 && (
                                        <span className="text-sm text-white">+{category.skills.length - 4}</span>
                                    )}
                                </div>
                            </div>

                            {/* Hover State (Proficiency Graph) */}
                            <div className="absolute inset-0 bg-[#1a1a2e] opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-y-auto">
                                <h4 className="text-lg font-bold text-white sticky top-0 bg-[#1a1a2e] px-6 py-4 border-b border-white/10 z-20 shadow-lg">
                                    {i18n.language === 'ko' ? (category.name_ko || category.name) : category.name}
                                </h4>
                                <div className="p-6 space-y-4">
                                    {category.skills.map((skill) => (
                                        <div key={skill.id} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-white font-medium">{skill.name}</span>
                                                <span className="text-white/60">{skill.level}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${skill.level}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className={`h-full bg-gradient-to-r ${categoryColors[category.name] || 'from-gray-500 to-gray-600'}`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Additional Info */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mt-16 glass-card p-8 text-center"
                >
                    <h3 className="text-2xl font-bold text-white mb-4">
                        {i18n.language === 'ko' ? '지속적인 학습' : 'Continuous Learning'}
                    </h3>
                    <p className="text-white/60 max-w-2xl mx-auto">
                        {i18n.language === 'ko'
                            ? '새로운 기술과 트렌드를 지속적으로 학습하며, AI와 클라우드 분야의 최신 동향을 따라가고 있습니다.'
                            : "I'm constantly learning new technologies and keeping up with the latest trends in AI and cloud computing."
                        }
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default SkillsPage;
