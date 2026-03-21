'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SecretariatNoteSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(contentRef.current,
                { y: 50, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 70%',
                    },
                    y: 0,
                    opacity: 1,
                    duration: 1.5,
                    ease: 'power3.out',
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="secretariat-note"
            className="relative min-h-screen bg-charcoal py-32 px-8 z-20 flex items-center justify-center overflow-hidden"
        >
            {/* Background Decorative Element */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
                <div className="absolute top-[-10%] right-[-5%] text-[40vw] font-display font-bold text-white select-none">
                    17
                </div>
            </div>

            <div ref={contentRef} className="max-w-4xl mx-auto w-full relative z-10">
                {/* Section Tag */}
                <div className="flex items-center gap-4 mb-12 text-gold font-mono text-[10px] tracking-[0.4em] uppercase">
                    <span className="w-2 h-2 bg-gold rounded-full" />
                    Message from the desk of the Secretariat
                </div>

                <div className="space-y-12">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-platinum leading-tight">
                        A Welcome from the <span className="text-gold">Heart of SISMUN Conclave</span>
                    </h2>

                    <div className="space-y-8 text-platinum/80 font-light text-lg leading-relaxed text-justify">
                        <p>
                            As the Secretariat, it is our great pleasure to welcome you to the 17th edition of SISMUN. This year, we come together around a theme that demands building an environment built upon a universal set of global human rights and social justice principles, a notion that feels ever more pressing in our current world order.
                        </p>
                        <p>
                            In our various committees, you will be discussing issues of self-determination, conflict, equitable distribution of resources, environmentalism, technological control, and global accountability, each of which has been carefully crafted to mirror our world in the 21st century, yet still requires intellectual, legal, and diplomatic sophistication.
                        </p>
                        <p>
                            Debate, however, will not be merely rhetorical in nature. In our Security Council, you will be discussing pressing issues of global food security as a result of the conflict in Ukraine, as well as humanitarian crises in Yemen. In our Human Rights Council, you will be discussing socio-political instability in gender-divergent societies as well as democratic backsliding in Nepal. DISEC and HSC will be discussing autonomous weapons, Greenland&rsquo;s autonomy, and a number of historical crises, all of which will challenge us to be responsible, forward-thinking global leaders.
                        </p>
                    </div>

                    {/* Signatories */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-platinum/10">
                        <div className="space-y-1">
                            <p className="text-gold font-display text-xl font-bold italic">Zorawar Bhinder</p>
                            <p className="text-platinum/40 font-mono text-[10px] uppercase tracking-widest">Secretary General</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-gold font-display text-xl font-bold italic">Chahel Dharod</p>
                            <p className="text-platinum/40 font-mono text-[10px] uppercase tracking-widest">Deputy Secretary General</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-gold font-display text-xl font-bold italic">Ritvayg Bindal</p>
                            <p className="text-platinum/40 font-mono text-[10px] uppercase tracking-widest">Deputy Secretary General</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
