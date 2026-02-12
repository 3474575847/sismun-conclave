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
            className="relative min-h-screen bg-gradient-to-b from-charcoal via-charcoal to-black overflow-hidden flex items-center justify-center"
        >
            {/* Parallax background elements */}
            <div className="parallax-slow absolute top-20 left-20 w-40 h-40 border border-gold/10 rounded-full" />
            <div className="parallax-fast absolute bottom-40 right-40 w-60 h-60 border border-gold/10 rounded-full" />
            <div className="parallax-slow absolute top-1/2 right-20 w-32 h-32 border border-gold/10 rounded-full" />

            {/* Main content */}
            <div className="relative z-10 text-center px-8">
                {/* Logo reveal with clip path */}
                <div className="mb-16">
                    <svg
                        width="500"
                        height="500"
                        viewBox="0 0 500 500"
                        className="mx-auto opacity-80"
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
                            r="200"
                            fill="none"
                            stroke="#FFCC00" /* School Gold */
                            strokeWidth="2"
                            clipPath="url(#reveal-clip)"
                        />

                        {/* SIS text */}
                        <text
                            x="250"
                            y="230"
                            textAnchor="middle"
                            fill="#FFCC00" /* School Gold */
                            fontSize="48"
                            fontWeight="bold"
                            clipPath="url(#reveal-clip)"
                        >
                            SIS
                        </text>

                        {/* MUN text */}
                        <text
                            x="250"
                            y="280"
                            textAnchor="middle"
                            fill="#F0F4F8" /* Platinum/White */
                            fontSize="36"
                            clipPath="url(#reveal-clip)"
                        >
                            MUN
                        </text>
                    </svg>
                </div>

                {/* School name */}
                <h3 className="text-4xl md:text-5xl font-display font-bold text-gradient mb-8">
                    Singapore International School
                </h3>

                {/* Contact info */}
                <div className="flex flex-wrap justify-center gap-8 mb-12 text-platinum/60">
                    <a
                        href="mailto:mun@sis.edu.sg"
                        className="hover:text-gold transition-colors duration-300"
                    >
                        mun@sis.edu.sg
                    </a>
                    <span>•</span>
                    <a
                        href="tel:+6512345678"
                        className="hover:text-gold transition-colors duration-300"
                    >
                        +65 1234 5678
                    </a>
                </div>

                {/* Social links */}
                <div className="flex justify-center gap-6 mb-16">
                    {['Instagram', 'Twitter', 'LinkedIn'].map((social) => (
                        <a
                            key={social}
                            href="#"
                            className="glass-card px-6 py-3 rounded-full hover:border-glow transition-all duration-300 text-sm tracking-wider"
                        >
                            {social}
                        </a>
                    ))}
                </div>

                {/* Divider */}
                <div className="max-w-4xl mx-auto h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mb-8" />

                {/* Copyright */}
                <p className="text-platinum/40 text-sm font-mono">
                    © 2024 SISMUN. Crafted with precision and diplomacy.
                </p>
            </div>

            {/* Decorative grid */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div
                    className="w-full h-full"
                    style={{
                        backgroundImage: `linear-gradient(#FFCC00 1px, transparent 1px), linear-gradient(90deg, #FFCC00 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                    }}
                />
            </div>
        </footer>
    );
}
