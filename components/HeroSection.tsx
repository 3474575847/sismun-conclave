'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';

// Dynamically import HeroScene to avoid SSR issues with Three.js
const HeroScene = dynamic(() => import('./HeroScene'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-white" />,
});

const splitTextReveal = (element: HTMLElement, delay: number = 0, isTitle: boolean = false) => {
    const text = element.textContent || '';
    element.innerHTML = '';

    const chars = text.split('').map((char, index) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        span.style.transformStyle = 'preserve-3d';
        span.style.opacity = '0';
        span.style.transform = 'rotateX(90deg)';

        // Color Branding logic
        if (isTitle) {
            if (text === 'SISMUN') {
                if (index < 3) {
                    span.style.color = '#B22234'; // Institutional Red (SIS)
                } else {
                    span.style.color = '#FFCC00'; // School Yellow (MUN)
                }
            } else if (text === 'CONCLAVE') {
                span.style.color = '#222222'; // Institutional Charcoal
            }
        }

        element.appendChild(span);
        return span;
    });

    gsap.to(chars, {
        opacity: 1,
        rotateX: 0,
        duration: 0.8,
        stagger: 0.03,
        delay,
        ease: 'power3.out',
        force3D: true,
    });
};

export default function HeroSection() {
    const titlePart1Ref = useRef<HTMLSpanElement>(null);
    const titlePart2Ref = useRef<HTMLSpanElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        if (titlePart1Ref.current && titlePart2Ref.current && subtitleRef.current) {
            // Delay for dramatic entrance
            setTimeout(() => {
                splitTextReveal(titlePart1Ref.current!, 0.5, true);
                splitTextReveal(titlePart2Ref.current!, 0.7, true);
                splitTextReveal(subtitleRef.current!, 1.5, false);
            }, 500);
        }
    }, []);

    return (
        <section id="hero-section" className="relative h-screen w-full overflow-hidden bg-white">
            <div className="absolute inset-0 z-0">
                <HeroScene />
            </div>
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-charcoal/5 to-charcoal/15 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                    className="relative w-32 h-32 md:w-36 md:h-36 mb-6"
                >
                    <Image
                        src="/SIS mun 1.png"
                        alt="SISMUN Conclave Logo"
                        fill
                        sizes="(max-width: 768px) 128px, 144px"
                        className="object-contain drop-shadow-[0_0_20px_rgba(239,192,1,0.2)]"
                        priority
                    />
                </motion.div>

                <h1
                    className="flex flex-col items-center font-display font-bold leading-[0.85] tracking-tighter mb-8"
                    style={{ perspective: '1000px' }}
                >
                    <span
                        ref={titlePart1Ref}
                        className="text-[100px] sm:text-[140px] md:text-[180px] lg:text-[220px]"
                    >
                        SISMUN
                    </span>
                    <span
                        ref={titlePart2Ref}
                        className="text-[60px] sm:text-[90px] md:text-[120px] lg:text-[150px] opacity-90"
                    >
                        CONCLAVE
                    </span>
                </h1>

                <p
                    ref={subtitleRef}
                    className="max-w-4xl text-xs sm:text-base md:text-lg text-charcoal/60 font-display font-medium tracking-[0.2em] sm:tracking-[0.4em] uppercase"
                    style={{ perspective: '1000px' }}
                >
                    Singapore International School Model United Nations Conclave
                </p>

                {/* Scroll indicator */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
                    <div className="w-6 h-10 border-2 border-school-red/50 rounded-full flex justify-center pt-2">
                        <div className="w-1 h-2 bg-school-red rounded-full animate-bounce" />
                    </div>
                </div>
            </div>

            {/* Floating particles decoration */}
            <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-school-red rounded-full opacity-60 animate-float" />
            <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-school-red rounded-full opacity-40 animate-float" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-school-red rounded-full opacity-50 animate-float" style={{ animationDelay: '4s' }} />
        </section>
    );
}
