import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '../components/ui/Loading';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://portfolio-api.jkapa0417.workers.dev';

interface CareerItem {
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
    responsibilities: string[] | string; // Can be JSON string or parsed array
    department?: string; // For backward compatibility if needed, though we use description now
    location?: string;
}

const CareerPage = () => {
    const { i18n } = useTranslation();
    const [careers, setCareers] = useState<CareerItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCareers = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/content/careers`);
                const data = await response.json();
                if (data.careers) {
                    setCareers(data.careers);
                }
            } catch (error) {
                console.error('Failed to fetch careers:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCareers();
    }, []);

    const formatDates = (start: string, end: string | null, isCurrent: boolean) => {
        // Simple formatter, can be enhanced
        return `${start} - ${isCurrent ? (i18n.language === 'ko' ? '현재' : 'Present') : end}`;
    };

    const calculateDuration = (start: string, end: string | null, isCurrent: boolean) => {
        // Simplified duration calculation
        const startDate = new Date(start);
        const endDate = isCurrent ? new Date() : (end ? new Date(end) : new Date());

        const totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;

        if (i18n.language === 'ko') {
            return `${years > 0 ? `${years}년 ` : ''}${months}개월`;
        }
        return `${years > 0 ? `${years} year${years > 1 ? 's' : ''} ` : ''}${months} month${months !== 1 ? 's' : ''}`;
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
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                        {i18n.language === 'ko' ? '경력' : 'Career'}
                    </h1>
                    <p className="text-lg text-white/60 max-w-2xl mx-auto">
                        {i18n.language === 'ko'
                            ? 'LG전자에서의 성장 여정'
                            : 'My professional journey at LG Electronics'
                        }
                    </p>
                </motion.div>

                {/* Timeline */}
                <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500 via-blue-500 to-cyan-500 transform md:-translate-x-1/2" />

                    {/* Career Items */}
                    <div className="space-y-12">
                        {careers.map((item, index) => {
                            const responsibilities = Array.isArray(item.responsibilities)
                                ? item.responsibilities
                                : []; // Handled by API parsing usually, but safe check needed if raw string

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true, margin: '-50px' }}
                                    className={`relative flex flex-col md:flex-row ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                                        } gap-8`}
                                >
                                    {/* Timeline Dot */}
                                    <div className="absolute left-0 md:left-1/2 top-8 w-4 h-4 bg-purple-500 rounded-full transform -translate-x-1/2 md:-translate-x-1/2 ring-4 ring-purple-500/20" />

                                    {/* Empty space for alternating layout */}
                                    <div className="hidden md:block md:w-1/2" />

                                    {/* Content Card */}
                                    <div className="ml-8 md:ml-0 md:w-1/2">
                                        <div className="glass-card p-6 md:p-8 group relative">
                                            {/* Date Badge */}
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium mb-4">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {formatDates(item.start_date, item.end_date, item.is_current)}
                                            </div>

                                            {/* Position & Company */}
                                            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                                                {i18n.language === 'ko' ? (item.position_ko || item.position) : item.position}
                                            </h3>
                                            <p className="text-purple-300 font-medium mb-1">
                                                {i18n.language === 'ko' ? (item.company_ko || item.company) : item.company}
                                            </p>
                                            <p className="text-white/50 text-sm mb-4">
                                                {i18n.language === 'ko' ? (item.description_ko || item.description) : item.description}
                                            </p>

                                            {/* Responsibilities */}
                                            <div className="relative">
                                                {/* Animated List Container */}
                                                <div className="relative overflow-hidden transition-all duration-500 ease-in-out max-h-[160px] group-hover:max-h-[1000px]">
                                                    <ul className="space-y-2">
                                                        {responsibilities.map((resp, rIdx) => (
                                                            <li key={rIdx} className="flex items-start gap-3 text-white/70 text-sm">
                                                                <span className="mt-1.5 w-1.5 h-1.5 bg-cyan-400 rounded-full flex-shrink-0" />
                                                                {resp}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* "+N More" Indicator (Fades out on hover, separate from list) */}
                                                {responsibilities.length > 4 && (
                                                    <div className="mt-4 flex justify-center group-hover:opacity-0 group-hover:h-0 group-hover:mt-0 transition-all duration-300 overflow-hidden">
                                                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-white/10 text-white/60 border border-white/5 backdrop-blur-sm cursor-help">
                                                            +{responsibilities.length - 4} More
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Duration Badge */}
                                            <div className="mt-4 pt-4 border-t border-white/10">
                                                <span className="text-white/40 text-sm">
                                                    {calculateDuration(item.start_date, item.end_date, item.is_current)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerPage;
