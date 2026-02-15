'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(Observer);

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
                type: "touch,pointer",
                lockAxis: true,
                tolerance: 60, // Higher tolerance for a more "intentional" swipe
                onLeft: () => {
                    if (currentIndex.current < committees.length - 1) {
                        gotoSlide(currentIndex.current + 1, 1);
                    }
                },
                onRight: () => {
                    if (currentIndex.current > 0) {
                        gotoSlide(currentIndex.current - 1, -1);
                    }
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, [gotoSlide]);

    return (
        <section ref={sectionRef} className="relative h-screen bg-white overflow-hidden select-none touch-none">
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
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-1000 ${i === activeIndex ? 'bg-gold scale-125' : 'bg-charcoal/20 hover:bg-charcoal/40'
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
                                    <div className="w-8 h-[1px] bg-gold" />
                                    <span className="text-gold font-mono text-xs tracking-widest uppercase">
                                        Committee // 0{index + 1}
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
                                            <span className="text-gold font-mono text-xs pt-1">0{i + 1}</span>
                                            <p className="text-charcoal/80 font-mono text-[11px] md:text-xs leading-relaxed uppercase tracking-wider">
                                                {topic}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-charcoal/60 font-light leading-relaxed text-lg border-l border-charcoal/10 pl-6">
                                    {committee.description}
                                </p>
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