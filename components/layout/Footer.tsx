export function Footer() {
  const year = new Date().getFullYear();

  const links = [
    { label: 'GITHUB',   href: 'https://github.com/preetsinghmakkar' },
    { label: 'LINKEDIN', href: 'https://www.linkedin.com/in/preet-singh-a65967302/' },
    { label: 'X / TWITTER', href: 'https://x.com/RaOne_0xDev' },
  ];

  return (
    <footer className="border-t border-white/6 bg-[#050505]">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-10 lg:px-12">
        {/* Social links — always centered, prominent */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border border-white/12 bg-white/4 px-5 py-2.5 font-mono text-[11px] font-bold tracking-widest text-[#9ca3af] transition-all hover:border-accent/40 hover:bg-accent/5 hover:text-accent"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p className="font-mono text-[11px] tracking-widest text-[#374151]">
          © {year} PREET_SINGH{' '}
          <span className="text-[#1f2937]">// BLOCKCHAIN_MAINNET_NODE_CONNECTED</span>
        </p>
      </div>
    </footer>
  );
}
