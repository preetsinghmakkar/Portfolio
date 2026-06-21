'use client';

import { Reveal, Stagger, StaggerItem } from '@/components/ui/MotionWrapper';
import { cn } from '@/lib/utils';

const auditFindings = [
  {
    protocol: 'Virtuals Protocol',
    logo: '/VirtualProtocol.webp',
    severity: 'HIGH',
    platform: 'Sherlock',
    platformLogo: '/sherlock.svg',
    rootCause:
      'PublicContributionNft::mint was publicly callable with no access control, allowing any address to invoke it.',
    impact:
      'Attackers could mint arbitrary NFTs and manipulate contribution accounting, resulting in cascading fund loss throughout the protocol.',
  },
  {
    protocol: 'Silo Finance',
    logo: '/Silo.webp',
    severity: 'MEDIUM',
    platform: 'Sherlock',
    platformLogo: '/sherlock.svg',
    rootCause:
      'deposit(), withdraw(), and redeem() lacked slippage protection and deadline validation parameters.',
    impact:
      'Users exposed to sandwich attacks and stale transaction execution at unfavorable prices.',
  },
  {
    protocol: 'Liquid Ron',
    logo: '/Liquid.svg',
    severity: 'MEDIUM',
    platform: 'Sherlock',
    platformLogo: '/sherlock.svg',
    rootCause:
      'Incorrect onlyOperator authorization logic used the wrong address for role comparison.',
    impact:
      'Authorized operators permanently blocked from executing critical protocol functionality, causing denial-of-service.',
  },
  {
    protocol: 'Aegis.im YUSD',
    logo: '/aegis.svg',
    severity: 'MEDIUM',
    platform: 'Cantina',
    platformLogo: '/cantina.webp',
    rootCause:
      'Shared asset accounting allowed multiple positions to draw against identical collateral simultaneously.',
    impact:
      'Protocol insolvency through undercollateralization — bad debt accumulates silently with no liquidation trigger.',
  },
  {
    protocol: 'Jigsaw Protocol',
    logo: '/jigsaw.jpeg',
    severity: 'MEDIUM',
    platform: 'Cantina',
    platformLogo: '/cantina.webp',
    rootCause:
      'Missing health-factor checks during repayment flow allowed positions to skip mandatory solvency validation.',
    impact:
      'Undercollateralized positions became permanently non-liquidatable, locking protocol bad debt with no recovery path.',
  },
];

type Finding = typeof auditFindings[0];

function AuditCard({ finding }: { finding: Finding }) {
  const isHigh = finding.severity === 'HIGH';

  return (
    <StaggerItem>
      <div
        className={cn(
          'group relative flex h-full flex-col rounded-lg border border-white/7 bg-[#0d0d0d] p-6',
          'transition-all duration-300 hover:border-white/14',
          isHigh && 'hover:shadow-[0_0_40px_rgba(0,255,102,0.04)]',
        )}
      >
        {/* ── Header ── */}
        <div className="mb-5 flex items-start justify-between gap-3">
          {/* Protocol logo + name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={finding.logo}
                alt={finding.protocol}
                className="h-8 w-8 object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[9px] tracking-[0.18em] text-[#6b7280] uppercase mb-0.5">
                {finding.platform}
              </p>
              <h3 className="font-mono text-sm font-bold text-white leading-tight truncate">
                {finding.protocol}
              </h3>
            </div>
          </div>

          {/* Platform logo + severity */}
          <div className="flex shrink-0 flex-col items-end gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={finding.platformLogo}
              alt={finding.platform}
              className="h-5 w-5 object-contain opacity-50 group-hover:opacity-75 transition-opacity"
            />
            <span
              className={cn(
                'rounded border px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.15em]',
                isHigh
                  ? 'border-accent/35 bg-accent/6 text-accent'
                  : 'border-white/14 bg-white/4 text-[#9ca3af]',
              )}
            >
              {finding.severity}
            </span>
          </div>
        </div>

        {/* ── Root Cause ── */}
        <div className="mb-4">
          <p className="mb-1.5 flex items-center gap-1.5 font-mono text-[9px] tracking-[0.18em] text-[#6b7280]">
            <span className="text-accent/50">▸</span>
            ROOT CAUSE
          </p>
          <p className="border-l border-white/8 pl-3 text-xs leading-5 text-[#9ca3af]">
            {finding.rootCause}
          </p>
        </div>

        {/* ── Impact ── */}
        <div className="flex-1">
          <p className="mb-1.5 flex items-center gap-1.5 font-mono text-[9px] tracking-[0.18em] text-[#6b7280]">
            <span className="text-accent/50">▸</span>
            IMPACT
          </p>
          <p className="border-l border-white/8 pl-3 text-xs leading-5 text-[#9ca3af]">
            {finding.impact}
          </p>
        </div>
      </div>
    </StaggerItem>
  );
}

export function AuditFindings() {
  return (
    <section id="audits" className="relative py-32 lg:py-40 border-t border-white/6">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">

        <Reveal>
          <p className="font-mono text-xs tracking-widest text-accent mb-4">
            — SECURITY_RESEARCH_LOG
          </p>
          <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-tight tracking-tighter text-white">
            AUDIT
            <br />
            <span className="text-[#374151]">FINDINGS</span>
          </h2>
        </Reveal>

        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {auditFindings.map((finding) => (
            <AuditCard key={finding.protocol} finding={finding} />
          ))}
        </Stagger>

      </div>
    </section>
  );
}
