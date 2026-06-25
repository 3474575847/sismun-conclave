'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function RegistrationSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const [regType, setRegType] = useState<'school' | 'independent'>('school');

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.reg-text',
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

    // Animation for content switch
    useEffect(() => {
        gsap.fromTo('.reg-content-fade',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
    }, [regType]);

    return (
        <section
            ref={sectionRef}
            id="registration-section"
            className="relative bg-white dark:bg-charcoal text-charcoal dark:text-white py-32 px-8 z-20 overflow-hidden transition-colors duration-500"
        >
            <div className="max-w-4xl mx-auto w-full">
                
                {/* Registration Toggle Button */}
                <div className="flex flex-col items-center mb-20 animate-fade-in">
                    <div className="relative p-1 bg-charcoal/5 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-full flex gap-1 mb-6">
                        <button
                            onClick={() => setRegType('school')}
                            className={`px-8 py-3 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] transition-all duration-500 relative z-10 ${
                                regType === 'school' ? 'text-white dark:text-charcoal' : 'text-charcoal/40 dark:text-platinum/40 hover:text-charcoal dark:hover:text-white'
                            }`}
                        >
                            School Delegations
                        </button>
                        <button
                            onClick={() => setRegType('independent')}
                            className={`px-8 py-3 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] transition-all duration-500 relative z-10 ${
                                regType === 'independent' ? 'text-white dark:text-charcoal' : 'text-charcoal/40 dark:text-platinum/40 hover:text-charcoal dark:hover:text-white'
                            }`}
                        >
                            Independent Delegates
                        </button>
                        
                        {/* Sliding Background */}
                        <div 
                            className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-gold rounded-full transition-transform duration-500 ease-out-expo ${
                                regType === 'independent' ? 'translate-x-full' : 'translate-x-0'
                            }`}
                        />
                    </div>
                </div>

                <div className="reg-content-fade min-h-[600px]">
                    {regType === 'school' ? (
                        <div className="space-y-24 text-charcoal/80 dark:text-platinum/80 font-light text-lg leading-relaxed transition-colors duration-500">
                            {/* School Delegations Content */}
                            <div>
                                <div className="mb-12 reg-text">
                                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal dark:text-platinum leading-tight mb-4 uppercase tracking-tighter transition-colors duration-500">
                                        Registration Process for School Delegations
                                    </h2>
                                    <div className="h-1.5 w-24 bg-gold" />
                                </div>

                                <div className="space-y-10">
                                    {/* Step 1 */}
                                    <div className="reg-text">
                                        <h3 className="text-xl font-display font-bold text-charcoal dark:text-platinum mb-2 uppercase tracking-wide transition-colors duration-500">Step 1: Expression of Interest</h3>
                                        <ul className="list-none space-y-3 pl-2">
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span>Schools are required to indicate their intention to participate by completing the SISMUN 2026 Google Registration Form.</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span>The form includes details of the school, the School MUN Director, and formal consent.</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span>Form Link: <a href="https://forms.gle/8rZRG7U7MtCnjho47" className="text-gold hover:underline font-bold" target="_blank" rel="noopener noreferrer">https://forms.gle/8rZRG7U7MtCnjho47</a></span>
                                            </li>
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span className="text-charcoal/60 dark:text-platinum/60 transition-colors duration-500">Deadline: <span className="font-semibold">10th July 2026</span></span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="reg-text">
                                        <h3 className="text-xl font-display font-bold text-charcoal dark:text-white mb-2 uppercase tracking-wide transition-colors duration-500">Step 2: Submission of Delegate Details and Registration Fees</h3>
                                        <ul className="list-none space-y-3 pl-2">
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span>Upon receipt of the Expression of Interest, the SISMUN Secretariat will share a Delegate Registration (Google) Form with the School MUN Director via email.</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span>Schools are requested to circulate this form among interested students.</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span>Students wishing to participate must complete the registration form, make the registration fee payment, and upload a copy of the payment receipt through the same form.</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span>Registration Fee: <span className="font-semibold">₹3,000 per student</span> (Includes registration, snack breaks, lunch, and high tea on both conference days).</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span>Chaperones: No registration fee.</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span className="text-charcoal/60 dark:text-platinum/60 transition-colors duration-500">Deadline: <span className="font-semibold">10th July 2026</span></span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Payment Details */}
                                    <div className="reg-text">
                                        <h3 className="text-xl font-display font-bold text-charcoal dark:text-platinum mb-2 transition-colors duration-500">Payment Details</h3>
                                        <ul className="list-none space-y-1 font-mono text-sm border-l border-charcoal/10 dark:border-platinum/10 pl-6 py-4 transition-colors duration-500">
                                            <li>— Account Name: Singapore International School</li>
                                            <li>— Account Number: 59202022786000</li>
                                            <li>— Bank: HDFC Bank, Mira Road Branch</li>
                                            <li>— IFSC Code: HDFC0006199</li>
                                            <li>— Account Type: Current</li>
                                        </ul>
                                    </div>

                                    {/* Info note */}
                                    <div className="reg-text pt-4">
                                        <div className="bg-charcoal/5 dark:bg-white/5 border-l-2 border-gold p-8 rounded-r-xl">
                                            <p className="text-base text-charcoal/70 dark:text-platinum/70 font-light leading-relaxed transition-colors duration-500">
                                                Study Guides, Committee Allocations, and Country Allocations will be shared with registered schools in <span className="text-gold font-bold">mid-July 2026</span>, following the verification of registration details and receipt of all applicable payments.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Special Note */}
                                    <div className="reg-text mt-20 mb-12 p-8 bg-charcoal/5 dark:bg-platinum/5 border-l-4 border-gold rounded-r-xl transition-colors duration-500">
                                        <h2 className="text-3xl font-serif font-bold text-charcoal dark:text-platinum leading-tight mb-4 lowercase first-letter:uppercase transition-colors duration-500">
                                            Special Note for Schools Reopening After the Conference:
                                        </h2>
                                        <p>Schools whose academic session begins after the first week of August (i.e., after the conference dates) may nominate independent delegates to participate in SISMUN 2026.</p>
                                        <p className="mt-3 text-charcoal/60 dark:text-platinum/60 text-base transition-colors duration-500">For detailed guidelines regarding independent delegate registration, kindly refer to the Independent Delegates tab above.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-24 text-charcoal/80 dark:text-platinum/80 font-light text-lg leading-relaxed transition-colors duration-500">
                            {/* Independent Delegates Content */}
                            <div>
                                <div className="mb-12 reg-text">
                                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal dark:text-platinum leading-tight mb-4 uppercase tracking-tighter transition-colors duration-500">
                                        Registration Process for Independent Delegates
                                    </h2>
                                    <div className="h-1.5 w-24 bg-gold" />
                                </div>

                                <div className="space-y-10">
                                    <div className="reg-text">
                                        <ul className="list-none space-y-4 pl-2">
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span>Independent delegates are required to complete the SISMUN 2026 Google Registration Form by providing their name, school, grade, committee preferences, and other relevant details.</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span>Form Link: <a href="https://forms.gle/21dAqNYqNcJEZvjp8" className="text-gold hover:underline font-bold" target="_blank" rel="noopener noreferrer">https://forms.gle/21dAqNYqNcJEZvjp8</a></span>
                                            </li>
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span>At the time of submission, delegates must complete the registration payment.</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span>Registration Fee: <span className="font-semibold">₹3,000 per delegate</span> (Includes conference registration, snack breaks, lunch, and high tea on both days of the conference).</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span className="text-charcoal/60 dark:text-platinum/60 transition-colors duration-500">Deadline: <span className="font-semibold">10th July 2026</span></span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Info note */}
                                    <div className="reg-text pt-4">
                                        <div className="bg-charcoal/5 dark:bg-white/5 border-l-2 border-gold p-8 rounded-r-xl">
                                            <p className="text-base text-charcoal/70 dark:text-platinum/70 font-light leading-relaxed transition-colors duration-500">
                                                Study Guides, Committee Allocations, and Country Allocations will be shared with independent delegates in <span className="text-gold font-bold">mid-July 2026</span>, following the verification of registration details and receipt of all applicable payments.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Payment Details */}
                                    <div className="reg-text">
                                        <h3 className="text-xl font-display font-bold text-charcoal dark:text-platinum mb-4 mt-4 transition-colors duration-500">Payment Details</h3>
                                        <ul className="list-none space-y-1 font-mono text-sm border-l border-charcoal/10 dark:border-white/10 pl-6 py-4 transition-colors duration-500">
                                            <li>— Account Name: Singapore International School</li>
                                            <li>— Account Number: 59202022786000</li>
                                            <li>— Bank: HDFC Bank, Mira Road Branch</li>
                                            <li>— IFSC Code: HDFC0006199</li>
                                            <li>— Account Type: Current</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
