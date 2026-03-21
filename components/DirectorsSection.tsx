'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function DirectorsSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const section = sectionRef.current;
        const content = contentRef.current;
        const image = imageRef.current;

        if (!section || !content || !image) return;

        const ctx = gsap.context(() => {
            gsap.fromTo([image, content],
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    stagger: 0.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }, section);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="w-full bg-charcoal py-20 sm:py-32 px-6 sm:px-12 lg:px-24 h-auto flex flex-col items-center justify-center overflow-visible"
            id="directors-section"
        >
            <div className="max-w-5xl w-full flex flex-col space-y-16">

                {/* Top: Landscape Image Placeholder */}
                <div
                    ref={imageRef}
                    className="relative w-full aspect-square sm:aspect-square lg:aspect-[4/3] rounded-3xl bg-platinum/5 border border-platinum/10 shadow-xl overflow-hidden group"
                >
                    <Image
                        src="/mun-directors.JPG"
                        alt="MUN Directors - CA Pushpendra Bansal & Abhilasha Singh"
                        fill
                        sizes="(max-width: 1024px) 100vw, 1000px"
                        className="object-contain transition-transform duration-700 md:group-hover:scale-105"
                        priority
                    />
                </div>

                {/* Bottom: Content Area */}
                <div
                    ref={contentRef}
                    className="flex flex-col space-y-12"
                >
                    <div className="space-y-4">
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-platinum font-bold leading-tight">
                            From the MUN Directors
                        </h2>
                        <div className="h-1.5 w-24 bg-gold" />
                    </div>

                    <div className="space-y-8 text-platinum/80 leading-relaxed text-lg lg:text-xl font-light">
                        <p>
                            It gives me immense pleasure to invite schools from across the world to the 17th Edition of SISMUN Conclave 2026, hosted at Singapore International School, Mumbai. Guided by the theme <span className="text-gold font-medium italic underline decoration-gold/30 underline-offset-4">&ldquo;Towards Fostering an Ecosystem of a Uniform Global Human Rights and Social Justice Framework,&rdquo;</span> this year&rsquo;s conference calls upon young leaders to reflect on the enduring promise of global cooperation as the international community marks eight decades since nations first came together to imagine a multilateral order founded on dialogue and shared responsibility.
                        </p>

                        <p>
                            As a THIMUN-aligned conference, SISMUN is grounded in academic rigour, meaningful diplomacy, and thoughtful collaboration across carefully curated committees. Yet beyond procedure and policy, it is built upon three enduring pillars: <span className="text-gold font-medium underline decoration-gold/30 underline-offset-4">voice, integrity, and connection</span>. These are not merely skills cultivated within committee rooms; they are the very principles that compelled nations to come together eighty years ago in pursuit of peace.
                        </p>

                        <p>
                            Within committee sessions, delegates learn to use their voice not to dominate but to clarify, not to perform but to connect. They learn that integrity is the foundation of trust, and that connection is the only path toward meaningful and lasting progress. It is our hope that every delegate who joins us for SISMUN Conclave 2026 will depart with more than a resolution; we hope they will leave with a renewed sense of purpose and a deeper commitment to the collective journey of our global community.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-platinum/10">
                        <div className="space-y-1">
                            <p className="text-platinum font-serif text-2xl italic">CA Pushpendra Bansal</p>
                            <p className="text-gold text-xs uppercase tracking-[0.3em] font-bold">MUN Director</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-platinum font-serif text-2xl italic">Abhilasha Singh</p>
                            <p className="text-gold text-xs uppercase tracking-[0.3em] font-bold">Deputy MUN Director</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
