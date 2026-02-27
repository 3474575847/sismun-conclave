'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';

const galleryImages = [
    '/SISMUN Photos Past Years/2025 - 1.JPG',
    '/SISMUN Photos Past Years/2025 - 2.JPG',
    '/SISMUN Photos Past Years/2025 - 3.JPG',
    '/SISMUN Photos Past Years/2024 - 1.JPG',
    '/SISMUN Photos Past Years/2024 - 2.JPG',
    '/SISMUN Photos Past Years/2023 - 1.JPG',
    '/SISMUN Photos Past Years/2023 - 2.JPG',
    '/SISMUN Photos Past Years/2019 - 1.JPG',
    '/SISMUN Photos Past Years/2019 - 2.JPG',
    '/SISMUN Photos Past Years/2018 -1.JPG',
    '/SISMUN Photos Past Years/2018 - 3.JPG',
];

export default function GallerySection() {
    const sliderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sliderRef.current) return;

        const slider = sliderRef.current;
        const totalWidth = slider.scrollWidth / 2;

        const ctx = gsap.context(() => {
            gsap.to(slider, {
                x: -totalWidth,
                duration: 40,
                ease: "none",
                repeat: -1,
                modifiers: {
                    x: gsap.utils.unitize((x: string) => parseFloat(x) % totalWidth)
                }
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <section id="gallery-section" className="relative bg-charcoal py-24 z-20 overflow-hidden border-y border-white/5">
            <div className="max-w-7xl mx-auto px-8 mb-16">
                <div className="flex items-center gap-4 mb-6 text-gold font-mono text-[10px] tracking-[0.4em] uppercase">
                    <span className="w-2 h-2 bg-gold rounded-full" />
                    Archive PREVIOUS EDITIONS
                </div>
                <h2 className="text-5xl md:text-7xl font-display font-bold text-platinum uppercase tracking-tighter">
                    Gallery
                </h2>
            </div>

            <div className="relative">
                <div
                    ref={sliderRef}
                    className="flex gap-4 cursor-grab active:cursor-grabbing w-max px-4"
                >
                    {/* Double the images for seamless loop */}
                    {[...galleryImages, ...galleryImages].map((src, index) => (
                        <div
                            key={index}
                            className="relative w-[300px] md:w-[450px] aspect-[4/3] rounded-2xl overflow-hidden group border border-white/10"
                        >
                            <Image
                                src={src}
                                alt={`SISMUN Gallery ${index}`}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                sizes="(max-width: 768px) 300px, 450px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Gradient Overlays for smooth edges */}
            <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-charcoal to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-charcoal to-transparent z-10 pointer-events-none" />
        </section>
    );
}
