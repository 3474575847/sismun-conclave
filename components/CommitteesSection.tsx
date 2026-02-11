'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';
import { useLenis } from '@/components/SmoothScroll';

gsap.registerPlugin(ScrollTrigger, Observer);

const committees = [
    {
        name: 'United Nations Security Council',
        acronym: 'UNSC',
        description: 'Addressing international peace and security with binding resolutions.',
        topic: 'The Question of Cyber Warfare',
        color: 'from-blue-500/20 to-blue-900/20',
    },
    {
        name: 'Human Rights Council',
        acronym: 'HRC',
        description: 'Protecting and promoting human rights around the globe.',
        topic: 'Digital Privacy Rights in the Age of AI',
        color: 'from-purple-500/20 to-purple-900/20',
    },
    {
        name: 'Economic and Social Council',
        acronym: 'ECOSOC',
        description: 'Coordinating economic and social work of the UN system.',
        topic: 'Sustainable Development in Emerging Markets',
        color: 'from-green-500/20 to-green-900/20',
    },
    {
        name: 'International Court of Justice',
        acronym: 'ICJ',
        description: 'The principal judicial organ of the United Nations.',
        topic: 'Maritime Boundary Disputes',
        color: 'from-red-500/20 to-red-900/20',
    },
    {
        name: 'General Assembly',
        acronym: 'GA',
        description: 'The main deliberative, policymaking organ of the UN.',
        topic: 'Climate Migration and Refugee Status',
        color: 'from-yellow-500/20 to-yellow-900/20',
    },
];

export default function CommitteesSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const animating = useRef(false);
    const currentIndex = useRef(0);
    const exitAttempts = useRef(0); // Buffer: require 2 consecutive boundary scrolls before releasing
    const isScrolling = useRef(false); // Track physical scroll state
    const lenis = useLenis();
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const ctx = gsap.context(() => {
            // Initial State: Stack all cards > 0 off-screen below
            committees.forEach((_, i) => {
                if (i > 0) gsap.set(`.committee-card-${i}`, { yPercent: 100 });
            });

            // Pin the section for exactly the viewport height (no extra buffer)
            const trigger = ScrollTrigger.create({
                trigger: section,
                pin: true,
                start: "top top",
                end: () => `+=${window.innerHeight * (committees.length - 1)}`,
                pinSpacing: true,
            });

            // Observer for scroll-driven slide changes
            const obs = Observer.create({
                target: section,
                type: "wheel,touch",
                preventDefault: true,
                tolerance: 10,
                onStopDelay: 0.05, // Rapidly detect stop to allow next scroll if intentional

                onUp: () => { // Scrolling UP (going to previous)
                    if (!trigger.isActive) return;
                    if (animating.current || isScrolling.current) return;

                    if (currentIndex.current > 0) {
                        exitAttempts.current = 0;
                        gotoSlide(currentIndex.current - 1, -1);
                    } else {
                        // At first slide -> exit upward logic
                        // Exit immediately on the 2nd scroll intention (index 0 -> try -> exit)
                        exitAttempts.current++;
                        if (exitAttempts.current >= 1) {
                            if (lenis) lenis.start(); // Ensure scrolling is enabled
                            exitAttempts.current = 0;
                            isScrolling.current = true;
                            trigger.scroll(trigger.start - 5); // Jump just before start
                            ScrollTrigger.update();
                            setTimeout(() => { isScrolling.current = false; }, 500);
                        }
                    }
                },

                onDown: () => { // Scrolling DOWN (going to next)
                    if (!trigger.isActive) return;
                    if (animating.current || isScrolling.current) return;

                    if (currentIndex.current < committees.length - 1) {
                        exitAttempts.current = 0;
                        gotoSlide(currentIndex.current + 1, 1);
                    } else {
                        // At last slide -> exit downward logic
                        exitAttempts.current++;
                        if (exitAttempts.current >= 1) {
                            if (lenis) lenis.start(); // Ensure scrolling is enabled
                            exitAttempts.current = 0;
                            isScrolling.current = true;
                            trigger.scroll(trigger.end + 5); // Jump just after end
                            ScrollTrigger.update();
                            setTimeout(() => { isScrolling.current = false; }, 500);
                        }
                    }
                },

                onStop: () => {
                    // Release the "gesture lock" when physical scroll stops
                    isScrolling.current = false;
                }
            });

            function gotoSlide(index: number, direction: number) {
                if (lenis) lenis.stop(); // STRICT LOCK
                animating.current = true;
                isScrolling.current = true;
                const current = currentIndex.current;
                const next = index;

                // RICHARD MILLE STYLE: Content fade -> Slide -> Content fade in
                const tl = gsap.timeline({
                    onComplete: () => {
                        animating.current = false;
                        if (lenis) lenis.start();
                    }
                });

                // 1. Fade out current content fast (0.5s)
                tl.to(`.card-content-${current}`, {
                    opacity: 0,
                    duration: 0.5,
                    ease: "power2.inOut"
                });

                // 2. Heavy Slide (starts slightly before fade ends for overlap smoothness)
                if (direction === 1) { // NEXT
                    tl.to(`.committee-card-${next}`, {
                        yPercent: 0,
                        duration: 2.0,
                        ease: "power3.inOut"
                    }, "-=0.2");

                    tl.to(`.committee-card-${current}`, {
                        scale: 0.95,
                        opacity: 0.5,
                        duration: 2.0,
                        ease: "power3.inOut"
                    }, "<");
                } else { // PREV
                    tl.to(`.committee-card-${current}`, {
                        yPercent: 100,
                        duration: 2.0,
                        ease: "power3.inOut"
                    }, "-=0.2");

                    tl.to(`.committee-card-${next}`, {
                        scale: 1,
                        opacity: 1,
                        duration: 2.0,
                        ease: "power3.inOut"
                    }, "<");
                }

                // 3. Fade in new content (after slide settles)
                tl.fromTo(`.card-content-${next}`,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
                    "-=0.5" // Start appearing as slide finishes
                );

                currentIndex.current = index;
                setActiveIndex(index);
            }

        }, sectionRef);

        return () => ctx.revert();
    }, [lenis]);

    return (
        <section ref={sectionRef} className="relative h-screen bg-black overflow-hidden select-none">
            {/* Slide Indicators */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
                {committees.map((_, i) => (
                    <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all duration-500 ${i === activeIndex
                            ? 'bg-gold scale-125 shadow-[0_0_8px_rgba(197,160,89,0.6)]'
                            : 'bg-white/20 hover:bg-white/40'
                            }`}
                    />
                ))}
            </div>

            {committees.map((committee, index) => (
                <div
                    key={index}
                    className={`committee-card-${index} absolute inset-0 w-full h-full flex items-center justify-center bg-[#0A0A0A] border-t-[0.5px] border-white/10`}
                    style={{ zIndex: index + 1 }}
                >
                    {/* Background */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br ${committee.color} opacity-20`} />
                        <div className="absolute inset-0 bg-black/60" />
                    </div>

                    {/* Background Grid & Vignette */}
                    <div className="absolute inset-0 pointer-events-none opacity-30 z-10">
                        <div className="w-full h-full bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:60px_60px]" />
                        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0A0A0A]/80 to-[#0A0A0A]" />
                    </div>

                    {/* Content Container */}
                    <div className="w-full h-full flex items-center justify-center z-20 relative">
                        <div className={`card-content-${index} w-full max-w-7xl px-8 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center`}>

                            {/* Left: Monumental Typography */}
                            <div className="lg:col-span-7">
                                <div className="flex items-center gap-4 mb-4 text-gold font-mono text-[10px] tracking-[0.4em] uppercase">
                                    <span className="w-2 h-2 bg-gold rounded-full" />
                                    Model: {committee.acronym} // REF.2026
                                </div>

                                <h2 className="text-[15vw] lg:text-[12vw] leading-[0.8] font-bold text-white tracking-tighter opacity-90">
                                    {committee.acronym}
                                </h2>
                                <div className="h-1 w-32 bg-gold mt-8" />
                            </div>

                            {/* Right: Technical Layout */}
                            <div className="lg:col-span-5 flex flex-col justify-center space-y-12">
                                <div>
                                    <h3 className="text-3xl lg:text-4xl text-white font-light uppercase tracking-wide mb-2">
                                        {committee.name}
                                    </h3>
                                    <p className="text-white/40 font-mono text-xs tracking-widest">
                                        // {committee.topic.toUpperCase()}
                                    </p>
                                </div>

                                <p className="text-lg text-white/60 leading-relaxed font-light border-l-2 border-white/10 pl-6">
                                    {committee.description}
                                </p>

                                {/* Data Table */}
                                <div className="grid grid-cols-2 gap-y-4 gap-x-8 font-mono text-[10px] uppercase tracking-widest text-white/40">
                                    <div className="border-b border-white/10 pb-2">
                                        <span>TYPE</span>
                                        <span className="block text-white mt-1">SPECIALIZED_AGENCY</span>
                                    </div>
                                    <div className="border-b border-white/10 pb-2">
                                        <span>DIFFICULTY</span>
                                        <span className="block text-gold mt-1">ADVANCED</span>
                                    </div>
                                    <div className="border-b border-white/10 pb-2">
                                        <span>DELEGATES</span>
                                        <span className="block text-white mt-1">DOUBLE_DEL</span>
                                    </div>
                                    <div className="border-b border-white/10 pb-2">
                                        <span>SESSION</span>
                                        <span className="block text-white mt-1">001_INAUGURAL</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mechanical Decorative Elements */}
                    <div className="absolute right-8 bottom-8 flex flex-col items-end opacity-20 pointer-events-none">
                        <div className="text-[120px] font-bold text-white leading-none tracking-tighter">
                            0{index + 1}
                        </div>
                    </div>
                </div>
            ))}
        </section>
    );
}
