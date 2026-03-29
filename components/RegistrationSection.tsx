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
            className="relative bg-charcoal text-white py-32 px-8 z-20 overflow-hidden"
        >
            <div className="max-w-4xl mx-auto w-full">
                
                {/* Registration Toggle Button */}
                <div className="flex flex-col items-center mb-20 animate-fade-in">
                    <div className="relative p-1 bg-white/5 border border-white/10 rounded-full flex gap-1 mb-6">
                        <button
                            onClick={() => setRegType('school')}
                            className={`px-8 py-3 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] transition-all duration-500 relative z-10 ${
                                regType === 'school' ? 'text-charcoal' : 'text-platinum/40 hover:text-white'
                            }`}
                        >
                            School Delegations
                        </button>
                        <button
                            onClick={() => setRegType('independent')}
                            className={`px-8 py-3 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] transition-all duration-500 relative z-10 ${
                                regType === 'independent' ? 'text-charcoal' : 'text-platinum/40 hover:text-white'
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
                        <div className="space-y-24 text-platinum/80 font-light text-lg leading-relaxed">
                            {/* School Delegations Content */}
                            <div>
                                <div className="mb-12 reg-text">
                                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight mb-4 uppercase tracking-tighter">
                                        Registration Process for School Delegations
                                    </h2>
                                    <div className="h-1.5 w-24 bg-gold" />
                                </div>

                                <div className="space-y-10">
                                    <div className="reg-text">
                                        <h3 className="text-xl font-display font-bold text-white mb-2 uppercase tracking-wide">Step 1: Expression of Interest</h3>
                                        <ul className="list-none space-y-3 pl-2">
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span>Complete the SISMUN 2026 Google Registration Form.</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span>Form includes: school details, School MUN Director info, formal consent.</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span>Form Link: <a href="https://forms.gle/8rZRG7U7MtCnjho47" className="text-gold hover:underline font-bold" target="_blank" rel="noopener noreferrer">https://forms.gle/8rZRG7U7MtCnjho47</a></span>
                                            </li>
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span className="text-white/60">Deadline: 25th April 2026</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="reg-text">
                                        <h3 className="text-xl font-display font-bold text-white mb-2 uppercase tracking-wide">Step 2: Submission of Delegate Details</h3>
                                        <ul className="list-none space-y-3 pl-2">
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span>SISMUN Secretariat will share an Excel form via email after Step 1.</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span>Form requires: delegate information and teacher chaperone details for both days.</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span className="text-white/60">Deadline: 30th April 2026</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="reg-text">
                                        <h3 className="text-xl font-display font-bold text-white mb-2 uppercase tracking-wide">Step 3: Fee Submission</h3>
                                        <ul className="list-none space-y-3 pl-2">
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span>Registration Fee: Rs. 3,000 per student</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span>Includes: registration, snack breaks, lunch, and high tea on both days.</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span>Chaperones: No registration fee.</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span className="text-white/60">Payment Deadline: 15th May 2026</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="reg-text">
                                        <h3 className="text-xl font-display font-bold text-white mb-2">Payment Details</h3>
                                        <ul className="list-none space-y-1 font-mono text-sm border-l border-white/10 pl-6 py-4">
                                            <li>- Account Name: Singapore International School</li>
                                            <li>- Account Number: 59202022786000</li>
                                            <li>- Bank: HDFC Bank, Mira Road Branch</li>
                                            <li>- IFSC Code: HDFC0006199</li>
                                            <li>- Account Type: Current</li>
                                        </ul>
                                    </div>

                                    <div className="reg-text pt-10">
                                        <div className="bg-white/5 border-l-2 border-gold p-8 rounded-r-xl">
                                            <p className="text-xl md:text-2xl font-display font-medium text-white mb-2 leading-tight lowercase first-letter:uppercase">
                                                Important: Email payment receipt to <a href="mailto:rep.mun@sisindia.edu.in" className="text-gold hover:underline font-bold">rep.mun@sisindia.edu.in</a>
                                            </p>
                                            <p className="text-base text-platinum/60 font-light italic">
                                                Study guides and committee/country allocations will be released <span className="text-gold font-bold">ONLY</span> after full payment is received.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="reg-text mt-20 mb-12 p-8 bg-white/5 border-l-4 border-gold rounded-r-xl">
                                        <h2 className="text-3xl font-serif font-bold text-white leading-tight mb-4 lowercase first-letter:uppercase">
                                            Special Note for Schools Reopening After the Conference:
                                        </h2>
                                        <p>Schools whose academic session begins after the first week of August (i.e., after the conference dates) may nominate independent delegates to participate in SISMUN 2026. Refer to Section 9 for independent delegate registration.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-24 text-platinum/80 font-light text-lg leading-relaxed">
                            {/* Independent Delegates Content */}
                            <div>
                                <div className="mb-12 reg-text">
                                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight mb-4 uppercase tracking-tighter">
                                        Registration Process for Independent Delegates
                                    </h2>
                                    <div className="h-1.5 w-24 bg-gold" />
                                </div>

                                <div className="space-y-10">
                                    <div className="reg-text">
                                        <ul className="list-none space-y-4 pl-2">
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span>Complete the SISMUN 2026 Google Registration Form with: name, school, grade, committee preferences, and other relevant details.</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span>Form Link: <a href="https://forms.gle/21dAqNYqNcJEZvjp8" className="text-gold hover:underline font-bold" target="_blank" rel="noopener noreferrer">https://forms.gle/21dAqNYqNcJEZvjp8</a></span>
                                            </li>
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span>Registration Fee: Rs. 3,000 per delegate</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span>Includes: conference registration, snack breaks, lunch, and high tea on both days.</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <span className="text-gold font-mono">—</span>
                                                <span className="text-white/60">Deadline: 15th May 2026</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="reg-text pt-6">
                                        <p className="text-sm opacity-60">
                                            After payment, email receipt to: <a href="mailto:rep.mun@sisindia.edu.in" className="text-gold hover:underline font-bold">rep.mun@sisindia.edu.in</a><br/>
                                            Study guides and committee/country allocations released ONLY after full payment is received.
                                        </p>
                                    </div>

                                    <div className="reg-text">
                                        <h3 className="text-xl font-display font-bold text-white mb-4 mt-10">Payment Details</h3>
                                        <ul className="list-none space-y-1 font-mono text-sm border-l border-white/10 pl-6 py-4">
                                            <li>- Account Name: Singapore International School</li>
                                            <li>- Account Number: 59202022786000</li>
                                            <li>- Bank: HDFC Bank, Mira Road Branch</li>
                                            <li>- IFSC Code: HDFC0006199</li>
                                            <li>- Account Type: Current</li>
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
