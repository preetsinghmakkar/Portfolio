'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const spring = useSpring(0, { stiffness: 200, damping: 40 });

  useEffect(() => {
    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const current = window.scrollY;
      const pct = total > 0 ? current / total : 0;
      setProgress(pct);
      spring.set(pct);
    };

    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [spring]);

  return (
    <motion.div
      className="fixed top-0 left-0 z-50 h-[2px] bg-accent origin-left"
      style={{ scaleX: spring }}
      aria-hidden
    />
  );
}
