'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function FooterSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const logoPathRef = useRef<SVGPathElement>(null);

    useEffect(() => {
        if (sectionRef.current && logoPathRef.current) {
            // Animate the clip path to reveal the logo
            gsap.fromTo(
                logoPathRef.current,
                {
                    attr: { d: 'M 250 250 m -0, 0 a 0,0 0 1,0 0,0 a 0,0 0 1,0 -0,0' },
                },
                {
                    attr: { d: 'M 250 250 m -200, 0 a 200,200 0 1,0 400,0 a 200,200 0 1,0 -400,0' },
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top bottom',
                        end: 'center center',
                        scrub: 1,
                    },
                }
            );

            // Parallax effect for background elements
            gsap.to('.parallax-slow', {
                y: -50,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                },
            });

            gsap.to('.parallax-fast', {
                y: -100,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                },
            });
        }
    }, []);

    return (
        <footer
            ref={sectionRef}
            className="relative bg-gradient-to-b from-charcoal via-charcoal/95 to-charcoal/90 overflow-hidden py-12 lg:py-16"
        >
            {/* Parallax background elements */}
            <div className="parallax-slow absolute top-20 left-20 w-40 h-40 border border-gold/10 rounded-full" />
            <div className="parallax-fast absolute bottom-20 right-20 w-40 h-40 border border-gold/10 rounded-full" />
            <div className="parallax-slow absolute top-1/2 right-20 w-32 h-32 border border-gold/10 rounded-full" />

            {/* Main content */}
            <div className="relative z-10 max-w-7xl mx-auto px-8">

                {/* Branding Circle SVG */}
                <div className="mb-4 flex justify-center">
                    <svg
                        viewBox="0 50 500 400"
                        className="w-full max-w-[280px] opacity-90"
                    >
                        <defs>
                            <clipPath id="reveal-clip">
                                <path ref={logoPathRef} />
                            </clipPath>
                        </defs>

                        {/* Logo circle */}
                        <circle
                            cx="250"
                            cy="250"
                            r="220"
                            fill="none"
                            stroke="#FFCC00" /* Gold */
                            strokeWidth="1.5"
                            clipPath="url(#reveal-clip)"
                        />

                        {/* SIS text */}
                        <text
                            x="250"
                            y="225"
                            textAnchor="middle"
                            fill="#FFCC00" /* Gold */
                            fontSize="80"
                            className="font-display font-bold"
                            style={{ letterSpacing: '0.15em' }}
                            clipPath="url(#reveal-clip)"
                        >
                            SIS
                        </text>

                        {/* MUN text */}
                        <text
                            x="250"
                            y="310"
                            textAnchor="middle"
                            fill="#F0F4F8" /* Platinum/White */
                            fontSize="64"
                            className="font-display font-light"
                            style={{ letterSpacing: '0.3em' }}
                            clipPath="url(#reveal-clip)"
                        >
                            MUN
                        </text>
                    </svg>
                </div>

                <div className="text-center mb-8">
                    <div className="flex justify-center items-center gap-4 mb-2 text-gold font-mono text-[10px] tracking-[0.4em] uppercase">
                        <span className="w-2 h-2 bg-gold rounded-full animate-ping" />
                        CARPE DIEM!
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 border-t border-white/10 pt-8">

                    {/* Venue */}
                    <div>
                        <h4 className="text-gold font-mono text-xs uppercase tracking-[0.2em] mb-8">Venue Address</h4>
                        <p className="text-platinum/80 font-light text-lg leading-relaxed">
                            <span className="text-white font-medium block mb-2">Singapore International School, Mumbai</span>
                            On National Highway No-8, Post, near Dahisar Toll Plaza, <br />
                            next to Aaradhya Highpark, Mahajan Wadi, <br />
                            Dahisar East, Mumbai, Maharashtra 401104
                        </p>
                    </div>

                    {/* Directors */}
                    <div>
                        <h4 className="text-gold font-mono text-xs uppercase tracking-[0.2em] mb-8">SIS MUN Directors</h4>
                        <div className="space-y-8">
                            <div className="group">
                                <p className="text-platinum font-display text-2xl mb-1 group-hover:text-gold transition-colors">CA Pushpendra Bansal</p>
                                <a href="tel:+919828727678" className="text-platinum/40 font-mono text-sm hover:text-white transition-colors">+91 98287 27678</a>
                            </div>
                            <div className="group">
                                <p className="text-platinum font-display text-2xl mb-1 group-hover:text-gold transition-colors">Abhilasha Singh</p>
                                <a href="tel:+919754789839" className="text-platinum/40 font-mono text-sm hover:text-white transition-colors">+91 97547 89839</a>
                            </div>
                            <div className="pt-4">
                                <p className="text-[10px] font-mono text-platinum/30 uppercase mb-2">Directorate Email</p>
                                <a href="mailto:rep.mun@sisindia.edu.in" className="text-platinum font-display text-xl border-b border-gold/30 pb-1 hover:border-gold transition-all">
                                    rep.mun@sisindia.edu.in
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Secretariat */}
                    <div>
                        <h4 className="text-gold font-mono text-xs uppercase tracking-[0.2em] mb-8">Secretariat</h4>
                        <div className="space-y-8">
                            <div className="group">
                                <p className="text-platinum font-display text-xl mb-1 group-hover:text-gold transition-colors">Zorawar Bhinder</p>
                                <div className="space-y-1">
                                    <a href="tel:+919619718508" className="block text-platinum/40 text-xs font-mono hover:text-white transition-colors">+91 96197 18508</a>
                                    <a href="mailto:zorawarbhinder7@gmail.com" className="block text-platinum/20 text-[10px] font-mono italic">zorawarbhinder7@gmail.com</a>
                                </div>
                            </div>
                            <div className="group">
                                <p className="text-platinum font-display text-xl mb-1 group-hover:text-gold transition-colors">Chahel Dharod</p>
                                <div className="space-y-1">
                                    <a href="tel:+918432306060" className="block text-platinum/40 text-xs font-mono hover:text-white transition-colors">+91 84323 06060</a>
                                    <a href="mailto:chaheldharod@gmail.com" className="block text-platinum/20 text-[10px] font-mono italic">chaheldharod@gmail.com</a>
                                </div>
                            </div>
                            <div className="group border-t border-white/5 pt-4">
                                <p className="text-platinum font-display text-xl mb-1 group-hover:text-gold transition-colors">Ritvayg Bindal</p>
                                <div className="space-y-1">
                                    <a href="tel:+918655850355" className="block text-platinum/40 text-xs font-mono hover:text-white transition-colors">+91 86558 50355</a>
                                    <a href="mailto:ritvayg@gmail.com" className="block text-platinum/20 text-[10px] font-mono italic">ritvayg@gmail.com</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social links & Copyright */}
                <div className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex gap-12">
                        {['Instagram', 'Twitter', 'LinkedIn'].map((social) => (
                            <a
                                key={social}
                                href="#"
                                className="text-platinum/40 hover:text-gold transition-colors duration-300 text-sm font-display tracking-widest uppercase"
                            >
                                {social}
                            </a>
                        ))}
                    </div>

                    <p className="text-platinum/20 text-[10px] font-mono uppercase tracking-[0.4em]">
                        © 2026 SISMUN CONCLAVE DIPLOMACY REDEFINED
                    </p>
                </div>
            </div>

            {/* Decorative background grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div
                    className="w-full h-full"
                    style={{
                        backgroundImage: `linear-gradient(#FFCC00 1px, transparent 1px), linear-gradient(90deg, #FFCC00 1px, transparent 1px)`,
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>
        </footer>
    );
}
