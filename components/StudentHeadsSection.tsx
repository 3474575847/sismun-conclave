'use client';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const partners = [
    {
        name: 'Aryan Jindal',
        role: 'Tech Head',
        image: '/Invite Photos Heads /Aaryan2.JPG',
    },
    {
        name: 'Sarthak Devrani',
        role: 'Joint Tech Head',
        image: '/Invite Photos Heads /Sarthak1.jpg',
    },
    {
        name: 'Aahana Patil',
        role: 'Design & Media Head',
        image: '/Invite Photos Heads /AhanaPatil1.jpg',
    },
    {
        name: 'Angad Sawant',
        role: 'Joint Design & Media Head',
        image: '/Invite Photos Heads /Angad.jpg',
    },
    {
        name: 'Tchia Pathare',
        role: 'Press Head',
        image: '/Invite Photos Heads /Tchia2.JPG',
    },
    {
        name: 'Saisha Swamy',
        role: 'Joint Press Head',
        image: '/Invite Photos Heads /Saisha1.jpg',
    },
    {
        name: 'Parth Toprani',
        role: 'Logistics & Hospitality Head',
        image: '/Invite Photos Heads /Parth1.jpg',
    },
    {
        name: 'Mahi Kasat',
        role: 'Joint Logistics & Hospitality Head',
        image: '/Invite Photos Heads /Mahi1.jpg',
    },
];

export default function StudentHeadsSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (sectionRef.current) {
                // Header reveal
                gsap.fromTo('.heads-header',
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

                // Heads grid stagger
                gsap.fromTo('.head-card',
                    { y: 60, opacity: 0 },
                    {
                        scrollTrigger: {
                            trigger: gridRef.current,
                            start: 'top 85%',
                        },
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        stagger: 0.1,
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
            id="student-heads-section"
            className="relative min-h-screen bg-charcoal py-24 px-8 z-20 flex flex-col justify-center"
        >
            <div className="max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="heads-header text-center mb-20 text-platinum">
                    <h2 className="text-5xl md:text-7xl font-display font-bold mb-4">
                        Student Department Heads
                    </h2>
                    <div className="h-1 w-24 bg-gold mx-auto rounded-full" />
                </div>

                {/* Profiles Grid */}
                <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {partners.map((member, index) => (
                        <div
                            key={index}
                            className="head-card relative group flex flex-col items-center"
                        >
                            <div className="relative overflow-hidden rounded-xl bg-platinum/5 border border-platinum/10 aspect-square w-full mb-6 transition-all duration-500 group-hover:border-gold/30">
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    fill
                                    className="object-contain transition-transform duration-700 group-hover:scale-105"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                />
                                {/* Soft Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>

                            <div className="text-center">
                                <h3 className="text-2xl font-display font-bold text-platinum mb-1">
                                    {member.name}
                                </h3>
                                <p className="text-gold/80 font-sans font-medium tracking-wider text-[10px] uppercase">
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
