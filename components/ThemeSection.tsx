'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const commemorations = [
    { id: '01', title: 'The 80th Commemoration of the United Nations' },
    { id: '02', title: 'The 250th Commemoration of the American Declaration of Independence' },
    { id: '03', title: 'The 150th Commemoration of the First Telephone Call' },
    { id: '04', title: 'The 150th Birth Commemoration of Birsa Munda and Sardar Vallabhbhai Patel' },
    { id: '05', title: 'The 40th Solemn Commemoration of the Chernobyl Nuclear Disaster' },
];

export default function ThemeSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (!sectionRef.current) return;

            // Stagger reveal for the theme title
            gsap.fromTo('.theme-title',
                { y: 60, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: '.theme-title',
                        start: 'top 85%',
                    },
                    y: 0,
                    opacity: 1,
                    duration: 1.2,
                    ease: 'power3.out',
                }
            );

            // Stagger reveal for commemorations
            gsap.fromTo('.commemoration-item',
                { x: -30, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: '.commemorations-grid',
                        start: 'top 80%',
                    },
                    x: 0,
                    opacity: 1,
                    duration: 1,
                    stagger: 0.15,
                    ease: 'power2.out',
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative min-h-screen bg-white py-24 px-8 z-10 flex flex-col justify-center"
        >
            <div ref={containerRef} className="max-w-6xl mx-auto w-full">
                {/* Section Tag */}
                <div className="flex items-center gap-4 mb-20 text-gold font-mono text-[10px] tracking-[0.4em] uppercase">
                    <span className="w-2 h-2 bg-gold rounded-full" />
                    Conclave Concept // THEME.2026
                </div>

                {/* Main Theme */}
                <div className="mb-32">
                    <h2 className="theme-title text-4xl md:text-6xl lg:text-7xl font-display font-bold text-charcoal leading-[1.1] tracking-tight text-center md:text-left">
                        Towards Fostering an Ecosystem of a <span className="text-gold">Uniform Global Human Rights</span> and Social Justice Framework
                    </h2>
                </div>

                {/* Commemorations Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    <div className="lg:col-span-4">
                        <h3 className="text-sm font-mono tracking-[0.5em] text-charcoal/40 uppercase mb-4">
                            Landmark commemorations
                        </h3>
                        <div className="h-px w-full bg-charcoal/10" />
                        <p className="mt-6 text-charcoal/60 font-light text-lg">
                            SISMUN Conclave is Dedicated to Five Landmark Commemorations that shaped our modern history and shared values.
                        </p>
                    </div>

                    <div className="lg:col-span-8 commemorations-grid space-y-8">
                        {commemorations.map((item) => (
                            <div key={item.id} className="commemoration-item flex items-start gap-8 group">
                                <span className="font-display text-4xl text-gold/30 group-hover:text-gold transition-colors duration-500">
                                    {item.id}
                                </span>
                                <div className="pt-2">
                                    <p className="text-xl md:text-2xl font-light text-charcoal group-hover:pl-4 transition-all duration-500 ease-out border-l border-transparent group-hover:border-gold">
                                        {item.title}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute right-0 top-0 w-1/3 h-full bg-platinum/30 -z-10" />
        </section>
    );
}
