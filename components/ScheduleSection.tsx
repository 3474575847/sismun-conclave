'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const day1 = [
    { time: '7:30 am - 8:00 am', activity: 'Reporting time & Registration' },
    { time: '8:00 am - 8:30 am', activity: 'Breakfast' },
    { time: '8:30 am - 10:00 am', activity: 'Opening Ceremony' },
    { time: '10:00 am - 10:45 am', activity: 'Group Photograph' },
    { time: '10:45 am - 12:00 pm', activity: 'Lobbying' },
    { time: '12:00 pm - 1:45 pm', activity: 'Committee Session 1' },
    { time: '1:45 pm - 2:15 pm', activity: 'Lunch' },
    { time: '2:15 pm - 4:45 pm', activity: 'Committee Session 2' },
    { time: '4:45 pm - 5:00 pm', activity: 'High tea' },
    { time: '5:00 pm - 6:00 pm', activity: 'Committee Session 3' },
    { time: '6:00 pm', activity: 'Dispersal' },
];

const day2 = [
    { time: '8:00 am - 8:30 am', activity: 'Reporting & Breakfast' },
    { time: '8:30 am - 9:50 am', activity: 'Committee Session 1' },
    { time: '9:50 am - 10:00 am', activity: 'Refreshment Break' },
    { time: '10:00 am - 12:30 pm', activity: 'Committee Session 2' },
    { time: '12:30 pm - 1:00 pm', activity: 'Lunch Break' },
    { time: '1:00 pm - 2:50 pm', activity: 'Committee Session 3' },
    { time: '2:50 pm - 3:00 pm', activity: 'Refreshment Break' },
    { time: '3:00 pm - 4:00 pm', activity: 'Committee Session 4' },
    { time: '4:00 pm - 6:00 pm', activity: 'Closing Ceremony' },
    { time: '6:00 pm', activity: 'Delegates Disperse' },
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
                        start: 'top 80%',
                    },
                    y: 0,
                    opacity: 1,
                    duration: 1,
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
            className="relative bg-white py-24 px-8 z-20"
        >
            <div className="max-w-5xl mx-auto w-full">
                <div className="schedule-header mb-20 text-center">
                    <div className="flex justify-center items-center gap-4 mb-6 text-school-red font-mono text-[10px] tracking-[0.4em] uppercase">
                        <span className="w-2 h-2 bg-school-red rounded-full" />
                        Timeline CONFERENCE SCHEDULE
                    </div>
                    <h2 className="text-6xl md:text-8xl font-display font-bold text-charcoal uppercase tracking-tighter">
                        Timetable
                    </h2>
                </div>

                {/* Day Toggle */}
                <div className="flex justify-center mb-16 gap-8">
                    <button
                        onClick={() => setActiveDay(1)}
                        className={`group relative py-2 px-6 font-display text-2xl transition-colors duration-300 ${activeDay === 1 ? 'text-charcoal' : 'text-charcoal/30'}`}
                    >
                        <span>DAY 01</span>
                        <div className={`absolute bottom-0 left-0 h-[2px] bg-school-red transition-all duration-500 ${activeDay === 1 ? 'w-full' : 'w-0'}`} />
                        <p className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] group-hover:text-sm font-mono text-school-red opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">8th AUG</p>
                    </button>
                    <button
                        onClick={() => setActiveDay(2)}
                        className={`group relative py-2 px-6 font-display text-2xl transition-colors duration-300 ${activeDay === 2 ? 'text-charcoal' : 'text-charcoal/30'}`}
                    >
                        <span>DAY 02</span>
                        <div className={`absolute bottom-0 left-0 h-[2px] bg-school-red transition-all duration-500 ${activeDay === 2 ? 'w-full' : 'w-0'}`} />
                        <p className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] group-hover:text-sm font-mono text-school-red opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">9th AUG</p>
                    </button>
                </div>

                {/* Timetable */}
                <div className="space-y-4">
                    {(activeDay === 1 ? day1 : day2).map((item, index) => (
                        <div
                            key={index}
                            className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-charcoal/5 bg-gold/5 md:bg-transparent md:hover:bg-gold/5 transition-colors duration-300 group"
                        >
                            <div className="flex items-center gap-6">
                                <span className="font-mono text-school-red text-xs">0{index + 1}</span>
                                <p className="font-mono text-sm tracking-widest text-school-red md:text-charcoal/40 md:group-hover:text-school-red transition-colors">{item.time}</p>
                            </div>
                            <h3 className="text-xl md:text-2xl font-light text-charcoal mt-2 md:mt-0 uppercase tracking-wide">{item.activity}</h3>
                        </div>
                    ))}
                </div>

                <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 py-10 border-t border-charcoal/10">
                    <div>
                        <h4 className="font-mono text-[10px] text-charcoal/40 uppercase mb-2 tracking-widest">Dress Code</h4>
                        <p className="text-charcoal/70 uppercase text-sm font-medium">Formal Western Business Attire</p>
                    </div>
                    <div>
                        <h4 className="font-mono text-[10px] text-charcoal/40 uppercase mb-2 tracking-widest">Location</h4>
                        <p className="text-charcoal/70 uppercase text-sm">SISMUN CONCLAVE 26 (Singapore International School)</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
