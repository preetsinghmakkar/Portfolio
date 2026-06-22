'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type AuditFinding, auditFindings } from '@/data/auditData';
import { SolidityHighlight } from '@/components/ui/SolidityHighlight';

// ─── Shared primitives ────────────────────────────────────────────────────────

function fade(delay = 0) {
  return {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  };
}

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-8">
      <span className="font-mono text-[10px] tracking-[0.22em] text-accent">{index} /</span>
      <h2 className="mt-1 font-mono text-xl font-extrabold tracking-tighter text-white sm:text-2xl">
        {title}
      </h2>
      <div className="mt-3 h-px bg-white/6" />
    </div>
  );
}

function Terminal({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/8 bg-[#0a0a0a]">
      <div className="flex items-center gap-1.5 border-b border-white/6 bg-[#070707] px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
        <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-[10px] tracking-widest text-[#6b7280]">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/8 bg-[#0d0f0d]">
      <div className="flex items-center gap-1.5 border-b border-white/6 bg-[#070907] px-4 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff5f57]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#febc2e]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-[10px] tracking-widest text-[#4b5563]">{label}</span>
      </div>
      <pre className="overflow-x-auto p-5 text-[12px] leading-[1.65]">
        <code className="font-mono">
          <SolidityHighlight code={code} />
        </code>
      </pre>
    </div>
  );
}

function DiffBlock({ label, code, type }: { label: string; code: string; type: 'bad' | 'good' }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/8 bg-[#0d0f0d]">
      <div
        className={cn(
          'flex items-center gap-2 border-b border-white/6 px-4 py-2.5',
          type === 'bad' ? 'bg-red-950/25' : 'bg-accent/5',
        )}
      >
        <span className={cn('font-mono text-[10px] font-bold tracking-widest', type === 'bad' ? 'text-red-400' : 'text-accent')}>
          {type === 'bad' ? '— VULNERABLE' : '+ SECURE'}
        </span>
        <span className="font-mono text-[10px] text-[#4b5563]">{label}</span>
      </div>
      <pre className="overflow-x-auto p-5 text-[12px] leading-[1.65]">
        <code className="font-mono">
          <SolidityHighlight code={code} />
        </code>
      </pre>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: 'HIGH' | 'MEDIUM' }) {
  return (
    <span
      className={cn(
        'rounded border px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.15em]',
        severity === 'HIGH'
          ? 'border-accent/35 bg-accent/8 text-accent'
          : 'border-white/15 bg-white/5 text-[#9ca3af]',
      )}
    >
      {severity}
    </span>
  );
}

// ─── Page sections ────────────────────────────────────────────────────────────

function AuditNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/6 bg-[#050505]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="font-mono text-sm font-bold tracking-widest text-white hover:text-accent transition-colors">
          PREET_SINGH
        </Link>
        <Link
          href="/#audits"
          className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-[#6b7280] hover:text-accent transition-colors"
        >
          <span>←</span>
          <span>BACK TO AUDITS</span>
        </Link>
      </div>
    </nav>
  );
}

function Header({ f }: { f: AuditFinding }) {
  return (
    <div className="border-b border-white/6 bg-[#050505] pt-16 pb-12">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <motion.div {...fade(0.1)} className="flex items-start gap-4 mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={f.logo} alt={f.protocol} className="h-12 w-12 rounded-xl border border-white/10 object-contain bg-white/5 p-1.5" />
          <div>
            <p className="font-mono text-[10px] tracking-[0.22em] text-[#6b7280] mb-1">{f.platform} · {f.findingId} · {f.date}</p>
            <h1 className="font-mono text-2xl font-extrabold tracking-tighter text-white sm:text-3xl">{f.protocol}</h1>
          </div>
        </motion.div>

        <motion.div {...fade(0.2)}>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <SeverityBadge severity={f.severity} />
            <span className="rounded border border-accent/20 bg-accent/5 px-2.5 py-1 font-mono text-[10px] text-accent">
              ✓ {f.status}
            </span>
            {f.platformLogo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.platformLogo} alt={f.platform} className="h-5 w-5 object-contain opacity-50" />
            )}
          </div>
          <p className="max-w-3xl font-mono text-[13px] leading-6 text-[#6b7280]">
            <span className="text-accent">// </span>
            {f.title}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function ExecSummary({ f }: { f: AuditFinding }) {
  const rows = [
    ['ISSUE OVERVIEW', f.summary.overview],
    ['AFFECTED COMPONENT', f.summary.affectedComponent],
    ['RISK CLASSIFICATION', f.summary.riskClassification],
    ['SEVERITY', f.severity],
    ['STATUS', f.status],
  ];
  return (
    <motion.section {...fade(0.25)} className="py-16 border-b border-white/6">
      <SectionLabel index="01" title="EXECUTIVE SUMMARY" />
      <Terminal title="EXECUTIVE_SUMMARY.log">
        <div className="space-y-3">
          {rows.map(([k, v]) => (
            <div key={k} className="flex gap-4">
              <span className="w-44 shrink-0 font-mono text-[10px] tracking-widest text-[#6b7280]">{k}</span>
              <span
                className={cn(
                  'font-mono text-[11px] leading-5',
                  k === 'SEVERITY'
                    ? f.severity === 'HIGH' ? 'text-accent' : 'text-[#9ca3af]'
                    : k === 'STATUS' ? 'text-accent' : 'text-[#9ca3af]',
                )}
              >
                <span className="text-accent/50 mr-1">›</span>
                {v}
              </span>
            </div>
          ))}
        </div>
      </Terminal>
    </motion.section>
  );
}

function RootCause({ f }: { f: AuditFinding }) {
  return (
    <motion.section {...fade(0.3)} className="py-16 border-b border-white/6">
      <SectionLabel index="02" title="ROOT CAUSE ANALYSIS" />
      <Terminal title="ROOT_CAUSE_ANALYSIS.log">
        <p className="mb-5 text-sm leading-6 text-[#9ca3af]">{f.rootCause.description}</p>
        <CodeBlock label={f.rootCause.vulnerableCode.label} code={f.rootCause.vulnerableCode.code} />
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-3 font-mono text-[10px] tracking-[0.2em] text-[#6b7280]">
              <span className="text-accent/50">▸</span> INCORRECT ASSUMPTIONS
            </p>
            <ul className="space-y-2">
              {f.rootCause.incorrectAssumptions.map((a, i) => (
                <li key={i} className="flex gap-2 text-xs leading-5 text-[#9ca3af]">
                  <span className="shrink-0 text-accent/40">—</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 font-mono text-[10px] tracking-[0.2em] text-[#6b7280]">
              <span className="text-accent/50">▸</span> AFFECTED CONTRACTS
            </p>
            <ul className="space-y-2">
              {f.rootCause.affectedContracts.map((c, i) => (
                <li key={i} className="font-mono text-[11px] text-accent/70">{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </Terminal>
    </motion.section>
  );
}

function AttackScenario({ f }: { f: AuditFinding }) {
  return (
    <motion.section {...fade(0.3)} className="py-16 border-b border-white/6">
      <SectionLabel index="03" title="ATTACK SCENARIO" />
      <Terminal title={`ATTACK_VECTOR — ${f.attackScenario.title}`}>
        <div className="space-y-0">
          {f.attackScenario.steps.map((step, i) => {
            const last = i === f.attackScenario.steps.length - 1;
            return (
              <div key={i} className="flex gap-5">
                <div className="flex flex-col items-center pt-0.5">
                  <span className="font-mono text-[11px] font-bold text-accent">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {!last && <div className="mt-1.5 mb-1.5 w-px flex-1 bg-accent/15" />}
                </div>
                <div className={cn('pb-5', last && 'pb-0')}>
                  <p className="text-sm leading-6 text-[#9ca3af]">{step}</p>
                  {!last && (
                    <span className="mt-1 block font-mono text-[10px] text-accent/40">↓</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Terminal>
    </motion.section>
  );
}

function ImpactAssessment({ f }: { f: AuditFinding }) {
  return (
    <motion.section {...fade(0.3)} className="py-16 border-b border-white/6">
      <SectionLabel index="04" title="IMPACT ASSESSMENT" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {f.impact.map((item) => (
          <div
            key={item.category}
            className={cn(
              'rounded-lg border p-5 transition-all duration-300',
              item.level === 'HIGH'
                ? 'border-accent/20 bg-accent/5 hover:border-accent/35'
                : 'border-white/8 bg-[#0d0d0d] hover:border-white/15',
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={cn(
                  'font-mono text-[9px] font-bold tracking-[0.2em]',
                  item.level === 'HIGH' ? 'text-accent' : 'text-[#9ca3af]',
                )}
              >
                {item.level}
              </span>
            </div>
            <h4 className="font-mono text-xs font-bold text-white mb-2">{item.category}</h4>
            <p className="text-xs leading-5 text-[#6b7280]">{item.description}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

function Mitigation({ f }: { f: AuditFinding }) {
  return (
    <motion.section {...fade(0.3)} className="py-16 border-b border-white/6">
      <SectionLabel index="05" title="MITIGATION" />
      <p className="mb-6 max-w-2xl text-sm leading-6 text-[#9ca3af]">{f.mitigation.description}</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <DiffBlock label="implementation" code={f.mitigation.vulnerableCode} type="bad" />
        <DiffBlock label="implementation" code={f.mitigation.fixedCode} type="good" />
      </div>
      <div className="mt-6 rounded-lg border border-white/8 bg-[#0a0a0a] p-5">
        <p className="mb-3 font-mono text-[10px] tracking-[0.2em] text-[#6b7280]">
          <span className="text-accent/50">▸</span> SECURITY CONSIDERATIONS
        </p>
        <ul className="space-y-2">
          {f.mitigation.considerations.map((c, i) => (
            <li key={i} className="flex gap-2 text-xs leading-5 text-[#9ca3af]">
              <span className="shrink-0 font-mono text-accent/50">{String(i + 1).padStart(2, '0')}.</span>
              {c}
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}

function ResearcherNotes({ f }: { f: AuditFinding }) {
  return (
    <motion.section {...fade(0.3)} className="py-16 border-b border-white/6">
      <SectionLabel index="06" title="RESEARCHER NOTES" />
      <Terminal title="RESEARCHER_NOTES.md">
        <div className="mb-3 flex items-center gap-2">
          <span className="font-mono text-[10px] text-accent">@preetsinghmakkar</span>
          <span className="font-mono text-[10px] text-[#6b7280]">— personal analysis</span>
        </div>
        <div className="space-y-4 border-l border-accent/20 pl-4">
          {f.researcherNotes.map((note, i) => (
            <p key={i} className="text-sm leading-7 text-[#9ca3af]">
              {note}
            </p>
          ))}
        </div>
      </Terminal>
    </motion.section>
  );
}

function Resources({ f }: { f: AuditFinding }) {
  const links = [
    f.reportLink !== '#' && { label: 'OFFICIAL REPORT', href: f.reportLink },
    f.websiteLink && { label: 'PROTOCOL WEBSITE', href: f.websiteLink },
    f.githubLink && { label: 'GITHUB', href: f.githubLink },
  ].filter(Boolean) as { label: string; href: string }[];

  if (!links.length) return null;

  return (
    <motion.section {...fade(0.3)} className="py-16 border-b border-white/6">
      <SectionLabel index="07" title="RESOURCES" />
      <div className="flex flex-wrap gap-3">
        {links.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-white/15 bg-[#0d0d0d] px-5 py-2.5 font-mono text-[11px] font-bold tracking-widest text-white transition-all hover:border-accent/40 hover:text-accent"
          >
            {label} ↗
          </a>
        ))}
      </div>
    </motion.section>
  );
}

function RelatedFindings({ current }: { current: AuditFinding }) {
  const others = auditFindings.filter((f) => f.slug !== current.slug);
  return (
    <motion.section {...fade(0.3)} className="py-16">
      <SectionLabel index="08" title="RELATED FINDINGS" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {others.map((f) => (
          <Link
            key={f.slug}
            href={`/audits/${f.slug}`}
            className="group rounded-lg border border-white/7 bg-[#0d0d0d] p-5 transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_24px_rgba(0,255,102,0.04)]"
          >
            <div className="flex items-center gap-3 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.logo} alt={f.protocol} className="h-7 w-7 rounded-lg border border-white/10 object-contain bg-white/5 p-1" />
              <div>
                <p className="font-mono text-[9px] tracking-widest text-[#6b7280]">{f.platform}</p>
                <p className="font-mono text-xs font-bold text-white">{f.protocol}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <SeverityBadge severity={f.severity} />
              <span className="font-mono text-[10px] text-[#6b7280] group-hover:text-accent transition-colors">VIEW →</span>
            </div>
          </Link>
        ))}
      </div>
    </motion.section>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function AuditDetailPage({ finding }: { finding: AuditFinding }) {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <AuditNav />
      <Header f={finding} />
      <div className="mx-auto max-w-5xl px-6 py-4 lg:px-8">
        <ExecSummary f={finding} />
        <RootCause f={finding} />
        <AttackScenario f={finding} />
        <ImpactAssessment f={finding} />
        <Mitigation f={finding} />
        <ResearcherNotes f={finding} />
        <Resources f={finding} />
        <RelatedFindings current={finding} />
      </div>
    </div>
  );
}
