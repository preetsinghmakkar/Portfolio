'use client';

import { motion, type Variants, type HTMLMotionProps } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

const slideRight: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

interface RevealProps extends HTMLMotionProps<'div'> {
  delay?: number;
  variant?: 'fadeUp' | 'fadeIn' | 'slideRight';
}

export function Reveal({ delay = 0, variant = 'fadeUp', children, ...props }: RevealProps) {
  const reduced = useReducedMotion();

  const variants = { fadeUp, fadeIn, slideRight }[variant];

  return (
    <motion.div
      variants={reduced ? undefined : variants}
      initial={reduced ? undefined : 'hidden'}
      whileInView={reduced ? undefined : 'visible'}
      viewport={{ once: true, amount: 0.15 }}
      transition={reduced ? undefined : { delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export function Stagger({ children, className }: StaggerProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      variants={reduced ? undefined : staggerContainer}
      initial={reduced ? undefined : 'hidden'}
      whileInView={reduced ? undefined : 'visible'}
      viewport={{ once: true, amount: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      variants={reduced ? undefined : fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}
