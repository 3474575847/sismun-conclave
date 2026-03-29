'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SecretariatNoteSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(contentRef.current,
                { y: 50, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 70%',
                    },
                    y: 0,
                    opacity: 1,
                    duration: 1.5,
                    ease: 'power3.out',
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="secretariat-note"
            className="relative min-h-screen bg-charcoal py-32 px-8 z-20 flex items-center justify-center overflow-hidden"
        >
            {/* Background Decorative Element */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
                <div className="absolute top-[-10%] right-[-5%] text-[40vw] font-display font-bold text-white select-none">
                    17
                </div>
            </div>

            <div ref={contentRef} className="max-w-4xl mx-auto w-full relative z-10">
                <div className="space-y-8">
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-platinum font-bold leading-[1.1] mb-4">
                        A note from the Secretariat
                    </h2>
                    <div className="h-1.5 w-24 bg-gold mb-8" />

                    <div className="space-y-8 text-platinum/80 font-light text-lg leading-relaxed text-justify">
                        <p>
                            It is with immense pride and gratitude that we welcome you to the 17th Edition of SISMUN. What you see is more than just a platform &mdash; it is the culmination of months of planning, collaboration, late-night discussions, and a shared commitment to creating a conference that challenges, inspires, and empowers. However, no matter how detailed our preparation, a conference truly comes alive only because of its delegates &mdash; and that means you.
                        </p>
                        <p>
                            SISMUN has never been defined merely by formal speeches or structured debate. It is a dynamic space where ideas are tested, perspectives evolve, and confidence steadily takes shape. Some of you arrive as seasoned delegates, comfortable navigating procedure and negotiation. Others may still be waiting for the right moment to raise your placard. Both journeys are equally meaningful. Every confident diplomat once began with hesitation, carefully drafting their first speech and hoping their resolution would pass.
                        </p>
                        <p>
                            The true spirit of Model United Nations extends beyond committee sessions. It thrives in the hurried strategy discussions in hallways, the alliances formed during short breaks, and the thoughtful compromises reached moments before voting. You will argue passionately, negotiate deliberately, and perhaps discover that diplomacy often requires rewriting an entire clause in pursuit of consensus. It is in these intense, human moments that leadership quietly develops.
                        </p>
                        <p>
                            After more than sixteen years of debate and dialogue, SISMUN has grown into a platform grounded in cooperation, curiosity, and principled diplomacy. Here, disagreement is not an obstacle but an opportunity &mdash; a chance to understand perspectives beyond our own. We encourage you not only to speak with conviction, but also to listen with openness, for meaningful learning often begins where comfort ends.
                        </p>
                        <p>
                            As your Secretariat, our hope is simple: immerse yourselves fully in the experience. Take intellectual risks. Build lasting friendships. Embrace both triumphs and challenges with equal grace. While awards may recognise excellence, the confidence you cultivate, the resilience you develop, and the relationships you forge will remain with you long after the final gavel falls.
                        </p>
                        <p>
                            Thank you for being part of SISMUN 2026. We eagerly await the energy, integrity, and passion you will bring to this conference.
                        </p>
                        <p>
                            As former UN Secretary-General Kofi Annan once said, &ldquo;More than ever before in human history, we share a common destiny.&rdquo; May this conference remind us of that shared responsibility &mdash; and the power of dialogue in shaping it.
                        </p>
                        <p className="font-semibold text-platinum italic">
                            Let the debate begin.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
}
