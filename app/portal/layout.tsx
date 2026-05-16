import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import '../globals.css';
import PortalNav from '@/components/portal/PortalNav';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

export const metadata: Metadata = {
    title: 'SISMUN Digital Ledger',
    description: 'Resolution drafting, submission, and amendment management for SISMUN Conclave 2026.',
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={`${inter.variable} ${jetbrainsMono.variable} bg-[#0a0a0f] text-slate-200 antialiased min-h-screen font-sans`}>
            <PortalNav />
            <main className="pt-14 min-h-screen">
                {children}
            </main>
        </div>
    );
}
