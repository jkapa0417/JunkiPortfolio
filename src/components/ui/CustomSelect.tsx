import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
    value: string | number;
    label: string;
}

interface CustomSelectProps {
    value: string | number;
    onChange: (value: string | number) => void;
    options: Option[];
    placeholder?: string;
    className?: string;
    required?: boolean;
}

export const CustomSelect = ({ value, onChange, options, placeholder = 'Select...', className = '', required = false }: CustomSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string | number) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`glass-input cursor-pointer flex items-center justify-between ${!selectedOption ? 'text-white/40' : 'text-white'}`}
            >
                <span className="truncate">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Hidden native select for form validation if needed, though custom handling handles submit usually */}
            {required && (
                <select
                    value={value}
                    onChange={() => { }}
                    required={required}
                    className="absolute opacity-0 pointer-events-none bottom-0 left-0 w-full h-[1px]"
                    tabIndex={-1}
                >
                    <option value="" disabled={!value}>Wrapper</option>
                    {value && <option value={value}>{value}</option>}
                </select>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#1a1a2e]/95 backdrop-blur-xl shadow-xl max-h-60 overflow-y-auto"
                    >
                        {options.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className={`px-4 py-3 cursor-pointer text-sm transition-colors ${value === option.value
                                        ? 'bg-blue-500/20 text-blue-300'
                                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {option.label}
                            </div>
                        ))}
                        {options.length === 0 && (
                            <div className="px-4 py-3 text-sm text-white/40 text-center">
                                No options available
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
