'use client';

import { Mail, ExternalLink, GitFork } from 'lucide-react';
import { Reveal } from '@/components/ui/MotionWrapper';
import { TerminalWindow } from '@/components/ui/TerminalWindow';
import { useTypingEffect } from '@/hooks/useTypingEffect';

const CONTACT_LINES = [
  "session: protocol_handshake",
  "",
  "$ loading engineer profile...",
  "",
  "→ Smart Contract Engineer",
  "→ Web3 Security Researcher",
  "→ Cosmos SDK Protocol Builder",
  "→ Distributed Systems Enthusiast",
  "",
  "SMART_CONTRACT_SECURITY",
  "",
  "SPECIALIZATIONS:",
  "SOLIDITY • FOUNDRY",
  "COSMOS SDK • IBC",
  "DEFI ARCHITECTURE",
  "AUDIT RESEARCH",
  "",
  "STATUS: BUILDING",
];

function ContactTerminal() {
  const { displayedLines, isComplete } = useTypingEffect({
    lines: CONTACT_LINES,
    typingSpeed: 35,
    pauseBetween: 400,
  });

  return (
    <TerminalWindow title="session: encrypted_handshake">
      <div className="space-y-2 text-[13px] min-h-40">
        {CONTACT_LINES.map((line, i) => {
          const displayed = displayedLines[i];
          if (!displayed && i > 0) return null;
          const isLast = i === CONTACT_LINES.length - 1;
          const isGreen = line.startsWith('→');

          return (
            <div
              key={i}
              className={
                isLast
                  ? 'text-accent font-bold'
                  : isGreen
                  ? 'text-muted-2'
                  : 'text-accent'
              }
            >
              {displayed ?? ''}
              {i === displayedLines.length - 1 && !isComplete && (
                <span className="cursor-blink inline-block h-4 w-2 bg-current align-middle ml-0.5" />
              )}
            </div>
          );
        })}

        {isComplete && (
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="mailto:preetsinghmakkar154@gmail.com"
              className="flex items-center gap-2 rounded border border-white/12 bg-white/4 px-4 py-2 font-mono text-xs font-bold tracking-widest text-muted-2 transition-all duration-200 hover:border-accent hover:bg-accent/8 hover:text-accent hover:shadow-[0_0_12px_rgba(0,255,102,0.15)]"
              aria-label="Send email"
            >
              <Mail className="h-3.5 w-3.5" />
              EMAIL ME
            </a>
            <a
              href="https://www.linkedin.com/in/preet-singh-a65967302/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded border border-white/12 bg-white/4 px-4 py-2 font-mono text-xs font-bold tracking-widest text-muted-2 transition-all duration-200 hover:border-accent hover:bg-accent/8 hover:text-accent hover:shadow-[0_0_12px_rgba(0,255,102,0.15)]"
              aria-label="LinkedIn profile"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              LINKEDIN
            </a>
            <a
              href="https://github.com/preetsinghmakkar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded border border-white/12 bg-white/4 px-4 py-2 font-mono text-xs font-bold tracking-widest text-muted-2 transition-all duration-200 hover:border-accent hover:bg-accent/8 hover:text-accent hover:shadow-[0_0_12px_rgba(0,255,102,0.15)]"
              aria-label="GitHub profile"
            >
              <GitFork className="h-3.5 w-3.5" />
              GITHUB
            </a>
          </div>
        )}

        <div className="mt-4 flex justify-between border-t border-white/6 pt-2 font-mono text-[10px] text-[#374151]">
          <span>NODE_STATUS: SYNCED</span>
          <span>PEER_ID: PS_PROTOCOL_001</span>
        </div>
      </div>
    </TerminalWindow>
  );
}

const stats = [
  { label: 'PERFORMANCE METRICS', value: '99.99%', sub: 'UPTIME: MAINNET STABILIZED', icon: '◎' },
  { label: 'SECURITY PROTOCOL', value: 'AES-256-GCM', sub: 'ENCRYPTION: ENTERPRISE LAYER', icon: '◈' },
];

export function Contact() {
  return (
    <section id="contact" className="relative py-32 lg:py-40 border-t border-white/6">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-accent mb-4">
            — /DEV/COLLABORATION
          </p>
          <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-tight tracking-tighter text-white">
            CONNECT TO
            <br />
            THE <span className="text-accent">NODE.</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Terminal */}
          <Reveal delay={0.15} variant="slideRight">
            <ContactTerminal />
          </Reveal>

          {/* Stats */}
          <Reveal delay={0.25}>
            <div className="flex flex-col gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border border-white/7 bg-surface p-6 transition-colors hover:border-border-green"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] tracking-widest text-muted">
                      {s.label}
                    </span>
                    <span className="text-accent text-lg">{s.icon}</span>
                  </div>
                  <div className="font-display text-3xl font-bold text-white mb-1">
                    {s.value}
                  </div>
                  <div className="font-mono text-[11px] tracking-wider text-accent">
                    {s.sub}
                  </div>
                </div>
              ))}

              <div className="rounded-lg border border-white/7 bg-surface p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] tracking-widest text-muted">
                    REGISTRY
                  </span>
                  <span className="text-accent text-sm">↗</span>
                </div>
                <p className="text-sm leading-6 text-muted-2">
                  Currently accepting select high-impact projects in the Cosmos ecosystem. Priority
                  given to validator infrastructure, IBC integrations, and decentralised governance
                  solutions.
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.35}>
          <p className="mt-16 text-center font-mono text-xs tracking-widest text-[#374151]">
            END OF TRANSMISSION
          </p>
        </Reveal>
      </div>
    </section>
  );
}
