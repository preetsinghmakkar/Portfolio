'use client';

import { Navigation } from '@/components/layout/Navigation';
import { ScrollProgress } from '@/components/layout/ScrollProgress';
import { Footer } from '@/components/layout/Footer';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { AuditFindings } from '@/components/sections/Protocol';
import { TechStack } from '@/components/sections/TechStack';
import { Experience } from '@/components/sections/Experience';
import { Projects } from '@/components/sections/Projects';
import { Contact } from '@/components/sections/Contact';
import { GitHubTelemetry } from '@/components/github/GitHubTelemetry';
import { useCommandPalette } from '@/hooks/useCommandPalette';

export default function Home() {
  const { open, setOpen } = useCommandPalette();

  return (
    <>
      <ScrollProgress />
      <Navigation onCommandPaletteOpen={() => setOpen(true)} />
      <CommandPalette open={open} onClose={() => setOpen(false)} />

      <main id="main-content">
        <Hero />
        <About />
        <AuditFindings />
        <TechStack />
        <Experience />
        <Projects />
        <GitHubTelemetry />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
