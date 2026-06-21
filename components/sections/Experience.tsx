'use client';

import { experiences } from '@/data/portfolio';
import type { ExperienceItem, HighlightType } from '@/types';
import { Reveal } from '@/components/ui/MotionWrapper';
import { cn } from '@/lib/utils';

const typeColors: Record<HighlightType, string> = {
  SUCCESS:  'text-accent',
  AUDIT:    'text-amber-400',
  INIT:     'text-blue-400',
  INFO:     'text-[#9ca3af]',
  DEPLOYED: 'text-accent',
  FINDING:  'text-amber-400',
  HIGH:     'text-red-400',
  MEDIUM:   'text-amber-400',
  CANTINA:  'text-purple-400',
  SHIPPED:  'text-blue-400',
};

function ExperienceCard({ item, index }: { item: ExperienceItem; index: number }) {
  return (
    <Reveal delay={index * 0.12}>
      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        {/* Left meta */}
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs tracking-widest text-accent">{item.period}</span>
          <h3 className="font-display text-xl font-bold text-white leading-tight">
            {item.title}
          </h3>
          <p className="text-sm text-[#6b7280]">{item.company}</p>
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded border border-white/8 px-2 py-0.5 font-mono text-[10px] tracking-wider text-[#6b7280]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Terminal card */}
        <div className="overflow-hidden rounded-lg border border-white/7 bg-[#0d0d0d]">
          <div className="flex items-center justify-between border-b border-white/6 px-4 py-2.5">
            <div className="flex items-center gap-1.5" aria-hidden>
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="font-mono text-[10px] tracking-widest text-[#6b7280]">
              {item.logFile}
            </span>
            <div className="w-14" />
          </div>
          <div className="p-5 font-mono text-[13px] space-y-2">
            {item.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={cn('shrink-0 font-bold', typeColors[h.type])}>
                  [{h.type}]
                </span>
                <span className="text-[#9ca3af] leading-5">{h.text}</span>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-white/6">
              <span className={cn('italic text-xs', typeColors[item.logType])}>
                # {item.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function Experience() {
  return (
    <section id="experience" className="relative py-32 lg:py-40 border-t border-white/6">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-accent mb-4">
            — CORE ARCHITECTURE LOGS
          </p>
          <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-tight tracking-tighter text-white">
            ENGINEERING
            <br />
            <span className="text-[#374151]">EXPERIENCE</span>
          </h2>
        </Reveal>

        {/* Timeline */}
        <div className="relative mt-16">
          {/* Vertical line */}
          <div
            className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-accent/30 via-white/8 to-transparent md:left-[199px]"
            aria-hidden
          />

          <div className="flex flex-col gap-16 pl-6 md:pl-0">
            {experiences.map((exp, i) => (
              <ExperienceCard key={exp.title} item={exp} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
