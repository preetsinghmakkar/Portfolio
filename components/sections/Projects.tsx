'use client';

import { ExternalLink, CheckCircle, GitBranch } from 'lucide-react';
import { projects } from '@/data/portfolio';
import type { Project } from '@/types';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/MotionWrapper';
import { cn } from '@/lib/utils';

function RepoMeta({ project }: { project: Project }) {
  return (
    <div className="flex items-center gap-4 pt-3 border-t border-white/6 mt-4">
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
        <span className="font-mono text-[10px] text-[#6b7280]">{project.lang}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <GitBranch className="h-3 w-3 text-[#6b7280]" />
        <span className="font-mono text-[10px] text-[#6b7280]">{project.visibility}</span>
      </div>
      <span className="font-mono text-[10px] text-[#6b7280] ml-auto">
        Updated {project.lastUpdated}
      </span>
    </div>
  );
}

function ProjectCard({ project, flagship }: { project: Project; flagship?: boolean }) {
  return (
    <article
      className={cn(
        'group flex h-full flex-col rounded-xl border border-white/7 bg-[#0d0d0d] p-8 transition-all duration-300',
        'hover:border-[rgba(0,255,102,0.25)] hover:shadow-[0_0_60px_rgba(0,255,102,0.07),inset_0_0_60px_rgba(0,255,102,0.02)]',
        flagship && 'lg:flex-row lg:gap-10',
      )}
    >
      {/* Main content column */}
      <div className={cn('flex flex-col', flagship && 'lg:flex-1')}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span className="font-mono text-[10px] tracking-widest text-accent">
                {project.status}
              </span>
            </div>
            <h3 className="font-display text-2xl font-bold text-white group-hover:text-white transition-colors">
              {project.name}
            </h3>
          </div>
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-white/8 p-2 text-[#6b7280] transition-all hover:border-accent/40 hover:text-accent hover:shadow-[0_0_12px_rgba(0,255,102,0.15)]"
            aria-label={`View ${project.name} on GitHub`}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <p className="mb-6 text-sm leading-6 text-[#9ca3af]">
          {project.description}
        </p>

        {/* Highlights */}
        <ul className="mb-6 space-y-2.5" aria-label="Architecture highlights">
          {project.highlights.map((h) => (
            <li key={h} className="flex items-start gap-2.5">
              <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent opacity-80" />
              <span className="text-xs leading-5 text-[#6b7280] group-hover:text-[#9ca3af] transition-colors">
                {h}
              </span>
            </li>
          ))}
        </ul>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="rounded border border-white/8 px-2.5 py-1 font-mono text-[11px] text-[#6b7280] transition-colors group-hover:border-[rgba(0,255,102,0.15)] group-hover:text-[#9ca3af]"
            >
              {tech}
            </span>
          ))}
        </div>

        <RepoMeta project={project} />
      </div>

      {/* Flagship-only: terminal panel */}
      {flagship && (
        <div className="hidden lg:flex lg:w-72 shrink-0 flex-col rounded-lg border border-white/7 bg-[#050505] p-5 font-mono text-[12px]">
          <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-white/6">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-auto text-[10px] tracking-widest text-[#6b7280]">protocol.log</span>
          </div>
          <div className="space-y-2 flex-1">
            <div className="text-accent">$ forge test --match-contract RevvFi</div>
            <div className="text-[#6b7280] italic"># Running test suite...</div>
            <div className="text-[#9ca3af]">Compiling 14 files...</div>
            <div className="text-[#9ca3af] mt-1">Running 4 test suites.</div>
            <div className="mt-2 space-y-0.5">
              <div><span className="text-accent">[PASS]</span> <span className="text-[#9ca3af]">LendingMarket.t.sol</span></div>
              <div><span className="text-accent">[PASS]</span> <span className="text-[#9ca3af]">Liquidation.t.sol</span></div>
              <div><span className="text-accent">[PASS]</span> <span className="text-[#9ca3af]">ERC721Position.t.sol</span></div>
              <div><span className="text-accent">[PASS]</span> <span className="text-[#9ca3af]">InterestRate.t.sol</span></div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/6 text-[10px] text-accent">
            # All tests passed. Coverage: 98.4%
          </div>
        </div>
      )}
    </article>
  );
}

export function Projects() {
  const flagship = projects.find((p) => p.flagship);
  const rest = projects.filter((p) => !p.flagship);

  return (
    <section id="work" className="relative py-32 lg:py-40 border-t border-white/6">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-accent mb-4">
            — DEPLOYED_PROTOCOLS
          </p>
          <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-tight tracking-tighter text-white">
            FEATURED
            <br />
            <span className="text-accent">WORK</span>
          </h2>
        </Reveal>

        <div className="mt-16 flex flex-col gap-6">
          {/* Flagship — full width */}
          {flagship && (
            <Reveal delay={0.1}>
              <ProjectCard project={flagship} flagship />
            </Reveal>
          )}

          {/* Remaining — 2-column grid */}
          <Stagger className="grid gap-6 lg:grid-cols-2">
            {rest.map((project) => (
              <StaggerItem key={project.name}>
                <ProjectCard project={project} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
