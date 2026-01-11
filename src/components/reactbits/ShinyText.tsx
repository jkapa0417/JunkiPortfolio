import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface ShinyTextProps {
    text: string;
    className?: string;
    shimmerWidth?: number;
    speed?: number;
}

const ShinyText = ({
    text,
    className = '',
    shimmerWidth = 100,
    speed = 2,
}: ShinyTextProps) => {
    const textRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!textRef.current) return;

        gsap.fromTo(
            textRef.current,
            {
                backgroundPosition: `-${shimmerWidth}% center`,
            },
            {
                backgroundPosition: `${shimmerWidth}% center`,
                duration: speed,
                repeat: -1,
                ease: 'none',
            }
        );
    }, [shimmerWidth, speed]);

    return (
        <span
            ref={textRef}
            className={className}
            style={{
                display: 'inline-block',
                background: `linear-gradient(
          90deg,
          rgba(255, 255, 255, 0.5) 0%,
          rgba(255, 255, 255, 1) 25%,
          rgba(255, 255, 255, 0.5) 50%,
          rgba(255, 255, 255, 1) 75%,
          rgba(255, 255, 255, 0.5) 100%
        )`,
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
            }}
        >
            {text}
        </span>
    );
};

export default ShinyText;
