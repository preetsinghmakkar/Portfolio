'use client';

import { infraItems } from '@/data/portfolio';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/MotionWrapper';
import { TerminalWindow } from '@/components/ui/TerminalWindow';

const metrics = [
  { label: 'NODES_MANAGED', value: '24+' },
  { label: 'CHAINS_SUPPORTED', value: '12' },
  { label: 'AVG_BLOCK_TIME', value: '5.8s' },
  { label: 'KAFKA_THROUGHPUT', value: '100K/s' },
];

export function Infrastructure() {
  return (
    <section id="infrastructure" className="relative py-32 lg:py-40 border-t border-white/6">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-accent mb-4">
            — INFRA_LAYER
          </p>
          <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-tight tracking-tighter text-white">
            DISTRIBUTED
            <br />
            <span className="text-accent">INFRASTRUCTURE</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Cards */}
          <Stagger className="grid grid-cols-2 gap-4 content-start">
            {infraItems.map((item) => (
              <StaggerItem key={item.name}>
                <div className="group rounded-lg border border-white/7 bg-[#0d0d0d] p-6 transition-all duration-300 hover:border-[rgba(0,255,102,0.2)] hover:bg-[rgba(0,255,102,0.03)]">
                  <div className="mb-3 text-2xl text-accent group-hover:scale-110 transition-transform inline-block">
                    {item.icon}
                  </div>
                  <div className="font-mono text-xs font-bold tracking-widest text-white mb-1">
                    {item.name}
                  </div>
                  <div className="font-mono text-[10px] text-[#6b7280]">
                    {item.description}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          {/* Metrics terminal */}
          <Reveal delay={0.2}>
            <TerminalWindow title="infra_metrics.sh">
              <div className="space-y-4 text-[13px]">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-accent">$</span>
                  <span className="text-[#9ca3af]">kubectl get nodes --all-namespaces</span>
                </div>

                {metrics.map((m) => (
                  <div key={m.label} className="flex items-center gap-3">
                    <span className="w-40 shrink-0 text-[#6b7280]">{m.label}</span>
                    <div className="flex-1 h-px bg-[#1a1a1a]" />
                    <span className="text-accent font-bold">{m.value}</span>
                  </div>
                ))}

                <div className="mt-4 pt-4 border-t border-white/6 space-y-1.5">
                  {[
                    'terraform plan --out=infra.tfplan',
                    '> 12 resources to add, 0 to destroy.',
                    '> Plan: 12 to add, 0 to change.',
                  ].map((line, i) => (
                    <div key={i} className={i === 0 ? 'flex gap-2' : ''}>
                      {i === 0 ? (
                        <>
                          <span className="text-accent">$</span>
                          <span className="text-[#9ca3af]">{line}</span>
                        </>
                      ) : (
                        <span className="text-[#6b7280] italic text-xs pl-4">{line}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TerminalWindow>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
