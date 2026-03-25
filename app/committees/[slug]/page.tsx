'use client';

import { useParams, useRouter } from 'next/navigation';
import { committees } from '@/data/committees';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import Image from 'next/image';

export default function CommitteePage() {
    const { slug } = useParams();
    const router = useRouter();
    const sectionRef = useRef<HTMLElement>(null);

    const committee = committees.find(c => c.slug === slug);

    useEffect(() => {
        if (!committee) {
            router.push('/');
            return;
        }

        const ctx = gsap.context(() => {
            gsap.fromTo('.reveal',
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out' }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, [committee, router]);

    if (!committee) return null;

    return (
        <main ref={sectionRef} className="min-h-screen bg-platinum text-charcoal selection:bg-school-red/30 overflow-x-hidden">
            {/* Minimal Header — no mix-blend-difference so links work */}
            <nav className="fixed top-0 left-0 w-full px-8 py-5 z-[110] flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-charcoal/10">
                <Link href="/" className="group flex items-center gap-3 text-charcoal">
                    <div className="w-9 h-9 border border-charcoal/20 flex items-center justify-center rounded-full group-hover:border-school-red/50 transition-colors">
                        <svg className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-charcoal/50 group-hover:text-charcoal transition-all">Back to Home</span>
                </Link>
                <div className="font-mono text-[10px] uppercase tracking-[0.6em] text-charcoal/30">
                    <span className="text-school-red text-sm lg:text-base">SISMUN Conclave</span> 2026
                </div>
            </nav>

            <section className="relative pt-40 pb-20 px-8 flex items-center justify-center">
                {/* Background Text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.03]">
                    <h1 className="text-[35vw] font-display font-bold uppercase leading-none tracking-tighter text-charcoal">
                        {committee.acronym}
                    </h1>
                </div>

                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-20 relative z-10">
                    {/* Left Column: Identity */}
                    <div className="lg:col-span-12 mb-12">
                        <div className="reveal flex items-center gap-4 mb-8 text-school-red font-mono text-xs tracking-[0.4em] uppercase">
                            <span className="w-2 h-2 bg-school-red rounded-full animate-pulse" />
                            Active Committee {committee.acronym}
                        </div>
                        <h1 className="reveal text-5xl md:text-8xl lg:text-9xl font-display font-bold tracking-tighter uppercase leading-[0.85] mb-8 text-charcoal">
                            {committee.name}
                        </h1>
                        <div className="reveal h-1 w-32 bg-school-red mb-12" />
                    </div>

                    {/* Committee Leadership — Refined & Centered (Moved Up) */}
                    <div className="lg:col-span-12 mt-12 mb-20 relative z-10">
                        <div className="reveal mb-12">
                            <div className="flex items-center gap-4 mb-4 text-school-red font-mono text-[10px] tracking-[0.4em] uppercase">
                                <span className="w-1.5 h-1.5 bg-school-red rounded-full animate-pulse" />
                                Committee Leadership
                            </div>
                            <div className="h-[1px] w-24 bg-school-red/30" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
                            {committee.studentOfficers?.map((officer, i) => (
                                <div key={i} className="reveal group flex flex-col items-center text-center">
                                    <div className="relative aspect-square w-full max-w-[240px] rounded-2xl overflow-hidden border border-charcoal/10 bg-charcoal/5 group-hover:border-school-red/30 transition-all duration-700 shadow-sm mb-8">
                                        {officer.image ? (
                                            <Image
                                                src={officer.image}
                                                alt={officer.name}
                                                fill
                                                sizes="240px"
                                                className="object-contain group-hover:scale-105 transition-transform duration-1000 p-4"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-charcoal/10 text-charcoal/30">
                                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <p className="text-school-red font-mono text-[9px] uppercase tracking-[0.4em] font-bold">
                                            {officer.role}
                                        </p>
                                        <h4 className="text-2xl font-display font-bold text-charcoal group-hover:text-school-red transition-colors duration-500">
                                            {officer.name}
                                        </h4>
                                        <div className="pt-3 border-t border-charcoal/5">
                                            <a
                                                href={`mailto:${officer.email}`}
                                                className="text-[10px] text-charcoal/40 hover:text-school-red transition-colors font-mono lowercase flex items-center justify-center gap-2 group/link"
                                            >
                                                <span className="w-1 h-1 border border-charcoal/30 rounded-full group-hover/link:bg-school-red group-hover/link:border-school-red transition-all" />
                                                {officer.email}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Middle: Core Information (Agenda) */}
                    <div className="lg:col-span-7 space-y-16">
                        <div className="reveal space-y-8">
                            <h2 className="text-school-red font-mono text-[10px] uppercase tracking-[0.5em] mb-4">Committee Agenda</h2>
                            <div className="space-y-10">
                                {committee.topics.map((topic, i) => (
                                    <div key={i} className="group relative pl-12">
                                        <span className="absolute left-0 top-0 text-school-red/30 font-display text-4xl group-hover:text-school-red transition-colors duration-500">
                                            0{i + 1}
                                        </span>
                                        <p className="text-2xl md:text-3xl font-light leading-snug text-charcoal/90 border-l border-charcoal/10 pl-8 group-hover:border-school-red transition-all duration-700">
                                            {topic}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Technical Details & Sidebar */}
                    <div className="lg:col-span-5 space-y-12">
                        <div className="reveal p-10 bg-charcoal/5 border border-charcoal/10 rounded-2xl backdrop-blur-xl">
                            <h3 className="text-school-red font-mono text-[10px] uppercase tracking-[0.4em] mb-6">Briefing Note</h3>
                            <p className="text-charcoal/70 font-light leading-relaxed text-lg italic">
                                &ldquo;{committee.description}&rdquo;
                            </p>
                        </div>
                    </div>

                    {/* Full Width detailedWriteup Section */}
                    {committee.detailedWriteup && (
                        <div className="lg:col-span-12 mt-20 space-y-20">
                            {/* Quote Section */}
                            {committee.detailedWriteup.quote && (
                                <div className="reveal flex flex-col items-center text-center max-w-4xl mx-auto">
                                    <svg className="w-12 h-12 text-school-red/20 mb-8" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V3L21.017 3V15C21.017 18.3137 18.3307 21 15.017 21H14.017ZM3.0166 21L3.0166 18C3.0166 16.8954 3.91203 16 5.0166 16H8.0166C8.56888 16 9.0166 15.5523 9.0166 15V9C9.0166 8.44772 8.56888 8 8.0166 8H5.0166C3.91203 8 3.0166 7.10457 3.0166 6V3L10.0166 3V15C10.0166 18.3137 7.33031 21 4.0166 21H3.0166Z" />
                                    </svg>
                                    <p className="text-3xl md:text-4xl font-display font-medium text-charcoal leading-tight mb-6 italic">
                                        &ldquo;{committee.detailedWriteup.quote}&rdquo;
                                    </p>
                                    <p className="text-school-red font-mono text-xs uppercase tracking-[0.3em] font-bold">
                                        — {committee.detailedWriteup.quoteAuthor}
                                    </p>
                                </div>
                            )}

                            {/* Main Content */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                                <div className="lg:col-span-8 space-y-10">
                                    <div className="reveal prose prose-lg prose-slate max-w-none">
                                        {committee.detailedWriteup.introduction && (
                                            <p className="text-xl text-charcoal font-medium leading-relaxed mb-8">
                                                {committee.detailedWriteup.introduction}
                                            </p>
                                        )}
                                        <div className="space-y-6 text-charcoal/80 font-light leading-relaxed">
                                            {committee.detailedWriteup.body?.map((para, i) => (
                                                <p key={i}>{para}</p>
                                            ))}
                                        </div>
                                        {committee.detailedWriteup.conclusion && (
                                            <p className="mt-12 p-8 bg-charcoal/5 rounded-2xl border-l-4 border-school-red text-charcoal/90 italic">
                                                {committee.detailedWriteup.conclusion}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="lg:col-span-4 space-y-12">
                                    {/* Bibliography / Citations Sidebar */}
                                    {(committee.detailedWriteup.bibliography || committee.detailedWriteup.citations) && (
                                        <div className="reveal space-y-8 sticky top-32">
                                            <div>
                                                <h4 className="text-school-red font-mono text-[10px] uppercase tracking-[0.4em] mb-6 border-b border-charcoal/10 pb-4">
                                                    {committee.detailedWriteup.bibliography ? 'Bibliography' : 'Citations'}
                                                </h4>
                                                <ul className="space-y-4">
                                                    {(committee.detailedWriteup.bibliography || committee.detailedWriteup.citations)?.map((item, i) => (
                                                        <li key={i} className="text-xs font-mono text-charcoal/50 leading-loose break-words hover:text-school-red transition-colors">
                                                            <span className="text-school-red/40 mr-2">/0{i + 1}</span>
                                                            {item.startsWith('http') ? (
                                                                <a href={item} target="_blank" rel="noopener noreferrer" className="underline decoration-school-red/20 underline-offset-4">
                                                                    {item}
                                                                </a>
                                                            ) : item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="p-6 bg-school-red text-white rounded-xl shadow-xl">
                                                <p className="font-mono text-[9px] uppercase tracking-widest mb-2 opacity-70">Committee status</p>
                                                <p className="text-sm font-bold uppercase tracking-tighter">Ready for Debate</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Decorative Corner Accents */}
            <div className="fixed top-0 right-0 w-32 h-32 border-t border-r border-charcoal/10 pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-32 h-32 border-b border-l border-charcoal/10 pointer-events-none" />
        </main>
    );
}
