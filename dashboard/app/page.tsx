// app/page.tsx
import Link from 'next/link';
import {
  HeroSection,
  ChallengeSection,
  TalkToDataSection,
  BeforeAfterSection,
  CaseStudySection,
  TestimonialsSection,
  DataSourcesSection,
  MethodologySection,
  TechStackSection,
  AboutSection,
} from '@/components/home';

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />

      <div className="max-w-5xl mx-auto px-4 py-16">
        <ChallengeSection />
        <TalkToDataSection />
        <BeforeAfterSection />
        <CaseStudySection />
        <TestimonialsSection />
        <DataSourcesSection />
        <MethodologySection />
        <TechStackSection />
        <AboutSection />

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            View Full Dashboard
          </Link>
          <div className="mt-2">
            <a
              href="/EXECUTIVE_REPORT_COMBINED.html"
              target="_blank"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Export Combined Report &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
