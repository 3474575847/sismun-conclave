'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

type RegistrationType = 'school' | 'independent';

interface RegistrationStep {
    number: string;
    title: string;
    subtitle: string;
    content: string;
    deadline: string;
    link?: string;
    fee?: string;
    feeSub?: string;
    chaperone?: string;
}

export default function RegistrationSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const [regType, setRegType] = useState<RegistrationType>('school');

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.reg-header', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                y: 30,
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            });

            gsap.from('.payment-card', {
                scrollTrigger: {
                    trigger: '.payment-card',
                    start: 'top 90%',
                    toggleActions: 'play none none none'
                },
                scale: 0.95,
                opacity: 0,
                duration: 1.2,
                ease: 'expo.out'
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const schoolSteps: RegistrationStep[] = [
        {
            number: '01',
            title: 'Expression of Interest',
            subtitle: 'Submit Intent to Participate',
            content: 'Schools are required to indicate their intention to participate by completing the SISMUN Conclave 2026 Google Registration Form. The form includes details of the school, the School MUN Director, and formal consent.',
            link: 'https://forms.gle/8rZRG7U7MtCnjho47',
            deadline: '15th April 2026'
        },
        {
            number: '02',
            title: 'Submission of Delegate Details',
            subtitle: 'Delegate & Chaperone Info',
            content: 'Upon receiving the Expression of Interest, the SISMUN Secretariat will share an Excel form via email. This form will require information about the participating delegates and the teacher chaperones for both days.',
            deadline: '25th April 2026'
        },
        {
            number: '03',
            title: 'Fee Submission',
            subtitle: 'Complete Payment Process',
            content: 'After submitting delegate details, schools are required to complete the registration payment. Includes registration, snack breaks, lunch, and high tea on both conference days.',
            fee: '₹3,000',
            feeSub: '/ student',
            chaperone: 'Chaperones: No registration fee',
            deadline: '30th April 2026'
        }
    ];

    const independentSteps: RegistrationStep[] = [
        {
            number: '01',
            title: 'Google Form Submission',
            subtitle: 'Personal & Committee Details',
            content: 'Independent delegates are required to complete the SISMUN Conclave 2026 Google Registration Form by providing their name, school, grade, committee preferences, and other relevant details.',
            link: 'https://forms.gle/21dAqNYqNcJEZvjp8',
            deadline: '30 April 2026'
        },
        {
            number: '02',
            title: 'Verification & Release',
            subtitle: 'Payment & Confirmation',
            content: 'Delegates must complete the registration payment at the time of submission and email the payment receipt to rep.mun@sisindia.edu.in for verification and confirmation.',
            fee: '₹3,000',
            feeSub: '/ delegate',
            deadline: '30 April 2026'
        },
        {
            number: '03',
            title: 'Allocation Release',
            subtitle: 'Study Guides & Countries',
            content: 'Upon successful completion of the payment process and verification, registered delegates will receive the study guides along with their committee and country allocations.',
            deadline: 'Post Payment'
        }
    ];

    return (
        <section
            ref={sectionRef}
            id="registration-section"
            className="relative bg-charcoal py-32 px-8 z-20 text-white overflow-hidden"
        >
            <div className="max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="reg-header mb-16">
                    <div className="flex items-center gap-4 mb-6 text-gold font-mono text-[10px] tracking-[0.4em] uppercase">
                        <span className="w-2 h-2 bg-gold rounded-full" />
                        Admission REGISTRATION.2026
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-12">
                        <h2 className="text-5xl md:text-7xl font-display font-bold text-gold tracking-tighter uppercase">
                            Join SISMUN Conclave
                        </h2>

                        {/* Type Toggle */}
                        <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
                            <button
                                onClick={() => setRegType('school')}
                                className={`px-6 py-2 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all duration-300 ${regType === 'school' ? 'bg-gold text-charcoal font-bold' : 'text-platinum/40 hover:text-platinum'}`}
                            >
                                School Delegations
                            </button>
                            <button
                                onClick={() => setRegType('independent')}
                                className={`px-6 py-2 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all duration-300 ${regType === 'independent' ? 'bg-gold text-charcoal font-bold' : 'text-platinum/40 hover:text-platinum'}`}
                            >
                                Independent Delegates
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Steps Container */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={regType}
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                                className="grid grid-cols-1 gap-6"
                            >
                                {(regType === 'school' ? schoolSteps : independentSteps).map((step, idx) => (
                                    <div
                                        key={idx}
                                        className="group bg-white/[0.03] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.05] hover:border-gold/30 transition-all duration-500 relative overflow-hidden flex flex-col md:flex-row gap-8 items-start"
                                    >
                                        <div className="text-6xl font-display font-bold text-white/5 group-hover:text-gold/10 transition-colors duration-500 shrink-0">
                                            {step.number}
                                        </div>

                                        <div className="flex-grow">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-gold font-mono text-[10px] tracking-widest uppercase">{step.title}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-[9px] uppercase tracking-widest text-platinum/30">Deadline</span>
                                                    <span className="font-mono text-[11px] font-bold text-gold uppercase">{step.deadline}</span>
                                                </div>
                                            </div>
                                            <h4 className="text-2xl font-display font-bold text-platinum mb-4 uppercase tracking-tight">{step.subtitle}</h4>
                                            <p className="text-white/70 font-light leading-relaxed mb-6 text-sm md:text-base">
                                                {step.content}
                                            </p>

                                            {step.fee && (
                                                <div className="mb-6 flex items-baseline gap-2 bg-white/5 w-fit px-4 py-2 rounded-xl border border-white/5">
                                                    <span className="text-3xl font-display font-bold text-platinum">{step.fee}</span>
                                                    <span className="text-[10px] font-mono text-platinum/40 uppercase tracking-widest">{step.feeSub}</span>
                                                    {step.chaperone && <span className="ml-4 text-[10px] font-mono text-gold/60 italic border-l border-white/10 pl-4">{step.chaperone}</span>}
                                                </div>
                                            )}

                                            {step.link && (
                                                <a
                                                    href={step.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-3 bg-gold text-charcoal px-6 py-3 rounded-xl font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-platinum transition-colors duration-300 group/btn"
                                                >
                                                    Access Registration Form
                                                    <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Sidebar: Payment & Rules */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Payment Details */}
                        <div className="payment-card bg-platinum text-charcoal rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl group-hover:bg-gold/20 transition-colors duration-500" />
                            <h3 className="text-xl font-display font-bold text-gold mb-6 border-b border-charcoal/10 pb-4 uppercase tracking-tighter">Payment Details</h3>
                            <div className="space-y-4 font-mono text-[10px] uppercase tracking-wider">
                                <div className="flex justify-between border-b border-charcoal/5 pb-2">
                                    <span className="text-charcoal/50">Account</span>
                                    <span className="font-bold">Singapore Int. School</span>
                                </div>
                                <div className="flex justify-between border-b border-charcoal/5 pb-2">
                                    <span className="text-charcoal/50">A/C No.</span>
                                    <span className="font-bold">59202022786000</span>
                                </div>
                                <div className="flex justify-between border-b border-charcoal/5 pb-2">
                                    <span className="text-charcoal/50">IFSC</span>
                                    <span className="font-bold">HDFC0006199</span>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-charcoal/10">
                                <p className="text-[10px] leading-relaxed text-charcoal/60 font-medium italic">
                                    "registered schools/delegates will receive study guides and allocations only after full payment verification."
                                </p>
                            </div>
                        </div>

                        {/* Quick Rules */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                            <h3 className="text-gold font-mono text-[10px] tracking-[0.3em] uppercase mb-6">Quick Guidelines</h3>
                            <ul className="space-y-4 text-xs font-light text-platinum/70">
                                <li className="flex items-start gap-3">
                                    <span className="text-gold">✦</span>
                                    <span>Emails specifically for verification: <strong className="text-platinum">rep.mun@sisindia.edu.in</strong></span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-gold">✦</span>
                                    <span>Preferably <strong className="text-platinum">7-21 students</strong> per school.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-gold">✦</span>
                                    <span>Allocations & Guides released post-payment confirmation.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-gold">✦</span>
                                    <span>Mandatory attendance on both days for award eligibility.</span>
                                </li>
                            </ul>
                            <a
                                href="#participation-rules-section"
                                className="mt-8 block text-center py-3 border border-white/10 rounded-xl font-mono text-[9px] uppercase tracking-[0.2em] hover:bg-white/5 transition-colors"
                            >
                                View Detailed Rules
                            </a>

                            {/* Special Note */}
                            <div className="mt-8 p-6 bg-gold/5 border border-gold/10 rounded-2xl">
                                <h4 className="text-gold font-mono text-[9px] uppercase tracking-[0.3em] mb-4">Special Note</h4>
                                <p className="text-[11px] leading-relaxed text-platinum/60 font-light italic">
                                    Schools whose academic session begins after the first week of August (i.e., after the conference dates) may nominate independent delegates to participate. Refer to <strong className="text-gold">Page 18</strong> of the Information Docket for guidelines.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="w-full h-full bg-[radial-gradient(#FFD700_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>
        </section>
    );
}
