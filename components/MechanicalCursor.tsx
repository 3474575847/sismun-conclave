'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function MechanicalCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
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

        window.addEventListener('mousemove', updateMousePosition);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
        };
    }, []);

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
                <div className="w-10 h-10 border-2 border-gold rounded-full relative">
                    {/* Coordinates display */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        <span className="font-mono text-[8px] text-gold opacity-60">
                            {Math.round(mousePosition.x)}, {Math.round(mousePosition.y)}
                        </span>
                    </div>
                </div>
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
