'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function DirectorsSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const placeholderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const section = sectionRef.current;
        const content = contentRef.current;
        const placeholder = placeholderRef.current;

        if (!section || !content || !placeholder) return;

        const ctx = gsap.context(() => {
            gsap.fromTo([content, placeholder],
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
            className="w-full bg-charcoal py-20 sm:py-32 px-6 sm:px-12 lg:px-24 h-auto flex items-center justify-center overflow-visible border-y border-white/5"
            id="directors-section"
        >
            <div className="max-w-7xl w-full">
                {/* Right Side: Image Placeholder Area - Floating on LG screens */}
                <div
                    ref={placeholderRef}
                    className="w-full lg:w-auto lg:float-right lg:ml-16 lg:mb-12 flex justify-center lg:block"
                >
                    <div className="relative w-[280px] sm:w-[360px] lg:w-[400px] aspect-[3/4] rounded-2xl bg-platinum/5 border border-platinum/10 shadow-lg overflow-hidden group">
                        <Image
                            src="/pushpendra-sir.jpeg"
                            alt="MUN Director - CA Pushpendra Bansal"
                            fill
                            sizes="(max-width: 1024px) 100vw, 400px"
                            className="object-cover transition-transform duration-700 md:group-hover:scale-105"
                            priority
                        />

                        {/* Corner Accents mirroring theme */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold/20 rounded-tl-2xl" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold/20 rounded-br-2xl" />
                    </div>
                </div>

                {/* Left Side: Content */}
                <div
                    ref={contentRef}
                    className="block"
                >
                    <div className="mb-10">
                        <div className="space-y-4">
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-platinum font-bold leading-[1.1]">
                                Message from the desk of the MUN Director
                            </h2>
                            <div className="h-1.5 w-24 bg-gold" />
                        </div>
                    </div>

                    <div className="text-platinum/80 leading-relaxed text-lg lg:text-xl font-light">
                        <p className="font-semibold text-platinum text-2xl lg:text-3xl mb-6 italic">
                            CA Pushpendra Bansal
                        </p>

                        <div className="space-y-6">
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
                    </div>

                    <div className="mt-10 pt-4 border-t border-platinum/10 w-fit">
                        <p className="text-gold text-sm lg:text-base uppercase tracking-[0.3em] font-bold">MUN Director</p>
                    </div>
                </div>
                {/* Clearfix for floating elements */}
                <div className="clear-both" />
            </div>
        </section>
    );
}
