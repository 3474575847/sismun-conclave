'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function TrainingSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.training-text',
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
            id="training-section"
            className="relative bg-white dark:bg-charcoal text-charcoal dark:text-platinum py-32 px-8 z-20 overflow-hidden transition-colors duration-500"
        >
            <div className="max-w-4xl mx-auto w-full">
                <div className="mb-16 training-text">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal dark:text-platinum leading-tight mb-4 transition-colors duration-500">
                        Pre-Conference Training
                    </h2>
                    <div className="h-1.5 w-24 bg-school-red" />
                </div>

                <div className="space-y-12 text-charcoal/80 dark:text-platinum/80 font-light text-lg leading-relaxed transition-colors duration-500">
                    
                    <div className="training-text">
                        <p className="mb-8">The SISMUN Pre-Conference Training Programme is designed to prepare delegates for a confident and meaningful participation in Model United Nations. The sessions will focus on the following key areas:</p>
                        
                        <ul className="list-none space-y-6 pl-0">
                            <li className="flex gap-4">
                                <span className="text-school-red mt-1">✦</span>
                                <div>
                                    <strong className="text-charcoal dark:text-platinum block mb-1 transition-colors duration-500">Foundations of Model United Nations</strong>
                                    Understanding the purpose, structure, significance, committees, and interpretation of agenda statements.
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="text-school-red mt-1">✦</span>
                                <div>
                                    <strong className="text-charcoal dark:text-platinum block mb-1 transition-colors duration-500">Research & Policy Development</strong>
                                    Conducting structured country-wise and agenda-based research using credible sources, and developing well-informed national positions and policy perspectives.
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="text-school-red mt-1">✦</span>
                                <div>
                                    <strong className="text-charcoal dark:text-platinum block mb-1 transition-colors duration-500">THIMUN Rules of Procedure</strong>
                                    Mastering motions, points, debate flow, formal committee procedures, and diplomatic conduct aligned with international standards.
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="text-school-red mt-1">✦</span>
                                <div>
                                    <strong className="text-charcoal dark:text-platinum block mb-1 transition-colors duration-500">Resolution Drafting & Amendments</strong>
                                    Learning to draft strong preambulatory and operative clauses, and effectively propose, debate, and incorporate amendments.
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="text-school-red mt-1">✦</span>
                                <div>
                                    <strong className="text-charcoal dark:text-platinum block mb-1 transition-colors duration-500">Public Speaking & Negotiation Skills</strong>
                                    Structuring impactful speeches, delivering persuasive interventions, and building consensus through strategic lobbying.
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="training-text mt-8">
                        <p>These training sessions aim to ensure that all delegates, including first-time participants, are academically prepared and confident before the conference.</p>
                    </div>

                    <div className="training-text mt-12 pt-12 border-t border-charcoal/10 dark:border-platinum/10 transition-colors duration-500">
                        <h3 className="text-2xl font-display font-bold text-charcoal dark:text-platinum mb-4 transition-colors duration-500">Mode of Delivery:</h3>
                        <p>All Pre-Conference Training Sessions will be conducted online via Google Meet/Zoom. The meeting links and joining details will be shared with registered delegates and schools in July 2026.</p>
                    </div>

                    <div className="training-text mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="p-8 bg-charcoal/5 dark:bg-platinum/5 border border-charcoal/10 dark:border-platinum/10 rounded-2xl transition-colors duration-500">
                            <h4 className="font-display font-semibold text-lg mb-4 text-charcoal dark:text-platinum uppercase tracking-widest border-b border-school-red/20 pb-2 transition-colors duration-500">Training Session 1</h4>
                            <p className="font-mono text-sm leading-8">
                                <span className="text-charcoal/40 dark:text-platinum/40">Conducted By:</span> Secretariat<br />
                                <span className="text-charcoal/40 dark:text-platinum/40">Date:</span> July 11, 2026<br />
                                <span className="text-charcoal/40 dark:text-platinum/40">Day:</span> Saturday<br />
                                <span className="text-charcoal/40 dark:text-platinum/40">Time:</span> 11 am to 1 pm
                            </p>
                        </div>
                        <div className="p-8 bg-charcoal/5 dark:bg-platinum/5 border border-charcoal/10 dark:border-platinum/10 rounded-2xl transition-colors duration-500">
                            <h4 className="font-display font-semibold text-lg mb-4 text-charcoal dark:text-platinum uppercase tracking-widest border-b border-school-red/20 pb-2 transition-colors duration-500">Training Session 2</h4>
                            <p className="font-mono text-sm leading-8">
                                <span className="text-charcoal/40 dark:text-platinum/40">Conducted By:</span> Secretariat<br />
                                <span className="text-charcoal/40 dark:text-platinum/40">Date:</span> July 19, 2026<br />
                                <span className="text-charcoal/40 dark:text-platinum/40">Day:</span> Sunday<br />
                                <span className="text-charcoal/40 dark:text-platinum/40">Time:</span> 11 am to 1 pm
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
