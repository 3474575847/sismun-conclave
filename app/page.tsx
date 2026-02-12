import HeroSection from '@/components/HeroSection';
import ThemeSection from '@/components/ThemeSection';
import SecretariatSection from '@/components/SecretariatSection';
import CommitteesSection from '@/components/CommitteesSection';
import FooterSection from '@/components/FooterSection';

export default function Home() {
    return (
        <main className="min-h-screen bg-charcoal text-platinum selection:bg-gold/30">
            <HeroSection />
            <ThemeSection />
            <SecretariatSection />
            <CommitteesSection />
            <FooterSection />
        </main>
    );
}
