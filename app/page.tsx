import HeroSection from '@/components/HeroSection';
import ThemeSection from '@/components/ThemeSection';
import SecretariatNoteSection from '@/components/SecretariatNoteSection';
import CommitteesSection from '@/components/CommitteesSection';
import SecretariatSection from '@/components/SecretariatSection';
import PrincipalSection from '@/components/PrincipalSection';
import SchoolDirectorSection from '@/components/SchoolDirectorSection';
import CuratorSection from '@/components/CuratorSection';
import DirectorsSection from '@/components/DirectorsSection';
import ParticipationRulesSection from '@/components/ParticipationRulesSection';
import RegistrationSection from '@/components/RegistrationSection';
import TrainingSection from '@/components/TrainingSection';
import ScheduleSection from '@/components/ScheduleSection';
import AwardsSection from '@/components/AwardsSection';
import GallerySection from '@/components/GallerySection';
import AccommodationSection from '@/components/AccommodationSection';
import StudentHeadsSection from '@/components/StudentHeadsSection';
import FooterSection from '@/components/FooterSection';

export default function Home() {
    return (
        <main className="min-h-screen bg-charcoal text-platinum selection:bg-gold/30">
            <HeroSection />
            <ThemeSection />
            <SecretariatSection />
            <SecretariatNoteSection />
            <StudentHeadsSection />
            <CommitteesSection />
            <PrincipalSection />
            <SchoolDirectorSection />
            <CuratorSection />
            <DirectorsSection />
            <ParticipationRulesSection />
            <RegistrationSection />
            <TrainingSection />
            <ScheduleSection />
            <AwardsSection />
            <GallerySection />
            <AccommodationSection />
            <FooterSection />
        </main>
    );
}
