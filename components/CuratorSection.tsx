'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CuratorSection() {
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
            className="w-full bg-white py-20 sm:py-32 px-6 sm:px-12 lg:px-24 h-auto flex items-center justify-center overflow-visible border-y border-charcoal/5"
            id="curator-section"
        >
            <div className="max-w-7xl w-full">
                {/* Left Side: Image Holder - Floating on LG screens */}
                <div
                    ref={placeholderRef}
                    className="w-full lg:w-auto lg:float-left lg:mr-16 lg:mb-12 flex justify-center lg:block"
                >
                    <div className="relative w-[280px] sm:w-[360px] lg:w-[400px] aspect-[3/4] rounded-2xl bg-charcoal/5 border border-charcoal/10 shadow-lg overflow-hidden group">
                        <Image
                            src="/parnab-curator.jpeg"
                            alt="Parnab Mukherjee - Knowledge Curator"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 448px"
                        />

                        {/* Corner Accents mirroring theme */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-school-red/20 rounded-tl-2xl z-10" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-school-red/20 rounded-br-2xl z-10" />
                    </div>
                </div>

                {/* Content */}
                <div
                    ref={contentRef}
                    className="block"
                >
                    <div className="mb-10">
                        <div className="space-y-4">
                            <h2 className="text-4xl sm:text-5xl lg:text-8xl font-serif text-charcoal font-bold leading-[1.1] mb-2 uppercase tracking-tighter text-balance">
                                A Vision for SISMUN 2026
                            </h2>
                            <h3 className="text-xl sm:text-2xl text-school-red font-mono uppercase tracking-[0.3em] font-medium mb-8">
                                A Message from the Curator
                            </h3>
                            <div className="h-1.5 w-24 bg-school-red" />
                        </div>
                    </div>

                    <div className="text-charcoal leading-relaxed text-lg lg:text-xl font-light">
                        <div className="space-y-6 text-charcoal/80">
                            <p>
                                What is history? Is it merely a collection of data, chronology, dates, timelines, and facts, or is it the study of diplomacy, subaltern voices, human experiences, wars, peace efforts, and their consequences across time? Is it a vital tool for understanding the present and shaping the future through the nuances of geopolitics? Do we gain a deeper appreciation of our mistakes, hopes, collective heritage, questions of identity and migration, and the complexities of human existence? Is history simply the past, a log of events that unfolded, or does it demand interpretation? Who unravels its dilemmas and dialectics to piece together an unbiased, coherent rendition? What is the place of the United Nations in this chronicling, and what role do media and social media play in shaping the narratives that influence both micro and grand histories?
                            </p>

                            <p>
                                Every generation interprets history based on its own concerns, challenges, and aspirations. Therefore, history is not a closed book; it is a continuously evolving, living dialogue between the past and the present. It helps us avoid repeating the tragic errors of our predecessors and fosters a spirit of critical inquiry—a quality essential to any robust educational framework.
                            </p>

                            <p>
                                The SISMUN Conclave is an ode to memory and history, carried forward by societies to transmit values and preserve the lamp of peace. Every discussion may be incomplete, yet it grounds us by dissolving boundaries as we engage with one another to better understand the present, the past, and the future. A resolution or white paper holds meaning only when it reflects sincere and rigorous deliberation. Our unique line-up of committees bridges historical continuities with present urgencies. The rest now lies with you, delegates, to make this journey engrossing, meaningful, and above all, humane.
                            </p>
                        </div>
                        <p className="italic font-serif text-2xl lg:text-3xl border-l-4 border-school-red pl-8 py-2 text-charcoal/90 mt-12">
                            &ldquo;Information is not knowledge. Knowledge is not wisdom. Wisdom is not truth.&rdquo;
                            <span className="block text-sm mt-3 font-sans font-normal not-italic tracking-widest text-charcoal/50">&mdash; PARNAB MUKHERJEE</span>
                        </p>
                    </div>

                    <div className="mt-10 pt-4 border-t border-charcoal/10 w-fit">
                        <p className="text-school-red text-lg lg:text-xl tracking-[0.1em] font-medium mb-1">PARNAB MUKHERJEE</p>
                        <p className="text-charcoal/40 font-mono text-[10px] uppercase tracking-widest leading-relaxed">
                            Knowledge Curator,<br />SISMUN Conclave
                        </p>
                    </div>
                </div>
                {/* Clearfix for floating elements */}
                <div className="clear-both" />
            </div>
        </section>
    );
}
