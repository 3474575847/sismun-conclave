'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useLenis } from './SmoothScroll';

const navItems = [
    {
        label: 'Welcome',
        sections: [
            { name: 'Hero', id: 'hero-section' },
            { name: 'Theme', id: 'theme-section' },
        ],
    },
    {
        label: 'People',
        sections: [
            { name: 'Secretariat', id: 'secretariat-section' },
            { name: 'Message', id: 'secretariat-note' },
            { name: 'Principal', id: 'principal-section' },
            { name: 'Curator', id: 'curator-section' },
            { name: 'Directors', id: 'directors-section' },
        ],
    },
    {
        label: 'Conference',
        sections: [
            { name: 'Committees', id: 'committees-section' },
            { name: 'Awards', id: 'awards-section' },
            { name: 'Gallery', id: 'gallery-section' },
        ],
    },
    {
        label: 'Info',
        sections: [
            { name: 'Rules', id: 'participation-rules-section' },
            { name: 'Training', id: 'training-section' },
            { name: 'Schedule', id: 'schedule-section' },
            { name: 'Accommodation', id: 'accommodation-section' },
        ],
    },
    {
        label: 'Registration',
        sections: [
            { name: 'Register Now', id: 'registration-section' },
        ],
    },
];

export default function Navbar() {
    const lenis = useLenis();
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        if (lenis) {
            lenis.scrollTo(`#${id}`, { offset: -80 });
        } else {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
        setHoveredItem(null);
    };

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${isScrolled
                ? 'py-4 bg-charcoal/80 backdrop-blur-md border-b border-gold/10 shadow-lg'
                : 'py-8 bg-gradient-to-b from-black/20 to-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
                {/* Logo */}
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => scrollToSection('hero-section')}
                >
                    <div className="relative w-10 h-10 md:w-12 md:h-12 overflow-hidden rounded-lg">
                        <Image
                            src="/SIS mun 1.png"
                            alt="SISMUN Logo"
                            fill
                            sizes="(max-width: 768px) 40px, 48px"
                            className="object-contain transition-transform duration-500 group-hover:scale-110"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl md:text-2xl font-display font-bold tracking-tighter transition-colors duration-300 leading-none">
                            <span className="text-school-red">SIS</span>
                            <span className={`transition-colors duration-300 group-hover:text-gold ${isScrolled ? 'text-platinum' : 'text-platinum'}`}>MUN</span>
                        </span>
                        <span className="text-[8px] font-mono text-gold/60 uppercase tracking-[0.2em] mt-1 group-hover:text-gold transition-colors">Conclave 2026</span>
                    </div>
                </div>

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-10">
                    {navItems.map((item) => (
                        <div
                            key={item.label}
                            className="relative"
                            onMouseEnter={() => setHoveredItem(item.label)}
                            onMouseLeave={() => setHoveredItem(null)}
                        >
                            <button className={`font-mono text-[10px] uppercase tracking-[0.3em] transition-colors duration-300 ${hoveredItem === item.label ? 'text-gold' : 'text-platinum/60 hover:text-platinum'
                                }`}>
                                {item.label}
                            </button>

                            <AnimatePresence>
                                {hoveredItem === item.label && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: 'easeOut' }}
                                        className="absolute top-full left-1/2 -translate-x-1/2 pt-6 w-48"
                                    >
                                        <div className="bg-charcoal/95 backdrop-blur-xl border border-gold/20 rounded-xl overflow-hidden shadow-2xl">
                                            {item.sections.map((section) => (
                                                <button
                                                    key={section.id}
                                                    onClick={() => scrollToSection(section.id)}
                                                    className="w-full text-left px-6 py-3 font-mono text-[9px] uppercase tracking-widest text-platinum/70 hover:text-gold hover:bg-gold/5 transition-all duration-300 border-b border-gold/5 last:border-none"
                                                >
                                                    {section.name}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* Mobile Burger - Simplified for now */}
                <div className="md:hidden flex items-center">
                    <button className="text-gold">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Top accent line */}
            <div className={`absolute top-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-gold/50 to-transparent transition-all duration-1000 ${isScrolled ? 'w-full opacity-100' : 'w-0 opacity-0'}`} />
        </nav>
    );
}
