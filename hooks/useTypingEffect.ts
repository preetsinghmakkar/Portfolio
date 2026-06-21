'use client';

import { useEffect, useState, useRef } from 'react';

interface UseTypingEffectOptions {
  lines: string[];
  typingSpeed?: number;
  pauseBetween?: number;
}

export function useTypingEffect({
  lines,
  typingSpeed = 45,
  pauseBetween = 800,
}: UseTypingEffectOptions) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (currentLine >= lines.length) return;

    const line = lines[currentLine];

    if (currentChar < line.length) {
      timeoutRef.current = setTimeout(() => {
        setDisplayedLines((prev) => {
          const next = [...prev];
          next[currentLine] = (next[currentLine] ?? '') + line[currentChar];
          return next;
        });
        setCurrentChar((c) => c + 1);
      }, typingSpeed);
    } else {
      setIsTyping(false);
      timeoutRef.current = setTimeout(() => {
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
        setIsTyping(true);
      }, pauseBetween);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentLine, currentChar, lines, typingSpeed, pauseBetween]);

  return { displayedLines, isTyping, isComplete: currentLine >= lines.length };
}
