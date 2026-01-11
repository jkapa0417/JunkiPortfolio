import { useRef, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';

interface SplitTextProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    ease?: string;
}

const SplitText = ({
    text,
    className = '',
    delay = 30,
    duration = 0.6,
    ease = 'power3.out',
}: SplitTextProps) => {
    const containerRef = useRef<HTMLSpanElement>(null);

    const characters = useMemo(() => {
        return text.split('').map((char, idx) => ({
            char: char === ' ' ? '\u00A0' : char,
            id: idx,
        }));
    }, [text]);

    useEffect(() => {
        if (!containerRef.current) return;

        const chars = containerRef.current.querySelectorAll('.split-char');

        gsap.fromTo(
            chars,
            {
                opacity: 0,
                y: 50,
                rotateX: -90,
            },
            {
                opacity: 1,
                y: 0,
                rotateX: 0,
                duration,
                ease,
                stagger: delay / 1000,
            }
        );
    }, [text, delay, duration, ease]);

    return (
        <span ref={containerRef} className={`inline-flex flex-wrap ${className}`}>
            {characters.map(({ char, id }) => (
                <span
                    key={id}
                    className="split-char inline-block will-change-transform"
                    style={{
                        transformStyle: 'preserve-3d',
                        opacity: 0,
                    }}
                >
                    {char}
                </span>
            ))}
        </span>
    );
};

export default SplitText;
