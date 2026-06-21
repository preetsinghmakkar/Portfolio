'use client';

import { useEffect, useRef } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';
import { commandItems } from '@/data/portfolio';
import type { CommandItem } from '@/types';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

function scrollToSection(href: string) {
  const id = href.replace('#', '');
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  function handleSelect(item: CommandItem) {
    scrollToSection(item.href);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            ref={ref}
            className="relative z-10 w-full max-w-lg"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <Command
              className="overflow-hidden rounded-xl border border-[rgba(0,255,102,0.2)] bg-[#0d0d0d] shadow-2xl"
              loop
            >
              <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3">
                <Search className="h-4 w-4 shrink-0 text-[#6b7280]" />
                <Command.Input
                  placeholder="Search sections..."
                  className="flex-1 bg-transparent font-mono text-sm text-white placeholder:text-[#6b7280] focus:outline-none"
                  autoFocus
                />
                <kbd className="font-mono text-[10px] text-[#6b7280] border border-white/10 rounded px-1.5 py-0.5">
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-72 overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center font-mono text-sm text-[#6b7280]">
                  No results found.
                </Command.Empty>

                <Command.Group heading="" className="[&_[cmdk-group-heading]]:hidden">
                  {commandItems.map((item) => (
                    <Command.Item
                      key={item.id}
                      value={item.label}
                      onSelect={() => handleSelect(item)}
                      className="group flex cursor-pointer items-center justify-between rounded-md px-3 py-2.5 font-mono text-sm text-[#9ca3af] transition-colors hover:bg-[rgba(0,255,102,0.07)] hover:text-white data-[selected=true]:bg-[rgba(0,255,102,0.07)] data-[selected=true]:text-white"
                    >
                      <div>
                        <div className="text-white">{item.label}</div>
                        <div className="text-xs text-[#6b7280]">{item.description}</div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 group-data-[selected=true]:opacity-100 text-accent" />
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>

              <div className="border-t border-white/6 px-4 py-2 flex items-center gap-4">
                <span className="font-mono text-[10px] text-[#6b7280]">
                  <kbd className="border border-white/10 rounded px-1 py-0.5 mr-1">↑↓</kbd> navigate
                </span>
                <span className="font-mono text-[10px] text-[#6b7280]">
                  <kbd className="border border-white/10 rounded px-1 py-0.5 mr-1">↵</kbd> select
                </span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
