import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import '../globals.css';
import PortalNav from '@/components/portal/PortalNav';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

export const metadata: Metadata = {
    title: 'SISMUN Digital Resolutions',
    description: 'Resolution drafting, submission, and amendment management for SISMUN Conclave 2026.',
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen font-sans transition-colors duration-300`}
             style={{ background: 'var(--portal-bg)', color: 'var(--portal-text-1)' }}>
            <PortalNav />
            <main className="pt-14 min-h-screen">
                {children}
            </main>
        </div>
    );
}
