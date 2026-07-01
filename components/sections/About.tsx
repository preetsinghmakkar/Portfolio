'use client';

import { useEffect, useRef, useState } from 'react';
import { Reveal } from '@/components/ui/MotionWrapper';
import { TerminalWindow } from '@/components/ui/TerminalWindow';

// ─── Actual vesper-interchaind startup logs ───────────────────────────────────

const VESPER_LOGS = [
  '> vesper-interchaind start',
  '4:19AM INF Unlocking keyring module=server',
  '4:19AM INF starting ABCI with CometBFT module=server',
  '4:19AM INF starting node with ABCI CometBFT in-process module=server',
  '4:19AM INF service start impl=multiAppConn module=proxy msg="Starting multiAppConn service" server=node',
  '4:19AM INF service start connection=query impl=localClient module=abci-client msg="Starting localClient service" server=node',
  '4:19AM INF service start connection=snapshot impl=localClient module=abci-client msg="Starting localClient service" server=node',
  '4:19AM INF service start connection=mempool impl=localClient module=abci-client msg="Starting localClient service" server=node',
  '4:19AM INF service start connection=consensus impl=localClient module=abci-client msg="Starting localClient service" server=node',
  '4:19AM INF service start impl=EventBus module=events msg="Starting EventBus service" server=node',
  '4:19AM INF service start impl=PubSub module=pubsub msg="Starting PubSub service" server=node',
  '4:19AM INF service start impl=IndexerService module=txindex msg="Starting IndexerService service" server=node',
  '4:19AM INF ABCI Handshake App Info hash=0DE72AA0B1C59ED0A30B078F5B6A380DA7EDBDF6E19D0AB12A38EA7429F3461B height=173 module=consensus protocol-version=0 server=node software-version=main-ab7d65637cd87327be7d2faa82bb1251b71407f0',
  '4:19AM INF ABCI Replay Blocks appHeight=173 module=consensus server=node stateHeight=173 storeHeight=173',
  '4:19AM INF Completed ABCI Handshake - CometBFT and App are synced appHash=0DE72AA0B1C59ED0A30B078F5B6A380DA7EDBDF6E19D0AB12A38EA7429F3461B appHeight=173 module=consensus server=node',
  '4:19AM INF Version info abci=2.0.0 block=11 commit_hash= module=server p2p=8 server=node tendermint_version=0.38.19',
  '4:19AM INF This node is a validator addr=A65A0FEF33BB4141E353802F381EFA5285D8D38C module=consensus pubKey=PubKeyEd25519{1F0DAEF5229AD1A59588E789D41FAFD47BAE908F9A2A3D5A8E132E486E2DA484} server=node',
  '4:19AM INF P2P Node ID ID=3c1fbc548d7e9f44e2d416165e7f10587aac5402 file=/home/ani/.vesper-interchain/config/node_key.json module=p2p server=node',
  '4:19AM INF Adding persistent peers addrs=[] module=p2p server=node',
  '4:19AM INF Adding unconditional peer ids ids=[] module=p2p server=node',
  '4:19AM INF Add our address to book addr=3c1fbc548d7e9f44e2d416165e7f10587aac5402@0.0.0.0:26656 book=/home/ani/.vesper-interchain/config/addrbook.json module=p2p server=node',
  '4:19AM INF service start impl=Node module=server msg="Starting Node service" server=node',
  '4:19AM INF serve module=rpc-server msg="Starting RPC HTTP server on 127.0.0.1:26657" server=node',
  '4:19AM INF service start impl="P2P Switch" module=p2p msg="Starting P2P Switch service" server=node',
  '4:19AM INF service start impl=ConsensusReactor module=consensus msg="Starting Consensus service" server=node',
  '4:19AM INF Reactor  module=consensus server=node waitSync=false',
  '4:19AM INF service start impl=ConsensusState module=consensus msg="Starting State service" server=node',
  '4:19AM INF service start impl=baseWAL module=consensus msg="Starting baseWAL service" server=node wal=/home/ani/.vesper-interchain/data/cs.wal/wal',
  '4:19AM INF service start impl=Group module=consensus msg="Starting Group service" server=node wal=/home/ani/.vesper-interchain/data/cs.wal/wal',
  '4:19AM INF service start impl=TimeoutTicker module=consensus msg="Starting TimeoutTicker service" server=node',
  '4:19AM INF Searching for height height=174 max=0 min=0 module=consensus server=node wal=/home/ani/.vesper-interchain/data/cs.wal/wal',
  '4:19AM INF Searching for height height=173 max=0 min=0 module=consensus server=node wal=/home/ani/.vesper-interchain/data/cs.wal/wal',
  '4:19AM INF Found height=173 index=0 module=consensus server=node wal=/home/ani/.vesper-interchain/data/cs.wal/wal',
];

// color map for key names
const KEY_COLORS: Record<string, string> = {
  module:             '#67e8f9',   // cyan
  connection:         '#fb923c',   // orange
  server:             '#4ade80',   // green
  impl:               '#fbbf24',   // amber
  msg:                '#e2e8f0',   // near-white
  hash:               '#a78bfa',   // purple
  appHash:            '#a78bfa',
  addr:               '#a78bfa',
  pubKey:             '#a78bfa',
  ID:                 '#a78bfa',
  height:             '#67e8f9',
  appHeight:          '#67e8f9',
  stateHeight:        '#67e8f9',
  storeHeight:        '#67e8f9',
  index:              '#67e8f9',
  block:              '#67e8f9',
  abci:               '#9ca3af',
  p2p:                '#9ca3af',
  'protocol-version': '#9ca3af',
  'software-version': '#6b7280',
  'tendermint_version': '#9ca3af',
  'commit_hash':      '#9ca3af',
  file:               '#6b7280',
  book:               '#6b7280',
  wal:                '#6b7280',
  addrs:              '#9ca3af',
  ids:                '#9ca3af',
  max:                '#9ca3af',
  min:                '#9ca3af',
  waitSync:           '#00ff66',
};

function keyColor(k: string): string {
  return KEY_COLORS[k] ?? '#9ca3af';
}

// Tokenise one structured log line into spans
function renderLogLine(line: string, idx: number) {
  // Command line (starts with >)
  if (line.startsWith('>')) {
    return (
      <div key={idx} className="flex items-center gap-1.5 mb-1 whitespace-nowrap">
        <span className="text-accent font-bold">›</span>
        <span className="text-[#e2e8f0] font-semibold">{line.slice(2)}</span>
      </div>
    );
  }

  // Structured log: "HH:MMam INF rest..."
  const header = line.match(/^(\d+:\d+[AP]M)\s+(INF|ERR|WRN|DBG)\s+(.*)$/);
  if (!header) {
    return <div key={idx} className="whitespace-nowrap text-muted">{line}</div>;
  }

  const [, time, level, rest] = header;

  // Split rest into message text + key=value tokens
  const kvRe = /(\b[\w-]+)=((?:"[^"]*"|\S*))/g;
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let m: RegExpExecArray | null;

  while ((m = kvRe.exec(rest)) !== null) {
    // text before this kv pair
    if (m.index > cursor) {
      nodes.push(
        <span key={`t${m.index}`} className="text-[#d1d5db]">
          {rest.slice(cursor, m.index)}
        </span>,
      );
    }
    const k = m[1];
    const v = m[2];
    nodes.push(
      <span key={`k${m.index}`} style={{ color: keyColor(k) }} className="font-medium">
        {k}
      </span>,
      <span key={`eq${m.index}`} className="text-[#4b5563]">=</span>,
      <span key={`v${m.index}`} style={{ color: keyColor(k) }} className="opacity-80">
        {v}
      </span>,
      <span key={`sp${m.index}`}> </span>,
    );
    cursor = m.index + m[0].length;
  }

  if (cursor < rest.length) {
    nodes.push(
      <span key="tail" className="text-[#d1d5db]">
        {rest.slice(cursor)}
      </span>,
    );
  }

  const levelColor = level === 'INF' ? '#9ca3af' : level === 'ERR' ? '#f87171' : '#fbbf24';

  return (
    <div key={idx} className="flex gap-2 leading-[1.6] whitespace-nowrap">
      <span className="shrink-0 text-[#4b5563] tabular-nums">{time}</span>
      <span className="shrink-0 font-bold" style={{ color: levelColor }}>{level}</span>
      <span>{nodes}</span>
    </div>
  );
}

function VesperLogTerminal() {
  const [visibleLines, setVisibleLines] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Progressive line reveal — simulates live node boot
  useEffect(() => {
    let i = 0;
    const tick = () => {
      i++;
      setVisibleLines(i);
      if (i < VESPER_LOGS.length) setTimeout(tick, 110);
    };
    const t = setTimeout(tick, 300);
    return () => clearTimeout(t);
  }, []);

  // Auto-scroll to latest line
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleLines]);

  const done = visibleLines >= VESPER_LOGS.length;

  return (
    <a
      href="https://github.com/Vesper-Interchain"
      target="_blank"
      rel="noopener noreferrer"
      className="block transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,255,102,0.08)] hover:scale-[1.005] rounded-xl"
      aria-label="View Vesper Interchain on GitHub"
    >
    <TerminalWindow title="vesper-interchaind start — github.com/Vesper-Interchain ↗">
      <div
        ref={scrollRef}
        className="h-75 sm:h-100 lg:h-120 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
      >
        {/* min-w-max keeps every line on a single row; horizontal scroll handles overflow */}
        <div className="min-w-max space-y-0.5 font-mono text-[10px] sm:text-[11px] pr-4">
          {VESPER_LOGS.slice(0, visibleLines).map((line, i) => renderLogLine(line, i))}
          {!done && (
            <div className="flex items-center gap-2 mt-1 whitespace-nowrap">
              <span className="text-accent">›</span>
              <span className="inline-block h-3 w-1.5 bg-accent animate-pulse" />
            </div>
          )}
          {done && (
            <div className="flex items-center gap-2 mt-2 whitespace-nowrap">
              <span className="text-accent">›</span>
              <span className="inline-block h-3 w-1.5 bg-accent animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </TerminalWindow>
    </a>
  );
}


// ─── Section ──────────────────────────────────────────────────────────────────

export function About() {
  return (
    <section id="about-detail" className="relative py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-accent mb-4">
            — CORE IDENTITY
          </p>
          <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-tight tracking-tighter text-white">
            ENGINEERING
            <br />
            <span className="text-[#374151]">MINDSET</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-[5fr_8fr] lg:gap-12">
          <Reveal delay={0.15} variant="slideRight" className="min-w-0">
            <div className="space-y-6 text-[#9ca3af] leading-7">
              <p>
                I build secure and scalable blockchain systems across EVM and Cosmos ecosystems. From designing Solidity smart contracts and testing complex protocol logic to developing Cosmos SDK–based chains, I treat security, correctness, and decentralization as fundamental requirements.
              </p>
              <p>
                My work spans the full blockchain development lifecycle: smart contract engineering in Solidity, advanced testing with Foundry and Echidna, protocol security reviews, and blockchain infrastructure development in Go. I operate at the intersection of protocol design, security research, and production-grade blockchain engineering.
              </p>
              <p>
                Currently focused on smart contract security, cross-chain protocols, and next-generation decentralized infrastructure.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.25} className="min-w-0 overflow-hidden">
            <VesperLogTerminal />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
