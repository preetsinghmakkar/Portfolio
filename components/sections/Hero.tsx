'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { marqueeItems } from '@/data/portfolio';
import { TerminalWindow, BlinkCursor } from '@/components/ui/TerminalWindow';
import { TechIcon } from '@/components/ui/TechIcon';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const TERMINAL_SEQUENCE = [
  { type: 'cmd', text: 'validator verify cosmos1abc...f92a' },
  { type: 'comment', text: '# Initiating consensus proof sequence...' },
  { type: 'blank', text: '' },
  { type: 'field', label: 'status:', value: 'ACTIVE', accent: true },
  { type: 'field', label: 'network:', value: 'Cosmos Hub Mainnet', accent: false },
  { type: 'field', label: 'version:', value: 'v0.47.5+commit.a94fc47', accent: false },
  { type: 'field', label: 'uptime:', value: '99.99%', accent: true },
  { type: 'blank', text: '' },
  { type: 'divider', text: 'VOTING_POWER  |  BLOCK_HEIGHT' },
  { type: 'values', text: '4.2%         |  19,420,084' },
];

function AnimatedTerminal() {
  const [visibleLines, setVisibleLines] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) { setVisibleLines(TERMINAL_SEQUENCE.length); return; }
    let i = 0;
    const tick = () => {
      i++;
      setVisibleLines(i);
      if (i < TERMINAL_SEQUENCE.length) setTimeout(tick, 380);
    };
    const t = setTimeout(tick, 600);
    return () => clearTimeout(t);
  }, [reduced]);

  return (
    <TerminalWindow title="bash — node-admin@preet_singh" className="w-full">
      <div className="space-y-1.5 text-[13px]">
        {TERMINAL_SEQUENCE.slice(0, visibleLines).map((line, i) => {
          if (line.type === 'cmd') {
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-accent">$</span>
                <span className="text-[#9ca3af]">{line.text}</span>
              </div>
            );
          }
          if (line.type === 'comment') {
            return <div key={i} className="text-[#6b7280] italic">{line.text}</div>;
          }
          if (line.type === 'blank') {
            return <div key={i} className="h-1" />;
          }
          if (line.type === 'field') {
            return (
              <div key={i} className="flex gap-3">
                <span className="w-20 shrink-0 text-[#6b7280]">{line.label}</span>
                <span className={line.accent ? 'text-accent font-semibold' : 'text-[#9ca3af]'}>
                  {line.value}
                </span>
              </div>
            );
          }
          if (line.type === 'divider') {
            return (
              <div key={i} className="mt-2 pt-2 border-t border-white/8 text-[#6b7280] text-xs tracking-wider">
                {line.text}
              </div>
            );
          }
          if (line.type === 'values') {
            return (
              <div key={i} className="text-[#9ca3af]">
                {(line.text ?? '').split('|').map((part, pi) => (
                  <span key={pi}>
                    {pi === 0 ? (
                      <span className="text-accent font-semibold">{part.trim()}</span>
                    ) : (
                      <span>  |  {part.trim()}</span>
                    )}
                  </span>
                ))}
              </div>
            );
          }
          return null;
        })}
        {visibleLines < TERMINAL_SEQUENCE.length ? null : (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-accent">$</span>
            <BlinkCursor />
          </div>
        )}
      </div>
    </TerminalWindow>
  );
}

function MarqueeStrip() {
  const doubled = [...marqueeItems, ...marqueeItems];
  return (
    <div
      className="overflow-hidden border-t border-b border-white/6 py-3"
      aria-hidden
    >
      <div className="animate-marquee flex gap-12">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="shrink-0 flex items-center gap-1.5 font-mono text-xs tracking-widest text-[#6b7280] hover:text-accent transition-colors cursor-default"
          >
            {item.icon && (
              <TechIcon name={item.icon} className="h-3.5 w-3.5 opacity-70" />
            )}
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  const reduced = useReducedMotion();

  const fadeProps = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section
      id="about"
      className="relative min-h-screen grid-bg flex flex-col"
      aria-label="Hero"
    >
      {/* Main content */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center gap-12 px-6 pt-24 pb-12 lg:flex-row lg:items-center lg:gap-16 lg:px-12">
        {/* Left column */}
        <div className="flex flex-col gap-6 lg:flex-1">

          {/* Status pill — in normal flow so it never overlaps the title */}
          <motion.div
            className="flex w-fit items-center gap-2 rounded-full border border-white/8 bg-[#0d0d0d] px-4 py-2.5"
            {...fadeProps(0.2)}
          >
            <span className="relative flex h-2 w-2">
              <span className="status-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="font-mono text-[11px] tracking-widest text-[#9ca3af]">
              SYSTEM STATUS: OPTIMAL
            </span>
          </motion.div>

          <motion.div className="space-y-0" {...fadeProps(0.3)}>
            <h1 className="font-display text-[clamp(2.6rem,7.5vw,6rem)] font-extrabold leading-[0.92] tracking-tighter text-white">
              BLOCKCHAIN
            </h1>
            <h1 className="font-display text-[clamp(2.6rem,7.5vw,6rem)] font-extrabold leading-[0.92] tracking-tighter text-[#374151] pl-[10%]">
              &
            </h1>
            <h1 className="font-display text-[clamp(2.6rem,7.5vw,6rem)] font-extrabold leading-[0.92] tracking-tighter text-accent">
              PROTOCOLS
            </h1>
          </motion.div>

          <motion.p
            className="max-w-md text-base leading-7 text-[#9ca3af]"
            {...fadeProps(0.45)}
          >
            Architecting secure, scalable distributed systems for the sovereign
            internet. Specializing in{' '}
            <span className="text-white">Cosmos SDK</span>,{' '}
            <span className="text-white">CometBFT</span>,{' '}
            <span className="text-white">IBC</span>,{' '}
            <span className="text-white">Solana</span>,{' '}
            <span className="text-white">smart contract security</span>, and{' '}
            <span className="text-white">cross-chain IBC protocols</span>.
          </motion.p>

          <motion.div className="flex flex-wrap gap-4" {...fadeProps(0.55)}>
            <a
              href="/Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 rounded border border-accent bg-accent px-6 py-3 font-mono text-xs font-bold tracking-widest text-black transition-all hover:bg-transparent hover:text-accent"
            >
              RESUME
            </a>
            <a
              href="https://github.com/preetsinghmakkar"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 rounded border border-white/20 bg-black px-6 py-3 font-mono text-xs font-bold tracking-widest text-white transition-all hover:border-white/40 hover:text-accent"
            >
              GITHUB
            </a>
          </motion.div>
        </div>

        {/* Right column – Terminal */}
        <motion.div className="lg:flex-1 lg:max-w-[520px] w-full" {...fadeProps(0.5)}>
          <AnimatedTerminal />
        </motion.div>
      </div>

      {/* Marquee */}
      <MarqueeStrip />
    </section>
  );
}
