'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { marqueeItems } from '@/data/portfolio';
import { TerminalWindow, BlinkCursor } from '@/components/ui/TerminalWindow';
import { TechIcon } from '@/components/ui/TechIcon';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const TERMINAL_SEQUENCE = [
  { type: 'cmd',     text: 'forge script script/Deploy.s.sol --network polygon --broadcast' },
  { type: 'comment', text: '# Connecting to Polygon mainnet (chain 137)...' },
  { type: 'blank',   text: '' },
  { type: 'field',   label: 'Network  :', value: 'Polygon mainnet (chain 137)', accent: false },
  { type: 'field',   label: 'Admin    :', value: '0x6cCf36a7...9e29', accent: false },
  { type: 'field',   label: 'Borrower :', value: '0xDFe588a3...667E', accent: false },
  { type: 'field',   label: 'USDC     :', value: '0x3c499c54...3359', accent: false },
  { type: 'field',   label: 'WETH     :', value: '0x7ceB23fD...f619', accent: false },
  { type: 'blank',   text: '' },
  { type: 'phase',   text: '[ADMIN 1/7] Deploying implementation contracts...' },
  { type: 'deploy',  label: '  MarketImpl        :', value: '0xaB72BDdD...5528' },
  { type: 'deploy',  label: '  EscrowImpl        :', value: '0xA8d01649...0E78' },
  { type: 'deploy',  label: '  OfferBookImpl     :', value: '0xd5b86aA5...bd5a' },
  { type: 'deploy',  label: '  LiquidityQueueImpl:', value: '0x6247D163...728e' },
  { type: 'blank',   text: '' },
  { type: 'phase',   text: '[ADMIN 2/7] Deploying Factory...' },
  { type: 'deploy',  label: '  Factory           :', value: '0xF51101c9...f3F4' },
  { type: 'phase',   text: '[ADMIN 3/7] ArchController + borrower whitelist...' },
  { type: 'deploy',  label: '  ArchController    :', value: '0x29D18742...c97b' },
  { type: 'comment', text: '  Blacklisted: USDC.e (deprecated), MaticX (rebase)' },
  { type: 'blank',   text: '' },
  { type: 'phase',   text: '[ADMIN 4/7] Deploying core contracts...' },
  { type: 'deploy',  label: '  PositionNFT       :', value: '0xc685f0F5...c485' },
  { type: 'deploy',  label: '  Liquidator        :', value: '0x6bf84c9a...F7f' },
  { type: 'deploy',  label: '  ReputationRegistry:', value: '0x3895D539...B3C' },
  { type: 'blank',   text: '' },
  { type: 'phase',   text: '[ADMIN 5-7] Wiring factory + confirming ownership...' },
  { type: 'ok',      text: '  ArchController owner: 0x6cCf36a7...9e29 ✓' },
  { type: 'ok',      text: '  Factory owner       : 0x6cCf36a7...9e29 ✓' },
  { type: 'blank',   text: '' },
  { type: 'phase',   text: '[BORROWER 1/1] Deploying WETH/USDC market...' },
  { type: 'deploy',  label: '  Market (WETH/USDC) :', value: '0x7CDA02dA...c82' },
  { type: 'blank',   text: '' },
  { type: 'success', text: '✓ DEPLOYMENT COMPLETE — 5 protocol contracts + 1 market' },
  { type: 'ok',      text: '  Network: Polygon mainnet · Verified on Polygonscan' },
];

function AnimatedTerminal() {
  const [visibleLines, setVisibleLines] = useState(0);
  const reduced = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) { setVisibleLines(TERMINAL_SEQUENCE.length); return; }
    let i = 0;
    const tick = () => {
      i++;
      setVisibleLines(i);
      if (i < TERMINAL_SEQUENCE.length) setTimeout(tick, 120);
    };
    const t = setTimeout(tick, 400);
    return () => clearTimeout(t);
  }, [reduced]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleLines]);

  return (
    <TerminalWindow title="forge script Deploy.s.sol --network polygon --broadcast" className="w-full">
      <div ref={scrollRef} className="h-[420px] overflow-y-auto space-y-1 text-[12px] leading-5 pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {TERMINAL_SEQUENCE.slice(0, visibleLines).map((line, i) => {
          if (line.type === 'cmd') return (
            <div key={i} className="flex items-start gap-2">
              <span className="shrink-0 text-accent">$</span>
              <span className="text-[#9ca3af] break-all">{line.text}</span>
            </div>
          );
          if (line.type === 'comment') return (
            <div key={i} className="text-[#4b5563] italic">{line.text}</div>
          );
          if (line.type === 'blank') return <div key={i} className="h-1.5" />;
          if (line.type === 'field') return (
            <div key={i} className="flex gap-2">
              <span className="w-24 shrink-0 font-mono text-[11px] text-[#6b7280]">{line.label}</span>
              <span className="font-mono text-[11px] text-[#9ca3af]">{line.value}</span>
            </div>
          );
          if (line.type === 'phase') return (
            <div key={i} className="mt-0.5 font-mono text-[11px] font-semibold text-accent/80">{line.text}</div>
          );
          if (line.type === 'deploy') return (
            <div key={i} className="flex gap-2">
              <span className="shrink-0 font-mono text-[11px] text-[#6b7280]">{line.label}</span>
              <span className="font-mono text-[11px] text-accent">{line.value}</span>
            </div>
          );
          if (line.type === 'ok') return (
            <div key={i} className="font-mono text-[11px] text-[#9ca3af]">{line.text}</div>
          );
          if (line.type === 'success') return (
            <div key={i} className="mt-1 font-mono text-[12px] font-bold text-accent">{line.text}</div>
          );
          return null;
        })}
        {visibleLines < TERMINAL_SEQUENCE.length ? null : (
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-accent text-[12px]">$</span>
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
            className="max-w-xl text-sm leading-7 text-muted-2"
            {...fadeProps(0.45)}
          >
            Architecting secure and scalable decentralized systems across{' '}
            <span className="text-white">EVM Layer 1, Layer 2</span>, and{' '}
            <span className="text-white">Cosmos</span> ecosystems. Specializing in{' '}
            <span className="text-accent">Solidity</span>,{' '}
            <span className="text-white">smart contract security</span>,{' '}
            <span className="text-white">Foundry/Echidna fuzz testing</span>,{' '}
            <span className="text-white">DeFi protocols</span>,{' '}
            <span className="text-white">ERC standards</span>{' '}
            <span className="text-muted">(ERC-20, ERC-721, ERC-4626)</span>,{' '}
            <span className="text-white">UUPS upgradeable proxy architectures</span>, and blockchain
            infrastructure across{' '}
            <span className="text-white">Ethereum</span>,{' '}
            <span className="text-white">Polygon</span>,{' '}
            <span className="text-white">Cosmos SDK</span>,{' '}
            <span className="text-white">CometBFT</span>, and{' '}
            <span className="text-white">cross-chain interoperability protocols</span>.
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
        <motion.div className="lg:flex-1 lg:max-w-145 w-full" {...fadeProps(0.5)}>
          <AnimatedTerminal />
        </motion.div>
      </div>

      {/* Marquee */}
      <MarqueeStrip />
    </section>
  );
}
