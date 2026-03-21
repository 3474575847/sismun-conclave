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
            className="w-full bg-white py-20 sm:py-32 px-6 sm:px-12 lg:px-24 h-auto flex items-center justify-center overflow-visible"
            id="school-director-section"
        >
            <div className="max-w-7xl w-full">
                {/* Left Side: Image Placeholder Area - Floating on LG screens */}
                <div
                    ref={placeholderRef}
                    className="w-full lg:w-auto lg:float-left lg:mr-16 lg:mb-12 flex justify-center lg:block"
                >
                    <div className="relative w-[280px] sm:w-[360px] lg:w-[400px] aspect-[3/4] rounded-2xl bg-charcoal/5 border border-charcoal/10 shadow-lg overflow-hidden group">
                        <Image
                            src="/school-director.JPG"
                            alt="Ms. Sharonee Mullick, School Director"
                            fill
                            sizes="(max-width: 1024px) 100vw, 400px"
                            className="object-contain transition-transform duration-700 md:group-hover:scale-105"
                        />

                        {/* Corner Accents mirroring theme */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-school-red/20 rounded-tl-2xl" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-school-red/20 rounded-br-2xl" />
                    </div>
                </div>

                {/* Right Side: Content */}
                <div
                    ref={contentRef}
                    className="block text-charcoal"
                >
                    <div className="mb-10">
                        <div className="space-y-4">
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-[1.1]">
                                Message from the desk of the School Director
                            </h2>
                            <div className="h-1.5 w-24 bg-school-red" />
                        </div>
                    </div>

                    <div className="text-charcoal/80 leading-relaxed text-lg lg:text-xl font-light">
                        <p className="font-semibold text-charcoal text-2xl lg:text-3xl mb-6 italic">
                            Ms. Sharonee Mullick
                        </p>

                        <div className="space-y-6">
                            <p className="font-bold text-charcoal text-xl underline decoration-school-red/30 underline-offset-4">
                                Shaping Global Citizens
                            </p>

                            <p>
                                Over seventeen editions, I have had the privilege of witnessing SISMUN grow from an ambitious vision into a vibrant forum of ideas, conviction, and collaboration. Each year has reaffirmed my belief that when young minds are entrusted with responsibility, they rise to meet it with insight and integrity. It gives me great pleasure to present the 17th Edition of the Singapore International School Model United Nations (SISMUN) Conclave 2026.
                            </p>

                            <p>
                                Guided by the theme <span className="text-school-red font-medium italic underline decoration-school-red/30 underline-offset-4">&ldquo;Towards Fostering an Ecosystem of a Uniform Global Human Rights and Social Justice Framework,&rdquo;</span> this year&rsquo;s conference invites us to reflect on the world we aspire to build, one where rights are universal, justice is unwavering, and human dignity is non-negotiable. More than a simulation, SISMUN is a dynamic platform where students confront global challenges with intellectual rigour, moral conviction, and diplomatic responsibility.
                            </p>

                            <p>
                                As the world marks the 80th Commemoration of the United Nations, we are reminded of the enduring relevance of its founding ideals. In this spirit, United Nations Secretary-General Ant&oacute;nio Guterres has called upon the international community to &ldquo;recommit to the purposes and principles of the UN Charter&rdquo; and restore faith in multilateralism. His appeal to defend human rights, strengthen international cooperation, and uphold peace resonates deeply with our theme and reinforces a simple truth: dialogue, justice, and collective action are essential to shaping a more equitable and peaceful world.
                            </p>

                            <p>
                                SISMUN is intentionally rigorous, demanding thorough research, independent thought, and disciplined diplomacy under the THIMUN Rules of Procedure. It is not merely a forum for debate, but a training ground for principled leadership and global awareness. It is my sincere hope that SISMUN Conclave 2026 will inspire every participant to move beyond rhetoric and emerge as a thoughtful and responsible advocate of peace, justice, and sustainable progress.
                            </p>

                            <p>
                                I warmly invite you to join us for what promises to be a conference defined by academic excellence, diplomatic integrity, and transformative dialogue.
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 pt-4 border-t border-charcoal/10 w-fit">
                        <p className="text-school-red text-sm lg:text-base uppercase tracking-[0.3em] font-bold">School Director</p>
                    </div>
                </div>
                {/* Clearfix for floating elements */}
                <div className="clear-both" />
            </div>
        </section>
    );
}
