'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SchoolDirectorSection() {
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
            id="school-director-section"
        >
            <div className="max-w-7xl w-full">
                {/* Right Side: Image Placeholder Area - Floating on LG screens */}
                <div
                    ref={placeholderRef}
                    className="w-full lg:w-auto lg:float-right lg:ml-16 lg:mb-12 flex justify-center lg:block"
                >
                    <div className="relative w-[280px] sm:w-[360px] lg:w-[400px] aspect-[3/4] rounded-2xl bg-platinum/5 border border-platinum/10 shadow-lg overflow-hidden group">
                        <Image
                            src="/sharonee-mullick.png"
                            alt="School Director - Mrs. Sharonee Mullick"
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
                                Message from the desk of the Director
                            </h2>
                            <div className="h-1.5 w-24 bg-gold" />
                        </div>
                    </div>

                    <div className="text-platinum/80 leading-relaxed text-lg lg:text-xl font-light">
                        <p className="font-semibold text-platinum text-2xl lg:text-3xl mb-6 italic">
                            Mrs. Sharonee Mullick
                        </p>

                        <div className="space-y-6">
                            <p>
                                It gives me great pleasure to present the 17th Edition of the Singapore International School Model United Nations (SISMUN). This year&rsquo;s theme &mdash; <span className="text-gold font-medium italic underline decoration-gold/30 underline-offset-4">&ldquo;Towards Fostering an Ecosystem of a Uniform Global Human Rights and Social Justice Framework&rdquo;</span> &mdash; urges us to reflect deeply on the world we aspire to build: one where rights are universal, justice is unwavering, and human dignity is non-negotiable. More than a simulation, SISMUN serves as a dynamic platform where young minds confront global challenges with intellectual rigour, moral conviction, and diplomatic responsibility.
                            </p>

                            <p>
                                Echoing the vision of the current United Nations Secretary-General, Ant&oacute;nio Guterres, who has urged the world to &ldquo;recommit to the purposes and principles of the UN Charter&rdquo; and restore faith in multilateralism, SISMUN 2026 stands firmly for solidarity, accountability, and sustainable progress. His call to defend human rights, strengthen international cooperation, and uphold peace resonates deeply with our theme&mdash;reminding us that dialogue, justice, and collective action are not optional, but essential.
                            </p>

                            <p>
                                The committees of SISMUN 2026 are thoughtfully crafted to reflect both contemporary urgency and historical depth. These agendas are intentionally rigorous, demanding thorough research, independent thought, and disciplined diplomacy under the THIMUN Rules of Procedure. SISMUN is not merely a forum for debate, but a training ground for principled leadership and global awareness.
                            </p>

                            <p>
                                As we welcome schools from diverse institutions, we anticipate thoughtful and respectful deliberations. We hope SISMUN 2026 inspires every participant to rise beyond rhetoric and emerge as responsible advocates of peace, justice, and sustainable progress.
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 pt-4 border-t border-platinum/10 w-fit">
                        <p className="text-gold text-sm lg:text-base uppercase tracking-[0.3em] font-bold">Director</p>
                    </div>
                </div>
                {/* Clearfix for floating elements */}
                <div className="clear-both" />
            </div>
        </section>
    );
}
