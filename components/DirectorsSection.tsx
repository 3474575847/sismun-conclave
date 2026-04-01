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
            className="w-full bg-platinum/30 py-20 sm:py-32 px-6 sm:px-12 lg:px-24 h-auto flex items-center justify-center overflow-visible border-y border-charcoal/5"
            id="directors-section"
        >
            <div className="max-w-7xl w-full">
                {/* Right Side: Image Placeholder Area - Floating on LG screens */}
                <div
                    ref={placeholderRef}
                    className="w-full lg:w-auto lg:float-right lg:ml-16 lg:mb-12 flex justify-center lg:block"
                >
                    <div className="relative w-[280px] sm:w-[360px] lg:w-[400px] aspect-[3/4] rounded-2xl bg-charcoal/5 border border-charcoal/10 shadow-lg overflow-hidden group">
                        <Image
                            src="/pushpendra-sir.jpeg"
                            alt="MUN Director - CA Pushpendra Bansal"
                            fill
                            sizes="(max-width: 1024px) 100vw, 400px"
                            className="object-cover transition-transform duration-700 md:group-hover:scale-105"
                            priority
                        />

                        {/* Corner Accents mirroring theme */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-school-red/20 rounded-tl-2xl" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-school-red/20 rounded-br-2xl" />
                    </div>
                </div>

                {/* Left Side: Content */}
                <div
                    ref={contentRef}
                    className="block"
                >
                    <div className="mb-10">
                        <div className="space-y-4">
                            <h2 className="text-4xl sm:text-5xl lg:text-8xl font-serif text-charcoal font-bold leading-[1.1] mb-2 uppercase tracking-tighter text-balance">
                                In the Spirit of the United Nations
                            </h2>
                            <h3 className="text-xl sm:text-2xl text-school-red font-mono uppercase tracking-[0.3em] font-medium mb-8">
                                A Message from the SISMUN Director
                            </h3>
                            <div className="h-1.5 w-24 bg-school-red" />
                        </div>
                    </div>

                    <div className="text-charcoal/80 leading-relaxed text-lg lg:text-xl font-light">
                        <div className="space-y-6">
                            <p>
                                Welcome to SISMUN 2026. This year, we stand at a crossroads where diplomacy and action must meet to address the most pressing challenges of our time. Our theme, &ldquo;Towards Fostering an Ecosystem of a Uniform Global Human Rights and Social Justice Framework,&rdquo; is a call to all young leaders to engage in meaningful dialogue and develop sustainable solutions for the future.
                            </p>

                            <p>
                                At SISMUN, we believe that education is not just about academics but about empathy, critical thinking, and global awareness. Our committees have been meticulously designed to challenge you, push your boundaries, and help you emerge as the principled leaders the world needs today.
                            </p>

                            <p className="italic font-serif text-2xl lg:text-3xl border-l-4 border-school-red pl-8 py-2 text-charcoal/90 mt-8">
                                &ldquo;You must be the change you wish to see in the world.&quot;
                                <span className="block text-sm mt-3 font-sans font-normal not-italic tracking-widest text-charcoal/50">&mdash; MAHATMA GANDHI</span>
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 pt-4 border-t border-charcoal/10 w-fit">
                        <p className="text-school-red text-lg lg:text-xl tracking-[0.1em] font-medium mb-1">CA PUSHPENDRA BANSAL</p>
                        <p className="text-charcoal/40 font-mono text-[10px] uppercase tracking-widest leading-relaxed">
                            SISMUN Director,<br />Singapore International School
                        </p>
                    </div>
                </div>
                {/* Clearfix for floating elements */}
                <div className="clear-both" />
            </div>
        </section>
    );
}
