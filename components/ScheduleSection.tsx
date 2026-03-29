'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const day1 = [
    { time: '7:30 am – 8:00 am', activity: 'Reporting & Registration' },
    { time: '8:00 am – 8:30 am', activity: 'Breakfast' },
    { time: '8:30 am – 10:00 am', activity: 'Opening Ceremony' },
    { time: '10:00 am – 10:45 am', activity: 'Official Group Photograph' },
    { time: '10:45 am – 12:00 pm', activity: 'Lobbying Session' },
    { time: '12:00 pm – 1:45 pm', activity: 'Committee Session 1' },
    { time: '1:45 pm – 2:15 pm', activity: 'Lunch Break' },
    { time: '2:15 pm – 4:45 pm', activity: 'Committee Session 2' },
    { time: '4:45 pm – 5:00 pm', activity: 'High Tea' },
    { time: '5:00 pm – 6:00 pm', activity: 'Committee Session 3' },
    { time: '6:00 pm', activity: 'Delegates Disperse – End of Day 1' },
];

const day2 = [
    { time: '8:00 am – 8:30 am', activity: 'Reporting & Breakfast' },
    { time: '8:30 am – 9:50 am', activity: 'Committee Session 1' },
    { time: '9:50 am – 10:00 am', activity: 'Refreshment Break' },
    { time: '10:00 am – 12:30 pm', activity: 'Committee Session 2' },
    { time: '12:30 pm – 1:00 pm', activity: 'Lunch Break' },
    { time: '1:00 pm – 2:50 pm', activity: 'Committee Session 3' },
    { time: '2:50 pm – 3:00 pm', activity: 'Refreshment Break' },
    { time: '3:00 pm – 4:00 pm', activity: 'Committee Session 4' },
    { time: '4:00 pm – 6:00 pm', activity: 'Closing Ceremony' },
    { time: '6:00 pm', activity: 'Delegates Disperse – End of Day 2' },
];

export default function ScheduleSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const [activeDay, setActiveDay] = useState(1);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.schedule-header',
                { y: 30, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 85%',
                    },
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: 'power3.out'
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="schedule-section"
            className="relative bg-charcoal text-white py-32 px-8 z-20 overflow-hidden"
        >
            <div className="max-w-4xl mx-auto w-full">
                <div className="schedule-header mb-16">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight mb-4">
                        Conference Schedule
                    </h2>
                    <div className="h-1.5 w-24 bg-gold" />
                </div>

                <div className="flex gap-12 mb-16 border-b border-white/10">
                    <button
                        onClick={() => setActiveDay(1)}
                        className={`pb-4 text-2xl font-display uppercase tracking-widest transition-all ${activeDay === 1 ? 'text-gold border-b-2 border-gold' : 'text-platinum/40 hover:text-platinum/60'}`}
                    >
                        Day 1 (8th Aug)
                    </button>
                    <button
                        onClick={() => setActiveDay(2)}
                        className={`pb-4 text-2xl font-display uppercase tracking-widest transition-all ${activeDay === 2 ? 'text-gold border-b-2 border-gold' : 'text-platinum/40 hover:text-platinum/60'}`}
                    >
                        Day 2 (9th Aug)
                    </button>
                </div>

                <div className="space-y-4">
                    <p className="text-gold font-mono text-xs uppercase tracking-widest mb-8">
                        Dress Code: Formal Western Business Attire
                    </p>
                    
                    {(activeDay === 1 ? day1 : day2).map((item, index) => (
                        <div
                            key={index}
                            className="group flex flex-col md:flex-row md:items-center justify-between py-6 border-b border-white/5 last:border-none hover:pl-4 transition-all duration-300"
                        >
                            <span className="font-mono text-gold text-lg mb-2 md:mb-0 w-48">{item.time}</span>
                            <span className="text-xl md:text-2xl font-display font-light text-platinum/90 group-hover:text-white transition-colors">
                                {item.activity}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
