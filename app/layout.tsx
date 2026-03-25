// Force rebuild: Light Theme Update
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';
import Navbar from '@/components/Navbar';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-jetbrains',
});

const cormorant = Cormorant_Garamond({
    subsets: ["latin"],
    variable: "--font-cormorant",
    weight: ["300", "400", "500", "600", "700"],
    display: "swap",
});

export const metadata: Metadata = {
    title: 'SISMUN - Singapore International School Model United Nations',
    description: 'Cultivating the next generation of global leaders through intensive diplomatic simulation and international collaboration.',
    keywords: ['MUN', 'Model United Nations', 'Singapore', 'SISMUN', 'Diplomacy', 'International Relations'],
    authors: [{ name: 'Singapore International School' }],
    icons: {
        icon: '/SIS mun 1.png',
        apple: '/SIS mun 1.png',
    },
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
        <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${cormorant.variable}`}>
            <body className={`${inter.className} font-sans bg-white text-charcoal antialiased selection:bg-gold/30 no-scrollbar`}>
                <SmoothScroll>
                    <Navbar />
                    {children}
                </SmoothScroll>
            </body>
        </html>
    );
}
