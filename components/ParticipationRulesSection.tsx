'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ParticipationRulesSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Using fromTo to ensure opacity strictly ends at 1
            gsap.fromTo('.rule-entry',
                { y: 30, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 95%',
                    },
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'power3.out',
                    clearProps: 'all'
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="participation-rules-section"
            className="relative bg-white py-24 px-8 z-20 overflow-hidden"
        >
            <div className="max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="mb-20">
                    <div className="flex items-center gap-4 mb-6 text-school-red font-mono text-[10px] tracking-[0.4em] uppercase">
                        <span className="w-2 h-2 bg-school-red rounded-full" />
                        Protocol RULES FOR PARTICIPATION
                    </div>
                    <h2 className="text-6xl md:text-8xl font-display font-bold text-charcoal uppercase tracking-tighter">
                        RULES FOR PARTICIPATION
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-charcoal">
                    {/* Delegation Size - VERBATIM */}
                    <div className="rule-entry p-8 bg-platinum border border-charcoal/5 rounded-3xl hover:bg-white hover:shadow-2xl transition-all duration-500">
                        <h4 className="text-xl font-display font-bold mb-3 uppercase">Delegation Size</h4>
                        <p className="text-sm font-normal leading-relaxed">
                            The teams should comprise of preferably 7-21 students per school (Grades 6-12).
                        </p>
                    </div>

                    {/* Chaperones - VERBATIM */}
                    <div className="rule-entry p-8 bg-platinum border border-charcoal/5 rounded-3xl hover:bg-white hover:shadow-2xl transition-all duration-500">
                        <h4 className="text-xl font-display font-bold mb-3 uppercase">Chaperones</h4>
                        <p className="text-sm font-normal leading-relaxed">
                            A minimum of one teacher must accompany students on both days.
                        </p>
                    </div>

                    {/* Rules of Procedure - VERBATIM */}
                    <div className="rule-entry p-8 bg-platinum border border-charcoal/5 rounded-3xl hover:bg-white hover:shadow-2xl transition-all duration-500">
                        <h4 className="text-xl font-display font-bold mb-3 uppercase">Rules of Procedure</h4>
                        <p className="text-sm font-normal leading-relaxed">
                            SISMUN Conclave 2026 will follow the latest THIMUN Rules of Procedure
                        </p>
                    </div>

                    {/* Diplomatic Conduct & Punctuality - VERBATIM */}
                    <div className="rule-entry p-8 bg-platinum border border-charcoal/5 rounded-3xl hover:bg-white transition-all duration-500">
                        <h4 className="text-xl font-display font-bold mb-3 uppercase">Diplomatic Conduct</h4>
                        <p className="text-sm font-normal leading-relaxed">
                            Delegates must uphold diplomatic standards and be punctual for all committee sessions.
                        </p>
                    </div>

                    {/* Dress Code Focus Card - VERBATIM */}
                    <div className="rule-entry lg:col-span-2 p-10 bg-charcoal text-white rounded-3xl shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-school-red/10 rounded-full blur-[100px] group-hover:bg-school-red/20 transition-all duration-700" />

                        <div className="relative z-10">
                            <h4 className="text-3xl font-display font-bold text-gold mb-4 uppercase tracking-tight">Dress Code</h4>
                            <p className="text-white text-sm font-normal leading-relaxed mb-8 max-w-2xl">
                                All delegates are required to wear formal Western business attire reflecting the professionalism of United Nations diplomats.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-white/10 pt-8">
                                <div>
                                    <h5 className="font-mono text-[10px] text-school-red uppercase tracking-widest mb-3">Mandatory:</h5>
                                    <ul className="space-y-2 text-[11px] font-normal text-white/80">
                                        <li className="flex items-center gap-2"><span className="w-1 h-1 bg-school-red rounded-full" /> Formal trousers/pants</li>
                                        <li className="flex items-center gap-2"><span className="w-1 h-1 bg-school-red rounded-full" /> Formal shirts/blouses</li>
                                        <li className="flex items-center gap-2"><span className="w-1 h-1 bg-school-red rounded-full" /> Blazers/suits</li>
                                        <li className="flex items-center gap-2"><span className="w-1 h-1 bg-school-red rounded-full" /> Formal shoes</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-3">Prohibited:</h5>
                                    <ul className="space-y-2 text-[11px] font-normal text-white/60">
                                        <li className="flex items-center gap-2"><span className="w-1 h-1 bg-gray-700 rounded-full" /> Skirts/mini-skirts</li>
                                        <li className="flex items-center gap-2"><span className="w-1 h-1 bg-gray-700 rounded-full" /> National/Cultural dress</li>
                                        <li className="flex items-center gap-2"><span className="w-1 h-1 bg-gray-700 rounded-full" /> Military/Costumes</li>
                                        <li className="flex items-center gap-2"><span className="w-1 h-1 bg-gray-700 rounded-full" /> Political accessories</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attendance - VERBATIM */}
                    <div className="rule-entry lg:col-span-2 p-10 bg-platinum border border-charcoal/5 rounded-3xl hover:bg-white transition-all duration-500">
                        <h4 className="text-2xl font-display font-bold mb-4 uppercase">Attendance</h4>
                        <p className="font-normal text-sm leading-relaxed">
                            Attendance on both conference days is mandatory. In case of absence, the school chaperone must inform the SISMUN Conclave 2026 MUN Director before the start of the day. Delegates absent on either day will not be eligible for certificates or awards.
                        </p>
                    </div>

                    {/* Use of Devices - VERBATIM */}
                    <div className="rule-entry lg:col-span-2 p-10 bg-platinum border border-charcoal/5 rounded-3xl hover:bg-white transition-all duration-500">
                        <h4 className="text-2xl font-display font-bold mb-4 uppercase">Use of Devices</h4>
                        <p className="font-normal text-sm leading-relaxed">
                            Laptops and mobile phones are permitted only at the discretion of the Committee President and Deputy President. Delegates must comply with usage instructions; misuse may result in restriction of devices for the remainder of the session.
                        </p>
                    </div>

                    {/* Meals - VERBATIM */}
                    <div className="rule-entry p-8 bg-platinum border border-charcoal/5 rounded-3xl hover:bg-white transition-all duration-500">
                        <h4 className="text-xl font-display font-bold mb-3 uppercase">Meals</h4>
                        <p className="font-normal text-sm leading-relaxed">
                            Externally brought food is prohibited. All meals provided by host school.
                        </p>
                    </div>

                    {/* Language - VERBATIM */}
                    <div className="rule-entry p-8 bg-platinum border border-charcoal/5 rounded-3xl hover:bg-white transition-all duration-500">
                        <h4 className="text-xl font-display font-bold mb-3 uppercase">Language</h4>
                        <p className="font-normal text-sm leading-relaxed">
                            English is the formal medium of communication.
                        </p>
                    </div>

                    {/* AI Policy Focus Card - VERBATIM */}
                    <div className="rule-entry lg:col-span-4 p-12 bg-platinum border border-charcoal/10 rounded-3xl shadow-lg">
                        <div className="flex flex-col lg:flex-row gap-12">
                            <div className="lg:w-1/3">
                                <h3 className="text-school-red font-mono text-[10px] tracking-widest uppercase mb-8">Academic Integrity</h3>
                                <h4 className="text-4xl font-display font-bold mb-6 uppercase tracking-tight">AI Usage Policy</h4>
                                <p className="text-charcoal/60 font-medium text-sm leading-relaxed italic">
                                    "SISMUN Conclave rewards originality, diplomacy, and independent thought."
                                </p>
                            </div>
                            <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="bg-white p-6 rounded-2xl border border-charcoal/5 shadow-sm">
                                    <h5 className="font-mono text-[10px] text-green-600 uppercase tracking-widest mb-3">Pre-Conference</h5>
                                    <p className="text-xs font-normal leading-relaxed">
                                        Delegates may use AI tools before the conference for background understanding, concept clarification, and research direction. AI must function only as a learning aid and not as a substitute for independent analysis.
                                    </p>
                                </div>
                                <div className="bg-school-red/5 p-6 rounded-2xl border border-school-red/10 shadow-sm">
                                    <h5 className="font-mono text-[10px] text-school-red uppercase tracking-widest mb-3">Live Sessions</h5>
                                    <p className="text-xs font-normal leading-relaxed">
                                        The use of AI tools during live committee sessions is strictly prohibited, including generating speeches, drafting resolutions or amendments, or producing real-time responses.
                                    </p>
                                </div>
                                <div className="sm:col-span-2 bg-charcoal text-platinum/90 p-6 rounded-2xl">
                                    <h5 className="font-mono text-[10px] text-gold uppercase tracking-widest mb-3">Usage Guidelines</h5>
                                    <p className="text-xs leading-relaxed font-normal">
                                        Electronic devices may be used for ethical research purposes only. Any delegate found using AI-generated content during committee proceedings will be disqualified from award consideration.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sustainability Policy - VERBATIM */}
                    <div className="rule-entry lg:col-span-4 p-12 bg-green-50 border border-green-200 rounded-3xl relative overflow-hidden group">
                        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-green-600/5 rounded-full blur-[100px]" />
                        <h4 className="text-3xl font-display font-bold mb-6 uppercase tracking-tight">Sustainability Policy</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                            <p className="font-normal text-sm leading-relaxed">
                                Printing facilities will not be provided during the conference. Participants are not permitted to take printouts on campus.
                            </p>
                            <p className="font-normal text-sm leading-relaxed italic border-l-2 border-green-600/30 pl-6">
                                Delegates who prefer printed study materials must bring them from home. We encourage sustainable practices while maintaining preparedness.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
