'use client';

import Link from 'next/link';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/MotionWrapper';
import { cn } from '@/lib/utils';

const auditFindings = [
  {
    slug: 'virtuals-protocol',
    protocol: 'Virtuals Protocol',
    logo: '/VirtualProtocol.webp',
    severity: 'HIGH',
    platform: 'Code4rena',
    platformLogo: '/sherlock.svg',
    rootCause:
      'PublicContributionNft::mint was publicly callable with no access control, allowing any address to invoke it.',
    impact:
      'Attackers could mint arbitrary NFTs and manipulate contribution accounting, resulting in cascading fund loss throughout the protocol.',
  },
  {
    slug: 'silo-finance',
    protocol: 'Silo Finance',
    logo: '/Silo.webp',
    severity: 'MEDIUM',
    platform: 'Code4rena',
    platformLogo: '/sherlock.svg',
    rootCause:
      'deposit(), withdraw(), and redeem() lacked slippage protection and deadline validation parameters.',
    impact:
      'Users exposed to sandwich attacks and stale transaction execution at unfavorable prices.',
  },
  {
    slug: 'liquid-ron',
    protocol: 'Liquid Ron',
    logo: '/Liquid.svg',
    severity: 'MEDIUM',
    platform: 'Code4rena',
    platformLogo: '/sherlock.svg',
    rootCause:
      'Incorrect onlyOperator authorization logic used the wrong address for role comparison.',
    impact:
      'Authorized operators permanently blocked from executing critical protocol functionality, causing denial-of-service.',
  },
  {
    slug: 'aegis-yusd',
    protocol: 'Aegis.im YUSD',
    logo: '/aegis.svg',
    severity: 'HIGH',
    platform: 'Sherlock',
    platformLogo: '/sherlock.webp',
    rootCause:
      '_untrackedAvailableAssetBalance is shared between approveRedeem and depositIncome with no earmarking — fund manager can consume redemption collateral to mint reward YUSD.',
    impact:
      'Pending redemptions fail with NotEnoughFunds while unbacked YUSD rewards are minted, violating the 1:1 redemption guarantee.',
  },
  {
    slug: 'jigsaw-protocol',
    protocol: 'Jigsaw Protocol',
    logo: '/jigsaw.jpeg',
    severity: 'MEDIUM',
    platform: 'Cantina',
    platformLogo: '/cantina.webp',
    rootCause:
      'liquidate() caps collateralUsed to the holding balance but never scales down the jUSD burned to match — liquidators burn more jUSD than the seized collateral is worth.',
    impact:
      'Guaranteed liquidator loss on any undercollateralized position destroys the liquidation incentive, leaving bad debt permanently unresolved and the protocol insolvent.',
  },
];

type Finding = typeof auditFindings[0];

function AuditCard({ finding }: { finding: Finding }) {
  const isHigh = finding.severity === 'HIGH';

  return (
    <StaggerItem>
      <Link href={`/audits/${finding.slug}`} className="block h-full">
      <div
        className={cn(
          'group relative flex h-full flex-col rounded-lg border border-white/7 bg-[#0d0d0d] p-6',
          'transition-all duration-300 hover:border-white/14 cursor-pointer',
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

        {/* ── Footer ── */}
        <div className="mt-5 flex items-center justify-end border-t border-white/6 pt-4">
          <span className="font-mono text-[10px] tracking-widest text-[#6b7280] group-hover:text-accent transition-colors">
            VIEW REPORT →
          </span>
        </div>
      </div>
      </Link>
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
