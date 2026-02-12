'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import dynamic from 'next/dynamic';

// Dynamically import HeroScene to avoid SSR issues with Three.js
const HeroScene = dynamic(() => import('./HeroScene'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-white" />,
});

const splitTextReveal = (element: HTMLElement, delay: number = 0) => {
    const text = element.textContent || '';
    element.innerHTML = '';

    const chars = text.split('').map((char) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        span.style.transformStyle = 'preserve-3d';
        span.style.opacity = '0';
        span.style.transform = 'rotateX(90deg)';
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
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        if (titleRef.current && subtitleRef.current) {
            // Delay for dramatic entrance
            setTimeout(() => {
                splitTextReveal(titleRef.current!, 0.5);
                splitTextReveal(subtitleRef.current!, 1.5);
            }, 500);
        }
    }, []);

    return (
        <section id="hero-section" className="relative h-screen w-full overflow-hidden bg-white">
            <div className="absolute inset-0 z-0">
                <HeroScene />
            </div>
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-charcoal/30 to-charcoal pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
                <h1
                    ref={titleRef}
                    className="text-[120px] md:text-[180px] lg:text-[220px] font-display font-bold text-gold leading-none tracking-tighter mb-6"
                    style={{ perspective: '1000px' }}
                >
                    SISMUN
                </h1>

                <p
                    ref={subtitleRef}
                    className="text-lg md:text-xl text-charcoal/80 font-light tracking-[0.3em] uppercase"
                    style={{ perspective: '1000px' }}
                >
                    Singapore International School Model United Nations
                </p>

                {/* Scroll indicator */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
                    <div className="w-6 h-10 border-2 border-gold/50 rounded-full flex justify-center pt-2">
                        <div className="w-1 h-2 bg-gold rounded-full animate-bounce" />
                    </div>
                </div>
            </div>

            {/* Floating particles decoration */}
            <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-gold rounded-full opacity-60 animate-float" />
            <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-gold rounded-full opacity-40 animate-float" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-gold rounded-full opacity-50 animate-float" style={{ animationDelay: '4s' }} />
        </section>
    );
}
