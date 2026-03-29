'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ParticipationRulesSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.rule-text',
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
            id="participation-rules-section"
            className="relative bg-white text-charcoal py-24 px-8 z-20 overflow-hidden"
        >
            <div className="max-w-4xl mx-auto w-full">
                <div className="mb-16 rule-text">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal leading-tight mb-4">
                        Rules of Participation
                    </h2>
                    <div className="h-1.5 w-24 bg-school-red" />
                </div>

                <div className="space-y-12 text-charcoal/80 font-light text-lg leading-relaxed">
                    <div className="rule-text">
                        <h3 className="text-xl font-display font-bold text-charcoal uppercase mb-2">Delegation Size</h3>
                        <p>The teams should preferably comprise 7-21 students per school (Grades 6-12).</p>
                    </div>

                    <div className="rule-text">
                        <h3 className="text-xl font-display font-bold text-charcoal uppercase mb-2">Chaperones</h3>
                        <p>A minimum of one teacher must accompany students on both days.</p>
                    </div>

                    <div className="rule-text">
                        <h3 className="text-xl font-display font-bold text-charcoal uppercase mb-2">Dress Code</h3>
                        <p className="mb-4">All delegates are required to wear formal Western business attire with appropriate footwear, reflecting the professionalism of United Nations diplomats.</p>
                        
                        <p className="font-medium text-charcoal mt-4 mb-2">Mandatory Attire:</p>
                        <ul className="list-disc pl-6 space-y-1 mb-4">
                            <li>Formal trousers/pants (compulsory for all delegates)</li>
                            <li>Formal shirts/blouses</li>
                            <li>Blazers/suits (strongly recommended)</li>
                            <li>Formal shoes</li>
                        </ul>

                        <p className="font-medium text-charcoal mt-4 mb-2">Not Permitted:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Skirts or mini-skirts</li>
                            <li>Denim of any kind (including jeans)</li>
                            <li>Shorts or Casual Trousers</li>
                            <li>T-shirts or Casual Tops</li>
                            <li>Sneakers, Sports Shoes, Slippers, Sandals or Casual Footwear</li>
                            <li>National dress or cultural attire</li>
                            <li>Military uniforms or costume-style clothing</li>
                            <li>Armbands or politically symbolic accessories</li>
                        </ul>
                        <p className="mt-4 italic text-sm">The dress code will be strictly enforced to maintain professionalism, uniformity, and respect within the conference environment.</p>
                    </div>

                    <div className="rule-text">
                        <h3 className="text-xl font-display font-bold text-charcoal uppercase mb-2">Rules of Procedure</h3>
                        <p>SISMUN 2026 will follow the latest THIMUN Rules of Procedure.</p>
                    </div>

                    <div className="rule-text">
                        <h3 className="text-xl font-display font-bold text-charcoal uppercase mb-2">Attendance</h3>
                        <p>Attendance on both conference days is mandatory. In case of absence, the school chaperone must inform the SISMUN 2026 Director before the start of the day. Delegates absent on either day will not be eligible for certificates or awards.</p>
                    </div>

                    <div className="rule-text">
                        <h3 className="text-xl font-display font-bold text-charcoal uppercase mb-2">Diplomatic Conduct & Punctuality</h3>
                        <p>Delegates must uphold diplomatic standards and be punctual for all committee sessions.</p>
                    </div>

                    <div className="rule-text">
                        <h3 className="text-xl font-display font-bold text-charcoal uppercase mb-2">Meals</h3>
                        <p>Externally brought food and beverages are prohibited. All meals will be provided by the host school.</p>
                    </div>

                    <div className="rule-text">
                        <h3 className="text-xl font-display font-bold text-charcoal uppercase mb-2">Language</h3>
                        <p>English is the formal medium of communication.</p>
                    </div>

                    <div className="rule-text">
                        <h3 className="text-xl font-display font-bold text-charcoal uppercase mb-2">Use of Devices</h3>
                        <p>The use of laptops and mobile phones is permitted during committee sessions only at the discretion of the Committee President and Deputy President. Delegates must comply with all instructions regarding device usage, and misuse may result in restriction of devices for the remainder of the session.</p>
                    </div>

                    <div className="rule-text">
                        <h3 className="text-xl font-display font-bold text-charcoal uppercase mb-2">AI Usage Policy</h3>
                        <p className="mb-4">Delegates may use AI tools before the conference for background understanding, concept clarification and research direction. AI must function only as a learning aid and not as a substitute for independent research or analysis.</p>
                        <p>The use of AI tools during live committee sessions is strictly prohibited, including generating speeches, drafting resolutions or amendments, or producing real-time responses.</p>
                    </div>

                    <div className="rule-text">
                        <h3 className="text-xl font-display font-bold text-charcoal uppercase mb-2">Sustainability Policy</h3>
                        <p>SISMUN 2026 is a green conference. We will avoid printing as far as possible. Participants are strongly discouraged from bringing single-use plastic bottles. We recommend bringing your own reusable bottles.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
