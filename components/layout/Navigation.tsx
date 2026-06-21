'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Menu, X } from 'lucide-react';
import { navItems } from '@/data/portfolio';
import { cn } from '@/lib/utils';

interface NavigationProps {
  onCommandPaletteOpen: () => void;
}

function scrollToSection(href: string) {
  const id = href.replace('#', '');
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function Navigation({ onCommandPaletteOpen }: NavigationProps) {
  const [activeSection, setActiveSection] = useState('about');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sectionIds = navItems.map((n) => n.href.replace('#', ''));
    const observers = sectionIds.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: '-40% 0px -55% 0px' },
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  function handleNavClick(href: string) {
    scrollToSection(href);
    setMobileOpen(false);
  }

  return (
    <>
      <motion.header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          scrolled ? 'border-b border-white/6 bg-[#050505]/90 backdrop-blur-md' : 'bg-transparent',
        )}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <nav
          className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-12"
          aria-label="Main navigation"
        >
          <button
            onClick={() => handleNavClick('#about')}
            className="font-mono text-sm font-bold tracking-widest text-white hover:text-accent transition-colors"
            aria-label="Go to top"
          >
            PREET_SINGH
          </button>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-8" role="list">
            {navItems.map((item) => {
              const isActive = activeSection === item.href.replace('#', '');
              return (
                <li key={item.href}>
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className={cn(
                      'relative font-mono text-xs tracking-widest transition-colors pb-0.5',
                      isActive ? 'text-white' : 'text-[#6b7280] hover:text-white',
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-0.5 left-0 right-0 h-px bg-accent"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-3">
            <button
              onClick={onCommandPaletteOpen}
              className="hidden md:flex items-center gap-2 rounded border border-white/10 px-2.5 py-1 font-mono text-[11px] text-[#6b7280] transition-colors hover:border-accent/30 hover:text-white"
              aria-label="Open command palette (Ctrl+K)"
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>⌘K</span>
            </button>

            <button
              className="md:hidden p-1.5 text-[#6b7280] hover:text-white transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-30 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              className="absolute top-16 left-0 right-0 border-b border-white/8 bg-[#0d0d0d] px-6 pb-6 pt-4"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              aria-label="Mobile navigation"
            >
              <ul className="flex flex-col gap-1" role="list">
                {navItems.map((item) => {
                  const isActive = activeSection === item.href.replace('#', '');
                  return (
                    <li key={item.href}>
                      <button
                        onClick={() => handleNavClick(item.href)}
                        className={cn(
                          'w-full py-3 text-left font-mono text-sm tracking-widest transition-colors border-b border-white/5',
                          isActive ? 'text-accent' : 'text-[#9ca3af] hover:text-white',
                        )}
                      >
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
