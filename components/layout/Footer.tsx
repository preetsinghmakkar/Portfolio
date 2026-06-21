export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/6 bg-[#050505]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row lg:px-12">
        <p className="font-mono text-xs text-[#6b7280]">
          © {year} PREET_SINGH{' '}
          <span className="text-[#374151]">// BLOCKCHAIN_MAINNET_NODE_CONNECTED</span>
        </p>

        <div className="flex items-center gap-6">
          {[
            { label: 'GITHUB', href: 'https://github.com/preetsinghmakkar' },
            { label: 'LINKEDIN', href: 'https://www.linkedin.com/in/preet-singh-a65967302/' },
            { label: 'TWITTER', href: 'https://x.com/RaOne_0xDev' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] tracking-widest text-[#6b7280] transition-colors hover:text-accent"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
