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
            gsap.fromTo([placeholder, content],
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
            className="w-full bg-charcoal py-20 sm:py-32 px-6 sm:px-12 lg:px-24 h-auto flex items-center justify-center overflow-visible"
            id="curator-section"
        >
            <div className="max-w-7xl w-full">
                {/* Left Side: Image Holder - Floating on LG screens */}
                <div
                    ref={placeholderRef}
                    className="w-full lg:w-auto lg:float-left lg:mr-16 lg:mb-12 flex justify-center lg:block"
                >
                    <div className="relative w-full max-w-md aspect-[3/4] rounded-2xl bg-platinum/5 border border-platinum/10 shadow-lg overflow-hidden group">
                        <Image
                            src="/parnav-curator.jpeg"
                            alt="Parnav Mukherjee - Knowledge Curator"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 448px"
                        />

                        {/* Corner Accents mirroring theme */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold/20 rounded-tl-2xl z-10" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold/20 rounded-br-2xl z-10" />
                    </div>
                </div>

                {/* Content */}
                <div
                    ref={contentRef}
                    className="block"
                >
                    <div className="mb-10">
                        <div className="space-y-4">
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-platinum font-bold leading-[1.1]">
                                From the desk of Parnav Mukherjee
                            </h2>
                            <div className="h-1.5 w-24 bg-gold" />
                        </div>
                    </div>

                    <div className="text-platinum leading-relaxed text-lg lg:text-xl font-light">
                        <p className="font-semibold text-platinum text-2xl lg:text-3xl mb-6 italic">
                            Parnav Mukherjee
                        </p>

                        <div className="space-y-6 text-platinum/80">
                            <p>
                                What is history? Is it merely a collection of data, big data, chronology, dates, timelines and facts? Or is it the study of diplomacy, subaltern voices, human experiences, wars, peace efforts, actions, and their consequences across a period of time? Is it a vital tool for understanding the present and shaping the future by studying the nuances of geo-politics? Is history merely the past, a passive record of events that unfolded? Who unravels the dilemmas, chronicles and dialectics of history across the sands of time to piece together, an unbiased, tilt free, coherent rendition?
                            </p>

                            <p>
                                What is the place of UN in this chronicling? What role do media and social media play in constructing present-day narratives that later shape both micro and grand narratives?
                            </p>

                            <p>
                                These are some of the questions that every MUN should attempt to unravel.
                            </p>

                            <p>
                                We hope to explore these ideas around the facticity of geo-politics and look at multi-track narratives of the past, and if so, whose past. We seek to explore contemporary narratives of conflict resolution and their role in building effective praxis. Politics, History, Sociology and International Relations are powerful tools; they can sow discord, yet foster peace, collaboration, empathy, care and compassion. Its use and abuse at the hands of those in positions of influence makes the discussions in MUN the urgent need of the hour.
                            </p>

                            <p>
                                SISMUN conclave every year is an ode to memory and history. By cultivating hope for individuals and societies, we understand ourselves better. Every discussion is problematic and incomplete, yet they ground us by dissolving boundaries as we engage with each other and decide on the best way to understand the present, past, and future. We engage with orality, listen to diversity, including everyday memories of survival that are often less marginalised. A resolution or a white paper does not carry meaning if it does not carry the essence of discussions.
                            </p>

                            <p>
                                We are ready with our unique line-up of committees that act as a bridge between the past and present urgencies. Over to you, delegates, to make this engrossing, meaningful, and most importantly, humane.
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 pt-4 border-t border-platinum/10 w-fit">
                        <p className="text-gold text-sm lg:text-base uppercase tracking-[0.3em] font-bold">Knowledge Resource Curator</p>
                    </div>
                </div>
                {/* Clearfix for floating elements */}
                <div className="clear-both" />
            </div>
        </section>
    );
}
