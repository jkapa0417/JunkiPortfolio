import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '../components/ui/Loading';
import { CustomSelect } from '../components/ui/CustomSelect';
import { getContactInfo, ContactItem } from '../lib/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://portfolio-api-production.jkapa0417.workers.dev';

const ContactPage = () => {
    const { i18n } = useTranslation();
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Remote data state
    const [contactInfo, setContactInfo] = useState<ContactItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchContact = async () => {
            try {
                const { contacts } = await getContactInfo();
                setContactInfo(contacts || []);
            } catch (error) {
                console.error('Failed to fetch contact info:', error);
                setContactInfo([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContact();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormState(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/content/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formState),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            console.log('Form submitted successfully');
            setSubmitted(true);
            setFormState({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error('Submission error:', error);
            alert(i18n.language === 'ko' ? '메시지 전송에 실패했습니다.' : 'Failed to send message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper to find specific contact item
    const getContactValue = (key: string) => {
        const item = contactInfo.find(c => c.key === key);
        return item ? item.value : null;
    };

    const socialLinks = [
        {
            name: 'GitHub',
            key: 'github',
            url: getContactValue('github') || 'https://github.com/',
            icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
            ),
        },
        {
            name: 'LinkedIn',
            key: 'linkedin',
            url: getContactValue('linkedin') || 'https://linkedin.com/',
            icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            ),
        },
        {
            name: 'Email',
            key: 'email',
            url: `mailto:${getContactValue('email') || 'jkapa0417@gmail.com'}`,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
        },
    ];

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
                        {i18n.language === 'ko' ? '연락하기' : 'Get in Touch'}
                    </h1>
                    <p className="text-lg text-white/60 max-w-2xl mx-auto">
                        {i18n.language === 'ko'
                            ? '프로젝트나 협업에 관심이 있으시다면 연락해주세요'
                            : "Have a project or collaboration in mind? Let's connect!"
                        }
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-5 gap-8">
                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="md:col-span-3"
                    >
                        <div className="glass-card p-8">
                            {submitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        {i18n.language === 'ko' ? '메시지가 전송되었습니다!' : 'Message Sent!'}
                                    </h3>
                                    <p className="text-white/60 mb-6">
                                        {i18n.language === 'ko'
                                            ? '빠른 시일 내에 답변드리겠습니다.'
                                            : "I'll get back to you as soon as possible."
                                        }
                                    </p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="glass-button"
                                    >
                                        {i18n.language === 'ko' ? '새 메시지 보내기' : 'Send Another Message'}
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-white/80 text-sm font-medium mb-2">
                                                {i18n.language === 'ko' ? '이름' : 'Name'}
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formState.name}
                                                onChange={handleChange}
                                                required
                                                className="glass-input"
                                                placeholder={i18n.language === 'ko' ? '홍길동' : 'John Doe'}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-white/80 text-sm font-medium mb-2">
                                                {i18n.language === 'ko' ? '이메일' : 'Email'}
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formState.email}
                                                onChange={handleChange}
                                                required
                                                className="glass-input"
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="relative z-20">
                                        <label htmlFor="subject" className="block text-white/80 text-sm font-medium mb-2">
                                            {i18n.language === 'ko' ? '제목' : 'Subject'}
                                        </label>
                                        <CustomSelect
                                            value={formState.subject}
                                            onChange={(val) => handleChange({ target: { name: 'subject', value: val } } as any)}
                                            options={[
                                                { value: "project", label: i18n.language === 'ko' ? '프로젝트 문의' : 'Project Inquiry' },
                                                { value: "collaboration", label: i18n.language === 'ko' ? '협업 제안' : 'Collaboration' },
                                                { value: "job", label: i18n.language === 'ko' ? '채용 문의' : 'Job Opportunity' },
                                                { value: "other", label: i18n.language === 'ko' ? '기타' : 'Other' }
                                            ]}
                                            placeholder={i18n.language === 'ko' ? '선택해주세요' : 'Select a topic'}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-white/80 text-sm font-medium mb-2">
                                            {i18n.language === 'ko' ? '메시지' : 'Message'}
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formState.message}
                                            onChange={handleChange}
                                            required
                                            rows={6}
                                            className="glass-input resize-none"
                                            placeholder={i18n.language === 'ko' ? '메시지를 입력해주세요...' : 'Your message...'}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="glass-button glass-button--primary w-full justify-center disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                {i18n.language === 'ko' ? '전송 중...' : 'Sending...'}
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                {i18n.language === 'ko' ? '메시지 보내기' : 'Send Message'}
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                            </span>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="md:col-span-2 space-y-6"
                    >
                        {/* Email Card */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                {i18n.language === 'ko' ? '이메일' : 'Email'}
                            </h3>
                            <a
                                href={`mailto:${getContactValue('email') || 'jkapa0417@gmail.com'}`}
                                className="text-purple-300 hover:text-purple-200 transition-colors"
                            >
                                {getContactValue('email') || 'jkapa0417@gmail.com'}
                            </a>
                        </div>

                        {/* Location Card */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                {i18n.language === 'ko' ? '위치' : 'Location'}
                            </h3>
                            <p className="text-white/60">
                                {getContactValue('location') || (i18n.language === 'ko' ? '서울, 대한민국 🇰🇷' : 'Seoul, South Korea 🇰🇷')}
                            </p>
                        </div>

                        {/* Social Links */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                {i18n.language === 'ko' ? '소셜' : 'Social'}
                            </h3>
                            <div className="flex gap-4">
                                {socialLinks.map(link => (
                                    <a
                                        key={link.name}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 
                             text-white/60 hover:text-white transition-all duration-300
                             hover:scale-110"
                                        aria-label={link.name}
                                    >
                                        {link.icon}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Availability */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                {i18n.language === 'ko' ? '가용성' : 'Availability'}
                            </h3>
                            <div className="flex items-center gap-3">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                                </span>
                                <span className="text-green-400 text-sm">
                                    {i18n.language === 'ko' ? '협업 가능' : 'Open to opportunities'}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
