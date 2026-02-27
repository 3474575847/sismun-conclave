'use client';

import { useParams, useRouter } from 'next/navigation';
import { committees } from '@/data/committees';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';

export default function CommitteePage() {
    const { slug } = useParams();
    const router = useRouter();
    const sectionRef = useRef<HTMLElement>(null);
    const [draftUrl, setDraftUrl] = useState<string | null>(null);

    const committee = committees.find(c => c.slug === slug);

    // Load draft resolution URL from localStorage on mount
    useEffect(() => {
        if (committee) {
            const stored = localStorage.getItem(`draft-resolution-${committee.slug}`);
            if (stored) setDraftUrl(stored);
        }
    }, [committee]);

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
                    <span className="text-school-red text-sm lg:text-base">SISMUN Conclave</span> // 2026
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
                            Active Committee // {committee.acronym}
                        </div>
                        <h1 className="reveal text-5xl md:text-8xl lg:text-9xl font-display font-bold tracking-tighter uppercase leading-[0.85] mb-8 text-charcoal">
                            {committee.name}
                        </h1>
                        <div className="reveal h-1 w-32 bg-school-red mb-12" />
                    </div>

                    {/* Middle: Core Information */}
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

                        <div className="reveal space-y-6 pt-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <span className="block text-[10px] font-mono text-charcoal/40 uppercase tracking-widest">Classification</span>
                                    <span className="block text-sm uppercase tracking-widest text-charcoal/80">THIMUN Level</span>
                                </div>
                                <div className="space-y-2">
                                    <span className="block text-[10px] font-mono text-charcoal/40 uppercase tracking-widest">Status</span>
                                    <span className="block text-sm uppercase tracking-widest text-school-red animate-pulse">Open for Registration</span>
                                </div>
                            </div>

                            {/* Draft Resolution Block */}
                            <div className="pt-4">
                                <div className="space-y-1 mb-3">
                                    <span className="block text-[10px] font-mono text-school-red uppercase tracking-widest">Resources</span>
                                </div>
                                {draftUrl ? (
                                    <a
                                        href={draftUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative flex items-center justify-between p-6 border border-charcoal/10 bg-white hover:border-school-red/50 hover:bg-school-red/[0.02] transition-all duration-500 rounded-xl"
                                    >
                                        <div className="space-y-1">
                                            <span className="block text-lg font-display font-medium text-charcoal group-hover:text-school-red transition-colors">Draft Resolution</span>
                                            <span className="block text-[10px] font-mono text-charcoal/40 uppercase tracking-widest">Open in Google Docs ↗</span>
                                        </div>
                                        <div className="w-12 h-12 border border-charcoal/10 flex items-center justify-center rounded-full group-hover:border-school-red/30 group-hover:bg-school-red/5 transition-all">
                                            <svg className="w-5 h-5 text-charcoal/40 group-hover:text-school-red transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </div>
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-4 p-6 border border-charcoal/10 bg-charcoal/[0.02] rounded-xl">
                                        <svg className="w-5 h-5 text-charcoal/30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <div>
                                            <span className="block text-sm font-display text-charcoal/50">Draft Resolution</span>
                                            <span className="block text-[10px] font-mono text-charcoal/30 uppercase tracking-widest mt-0.5">Not yet posted by Chair</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Decorative Corner Accents */}
            <div className="fixed top-0 right-0 w-32 h-32 border-t border-r border-charcoal/10 pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-32 h-32 border-b border-l border-charcoal/10 pointer-events-none" />
        </main>
    );
}
