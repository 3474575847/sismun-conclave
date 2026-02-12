'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';
import { useLenis } from '@/components/SmoothScroll';

gsap.registerPlugin(ScrollTrigger, Observer);

const committees = [
    {
        name: 'Special Political & Decolonisation (GA4)',
        acronym: 'GA4',
        description: 'Addressing the decolonisation of natural resources and self-determination movements in the post-colonial era.',
        topics: [
            'The Question of Self-Determination Movements in Africa in the Post-Colonial Era in Somaliland',
            'The Role of The United Nations bodies in Facilitating the Decolonisation of Natural Resources in the Horn of Africa'
        ],
        color: 'from-blue-500/20 to-blue-900/20',
    },
    {
        name: 'Security Council',
        acronym: 'SC',
        description: 'Safeguarding international peace and security amid global crises and humanitarian threats.',
        topics: [
            'Aftereffects of the lasting Impact of Prolonged Warfare in Ukraine on Global Food Security, Energy Stability, and Credibility of International Security Guarantees',
            'Addressing the humanitarian crisis and threats to international peace and security resulting from the Yemen conflict'
        ],
        color: 'from-red-500/20 to-red-900/20',
    },
    {
        name: 'Economic and Social Council',
        acronym: 'ECOSOC',
        description: 'Coordinating humanitarian aid and environmental safeguards for global stability.',
        topics: [
            'Emergency Measures to enhance food security and distribution of humanitarian aid in conflict zones across Sudan and South Sudan',
            'Ensuring equitable water sharing of Trans-boundary River Systems of South Asia'
        ],
        color: 'from-green-500/20 to-green-900/20',
    },
    {
        name: 'Human Rights Council',
        acronym: 'HRC',
        description: 'Promoting and protecting human rights across diverse socio-political landscapes.',
        topics: [
            'The Impact of Socio-Political Instability, Armed Conflict, and Social Conservatism vis-a-vis the Rights of Gender-Divergent in Middle East',
            'Human Rights frameworks and the smooth transition towards a future elected Parliament in Nepal'
        ],
        color: 'from-purple-500/20 to-purple-900/20',
    },
    {
        name: 'Historical Security Council',
        acronym: 'HSC',
        description: 'Re-evaluating historical conflicts that shaped the modern world.',
        topics: [
            'The implications of Cuban Missile Crisis and the Deployment of Strategic Weapons in the Caribbean',
            'Proposed formation of a future independent government with the prevalent Situation in East Pakistan'
        ],
        color: 'from-indigo-500/20 to-indigo-900/20',
    },
    {
        name: 'Disarmament and International Security Committee',
        acronym: 'DISEC',
        description: 'Regulating emerging military applications and sovereignty questions.',
        topics: [
            'Regulating Lethal Autonomous Weapon Systems (LAWS) and Military Applications of Artificial Intelligence',
            'The question of granting Greenland conditional autonomy from Denmark'
        ],
        color: 'from-orange-500/20 to-orange-900/20',
    },
    {
        name: 'International Criminal Court',
        acronym: 'ICC',
        description: 'Pursuing justice and accountability for crimes against humanity.',
        topics: [
            'The question of the Judicial Rights, privileges and Accountability for the Prisoners of Consciences taken from the Rohingya Population in Myanmar',
            'Setting up Truth and Reconciliation tribunal for Accountability of Crimes Against Humanity in Venezuela'
        ],
        color: 'from-yellow-500/20 to-yellow-900/20',
    },
    {
        name: 'United Nations Environment Programme',
        acronym: 'UNEP',
        description: 'Strengthening global protection frameworks for endangered ecosystems.',
        topics: [
            'Addressing the Degradation of Ecosystems and Strengthening Global Protection Frameworks with a focus on Bay of Bengal Islands'
        ],
        color: 'from-cyan-500/20 to-cyan-900/20',
    },
];

export default function CommitteesSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const animating = useRef(false);
    const currentIndex = useRef(0);
    const exitAttempts = useRef(0);
    const isScrolling = useRef(false);
    const lenis = useLenis();
    const [activeIndex, setActiveIndex] = useState(0);

    const gotoSlide = useCallback((index: number, direction: number) => {
        if (animating.current) return;
        if (index === currentIndex.current) return;

        if (lenis) lenis.stop();
        animating.current = true;
        isScrolling.current = true;
        const current = currentIndex.current;
        const next = index;

        const tl = gsap.timeline({
            onComplete: () => {
                animating.current = false;
                if (lenis) lenis.start();
                setTimeout(() => { isScrolling.current = false; }, 200);
            }
        });

        tl.to(`.card-content-${current}`, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut"
        });

        if (direction === 1) {
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
        } else {
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

        tl.fromTo(`.card-content-${next}`,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
            "-=0.5"
        );

        currentIndex.current = index;
        setActiveIndex(index);
    }, [lenis]);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const ctx = gsap.context(() => {
            committees.forEach((_, i) => {
                if (i > 0) gsap.set(`.committee-card-${i}`, { yPercent: 100 });
            });

            const trigger = ScrollTrigger.create({
                trigger: section,
                pin: true,
                start: "top top",
                end: () => `+=${window.innerHeight * (committees.length - 1)}`,
                pinSpacing: true,
            });

            const obs = Observer.create({
                target: section,
                type: "wheel,touch",
                preventDefault: true,
                tolerance: 10,
                onStopDelay: 0.05,

                onUp: () => {
                    if (!trigger.isActive) return;
                    if (animating.current || isScrolling.current) return;

                    if (currentIndex.current > 0) {
                        exitAttempts.current = 0;
                        gotoSlide(currentIndex.current - 1, -1);
                    } else {
                        exitAttempts.current++;
                        if (exitAttempts.current >= 1) {
                            exitAttempts.current = 0;
                            isScrolling.current = true;
                            if (lenis) {
                                lenis.start();
                                lenis.scrollTo(trigger.start - 50, { immediate: true });
                            }
                            setTimeout(() => { isScrolling.current = false; }, 500);
                        }
                    }
                },

                onDown: () => {
                    if (!trigger.isActive) return;
                    if (animating.current || isScrolling.current) return;

                    if (currentIndex.current < committees.length - 1) {
                        exitAttempts.current = 0;
                        gotoSlide(currentIndex.current + 1, 1);
                    } else {
                        exitAttempts.current++;
                        if (exitAttempts.current >= 1) {
                            exitAttempts.current = 0;
                            isScrolling.current = true;
                            if (lenis) {
                                lenis.start();
                                lenis.scrollTo(trigger.end + 50, { immediate: true });
                            }
                            setTimeout(() => { isScrolling.current = false; }, 500);
                        }
                    }
                },

                onStop: () => {
                    isScrolling.current = false;
                }
            });

        }, sectionRef);

        return () => ctx.revert();
    }, [lenis, gotoSlide]);

    const handleDotClick = (i: number) => {
        if (i === activeIndex || animating.current) return;
        const direction = i > activeIndex ? 1 : -1;
        gotoSlide(i, direction);
    };

    return (
        <section ref={sectionRef} className="relative h-screen bg-white overflow-hidden select-none">
            {/* Slide Indicators */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 pointer-events-auto">
                {committees.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => handleDotClick(i)}
                        className={`w-2 h-2 rounded-full transition-all duration-500 cursor-pointer outline-none ${i === activeIndex
                            ? 'bg-gold scale-125 shadow-[0_0_8px_rgba(255,204,0,0.6)]'
                            : 'bg-charcoal/20 hover:bg-charcoal/40'
                            }`}
                        aria-label={`Go to committee ${i + 1}`}
                    />
                ))}
            </div>

            {committees.map((committee, index) => (
                <div
                    key={index}
                    className={`committee-card-${index} absolute inset-0 w-full h-full flex items-center justify-center bg-white border-t-[0.5px] border-charcoal/10`}
                    style={{ zIndex: index + 1 }}
                >
                    {/* Background */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br ${committee.color} opacity-10`} />
                        <div className="absolute inset-0 bg-white" />
                    </div>

                    {/* Background Grid & Vignette */}
                    <div className="absolute inset-0 pointer-events-none opacity-30 z-10">
                        <div className="w-full h-full bg-[linear-gradient(to_right,rgba(10,25,47,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(10,25,47,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />
                        <div className="absolute inset-0 bg-radial-gradient from-transparent via-white/80 to-white" />
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

                                <h2 className="text-[15vw] lg:text-[12vw] leading-[0.8] font-display font-bold text-charcoal tracking-tighter opacity-90">
                                    {committee.acronym}
                                </h2>
                                <div className="h-1 w-32 bg-gold mt-8" />
                                <h3 className="text-2xl md:text-4xl lg:text-5xl font-light text-charcoal/80 mt-6 tracking-widest uppercase">
                                    {committee.name}
                                </h3>
                            </div>

                            {/* Right: Technical Layout */}
                            <div className="lg:col-span-5 flex flex-col justify-center space-y-12">
                                <div>
                                    <div className="space-y-4">
                                        {committee.topics.map((topic, i) => (
                                            <p key={i} className="text-charcoal/80 font-mono text-xs tracking-widest leading-relaxed">
                                                // 0{i + 1} {topic.toUpperCase()}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                <p className="text-lg text-charcoal/60 leading-relaxed font-light border-l-2 border-charcoal/10 pl-6">
                                    {committee.description}
                                </p>

                                {/* Data Table */}
                                <div className="grid grid-cols-2 gap-y-4 gap-x-8 font-mono text-[10px] uppercase tracking-widest text-charcoal/40">
                                    <div className="border-b border-charcoal/10 pb-2">
                                        <span>TYPE</span>
                                        <span className="block text-charcoal mt-1">SPECIALIZED_AGENCY</span>
                                    </div>
                                    <div className="border-b border-charcoal/10 pb-2">
                                        <span>DIFFICULTY</span>
                                        <span className="block text-gold mt-1">ADVANCED</span>
                                    </div>
                                    <div className="border-b border-charcoal/10 pb-2">
                                        <span>DELEGATES</span>
                                        <span className="block text-charcoal mt-1">DOUBLE_DEL</span>
                                    </div>
                                    <div className="border-b border-charcoal/10 pb-2">
                                        <span>SESSION</span>
                                        <span className="block text-charcoal mt-1">001_INAUGURAL</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mechanical Decorative Elements */}
                    <div className="absolute right-8 bottom-8 flex flex-col items-end opacity-20 pointer-events-none">
                        <div className="text-[120px] font-bold text-charcoal leading-none tracking-tighter">
                            0{index + 1}
                        </div>
                    </div>
                </div>
            ))}
        </section>
    );
}
