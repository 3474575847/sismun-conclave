'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const commemorations = [
    { id: '01', title: '75th Anniversary of the Schuman Declaration' },
    { id: '02', title: '80th Commemoration of the United Nations' },
    { id: '03', title: '40th Solemn Commemoration of the Chernobyl Nuclear Disaster' },
    { id: '04', title: '150th Birth Commemoration of Birsa Munda and Sardar Vallabhbhai Patel' }
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
            id="theme-section"
            className="relative min-h-screen bg-white py-24 px-8 z-10 flex flex-col justify-center"
        >
            <div ref={containerRef} className="max-w-6xl mx-auto w-full">
                {/* Section Tag */}
                <div className="flex items-center gap-4 mb-20 text-school-red font-mono text-xs md:text-sm tracking-[0.4em] uppercase">
                    <span className="w-2 h-2 bg-school-red rounded-full" />
                    SISMUN 2026 Theme
                </div>

                {/* Main Theme */}
                <div className="mb-32">
                    <h2 className="theme-title text-3xl md:text-5xl lg:text-6xl font-display font-bold text-charcoal leading-[1.1] tracking-tight text-center md:text-left">
                        Towards Fostering an Ecosystem of a <span className="text-school-red">Uniform Global Human Rights</span> and Social Justice Framework
                    </h2>
                </div>

                {/* Commemorations Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    <div className="lg:col-span-4">
                        <div className="h-px w-full bg-charcoal/10" />
                        <p className="mt-6 text-charcoal/60 font-light text-lg font-medium text-charcoal">
                            Dedicated to Four Landmark Commemorations:
                        </p>
                    </div>

                    <div className="lg:col-span-8 commemorations-grid space-y-8">
                        {commemorations.map((item) => (
                            <div key={item.id} className="commemoration-item flex items-start gap-8 group">
                                <span className="font-display text-4xl text-school-red md:text-school-red/30 md:group-hover:text-school-red transition-colors duration-500">
                                    {item.id}
                                </span>
                                <div className="pt-2">
                                    <p className="text-xl md:text-2xl font-light text-charcoal pl-4 md:pl-0 md:group-hover:pl-4 transition-all duration-500 ease-out border-l border-school-red md:border-transparent md:group-hover:border-school-red">
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
