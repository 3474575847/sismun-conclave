import HeroSection from '@/components/HeroSection';
import MissionSection from '@/components/MissionSection';
import CommitteesSection from '@/components/CommitteesSection';
import FooterSection from '@/components/FooterSection';

export default function Home() {
    return (
        <main className="relative bg-platinum">
            <HeroSection />
            <MissionSection />
            <CommitteesSection />
            <FooterSection />
        </main>
    );
}
