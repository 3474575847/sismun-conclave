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
            className="w-full bg-white py-20 sm:py-32 px-6 sm:px-12 lg:px-24 h-auto flex items-center justify-center overflow-visible border-y border-charcoal/5"
            id="school-director-section"
        >
            <div className="max-w-7xl w-full">
                {/* Right Side: Image Placeholder Area - Floating on LG screens */}
                <div
                    ref={placeholderRef}
                    className="w-full lg:w-auto lg:float-right lg:ml-16 lg:mb-12 flex justify-center lg:block"
                >
                    <div className="relative w-[280px] sm:w-[360px] lg:w-[400px] aspect-[3/4] rounded-2xl bg-charcoal/5 border border-charcoal/10 shadow-lg overflow-hidden group">
                        <Image
                            src="/sharonee-mullick.png"
                            alt="School Director - Mrs. Sharonee Mullick"
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
                            <h2 className="text-4xl sm:text-5xl lg:text-8xl font-serif text-charcoal font-bold leading-[1.1] mb-2 uppercase tracking-tighter">
                                Shaping Global Citizens
                            </h2>
                            <h3 className="text-xl sm:text-2xl text-school-red font-mono uppercase tracking-[0.3em] font-medium mb-8">
                                A Message from the Director
                            </h3>
                            <div className="h-1.5 w-24 bg-school-red" />
                        </div>
                    </div>

                    <div className="text-charcoal/80 leading-relaxed text-lg lg:text-xl font-light space-y-6">
                        <p>
                            It gives me great pleasure to present the 17th Edition of the Singapore International School Model United Nations (SISMUN). This year&rsquo;s theme &mdash; <span className="text-school-red font-medium italic underline decoration-school-red/30 underline-offset-4">&ldquo;Towards Fostering an Ecosystem of a Uniform Global Human Rights and Social Justice Framework&rdquo;</span> &mdash; urges us to reflect deeply on the world we aspire to build: one where rights are universal, justice is unwavering, and human dignity is non-negotiable. More than a simulation, SISMUN serves as a dynamic platform where young minds confront global challenges with intellectual rigour, moral conviction, and diplomatic responsibility.
                        </p>

                        <p>
                            Echoing the vision of the current United Nations Secretary-General, Ant&oacute;nio Guterres, who has urged the world to &ldquo;recommit to the purposes and principles of the UN Charter&rdquo; and restore faith in multilateralism, SISMUN 2026 stands firmly for solidarity, accountability, and sustainable progress. His call to defend human rights, strengthen international cooperation, and uphold peace resonates deeply with our theme&mdash;reminding us that dialogue, justice, and collective action are not optional, but essential.
                        </p>

                        <p>
                            The committees of SISMUN 2026 are thoughtfully crafted to reflect both contemporary urgency and historical depth. The General Assembly (GA4) will address the question of self-determination in Somaliland and the decolonisation of natural resources in the Horn of Africa&mdash;core issues that challenge notions of sovereignty, political legitimacy, and economic justice in post-colonial societies.
                        </p>

                        <p>
                            The Security Council will examine the far-reaching global consequences of the war in Ukraine, including its impact on food security, energy stability, and international security credibility. It will also address the humanitarian crisis in Yemen, urging delegates to propose effective and accountable pathways toward peace and stability.
                        </p>

                        <p>
                            The Economic and Social Council will address food insecurity in conflict-affected Sudan and South Sudan, while also deliberating on equitable water sharing in South Asia&rsquo;s trans-boundary rivers&mdash;balancing humanitarian needs, environmental protection, and regional diplomacy.
                        </p>

                        <p>
                            The Human Rights Council will examine the impact of socio-political instability and conflict on the rights of gender-divergent individuals in the Middle East, while also addressing the protection of democratic institutions and human rights amid civil unrest in Nepal.
                        </p>

                        <p>
                            The Historical Security Council will revisit pivotal moments such as the Cuban Missile Crisis and the situation in East Pakistan, encouraging delegates to reflect on how historical decisions continue to shape modern principles of deterrence, sovereignty, and self-governance.
                        </p>

                        <p>
                            DISEC will deliberate on regulating Lethal Autonomous Weapon Systems and the military use of artificial intelligence, addressing the ethical challenges posed by emerging technologies. The International Criminal Court will examine accountability in the Rohingya crisis and the Venezuelan political situation, reaffirming the importance of international justice. UNEP will focus on ecosystem degradation in the Bay of Bengal Islands, highlighting the urgency of climate action and sustainable development.
                        </p>

                        <p>
                            These agendas are intentionally rigorous, demanding thorough research, independent thought, and disciplined diplomacy under the THIMUN Rules of Procedure. SISMUN is not merely a forum for debate, but a training ground for principled leadership and global awareness.
                        </p>

                        <p>
                            As we welcome schools from diverse institutions, we anticipate thoughtful and respectful deliberations. We hope SISMUN 2026 inspires every participant to rise beyond rhetoric and emerge as responsible advocates of peace, justice, and sustainable progress.
                            <p className="italic font-serif text-2xl lg:text-3xl border-l-4 border-school-red pl-8 py-2 text-charcoal/90 mt-8">
                                &ldquo;Education is the most powerful weapon which you can use to change the world.&rdquo;
                                <span className="block text-sm mt-3 font-sans font-normal not-italic tracking-widest text-charcoal/50">&mdash; NELSON MANDELA</span>
                            </p>
                        </p>

                        <p className="text-charcoal/80 leading-relaxed text-lg lg:text-xl font-light">
                            I look forward to welcoming you all to the 17th anniversary of SISMUN Conclave.
                        </p>
                    </div>
                        
                    <div className="mt-10 pt-4 border-t border-charcoal/10 w-fit">
                        <p className="text-school-red text-lg lg:text-xl tracking-[0.1em] font-medium mb-1">SHARONEE MULLICK</p>
                        <p className="text-charcoal/40 font-mono text-[10px] uppercase tracking-widest leading-relaxed">
                            School Director,<br />Singapore International School
                        </p>
                    </div>
                </div>
                {/* Clearfix for floating elements */}
                <div className="clear-both" />
            </div>
        </section>
    );
}
