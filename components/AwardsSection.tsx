'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AwardsSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.award-card',
                { y: 50, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 75%',
                    },
                    y: 0,
                    opacity: 1,
                    duration: 1.2,
                    stagger: 0.2,
                    ease: 'power4.out'
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="awards-section"
            className="relative bg-charcoal py-32 px-8 z-20 overflow-hidden text-platinum"
        >
            <div className="max-w-7xl mx-auto w-full">
                <div className="mb-24 text-center">
                    <div className="flex justify-center items-center gap-4 mb-6 text-gold font-mono text-[10px] tracking-[0.4em] uppercase">
                        <span className="w-2 h-2 bg-gold rounded-full" />
                        Excellence DISTINCTIONS & HONORS
                    </div>
                    <h2 className="text-6xl md:text-8xl font-display font-bold text-gold uppercase tracking-tighter">
                        Awards
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Institutional Award */}
                    <div className="award-card lg:col-span-12 bg-gradient-to-br from-gold/20 via-gold/5 to-transparent border border-gold/30 p-12 rounded-3xl relative group overflow-hidden">
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h3 className="text-gold font-mono text-xs tracking-widest mb-4 uppercase">The highest institutional honour at SISMUN Conclave 2026</h3>
                                <h4 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-[0.9] tracking-tighter uppercase">
                                    Overall Best Policy <br /> & <br /> Research Delegation
                                </h4>
                                <div className="h-px w-24 bg-gold mb-6" />
                            </div>
                            <div>
                                <p className="text-platinum/60 font-light mb-8 text-lg">Awarded to the best performing school delegation that demonstrates:</p>
                                <ul className="space-y-4 text-sm font-mono tracking-wider uppercase text-platinum/80">
                                    <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-gold rounded-full" /> Consistent excellence across committees</li>
                                    <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-gold rounded-full" /> Strength in research and policy depth</li>
                                    <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-gold rounded-full" /> Leadership in negotiations and resolution writing</li>
                                    <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-gold rounded-full" /> Collaborative diplomacy</li>
                                    <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-gold rounded-full" /> Upholding the highest standards of decorum</li>
                                </ul>
                                <p className="mt-8 pt-8 border-t border-white/10 text-xs italic text-platinum/40">
                                    This award recognizes collective excellence, unity, and intellectual leadership.
                                </p>
                            </div>
                        </div>
                        {/* Background Massive Text */}
                        <div className="absolute right-[-5%] bottom-[-5%] text-[20vw] font-bold text-gold opacity-[0.03] select-none pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-1000">
                            HONOR
                        </div>
                    </div>

                    {/* Individual Awards */}
                    <div className="award-card lg:col-span-12 mt-16 lg:mt-24">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                            <div>
                                <h3 className="text-gold font-mono text-xs tracking-widest mb-4 uppercase">Individual Distinctions</h3>
                                <h4 className="text-3xl md:text-5xl font-display font-bold text-platinum tracking-tighter uppercase">Committee Awards</h4>
                            </div>
                            <p className="text-sm text-platinum/40 font-light italic max-w-xs md:text-right">
                                Presented to outstanding delegates demonstrating exceptional diplomatic prowess.
                            </p>
                        </div>

                        <div className="flex flex-col border-t border-white/10">
                            {[
                                'Best Delegate',
                                'Best Delegate (Research)',
                                'High Commendation',
                                'Special Commendation',
                                'Commendation'
                            ].map((award, index) => (
                                <div key={award} className="group relative flex items-center justify-between py-8 px-4 md:px-8 border-b border-white/10 hover:bg-white/[0.02] transition-colors duration-500 cursor-default overflow-hidden">
                                    {/* Left highlight bar */}
                                    <div className="absolute left-0 top-0 h-full w-1 bg-gold transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />

                                    <div className="flex items-center gap-6 md:gap-12 relative z-10 transition-transform duration-500 group-hover:translate-x-4">
                                        <span className="font-mono text-sm tracking-widest text-platinum/20 group-hover:text-gold transition-colors duration-500">0{index + 1}</span>
                                        <h5 className="font-display text-2xl md:text-4xl text-platinum/70 group-hover:text-platinum transition-colors duration-500 tracking-wide">{award}</h5>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
