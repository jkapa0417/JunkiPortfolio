import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface MagnetProps {
    children: React.ReactNode;
    className?: string;
    padding?: number;
    strength?: number;
    disabled?: boolean;
}

const Magnet = ({
    children,
    className = '',
    padding = 100,
    strength = 0.3,
    disabled = false,
}: MagnetProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isActive, setIsActive] = useState(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = { stiffness: 150, damping: 15 };
    const xSpring = useSpring(x, springConfig);
    const ySpring = useSpring(y, springConfig);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (disabled || !ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;

        // Check if mouse is within padding area
        const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
        const maxDistance = Math.max(rect.width, rect.height) / 2 + padding;

        if (distance < maxDistance) {
            setIsActive(true);
            x.set(distanceX * strength);
            y.set(distanceY * strength);
        }
    };

    const handleMouseLeave = () => {
        setIsActive(false);
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            className={`inline-block ${className}`}
            style={{
                x: xSpring,
                y: ySpring,
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <motion.div
                animate={{
                    scale: isActive ? 1.05 : 1,
                }}
                transition={{ duration: 0.15 }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
};

export default Magnet;
