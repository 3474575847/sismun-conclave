'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useLenis } from './SmoothScroll';
import { committees } from '@/data/committees';

const navItems = [
    {
        label: 'Home',
        id: 'hero-section',
    },
    {
        label: 'About Us',
        sections: [
            { name: 'Mission & Theme', id: 'theme-section' },
            { name: 'Secretariat', id: 'secretariat-section' },
            { name: 'Directors\' Messages', id: 'principal-section' },
            { name: 'Meet the Team', id: 'student-heads-section' },
        ],
    },
    {
        label: 'Committees',
        sections: [
            { name: 'Overview', id: 'committees-section' },
            ...committees.map(c => ({
                name: c.acronym,
                id: c.slug,
                isExternal: true,
                path: `/committees/${c.slug}`
            }))
        ],
    },
    {
        label: 'Conference',
        sections: [
            { name: 'Schedule', id: 'schedule-section' },
            { name: 'Training Sessions', id: 'training-section' },
            { name: 'Rules of Participation', id: 'participation-rules-section' },
            { name: 'Awards', id: 'awards-section' },
            { name: 'Gallery', id: 'gallery-section' },
            { name: 'Venue & Accommodation', id: 'accommodation-section' },
        ],
    },
    {
        label: 'Contact Us',
        id: 'footer-section',
    },
];

import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
    const lenis = useLenis();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            const threshold = window.innerHeight * 0.1;
            setIsScrolled(window.scrollY > threshold);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        if (!isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setOpenSubMenu(null);
        }
    };

    const handleMobileNavClick = (item: any) => {
        if (item.sections) {
            setOpenSubMenu(openSubMenu === item.label ? null : item.label);
        } else if (item.id) {
            scrollToSection(item.id);
            toggleMenu();
        }
    };

    const handleMobileSubClick = (section: any) => {
        if (section.isExternal) {
            router.push(section.path);
        } else {
            scrollToSection(section.id);
        }
        toggleMenu();
    };

    const scrollToSection = (id: string) => {
        if (pathname !== '/' && !id.startsWith('/')) {
            router.push('/#' + id);
            return;
        }

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
            className={`fixed top-0 left-0 w-full z-[100] transition-all duration-700 bg-[#0A192F]/90 backdrop-blur-xl border-b border-gold/10 shadow-2xl ${isScrolled
                ? 'py-3'
                : 'py-4 md:py-5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
                {/* Logo */}
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => {
                        if (pathname === '/') {
                            scrollToSection('hero-section');
                        } else {
                            router.push('/');
                        }
                    }}
                >
                    <div className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                        {/* White circle background */}
                        <div className="absolute -inset-[6px] bg-white rounded-full translate-y-[1px]" />
                        
                        <div className="relative w-full h-full overflow-hidden rounded-lg">
                            <Image
                                src="/WhatsApp_Image_2026-03-26_at_18.10.16-removebg-preview.png"
                                alt="SISMUN Logo"
                                fill
                                sizes="(max-width: 768px) 40px, 48px"
                                className="object-contain transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl md:text-2xl font-display font-bold tracking-tighter transition-colors duration-300 leading-none text-platinum">
                            <span className="text-school-red">SIS</span>
                            MUN
                        </span>
                        <span className="text-[8px] font-mono text-gold/60 uppercase tracking-[0.2em] mt-1 group-hover:text-gold transition-colors">Conclave 2026</span>
                    </div>
                </div>

                {/* Desktop Nav Links */}
                <div className="hidden lg:flex items-center gap-10">
                    {navItems.map((item) => (
                        <div
                            key={item.label}
                            className="relative group"
                            onMouseEnter={() => setHoveredItem(item.label)}
                            onMouseLeave={() => setHoveredItem(null)}
                        >
                            <button
                                onClick={() => item.id ? scrollToSection(item.id) : null}
                                className={`font-mono text-[10px] uppercase tracking-[0.3em] transition-colors duration-300 ${hoveredItem === item.label ? 'text-gold' : 'text-platinum/60 hover:text-platinum'
                                    }`}
                            >
                                {item.label}
                            </button>

                            {item.sections && (
                                <AnimatePresence>
                                    {hoveredItem === item.label && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2, ease: 'easeOut' }}
                                            className={`absolute top-full left-1/2 -translate-x-1/2 pt-6 ${item.label === 'Committees' ? 'w-80' : 'w-48'}`}
                                        >
                                            <div className={`bg-charcoal/95 backdrop-blur-3xl border border-gold/20 rounded-xl overflow-hidden shadow-2xl ${item.label === 'Committees' ? 'w-80 grid grid-cols-2 p-2 gap-1' : 'w-48 flex flex-col p-1'}`}>
                                                {item.sections.map((section: any) => (
                                                    <button
                                                        key={section.id}
                                                        onClick={() => {
                                                            if (section.isExternal) {
                                                                router.push(section.path);
                                                            } else {
                                                                scrollToSection(section.id);
                                                            }
                                                            setHoveredItem(null);
                                                        }}
                                                        className="w-full text-left px-5 py-3 font-mono text-[9px] uppercase tracking-widest text-platinum/70 hover:text-gold hover:bg-gold/5 transition-all duration-300 rounded-lg"
                                                    >
                                                        {section.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={() => scrollToSection('registration-section')}
                        className="bg-gold px-7 py-2.5 rounded-full font-mono text-[10px] uppercase tracking-widest text-charcoal font-bold hover:bg-gold/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gold/10"
                    >
                        Register
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button 
                    onClick={toggleMenu}
                    className="lg:hidden relative z-[110] w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none bg-white/5 rounded-full border border-white/10"
                >
                    <motion.span 
                        animate={isMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                        className="w-5 h-[1.5px] bg-gold rounded-full block"
                    />
                    <motion.span 
                        animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                        className="w-5 h-[1.5px] bg-gold/70 rounded-full block"
                    />
                    <motion.span 
                        animate={isMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                        className="w-5 h-[1.5px] bg-gold rounded-full block"
                    />
                </button>
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleMenu}
                            className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-[101]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-screen w-[85%] sm:w-[400px] bg-charcoal border-l border-gold/10 z-[105] p-8 pt-24 shadow-2xl flex flex-col overflow-y-auto"
                        >
                            <div className="flex flex-col gap-6">
                                {navItems.map((item) => (
                                    <div key={item.label} className="border-b border-white/5 pb-4">
                                        <button
                                            onClick={() => handleMobileNavClick(item)}
                                            className="w-full flex items-center justify-between font-serif text-2xl text-white uppercase tracking-tighter"
                                        >
                                            {item.label}
                                            {item.sections && (
                                                <motion.svg
                                                    animate={{ rotate: openSubMenu === item.label ? 180 : 0 }}
                                                    className="w-4 h-4 text-gold"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </motion.svg>
                                            )}
                                        </button>
                                        
                                        <AnimatePresence>
                                            {openSubMenu === item.label && item.sections && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden bg-white/5 rounded-xl mt-4 grid grid-cols-1"
                                                >
                                                    {item.sections.map((section: any) => (
                                                        <button
                                                            key={section.id}
                                                            onClick={() => handleMobileSubClick(section)}
                                                            className="w-full text-left px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-platinum/50 hover:text-gold hover:bg-white/5 transition-all border-b border-white/5 last:border-none"
                                                        >
                                                            {section.name}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => {
                                    scrollToSection('registration-section');
                                    toggleMenu();
                                }}
                                className="mt-12 w-full bg-gold py-5 rounded-2xl font-mono text-xs uppercase tracking-[0.2em] text-charcoal font-bold hover:bg-gold/90 transition-all shadow-xl shadow-gold/20"
                            >
                                Register Now
                            </button>

                            <div className="mt-auto pt-10 text-center">
                                <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em]">Singapore International School</p>
                                <p className="text-[10px] font-mono text-gold/40 uppercase tracking-[0.3em] mt-2">SISMUN Conclave 2026</p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Top accent line */}
            <div className={`absolute top-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-gold/50 to-transparent transition-all duration-1000 ${isScrolled ? 'w-full opacity-100' : 'w-0 opacity-0'}`} />
        </nav>
    );
}
