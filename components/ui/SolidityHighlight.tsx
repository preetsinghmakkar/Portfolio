'use client';

import React from 'react';

// Token rules — order matters (first match wins)
const RULES: { re: RegExp; cls: string | ((m: string) => string) }[] = [
  // @audit / @notice / @dev — orange warning marker
  { re: /^(\/\/\s*@(?:audit|notice|dev)[^\n]*)/, cls: 'text-[#f78c6c]' },
  // Single-line comments
  { re: /^(\/\/[^\n]*)/, cls: 'text-[#4b5563] italic' },
  // Multi-line comments
  { re: /^(\/\*[\s\S]*?\*\/)/, cls: 'text-[#4b5563] italic' },
  // Double-quoted strings
  { re: /^("(?:[^"\\]|\\.)*")/, cls: 'text-[#c3e88d]' },
  // Single-quoted strings
  { re: /^('(?:[^'\\]|\\.)*')/, cls: 'text-[#c3e88d]' },
  // Hex literals
  { re: /^(0x[0-9a-fA-F]+)/, cls: 'text-[#f78c6c]' },
  // Numeric literals
  { re: /^(\d+(?:\.\d+)?(?:e\d+)?)/, cls: 'text-[#f78c6c]' },
  // Visibility / mutability modifiers
  {
    re: /^(external|internal|public|private|view|pure|payable|returns|override|virtual|storage|memory|calldata|immutable|constant|indexed)(?![a-zA-Z0-9_$])/,
    cls: 'text-[#89ddff]',
  },
  // Primitive types
  {
    re: /^(address|uint256|uint128|uint64|uint32|uint16|uint8|uint|int256|int128|int64|int32|int16|int8|int|bool|bytes32|bytes20|bytes16|bytes8|bytes4|bytes1|bytes|string)(?![a-zA-Z0-9_$])/,
    cls: 'text-[#82aaff]',
  },
  // Language keywords
  {
    re: /^(pragma|solidity|contract|interface|library|abstract|function|modifier|event|error|struct|enum|mapping|if|else|for|while|do|break|continue|return|emit|revert|require|assert|try|catch|new|delete|this|super|unchecked|import|using|as|is|from|constructor|fallback|receive|assembly|let|switch|case|default|leave|slot|offset)(?![a-zA-Z0-9_$])/,
    cls: 'text-[#c792ea]',
  },
  // Named identifiers (variables, function names)
  { re: /^([a-zA-Z_$][a-zA-Z0-9_$]*)/, cls: 'text-[#9ca3af]' },
  // Operators
  { re: /^([+\-*/%=!<>&|^~?]+)/, cls: 'text-[#89ddff]' },
  // Punctuation
  { re: /^([{}()[\];,])/, cls: 'text-[#6b7280]' },
  // Dot
  { re: /^(\.)/, cls: 'text-[#6b7280]' },
  // Whitespace (preserve as-is — pre tag handles rendering)
  { re: /^(\s+)/, cls: '' },
  // Catch-all
  { re: /^(.)/, cls: 'text-[#9ca3af]' },
];

function tokenize(code: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let remaining = code;
  let key = 0;

  while (remaining.length > 0) {
    let consumed = false;
    for (const { re, cls } of RULES) {
      const m = remaining.match(re);
      if (m) {
        const text = m[1];
        const className = typeof cls === 'function' ? cls(text) : cls;
        if (className) {
          nodes.push(
            <span key={key++} className={className}>
              {text}
            </span>,
          );
        } else {
          nodes.push(text);
        }
        remaining = remaining.slice(text.length);
        consumed = true;
        break;
      }
    }
    if (!consumed) {
      nodes.push(remaining[0]);
      remaining = remaining.slice(1);
    }
  }

  return nodes;
}

export function SolidityHighlight({ code }: { code: string }) {
  return <>{tokenize(code)}</>;
}
