'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function MechanicalCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });

            // Check if hovering over interactive element
            const target = e.target as HTMLElement;
            const isInteractive = target.tagName === 'A' ||
                target.tagName === 'BUTTON' ||
                target.closest('a') ||
                target.closest('button');
            setIsHovering(!!isInteractive);
        };

        const handleVisibilityChange = () => {
            const matches = mediaQuery.matches;
            setIsVisible(matches);
            if (matches) {
                window.addEventListener('mousemove', updateMousePosition);
            } else {
                window.removeEventListener('mousemove', updateMousePosition);
            }
        };

        handleVisibilityChange();
        mediaQuery.addEventListener('change', handleVisibilityChange);

        return () => {
            mediaQuery.removeEventListener('change', handleVisibilityChange);
            window.removeEventListener('mousemove', updateMousePosition);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <>
            {/* Main cursor ring */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
                animate={{
                    x: mousePosition.x - 20,
                    y: mousePosition.y - 20,
                    scale: isHovering ? 1.5 : 1,
                }}
                transition={{
                    type: 'spring',
                    damping: 30,
                    stiffness: 300,
                    mass: 0.5,
                }}
            >
                <div className="w-10 h-10 border-2 border-gold rounded-full relative" />
            </motion.div>

            {/* Dot cursor */}
            <motion.div
                className="fixed top-0 left-0 w-1 h-1 bg-gold rounded-full pointer-events-none z-[9999] mix-blend-difference"
                animate={{
                    x: mousePosition.x - 2,
                    y: mousePosition.y - 2,
                }}
                transition={{
                    type: 'spring',
                    damping: 40,
                    stiffness: 500,
                    mass: 0.2,
                }}
            />
        </>
    );
}
