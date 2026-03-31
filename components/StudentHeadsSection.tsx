'use client';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { teamMembers } from '@/data/team';

gsap.registerPlugin(ScrollTrigger);

export default function StudentHeadsSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.team-card',
                { y: 50, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 80%',
                    },
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'power3.out'
                }
            );

            if (headingRef.current) {
                gsap.fromTo(headingRef.current,
                    { x: -50, opacity: 0 },
                    {
                        scrollTrigger: {
                            trigger: sectionRef.current,
                            start: 'top 90%',
                        },
                        x: 0,
                        opacity: 1,
                        duration: 1,
                        ease: 'power4.out'
                    }
                );
            }
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    // Only department heads for this section
    const categories = ['Department Heads'];

    return (
        <section
            ref={sectionRef}
            id="student-heads-section"
            className="relative bg-white py-24 px-6 sm:px-12 lg:px-24 z-20 overflow-hidden"
        >
            <div className="max-w-7xl mx-auto w-full">
                <div ref={headingRef} className="mb-20">
                    <h2 className="text-4xl sm:text-7xl lg:text-8xl font-serif font-bold text-charcoal leading-none mb-4 sm:mb-6 uppercase tracking-tighter">
                        Meet the <span className="text-school-red">Team</span>
                    </h2>
                    <div className="h-1 sm:h-2 w-24 sm:w-32 bg-school-red" />
                </div>

                {categories.map((category) => (
                    <div key={category} className="mb-20 last:mb-0">
                        <div className="flex items-center gap-6 mb-10">
                            <h3 className="text-xl md:text-2xl font-mono text-charcoal/60 uppercase tracking-[0.4em]">
                                {category}
                            </h3>
                            <div className="h-[1px] flex-grow bg-charcoal/10" />
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-10">
                            {teamMembers
                                .filter(member => member.category === category)
                                .map((partner, idx) => (
                                    <div
                                        key={idx}
                                        className="team-card group relative flex flex-col items-center text-center"
                                    >
                                        <div className="relative w-full aspect-[4/5] mb-6 overflow-hidden bg-charcoal/5 rounded-2xl border border-charcoal/5 group-hover:border-school-red/30 transition-all duration-500 shadow-sm group-hover:shadow-xl">
                                            <Image
                                                src={partner.image}
                                                alt={partner.name}
                                                fill
                                                sizes="(max-width: 640px) 50vw, 280px"
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            {/* Geometric Corner Accent */}
                                            <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-school-red/0 group-hover:border-school-red/40 group-hover:m-2 transition-all duration-500 opacity-0 group-hover:opacity-100" />
                                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-school-red/0 group-hover:border-school-red/40 group-hover:m-2 transition-all duration-500 opacity-0 group-hover:opacity-100" />
                                        </div>
                                        <div className="space-y-1 px-1">
                                            <h4 className="text-charcoal font-display font-bold text-[9px] sm:text-lg leading-tight group-hover:text-school-red transition-colors">
                                                {partner.name}
                                            </h4>
                                            <p className="text-charcoal/40 font-mono text-[6px] sm:text-[10px] uppercase tracking-[0.05em] sm:tracking-[0.2em] px-0.5 sm:px-2 italic font-medium">
                                                {partner.role}
                                            </p>
                                            {partner.email && (
                                                <a 
                                                    href={`mailto:${partner.email}`} 
                                                    className="block text-[#B22234] font-mono text-[5px] sm:text-[9px] hover:underline transition-all mt-0.5 sm:mt-1 opacity-80"
                                                >
                                                    {partner.email}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
