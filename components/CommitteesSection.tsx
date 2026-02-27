'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(Observer);

import { committees } from '@/data/committees';

export default function CommitteesSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const animating = useRef(false);
    const currentIndex = useRef(0);
    const [activeIndex, setActiveIndex] = useState(0);

    const gotoSlide = useCallback((index: number, direction: number) => {
        if (animating.current || index === currentIndex.current) return;

        animating.current = true;
        const current = currentIndex.current;
        const next = index;

        const tl = gsap.timeline({
            onComplete: () => {
                animating.current = false;
            }
        });

        // Ensure the next card is correctly positioned before animating
        // Forward: next card comes from right (100). Backward: next card comes from left (-100).
        gsap.set(`.committee-card-${next}`, {
            xPercent: direction === 1 ? 100 : -100,
            opacity: 1,
            zIndex: 20
        });

        // Keep current card below it
        gsap.set(`.committee-card-${current}`, { zIndex: 10 });

        // Horizontal Move
        tl.to(`.committee-card-${current}`, {
            xPercent: direction === 1 ? -100 : 100,
            duration: 0.8,
            ease: "power2.inOut"
        });

        tl.to(`.committee-card-${next}`, {
            xPercent: 0,
            duration: 0.8,
            ease: "power2.inOut"
        }, "<");

        // Subtle Content Fade
        tl.to(`.card-content-${current}`, { opacity: 0, duration: 0.3 }, 0);
        tl.fromTo(`.card-content-${next}`,
            { opacity: 0 },
            { opacity: 1, duration: 0.8 },
            0.4
        );

        currentIndex.current = index;
        setActiveIndex(index);
    }, []);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const ctx = gsap.context(() => {
            // Initial Stacking logic
            committees.forEach((_, i) => {
                if (i === 0) {
                    gsap.set(`.committee-card-${i}`, { xPercent: 0, zIndex: 10 });
                } else {
                    gsap.set(`.committee-card-${i}`, { xPercent: 100, zIndex: 0 });
                }
            });

            Observer.create({
                target: section,
                type: "wheel,touch",
                lockAxis: true,
                tolerance: 60, // Higher tolerance for a more "intentional" swipe
                onRight: () => {
                    if (currentIndex.current < committees.length - 1) {
                        gotoSlide(currentIndex.current + 1, 1);
                    }
                },
                onLeft: () => {
                    if (currentIndex.current > 0) {
                        gotoSlide(currentIndex.current - 1, -1);
                    }
                },
                preventDefault: true,
            });
        }, sectionRef);

        return () => ctx.revert();
    }, [gotoSlide]);

    return (
        <section ref={sectionRef} id="committees-section" className="relative h-screen bg-white overflow-hidden select-none">
            {/* Slide Navigation Dots */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex gap-4">
                {committees.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            if (!animating.current) {
                                const dir = i > activeIndex ? 1 : -1;
                                gotoSlide(i, dir);
                            }
                        }}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-1000 ${i === activeIndex ? 'bg-school-red scale-125' : 'bg-charcoal/20 hover:bg-charcoal/40'
                            }`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>

            {committees.map((committee, index) => (
                <div
                    key={index}
                    className={`committee-card-${index} absolute inset-0 w-full h-full flex items-center justify-center bg-white`}
                    style={{ willChange: 'transform' }}
                >
                    {/* Background Visuals */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${committee.color} opacity-10`} />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

                    <div className="w-full max-w-7xl px-8 md:px-12 z-20">
                        <div className={`card-content-${index} grid grid-cols-1 lg:grid-cols-12 gap-12 items-center`}>

                            {/* Left Side: Identity */}
                            <div className="lg:col-span-7">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-[1px] bg-school-red" />
                                    <span className="text-school-red font-mono text-xs tracking-widest uppercase">
                                        Committee 0{index + 1}
                                    </span>
                                </div>
                                <h2 className="text-[14vw] lg:text-[11vw] leading-[0.85] font-display font-bold text-charcoal tracking-tighter uppercase">
                                    {committee.acronym}
                                </h2>
                                <h3 className="text-xl md:text-3xl font-light text-charcoal/70 mt-6 uppercase tracking-[0.2em]">
                                    {committee.name}
                                </h3>
                            </div>

                            {/* Right Side: Info */}
                            <div className="lg:col-span-5 space-y-10">
                                <div className="space-y-6">
                                    {committee.topics.map((topic, i) => (
                                        <div key={i} className="flex gap-4">
                                            <span className="text-school-red font-mono text-xs pt-1">0{i + 1}</span>
                                            <p className="text-charcoal/80 font-mono text-[11px] md:text-xs leading-relaxed uppercase tracking-wider">
                                                {topic}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-charcoal/60 font-light leading-relaxed text-lg border-l border-charcoal/10 pl-6">
                                    {committee.description}
                                </p>

                                {/* Committee Actions */}
                                <div className="pt-2 flex flex-wrap gap-4">
                                    <Link
                                        href={`/committees/${committee.slug}`}
                                        className="group relative inline-flex items-center gap-6 px-10 py-5 border border-school-red/100 bg-school-red/10 backdrop-blur-md md:bg-school-red/5 md:border-school-red/30 transition-all duration-700 md:hover:border-school-red md:hover:bg-school-red/10 overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-school-red/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                                        <span className="relative z-10 text-school-red font-mono text-[10px] tracking-[0.4em] uppercase transition-colors duration-500 group-hover:text-school-red">
                                            Enter Committee
                                        </span>

                                        <div className="relative z-10 flex items-center">
                                            <div className="w-12 h-[1px] bg-school-red/30 transition-all duration-700 group-hover:w-16 group-hover:bg-school-red" />
                                            <div className="w-2 h-2 border-t border-r border-school-red/50 rotate-45 -ml-1 group-hover:border-school-red transition-colors duration-700" />
                                        </div>

                                        {/* Mechanical Corner Accents */}
                                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-school-red/40 group-hover:w-3 group-hover:h-3 transition-all duration-500" />
                                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-school-red/40 group-hover:w-3 group-hover:h-3 transition-all duration-500" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Massive Background Number */}
                    <div className="absolute right-10 bottom-0 opacity-[0.03] select-none pointer-events-none">
                        <span className="text-[25vw] font-bold text-charcoal leading-none translate-y-1/4">
                            0{index + 1}
                        </span>
                    </div>
                </div>
            ))}
        </section>
    );
}