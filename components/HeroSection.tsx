'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Dynamically import HeroScene to avoid SSR issues with Three.js
const HeroScene = dynamic(() => import('./HeroScene'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-white" />,
});

export default function HeroSection() {
    return (
        <section id="hero-section" className="relative h-screen w-full overflow-hidden bg-white">
            <div className="absolute inset-0 z-0">
                <HeroScene />
            </div>
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-charcoal/5 to-charcoal/15 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
                    className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px]"
                >
                    <Image
                        src="/WhatsApp_Image_2026-03-26_at_18.10.16-removebg-preview.png"
                        alt="SISMUN Conclave Logo"
                        fill
                        sizes="(max-width: 768px) 288px, 500px"
                        className="object-contain drop-shadow-[0_0_40px_rgba(178,34,52,0.1)]"
                        priority
                    />
                </motion.div>

                {/* Scroll indicator */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
                    <div className="w-8 h-12 border-2 border-school-red/30 rounded-full flex justify-center pt-2">
                        <div className="w-1.5 h-3 bg-school-red/60 rounded-full animate-bounce" />
                    </div>
                    <p className="mt-4 font-mono text-[8px] uppercase tracking-[0.6em] text-charcoal/40">Scroll</p>
                </div>
            </div>

            {/* Floating particles decoration */}
            <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-school-red rounded-full opacity-30 animate-float" />
            <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-school-red rounded-full opacity-20 animate-float" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-school-red rounded-full opacity-25 animate-float" style={{ animationDelay: '4s' }} />
        </section>
    );
}
