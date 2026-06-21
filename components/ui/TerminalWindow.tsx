'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TerminalWindowProps {
  title?: string;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'compact';
}

function TrafficLights() {
  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
      <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
      <span className="h-3 w-3 rounded-full bg-[#28c840]" />
    </div>
  );
}

export function TerminalWindow({
  title,
  children,
  className,
  variant = 'default',
}: TerminalWindowProps) {
  return (
    <div
      className={cn(
        'rounded-[8px] border border-white/8 bg-[#0d0d0d] overflow-hidden',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-white/6 px-4 py-2.5">
        <TrafficLights />
        {title && (
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#6b7280]">
            {title}
          </span>
        )}
        <div className="w-14" />
      </div>
      <div
        className={cn(
          'font-mono text-sm leading-relaxed',
          variant === 'compact' ? 'p-4' : 'p-5',
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function TerminalLine({
  prefix = '$',
  children,
  className,
}: {
  prefix?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start gap-2', className)}>
      <span className="text-accent shrink-0">{prefix}</span>
      <span className="text-[#9ca3af]">{children}</span>
    </div>
  );
}

export function TerminalOutput({
  label,
  value,
  labelClassName,
  valueClassName,
}: {
  label: string;
  value: string;
  labelClassName?: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex gap-3">
      <span className={cn('w-20 shrink-0 text-[#6b7280]', labelClassName)}>{label}</span>
      <span className={cn('text-accent', valueClassName)}>{value}</span>
    </div>
  );
}

export function TerminalComment({ children }: { children: ReactNode }) {
  return <div className="text-[#6b7280] italic">{children}</div>;
}

export function BlinkCursor() {
  return (
    <span
      className="cursor-blink ml-0.5 inline-block h-4 w-2 bg-accent align-middle"
      aria-hidden
    />
  );
}
