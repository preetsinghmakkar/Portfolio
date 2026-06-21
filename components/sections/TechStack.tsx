'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { techCategories } from '@/data/portfolio';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/MotionWrapper';
import { TechIcon, hasTechIcon } from '@/components/ui/TechIcon';
import { cn } from '@/lib/utils';

export function TechStack() {
  const [active, setActive] = useState(techCategories[0].name);
  const activeCategory = techCategories.find((c) => c.name === active)!;

  return (
    <section id="stack" className="relative py-32 lg:py-40 border-t border-white/6">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-accent mb-4">
            — TECH_MATRIX
          </p>
          <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-tight tracking-tighter text-white">
            ENGINEERING
            <br />
            <span className="text-[#374151]">STACK</span>
          </h2>
        </Reveal>

        <div className="mt-16">
          {/* Category tabs */}
          <Reveal delay={0.15}>
            <div
              className="flex flex-wrap gap-2 mb-10"
              role="tablist"
              aria-label="Tech categories"
            >
              {techCategories.map((cat) => (
                <button
                  key={cat.name}
                  role="tab"
                  aria-selected={active === cat.name}
                  onClick={() => setActive(cat.name)}
                  className={cn(
                    'rounded border px-4 py-2 font-mono text-[11px] tracking-widest transition-all',
                    active === cat.name
                      ? 'border-accent bg-[rgba(0,255,102,0.08)] text-accent'
                      : 'border-white/8 text-[#6b7280] hover:border-white/20 hover:text-white',
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Items grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              role="tabpanel"
              aria-label={active}
            >
              <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {activeCategory.items.map((item) => (
                  <StaggerItem key={item.name}>
                    <div className="group flex items-center gap-3 rounded-lg border border-white/7 bg-[#0d0d0d] px-4 py-3.5 transition-all duration-300 hover:border-[rgba(0,255,102,0.25)] hover:bg-[rgba(0,255,102,0.04)] cursor-default">
                      {hasTechIcon(item.name) ? (
                        <TechIcon name={item.name} className="h-5 w-5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0 group-hover:shadow-[0_0_6px_rgba(0,255,102,0.8)] transition-shadow" />
                      )}
                      <span className="font-mono text-xs text-[#9ca3af] group-hover:text-white transition-colors">
                        {item.name}
                      </span>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
