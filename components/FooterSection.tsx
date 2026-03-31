'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function FooterSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (sectionRef.current) {
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
            id="footer-section"
            className="relative bg-gradient-to-b from-charcoal via-charcoal/95 to-charcoal/90 overflow-hidden py-12 lg:py-16"
        >
            {/* Parallax background elements */}
            <div className="parallax-slow absolute top-20 left-20 w-40 h-40 border border-gold/10 rounded-full" />
            <div className="parallax-fast absolute bottom-20 right-20 w-40 h-40 border border-gold/10 rounded-full" />
            <div className="parallax-slow absolute top-1/2 right-20 w-32 h-32 border border-gold/10 rounded-full" />

            {/* Main content */}
            <div className="relative z-10 max-w-7xl mx-auto px-8">

                {/* Branding Circle Logo */}
                <div className="mb-8 flex justify-center">
                    <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
                        {/* White circle background */}
                        <div className="absolute inset-0 bg-white rounded-full"></div>
                        
                        <div className="relative w-full h-full overflow-hidden rounded-full">
                            <Image
                                src="/WhatsApp_Image_2026-03-26_at_18.10.16-removebg-preview.png"
                                alt="SISMUN Conclave Logo"
                                fill
                                sizes="(max-width: 768px) 192px, 224px"
                                className="object-contain p-4"
                            />
                        </div>
                    </div>
                </div>

                <div className="text-center mb-16">
                    <div className="flex justify-center items-center gap-4 mb-2 text-gold font-mono text-[10px] tracking-[0.4em] uppercase">
                        <span className="w-2 h-2 bg-gold rounded-full animate-ping" />
                        CARPE DIEM!
                    </div>
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-white uppercase tracking-tighter">
                        Contact Details
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 border-t border-white/10 pt-8">

                    {/* Venue */}
                    <div>
                        <h4 className="text-gold font-mono text-xs uppercase tracking-[0.2em] mb-8">Venue Address</h4>
                        <p className="text-platinum/80 font-light text-lg leading-relaxed">
                            <span className="text-white font-medium block mb-2">Singapore International School, Mumbai</span>
                        </p>
                    </div>

                    {/* Directors */}
                    <div>
                        <h4 className="text-gold font-mono text-xs uppercase tracking-[0.2em] mb-8">SISMUN Director</h4>
                        <div className="space-y-8">
                            <div className="group">
                                <p className="text-platinum font-display text-2xl mb-1 group-hover:text-gold transition-colors">Pushpendra Bansal</p>
                                <a href="tel:+919828727678" className="text-platinum/60 font-mono text-lg md:text-xl hover:text-white transition-colors tracking-tighter">+91 9828727678</a>
                            </div>
                            <div className="pt-4">
                                <a href="mailto:rep.mun@sisindia.edu.in" className="text-platinum font-display text-2xl border-b border-gold/30 pb-1 hover:border-gold transition-all">
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
                                    <h5 className="text-gold text-[10px] uppercase font-mono tracking-widest">Secretary General</h5>
                                    <a href="tel:+919619718508" className="block text-platinum/60 text-lg font-mono hover:text-white transition-colors tracking-tighter">+91 9619718508</a>
                                    <a href="mailto:zorawarbhinder7@gmail.com" className="block text-platinum/40 text-xs font-mono italic">zorawarbhinder7@gmail.com</a>
                                </div>
                            </div>
                            <div className="group">
                                <p className="text-platinum font-display text-xl mb-1 group-hover:text-gold transition-colors">Chahel Dharod</p>
                                <div className="space-y-1">
                                    <h5 className="text-gold text-[10px] uppercase font-mono tracking-widest">Deputy Secretary General</h5>
                                    <a href="tel:+918432306060" className="block text-platinum/60 text-lg font-mono hover:text-white transition-colors tracking-tighter">+91 8432306060</a>
                                    <a href="mailto:chaheldharod@gmail.com" className="block text-platinum/40 text-xs font-mono italic">chaheldharod@gmail.com</a>
                                </div>
                            </div>
                            <div className="group border-t border-white/5 pt-4">
                                <p className="text-platinum font-display text-xl mb-1 group-hover:text-gold transition-colors">Ritvayg Bindal</p>
                                <div className="space-y-1">
                                    <h5 className="text-gold text-[10px] uppercase font-mono tracking-widest">Deputy Secretary General</h5>
                                    <a href="tel:+918655850355" className="block text-platinum/60 text-lg font-mono hover:text-white transition-colors tracking-tighter">+91 8655850355</a>
                                    <a href="mailto:ritvayg@gmail.com" className="block text-platinum/40 text-xs font-mono italic">ritvayg@gmail.com</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social links & Copyright */}
                <div className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex gap-12">
                        <a
                            href="https://www.instagram.com/sismun_2026?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 px-6 py-3 rounded-full border border-platinum/20 hover:border-gold hover:bg-gold/5 transition-all duration-300"
                        >
                            <svg className="w-5 h-5 text-platinum group-hover:text-gold transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                            <span className="text-platinum group-hover:text-gold transition-colors duration-300 text-sm font-display tracking-widest uppercase font-bold">
                                Follow on Instagram
                            </span>
                        </a>
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
