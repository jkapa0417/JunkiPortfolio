import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SplitText from '../components/reactbits/SplitText';
import ShinyText from '../components/reactbits/ShinyText';
import { getCareers, getSkills, Career, SkillCategory } from '../lib/api';
import SEO from '../components/SEO';
import { PersonSchema } from '../components/Schema';

const HomePage = () => {
    const { i18n } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentCareer, setCurrentCareer] = useState<Career | null>(null);
    const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Careers to find current role
                const { careers } = await getCareers();
                const current = careers.find(c => c.is_current) || careers[0];
                setCurrentCareer(current || null);

                // Fetch Skills
                const { categories } = await getSkills();
                setSkillCategories(categories);
            } catch (error) {
                console.error('Failed to fetch home page data:', error);
            }
        };

        fetchData();
    }, []);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start'],
    });

    const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const textY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

    const highlightWords = ['Full Stack', 'Developer', 'Data Scientist', 'AI'];

    // Helper to get localized text
    const getLocalizedText = (en: string | null | undefined, ko: string | null | undefined) => {
        return i18n.language === 'ko' ? (ko || en) : (en || ko);
    };

    return (
        <div ref={containerRef} className="relative">
            <SEO
                title={i18n.language === 'ko' ? "풀스택 개발자 포트폴리오" : "Full Stack Developer Portfolio"}
                description={i18n.language === 'ko'
                    ? "React, Node.js, Python 전문 풀스택 개발자의 포트폴리오입니다. 최신 웹 기술과 클라우드 인프라 구축 경험을 확인하세요."
                    : "Portfolio of a Full Stack Developer specializing in React, Node.js, and Python. Explore projects, skills, and experience in modern web development."
                }
            />
            <PersonSchema />
            {/* Hero Section with Parallax */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Animated Background */}
                <motion.div
                    style={{ y: heroY }}
                    className="absolute inset-0 z-0"
                >
                    {/* Gradient Orbs */}
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                    <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-2000" />

                    {/* Grid Pattern */}
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                            backgroundSize: '100px 100px',
                        }}
                    />
                </motion.div>

                {/* Hero Content */}
                <motion.div
                    style={{ y: textY, opacity: heroOpacity }}
                    className="relative z-10 text-center px-4 max-w-5xl mx-auto"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                        <ShinyText
                            text={i18n.language === 'ko' ? '안녕하세요' : 'Hello, I\'m'}
                            className="text-xl md:text-2xl text-white/60 mb-4 block"
                        />
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6">
                        <SplitText
                            text="Jun Ki Ahn"
                            delay={50}
                            className="inline-block"
                        />
                    </h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="text-xl md:text-2xl lg:text-3xl text-white/70 mb-4"
                    >
                        {highlightWords.map((word, idx) => (
                            <span key={idx}>
                                <span className="gradient-text font-semibold">{word}</span>
                                {idx < highlightWords.length - 1 && <span className="text-white/40"> · </span>}
                            </span>
                        ))}
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto"
                    >
                        {currentCareer ? (
                            i18n.language === 'ko'
                                ? `${getLocalizedText(currentCareer.company, currentCareer.company_ko)}에서 ${getLocalizedText(currentCareer.position, currentCareer.position_ko)}로 근무하고 있습니다`
                                : `Working as a ${getLocalizedText(currentCareer.position, currentCareer.position_ko)} at ${getLocalizedText(currentCareer.company, currentCareer.company_ko)}`
                        ) : (
                            i18n.language === 'ko'
                                ? '클라우드와 AI 솔루션을 구축하고 있습니다'
                                : 'Building cloud and AI solutions'
                        )}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9, duration: 0.6 }}
                        className="flex flex-wrap items-center justify-center gap-4"
                    >
                        <Link to="/projects" className="glass-button glass-button--primary">
                            <span>{i18n.language === 'ko' ? '프로젝트 보기' : 'View Projects'}</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                        <Link to="/contact" className="glass-button">
                            <span>{i18n.language === 'ko' ? '연락하기' : 'Get in Touch'}</span>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.6 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="flex flex-col items-center gap-2 text-white/40"
                    >
                        <span className="text-sm">{i18n.language === 'ko' ? '스크롤' : 'Scroll'}</span>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </motion.div>
                </motion.div>
            </section>

            {/* About Preview Section */}
            <section className="relative py-32 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true, margin: '-100px' }}
                    className="max-w-6xl mx-auto"
                >
                    <div className="glass-card p-8 md:p-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            {i18n.language === 'ko' ? '소개' : 'About Me'}
                        </h2>
                        <p className="text-lg text-white/70 leading-relaxed mb-8">
                            {currentCareer ? (
                                getLocalizedText(currentCareer.description, currentCareer.description_ko)
                            ) : (
                                i18n.language === 'ko'
                                    ? '풀스택 개발과 데이터 사이언스 분야에서 혁신적인 솔루션을 구축하고 있습니다.'
                                    : 'Building innovative solutions in full-stack development and data science.'
                            )}
                        </p>
                        <Link to="/career" className="glass-button inline-flex">
                            {i18n.language === 'ko' ? '경력 보기' : 'View My Journey'}
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Skills Preview */}
            <section className="relative py-20 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true, margin: '-100px' }}
                    className="max-w-6xl mx-auto"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
                        {i18n.language === 'ko' ? '기술 스택' : 'Tech Stack'}
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {skillCategories.length > 0 ? (
                            skillCategories.map((category, idx) => (
                                <motion.div
                                    key={category.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    viewport={{ once: true }}
                                    className="glass-card p-6 text-center"
                                >
                                    <h3 className="text-lg font-semibold gradient-text mb-4">
                                        {getLocalizedText(category.name, category.name_ko)}
                                    </h3>
                                    <ul className="space-y-2">
                                        {category.skills.slice(0, 4).map((skill) => (
                                            <li key={skill.id} className="text-white/60 text-sm">{skill.name}</li>
                                        ))}
                                        {category.skills.length > 4 && (
                                            <li className="text-white/40 text-xs mt-2">+{category.skills.length - 4} more</li>
                                        )}
                                    </ul>
                                </motion.div>
                            ))
                        ) : (
                            // Fallback skeleton or empty state if needed
                            [1, 2, 3, 4].map((_, idx) => (
                                <div key={idx} className="glass-card p-6 h-48 animate-pulse bg-white/5" />
                            ))
                        )}
                    </div>

                    <div className="text-center mt-12">
                        <Link to="/skills" className="glass-button inline-flex">
                            {i18n.language === 'ko' ? '모든 기술 보기' : 'View All Skills'}
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* CTA Section */}
            <section className="relative py-32 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true, margin: '-100px' }}
                    className="max-w-4xl mx-auto text-center"
                >
                    <div className="glass-card p-12 md:p-16 relative overflow-hidden">
                        {/* Glow Effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-purple-500/30 blur-3xl" />

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                {i18n.language === 'ko' ? '함께 일해요!' : "Let's Work Together"}
                            </h2>
                            <p className="text-lg text-white/60 mb-8">
                                {i18n.language === 'ko'
                                    ? '새로운 프로젝트나 협업에 관심이 있으시다면 연락해주세요'
                                    : "Interested in collaboration or have a project in mind? Let's connect!"
                                }
                            </p>
                            <Link to="/contact" className="glass-button glass-button--primary">
                                <span>{i18n.language === 'ko' ? '연락하기' : 'Get in Touch'}</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default HomePage;
