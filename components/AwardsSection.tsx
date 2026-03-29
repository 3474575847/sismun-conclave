'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AwardsSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.award-text',
                { y: 30, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 85%',
                    },
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.05,
                    ease: 'power3.out'
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="awards-section"
            className="relative bg-charcoal text-white py-32 px-8 z-20 overflow-hidden"
        >
            <div className="max-w-4xl mx-auto w-full">
                <div className="mb-16 award-text">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight mb-4">
                        Awards & Recognitions
                    </h2>
                    <div className="h-1.5 w-24 bg-gold" />
                </div>

                <div className="space-y-16 text-platinum/80 font-light text-lg leading-relaxed">
                    
                    <div className="award-text border-l-4 border-gold pl-8 py-2">
                        <h3 className="text-2xl font-display font-bold text-white mb-4 uppercase tracking-wider">Overall Best Policy & Research Delegation</h3>
                        <p className="mb-4">Awarded to the best-performing school delegation that demonstrates:</p>
                        <ul className="list-disc pl-6 space-y-2 mb-4">
                            <li>Consistent excellence across committees</li>
                            <li>Depth of research and clarity of policy position</li>
                            <li>Leadership in negotiations and resolution drafting</li>
                            <li>Effective and collaborative diplomacy</li>
                            <li>Upholding the highest standards of decorum and professionalism</li>
                        </ul>
                        <p>This award recognises collective excellence, unity of purpose, and intellectual leadership at the institutional level.</p>
                    </div>

                    <div className="award-text">
                        <h3 className="text-2xl font-display font-bold text-white mb-2 underline decoration-gold/50 underline-offset-8">Best Delegate</h3>
                        <p>Awarded in each committee to the delegate who exemplifies outstanding research, mastery of procedure, persuasive articulation, and strategic leadership within that committee.</p>
                    </div>

                    <div className="award-text">
                        <h3 className="text-2xl font-display font-bold text-white mb-2 underline decoration-gold/50 underline-offset-8">Best Delegate (Research)</h3>
                        <p>Awarded in each committee to the delegate whose preparation reflects exceptional depth, evidence-based analysis, and comprehensive understanding of the assigned agenda.</p>
                    </div>

                    <div className="award-text">
                        <h3 className="text-2xl font-display font-bold text-white mb-2 underline decoration-gold/50 underline-offset-8">High Commendation</h3>
                        <p>Awarded in each committee to delegates who demonstrate exceptional analytical depth, sustained leadership in debate, and near-Best Delegate level performance throughout the conference.</p>
                    </div>

                    <div className="award-text">
                        <h3 className="text-2xl font-display font-bold text-white mb-2 underline decoration-gold/50 underline-offset-8">Special Commendation</h3>
                        <p>Awarded in each committee to delegates who show strong preparation, clear articulation, and consistent contribution to committee progress.</p>
                    </div>

                    <div className="award-text">
                        <h3 className="text-2xl font-display font-bold text-white mb-2 underline decoration-gold/50 underline-offset-8">Commendation</h3>
                        <p>Awarded in each committee to delegates who participate responsibly, display developing analytical skills, and contribute constructively to discussions.</p>
                    </div>

                </div>
            </div>
        </section>
    );
}
