import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
};

export const LoadingSpinner = ({ size = 'md', className = '' }: LoadingSpinnerProps) => {
    return (
        <motion.div
            className={`${sizes[size]} border-2 border-purple-500/30 border-t-purple-500 rounded-full ${className}`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
    );
};

interface LoadingCardProps {
    className?: string;
}

export const LoadingCard = ({ className = '' }: LoadingCardProps) => {
    return (
        <div className={`glass-card p-6 animate-pulse ${className}`}>
            <div className="h-4 bg-white/10 rounded w-1/4 mb-4" />
            <div className="h-6 bg-white/10 rounded w-3/4 mb-3" />
            <div className="space-y-2">
                <div className="h-3 bg-white/10 rounded w-full" />
                <div className="h-3 bg-white/10 rounded w-5/6" />
                <div className="h-3 bg-white/10 rounded w-4/6" />
            </div>
            <div className="flex gap-2 mt-4">
                <div className="h-6 bg-white/10 rounded-full w-16" />
                <div className="h-6 bg-white/10 rounded-full w-16" />
            </div>
        </div>
    );
};

interface PageLoaderProps {
    message?: string;
}

export const PageLoader = ({ message = 'Loading...' }: PageLoaderProps) => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-white/60">{message}</p>
        </div>
    );
};

export default LoadingSpinner;
