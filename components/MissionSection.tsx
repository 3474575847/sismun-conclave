'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';


gsap.registerPlugin(ScrollTrigger);

const missionCards = [
    {
        title: 'Diplomatic Excellence',
        description: 'Fostering critical thinking and negotiation skills through authentic UN simulations.',
        icon: '🏛️',
    },
    {
        title: 'Global Perspective',
        description: 'Understanding international relations and developing solutions to world challenges.',
        icon: '🌍',
    },
    {
        title: 'Leadership Development',
        description: 'Empowering students to become influential leaders and changemakers.',
        icon: '⚡',
    },
    {
        title: 'Cultural Exchange',
        description: 'Connecting students from diverse backgrounds in meaningful dialogue.',
        icon: '🤝',
    },
];

export default function MissionSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero section reference
            const heroSection = document.getElementById('hero-section');

            if (sectionRef.current && heroSection) {
                // Layered pinning effect
                gsap.to(heroSection, {
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top bottom',
                        end: 'top top',
                        scrub: 1,
                    },
                    scale: 0.85,
                    opacity: 0.4,
                    borderRadius: '40px',
                    ease: 'none',
                });

                // Staggered trigger animation for cards (Play once, no scrub)
                // Use .to with initial opacity-0 in Tailwind to ensure it reaches 100%
                gsap.to('.mission-card', {
                    scrollTrigger: {
                        trigger: gridRef.current,
                        start: 'top 85%', // Trigger earlier
                        toggleActions: 'play none none reverse',
                    },
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    rotateX: 0,
                    duration: 1.2,
                    stagger: 0.2,
                    ease: 'power3.out',
                    force3D: true,
                });

                // Header reveal
                gsap.to('.mission-header', {
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 90%',
                    },
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: 'power2.out',
                });

                // Force a refresh after a short delay to account for Hero 3D loading
                ScrollTrigger.refresh();
            }
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative min-h-screen bg-platinum py-20 px-8 z-20"
            style={{ perspective: '1000px' }}
        >
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="mission-header text-center mb-10 opacity-0 transform translate-y-8">
                    <h2 className="text-6xl md:text-8xl font-bold text-gradient mb-6">
                        Our Mission
                    </h2>
                    <p className="text-xl text-charcoal/70 max-w-3xl mx-auto leading-relaxed">
                        Cultivating the next generation of global leaders through intensive diplomatic simulation
                        and international collaboration.
                    </p>
                </div>

                {/* Bento Grid */}
                <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {missionCards.map((card, index) => (
                        <div
                            key={index}
                            className="mission-card relative glass-card p-8 rounded-lg group border border-gold/10 hover:border-gold/30 transition-all duration-500 opacity-0 transform translate-y-12 -rotate-x-12"
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            {/* Icon */}
                            <div className="text-6xl mb-6 transform group-hover:scale-110 group-hover:translate-z-10 transition-transform duration-500">
                                {card.icon}
                            </div>

                            {/* Content */}
                            <h3 className="text-3xl font-bold text-gold mb-4">
                                {card.title}
                            </h3>
                            <p className="text-charcoal/80 leading-relaxed">
                                {card.description}
                            </p>

                            {/* Hover effect overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg pointer-events-none" />
                        </div>
                    ))}
                </div>

                {/* Additional decorative element */}
                <div className="mt-12 text-center opacity-0 animate-fade-in delay-1000">
                    <div className="inline-block glass-card px-8 py-4 rounded-full border border-gold/20">
                        <p className="text-gold font-mono text-sm tracking-wider">
                            EST. 2024 • SINGAPORE
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
