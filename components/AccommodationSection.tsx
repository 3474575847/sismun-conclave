'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const hotels = [
    {
        name: 'Royal Hometel Suites',
        address: 'D B OZONE, Western Express Hwy, Next to Thakur Mall, Ketkipada, Mira Road East, Mumbai, Maharashtra 401107',
        contact: '02262950000 / reservations@sarovarhotels.com',
        distance: '550 m (5 minutes)',
        link: 'https://www.sarovarhotels.com/royal-hometel-suites-dahisar-mumbai/'
    },
    {
        name: 'The Fern Residency',
        address: 'Western Express Hwy, Opp. Daras Dhaba, Laxmi Baug, Kashimira, Mira Road East, Mumbai, Mira Bhayandar, Maharashtra 401107',
        contact: '0124 458 0651 / crs@fernhotels.com',
        distance: '3.7 km (15 minutes)',
        link: 'https://www.marriott.com/en-us/hotels/bomrm-the-fern-residency-mumbai-mira-road-series/overview/'
    },
    {
        name: 'GCC Hotel & Clubs',
        address: 'Off Mira Bhayandar Road, 92/1, GCC Club Rd, Mira Road East, Maharashtra 401107',
        contact: '8285638563, 8285638564 / reservation@gcchotelandclub.com',
        distance: '4.6 km (20 minutes)',
        link: 'https://gcchotelandclub.com'
    },
    {
        name: 'Seven Eleven Hotels & Clubs',
        address: '8V2H+233, Beverly Park, Mira Road East, Mira Bhayandar, Maharashtra 401107',
        contact: '9324907513 / reservation@sevenelevenclub.in',
        distance: '6.9 km (25 minutes)',
        link: 'https://sevenelevenclub.in'
    },
    {
        name: 'Hotel Sea \'N Rock',
        address: 'Thane Ghodbunder Road, Western Express Highway, Beside Thane Toll Naka, Mira Road East, Mumbai, Maharashtra 401104',
        contact: '09820955711 / reservation@hotelseanrock.com',
        distance: '6.5 km (20 minutes)',
        link: 'https://hotelseanrock.com'
    },
    {
        name: 'The Westin Garden City',
        address: 'Oberoi Garden City, International Business Park, Yashodham, Goregaon, Mumbai, Maharashtra 400063',
        contact: '2261470000 / westin.mumbaigardencity@westin.com',
        distance: '13 km (40 minutes)',
        link: 'https://www.marriott.com/en-us/hotels/bomwi-the-westin-mumbai-garden-city/overview/'
    }
];

export default function AccommodationSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.hotel-card',
                { y: 30, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 80%',
                    },
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'power2.out'
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="accommodation-section"
            className="relative bg-white py-24 px-8 z-20"
        >
            <div className="max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
                    <div className="lg:col-span-8">
                        <div className="flex items-center gap-4 mb-6 text-school-red font-mono text-[10px] tracking-[0.4em] uppercase">
                            <span className="w-2 h-2 bg-school-red rounded-full" />
                            Logistics
                        </div>
                        <h2 className="text-5xl md:text-7xl font-display font-bold text-charcoal uppercase tracking-tighter mb-4">
                            Accommodation & Travel
                        </h2>
                        <h3 className="text-xl md:text-2xl font-display font-medium text-charcoal/40 uppercase tracking-widest mb-8">
                            (For Outstation Schools)
                        </h3>
                        <p className="mt-8 text-charcoal/60 font-light text-xl leading-relaxed max-w-2xl">
                            Schools are responsible for their own accommodation and transport arrangements. We recommend booking early due to high demand.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {hotels.map((hotel, index) => (
                        <a
                            key={index}
                            href={hotel.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hotel-card group bg-white/5 md:bg-platinum/5 border border-white/5 p-8 rounded-xl flex flex-col justify-between hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 block"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-school-red text-xs">0{index + 1}</span>
                                        <div className="w-4 h-[1px] bg-school-red/30" />
                                        <span className="text-[10px] font-mono text-school-red/50 uppercase tracking-widest">Official Website</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-school-red/50 uppercase tracking-widest">{hotel.distance}</span>
                                </div>
                                <h3 className="text-2xl font-display font-bold text-white mb-4 uppercase leading-none">{hotel.name}</h3>
                                <p className="text-sm text-white/60 mb-6 font-light leading-relaxed">{hotel.address}</p>
                            </div>
                            <div className="pt-6 border-t border-charcoal/10">
                                <p className="text-[10px] font-mono text-school-red uppercase tracking-widest mb-2">Booking Contact</p>
                                <p className="text-xs text-white/80 transition-colors break-words">{hotel.contact}</p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
