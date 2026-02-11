// Force rebuild: Light Theme Update
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';
import MechanicalCursor from '@/components/MechanicalCursor';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-jetbrains',
});

export const metadata: Metadata = {
    title: 'SISMUN - Singapore International School Model United Nations',
    description: 'Cultivating the next generation of global leaders through intensive diplomatic simulation and international collaboration.',
    keywords: ['MUN', 'Model United Nations', 'Singapore', 'SISMUN', 'Diplomacy', 'International Relations'],
    authors: [{ name: 'Singapore International School' }],
    openGraph: {
        title: 'SISMUN - Singapore International School Model United Nations',
        description: 'Cultivating the next generation of global leaders through intensive diplomatic simulation.',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
            <body className={`${inter.className} font-sans bg-platinum text-charcoal antialiased selection:bg-gold/30 no-scrollbar`}>
                <SmoothScroll>
                    <MechanicalCursor />
                    {children}
                </SmoothScroll>
            </body>
        </html>
    );
}
