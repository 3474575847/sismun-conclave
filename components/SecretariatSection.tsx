'use client';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const secretariat = [
    {
        name: 'Ritvayg Bindal',
        role: 'Deputy Secretary-General',
        image: '/ritvayg-bindal.jpeg',
    },
    {
        name: 'Zorawar Bhinder',
        role: 'Secretary-General',
        image: '/zorawar-bhinder.jpeg',
    },
    {
        name: 'Chahel Dharod',
        role: 'Deputy Secretary-General',
        image: '/chahel-dharod.jpeg',
    },
];

export default function SecretariatSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero section reference for pinning effect
            const heroSection = document.getElementById('hero-section');

            if (sectionRef.current && heroSection) {
                // Layered pinning effect (same as Mission for consistency)
                gsap.to(heroSection, {
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top bottom',
                        end: 'top top',
                        scrub: 1,
                    },
                    scale: 0.85,
                    opacity: 0.4,
                    borderRadius: '40px',
                    ease: 'none',
                });

                // Header reveal
                gsap.fromTo('.secretariat-header',
                    { y: 50, opacity: 0 },
                    {
                        scrollTrigger: {
                            trigger: sectionRef.current,
                            start: 'top 80%',
                        },
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        ease: 'power3.out',
                    }
                );

                // Cards stagger
                gsap.fromTo('.member-card',
                    { y: 100, opacity: 0 },
                    {
                        scrollTrigger: {
                            trigger: gridRef.current,
                            start: 'top 75%',
                        },
                        y: 0,
                        opacity: 1,
                        duration: 1.2,
                        stagger: 0.2,
                        ease: 'power3.out',
                    }
                );
            }
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="secretariat-section"
            className="relative min-h-screen bg-white py-24 px-8 z-20 flex flex-col justify-center"
        >
            <div className="max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="secretariat-header text-center mb-20">
                    <h2 className="text-6xl md:text-8xl font-display font-bold text-charcoal mb-4">
                        The Secretariat
                    </h2>
                    <div className="h-1 w-24 bg-gold mx-auto rounded-full" />
                </div>

                {/* Profiles Grid */}
                <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {secretariat.map((member, index) => (
                        <div
                            key={index}
                            className="member-card relative group"
                        >
                            <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl aspect-[3/4] mb-8 border-gold/50 md:border-platinum transition-colors duration-500 md:hover:border-gold/50">
                                {/* Image Placeholder */}
                                <div className="absolute inset-0 bg-charcoal/10 md:bg-charcoal/5 md:group-hover:bg-charcoal/10 transition-colors duration-500">
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill // This makes it fill the parent container automatically
                                        className="object-contain transition-transform duration-700 group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        priority={index === 0} // Optimization: loads the first image immediately
                                    />
                                </div>

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-transparent to-transparent opacity-60 z-10" />

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-60" />
                            </div>

                            <div className="text-center relative z-10">
                                <h3 className="text-4xl font-display font-bold text-charcoal mb-2">
                                    {member.name}
                                </h3>
                                <p className="text-gold font-sans font-medium tracking-widest text-sm uppercase">
                                    {member.role}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
