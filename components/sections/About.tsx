'use client';

import { Reveal, Stagger, StaggerItem } from '@/components/ui/MotionWrapper';
import { TerminalWindow } from '@/components/ui/TerminalWindow';
import { Shield, Cpu, Network } from 'lucide-react';

const pillars = [
  {
    icon: Shield,
    title: 'Security-First',
    body: 'Security is a fundamental design principle. I focus on smart contract correctness through manual reviews, adversarial thinking, comprehensive testing, and advanced fuzzing methodologies.',
  },
  {
    icon: Cpu,
    title: 'Performance Engineering',
    body: 'Developing decentralized systems across EVM and Cosmos ecosystems, with experience in Solidity, Foundry, Echidna, and Go-based blockchain development.',
  },
  {
    icon: Network,
    title: 'Interoperability',
    body: 'Exploring and building interoperable blockchain infrastructure, focusing on secure communication, asset settlement, and next-generation decentralized protocols.',
  },
];

export function About() {
  return (
    <section id="about-detail" className="relative py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-accent mb-4">
            — CORE IDENTITY
          </p>
          <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-tight tracking-tighter text-white">
            ENGINEERING
            <br />
            <span className="text-[#374151]">MINDSET</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-16">
          <Reveal delay={0.15} variant="slideRight">
            <div className="space-y-6 text-[#9ca3af] leading-7">
              <p>
               I build secure and scalable blockchain systems across EVM and Cosmos ecosystems. From designing Solidity smart contracts and testing complex protocol logic to developing Cosmos SDK–based chains, I treat security, correctness, and decentralization as fundamental requirements.
              </p>
              <p>
               My work spans the full blockchain development lifecycle: smart contract engineering in Solidity, advanced testing with Foundry and Echidna, protocol security reviews, and blockchain infrastructure development in Go. I operate at the intersection of protocol design, security research, and production-grade blockchain engineering.
              </p>
              <p>
                Currently focused on smart contract security, cross-chain protocols, and next-generation decentralized infrastructure.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.25}>
            <TerminalWindow title="node_identity.sh">
              <div className="space-y-2 text-[13px]">
                {[
                  ['ROLE', 'Protocol Engineer'],
                  ['CHAIN', 'Cosmos Hub // IBC-enabled'],
                  ['CONSENSUS', 'CometBFT v0.38'],
                  ['UPTIME', '99.99%'],
                  ['SLASHING', 'NEVER'],
                  ['FOCUS', 'Cosmos SDK / Go / K8s'],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3">
                    <span className="w-24 shrink-0 text-[#6b7280]">{k}</span>
                    <span className="text-[#9ca3af]">
                      <span className="text-accent">›</span> {v}
                    </span>
                  </div>
                ))}
              </div>
            </TerminalWindow>
          </Reveal>
        </div>

        {/* Pillars */}
        <Stagger className="mt-16 grid gap-5 sm:grid-cols-3">
          {pillars.map(({ icon: Icon, title, body }) => (
            <StaggerItem key={title} className="h-full">
              <div className="group h-full rounded-lg border border-white/7 bg-[#0d0d0d] p-6 transition-all duration-300 hover:border-[rgba(0,255,102,0.2)] hover:bg-[rgba(0,255,102,0.03)]">
                <Icon className="mb-4 h-5 w-5 text-accent" />
                <h3 className="mb-2 font-mono text-xs font-bold tracking-widest text-white">
                  {title.toUpperCase()}
                </h3>
                <p className="text-sm leading-6 text-[#6b7280]">{body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
