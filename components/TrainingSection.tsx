'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function TrainingSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(textRef.current,
                { y: 30, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 80%',
                    },
                    y: 0,
                    opacity: 1,
                    duration: 1.2,
                    ease: 'power3.out',
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="training-section"
            className="relative bg-charcoal py-24 px-8 z-20 overflow-hidden"
        >
            <div className="max-w-7xl mx-auto w-full flex flex-col items-center text-center">
                <div className="flex items-center gap-4 mb-8 text-gold font-mono text-[10px] tracking-[0.4em] uppercase">
                    <span className="w-2 h-2 bg-gold rounded-full" />
                    Preparation DELEGATE ACADEMY
                </div>

                <div ref={textRef} className="max-w-4xl w-full">
                    <h2 className="text-4xl md:text-6xl font-display font-bold text-platinum mb-8 uppercase tracking-tighter">
                        Pre-Conference Training
                    </h2>

                    <p className="text-xl text-platinum/60 font-light leading-relaxed mb-16">
                        The SISMUN Pre-Conference Training Programme is designed to prepare delegates for a confident and meaningful participation in Model United Nations.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left items-stretch">
                        <div className="space-y-8 bg-white/5 p-8 rounded-2xl border border-gold/10 hover:border-gold/30 transition-colors">
                            <h3 className="text-gold font-display text-xl uppercase tracking-widest border-b border-gold/20 pb-4">Key Focus Areas</h3>
                            <ul className="space-y-4 text-platinum/80 text-lg font-light">
                                <li className="flex items-start gap-3">
                                    <span className="text-gold mt-1">▹</span>
                                    <span><strong className="text-platinum">Foundations</strong>: Understanding purpose, structure, and agenda interpretation.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-gold mt-1">▹</span>
                                    <span><strong className="text-platinum">Research</strong>: Policy development and conducting country-wise research.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-gold mt-1">▹</span>
                                    <span><strong className="text-platinum">THIMUN Procedure</strong>: Mastering motions, debate flow, and diplomatic conduct.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-gold mt-1">▹</span>
                                    <span><strong className="text-platinum">Resolution Drafting</strong>: Learning to draft clauses and propose amendments.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-gold mt-1">▹</span>
                                    <span><strong className="text-platinum">Skills</strong>: Impactful speeches and strategic lobbying/negotiation.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col gap-8">
                            <div className="bg-gold/10 p-8 rounded-2xl border border-gold/20 flex flex-col justify-center h-full">
                                <h3 className="text-gold font-mono text-xs uppercase tracking-[0.4em] mb-4">Mode of Training</h3>
                                <p className="text-platinum text-2xl font-display uppercase tracking-wider mb-2">Online</p>
                                <p className="text-platinum/60 uppercase text-sm tracking-widest font-mono">Via Google Meet / Zoom</p>
                            </div>

                            <div className="bg-white/5 p-8 rounded-2xl border border-gold/10 flex flex-col justify-center h-full">
                                <h3 className="text-gold font-mono text-xs uppercase tracking-[0.4em] mb-4">Training Schedule</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-platinum">
                                        <p className="font-display tracking-[0.2em] font-medium italic">July 11, 2026</p>
                                        <p className="font-mono text-sm text-gold">11 am - 1 pm</p>
                                    </div>
                                    <div className="flex justify-between items-center text-platinum font-medium border-t border-platinum/10 pt-4">
                                        <p className="font-display tracking-[0.2em] italic">July 19, 2026</p>
                                        <p className="font-mono text-sm text-gold">11 am - 1 pm</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
                <div className="w-full h-full bg-[radial-gradient(#FFCC00_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>
        </section>
    );
}
