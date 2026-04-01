'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function PrincipalSection() {
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
            id="principal-section"
        >
            <div className="max-w-7xl w-full">
                {/* Right Side: Image Placeholder Area - Floating on LG screens */}
                <div
                    ref={placeholderRef}
                    className="w-full lg:w-auto lg:float-right lg:ml-16 lg:mb-12 flex justify-center lg:block"
                >
                    <div className="relative w-[280px] sm:w-[360px] lg:w-[400px] aspect-[3/4] rounded-2xl bg-platinum/5 border border-platinum/10 shadow-lg overflow-hidden group">
                        <Image
                            src="/principal-Stephen-Willoughby.jpg"
                            alt="Mr. Stephen Willoughby, Principal"
                            fill
                            sizes="(max-width: 1024px) 100vw, 400px"
                            className="object-cover object-[73%_50%] transition-transform duration-700 md:group-hover:scale-105"
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
                                Leading with Purpose
                            </h2>
                            <h3 className="text-xl sm:text-2xl text-school-red font-mono uppercase tracking-[0.3em] font-medium mb-8">
                                A Message from the Principal
                            </h3>
                            <div className="h-1.5 w-24 bg-school-red" />
                        </div>
                    </div>

                    <div className="text-charcoal/80 leading-relaxed text-lg lg:text-xl font-light">

                        <div className="space-y-6">
                            <p>
                                History often favours the powerful. The stories that endure are usually those told by the victors, while the experiences of the marginalised are reduced, reframed, or forgotten. At SISMUN, we believe that meaningful dialogue begins by acknowledging this imbalance and by creating space for voices that are too often overlooked.
                            </p>

                            <p>
                                The 17th Edition of the SISMUN Conclave warmly invites schools to join a conversation shaped by this year&rsquo;s theme, <span className="text-school-red font-medium italic underline decoration-school-red/30 underline-offset-4">&ldquo;Towards Fostering an Ecosystem of a Uniform Global Human Rights and Social Justice Framework.&rdquo;</span> Through debate, diplomacy, and dialogue, delegates will explore how universal principles of rights and justice can be understood, challenged, and strengthened in a complex and evolving world.
                            </p>

                            <p>
                                This year&rsquo;s conclave is guided by four landmark commemorations that continue to shape our collective global journey.
                            </p>

                            <p>
                                The 75th Anniversary of the Schuman Declaration reminds us that peace is born from deliberate cooperation rather than rivalry. It highlights the enduring value of shared responsibility and structured collaboration in building equitable global systems.
                            </p>

                            <p>
                                The 80th Commemoration of the United Nations reaffirms the importance of multilateral dialogue. Eight decades on, the UN continues to symbolize humanity&rsquo;s collective commitment to dignity, law, and universal human rights.
                            </p>

                            <p>
                                The 40th Solemn Commemoration of the Chernobyl Nuclear Disaster serves as a reminder that progress without accountability carries profound human and environmental costs. It underscores the need for transparency and ethical governance within global frameworks.
                            </p>

                            <p>
                                The 150th Birth Anniversary of Birsa Munda and Sardar Vallabhbhai Patel honours leadership grounded in unity, resilience, and justice. Their legacies remind us that inclusive and principled leadership is essential in shaping fair and stable societies.
                            </p>

                            <div className="relative py-4">
                                <p className="italic font-serif text-2xl lg:text-3xl border-l-4 border-school-red/40 pl-8 py-2 text-charcoal/90">
                            &ldquo;There&rsquo;s really no such thing as the &lsquo;voiceless&rsquo;. There are only the deliberately silenced, or the preferably unheard.&rdquo;
                            <span className="block text-sm mt-3 font-sans font-normal not-italic tracking-widest text-charcoal/50">&mdash; ARUNDHATI ROY</span>
                        </p>
                    </div>

                    <p>
                        It is in this spirit that we invite your students to participate in a conclave that promotes thoughtful debate, respectful dialogue, and a deeper understanding of global issues rooted in human rights and social justice.
                    </p>
                </div>
            </div>

            <div className="mt-10 pt-4 border-t border-charcoal/10 w-fit">
                <p className="text-school-red text-lg lg:text-xl tracking-[0.1em] font-medium mb-1">Stephen Willoughby</p>
            </div>
        </div>
                {/* Clearfix for floating elements */}
                <div className="clear-both" />
            </div>
        </section>
    );
}
