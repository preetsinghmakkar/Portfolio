import type {
  NavItem,
  StatItem,
  TechCategory,
  ExperienceItem,
  Project,
  InfraItem,
  CommandItem,
  MarqueeItem,
} from '@/types';

export const navItems: NavItem[] = [
  { label: 'ABOUT', href: '#about' },
  { label: 'AUDITS', href: '#audits' },
  { label: 'STACK', href: '#stack' },
  { label: 'EXPERIENCE', href: '#experience' },
  { label: 'WORK', href: '#work' },
  { label: 'CONTACT', href: '#contact' },
];

export const heroStats: StatItem[] = [
  { value: '8+', label: 'MAINNET VALIDATORS' },
  { value: '$500M+', label: 'STAKED ASSETS' },
  { value: '0', label: 'DOWNTIME INCIDENTS' },
];

export const marqueeItems: MarqueeItem[] = [
  { label: 'SOLIDITY',    icon: 'Solidity' },
  { label: 'FOUNDRY',     icon: 'Foundry' },
  { label: 'HARDHAT',     icon: 'Hardhat' },
  { label: 'SLITHER',     icon: 'Slither' },
  { label: 'ECHIDNA',     icon: 'Echidna' },
  { label: 'ADERYN',      icon: 'Aderyn' },
  { label: 'HALMOS' },
  { label: 'RUST',        icon: 'Rust' },
  { label: 'GOLANG',      icon: 'Go' },
  { label: 'TYPESCRIPT',  icon: 'TypeScript' },
  { label: 'COSMOS_SDK',  icon: 'Cosmos SDK' },
  { label: 'IBC_PROTOCOL',  icon: 'IBC Protocol' },
  { label: 'COMETBFT',     icon: 'CometBFT' },
  { label: 'DOCKER',      icon: 'Docker' },
  { label: 'TENDERMINT' },
  { label: 'CELESTIA' },
  { label: 'OSMOSIS' },
];

export const techCategories: TechCategory[] = [
  {
    name: 'LANGUAGES',
    items: [
      { name: 'Go' },
      { name: 'Rust' },
      { name: 'Solidity' },
      { name: 'TypeScript' },
      { name: 'Python' },
    ],
  },
  {
    name: 'BLOCKCHAIN',
    items: [
      { name: 'Cosmos SDK' },
      { name: 'Ethereum' },
      { name: 'Solana' },
      { name: 'IBC Protocol' },
      { name: 'CometBFT' },
      { name: 'CosmWasm' },
    ],
  },
  {
    name: 'INFRASTRUCTURE ',
    items: [
      { name: 'AWS' },
      { name: 'Github Actions' },
      { name: 'Docker' },
    ],
  },
  {
    name: 'SECURITY',
    items: [
      { name: 'Foundry' },
      { name: 'Echidna' },
      { name: 'Slither' },
      { name: 'Hardhat' },
      { name: 'Aderyn' },
    ],
  },
];

export const experiences: ExperienceItem[] = [
  {
    period: '2025 — PRESENT',
    title: 'SMART CONTRACT ENGINEER',
    company: 'iTechnolabs',
    tags: ['SOLIDITY', 'FOUNDRY', 'ERC4626', 'UUPS'],
    logFile: 'itechnolabs_contracts.log',
    logType: 'DEPLOYED',
    highlights: [
      {
        type: 'DEPLOYED',
        text: 'Architecting production-grade smart contracts powering tokenized financial systems using UUPS and TransparentUpgradeableProxy patterns.',
      },
      {
        type: 'DEPLOYED',
        text: 'Built FollowMe Core (NDA), a 9-contract on-chain brand management protocol enforcing global ledger invariants across all state mutations.',
      },
      {
        type: 'DEPLOYED',
        text: 'Implemented ERC20/ERC4626 tokenomics, vesting systems, settlement engines, inactivity penalties, and role-based access control with 6 distinct permission layers.',
      },
      {
        type: 'DEPLOYED',
        text: 'Developed a 150-test Foundry suite covering unit, integration, invariant, fuzz, and precision testing.',
      },
    ],
    status: 'System status: ACTIVE. Contracts verified. Test coverage complete.',
  },
  {
    period: 'FEB 2025 — JAN 2026',
    title: 'WEB3 SECURITY RESEARCHER',
    company: 'Code4rena · Cantina · Sherlock',
    tags: ['1 HIGH', '4 MEDIUM', '$391 EARNED'],
    logFile: 'security_findings.log',
    logType: 'AUDIT',
    highlights: [
      {
        type: 'FINDING',
        text: 'Identified critical vulnerabilities across DeFi, lending, AMM, and agent protocol architectures.',
      },
      {
        type: 'HIGH',
        text: 'Virtuals Protocol: PublicContributionNft::mint lacked access control, enabling arbitrary NFT minting and cascading fund loss.',
      },
      {
        type: 'MEDIUM',
        text: 'Silo Finance: Missing slippage and deadline protections exposed users to sandwich attacks and stale execution.',
      },
      {
        type: 'MEDIUM',
        text: 'Liquid Ron: Incorrect operator authorization logic caused denial-of-service across protocol operations.',
      },
      {
        type: 'CANTINA',
        text: 'Discovered insolvency and liquidation bypass vectors in Aegis.im YUSD and Jigsaw Protocol.',
      },
    ],
    status: 'Audit status: 1 High | 4 Medium | Rank #1593',
  },
  {
    period: 'SEP 2024 — FEB 2025',
    title: 'FULL STACK BLOCKCHAIN ENGINEER',
    company: 'Ungate.io',
    tags: ['EVM', 'WALLETS', 'SECURITY', 'BACKEND'],
    logFile: 'ungate_deployment.log',
    logType: 'SHIPPED',
    highlights: [
      {
        type: 'SHIPPED',
        text: 'Engineered secure wallet infrastructure supporting controlled execution across multiple EVM-compatible networks.',
      },
      {
        type: 'SHIPPED',
        text: 'Implemented transaction authorization workflows with signature validation and role-based controls.',
      },
      {
        type: 'SHIPPED',
        text: 'Built failure-resilient transaction lifecycle management for secure on-chain operations.',
      },
      {
        type: 'SHIPPED',
        text: 'Enhanced wallet security through strict execution safeguards and validation pipelines.',
      },
    ],
    status: 'Deployment status: STABLE. Multi-chain execution enabled.',
  },
];

export const projects: Project[] = [
  {
    name: 'REVVFI PROTOCOL',
    description:
      'A decentralized lending protocol enabling peer-to-peer loan matching, dynamic interest-rate discovery, collateralized borrowing, Dutch-auction liquidations, reputation-based risk assessment, and NFT-backed lender positions.',
    techStack: ['Solidity', 'Foundry', 'Chainlink', 'ERC721', 'DeFi', 'OpenZeppelin'],
    highlights: [
      'Multi-market architecture supporting isolated borrower lending markets',
      'Competitive APR discovery through on-chain lender offer matching',
      'Dutch-auction liquidation engine with collateral health monitoring',
      'ERC721 lender positions with epoch-based withdrawal queue protection',
    ],
    github: 'https://github.com/RevvFi',
    status: 'PROTOCOL_ACTIVE',
    lang: 'Solidity',
    visibility: 'Public',
    lastUpdated: 'Jun 2026',
    flagship: true,
  },
  {
    name: 'VESPER INTERCHAIN',
    description:
      'A sovereign Cosmos SDK blockchain bridging IBC-native collateral with EVM-compatible DeFi. Users deposit staked assets from any Cosmos chain and mint USDX, an overcollateralized stablecoin usable across Ethereum ecosystems.',
    techStack: ['Cosmos SDK', 'Go', 'IBC', 'Ethermint', 'CometBFT', 'Solidity'],
    highlights: [
      'Native IBC collateral deposits from Cosmos Hub, Osmosis, Stride, and other IBC chains',
      'USDX stablecoin minted against collateral through custom Cosmos SDK modules',
      'EVM precompile architecture enabling direct Solidity access to chain functionality',
      'Automated liquidation engine, stability fees, and sovereign validator security',
    ],
    github: 'https://github.com/Vesper-Interchain',
    status: 'CHAIN_ACTIVE',
    lang: 'Go',
    visibility: 'Public',
    lastUpdated: 'Jun 2026',
  },
  {
    name: 'TOKENMAKER',
    description:
      'A full-stack ERC20 token generation platform allowing users to deploy customizable Ethereum tokens with advanced tokenomics and permission systems through a streamlined interface.',
    techStack: ['Next.js', 'TypeScript', 'Solidity', 'Foundry', 'RainbowKit', 'Wagmi'],
    highlights: [
      'Mintable, Burnable, Pausable, and Capped ERC20 token generation',
      'Time-lock and supply-control mechanisms for token distribution',
      'Wallet integration using RainbowKit, Wagmi, and ethers.js',
      'End-to-end deployment workflow powered by Foundry smart contracts',
    ],
    github: 'https://github.com/preetsinghmakkar/TokenMaker',
    status: 'LIVE_PLATFORM',
    lang: 'TypeScript',
    visibility: 'Public',
    lastUpdated: 'Apr 2025',
  },
];

export const infraItems: InfraItem[] = [
  { name: 'AWS', description: 'Cloud Infrastructure', icon: '☁' },
  { name: 'DOCKER', description: 'Containerization', icon: '◻' },
  {
    name:
    'Github Actions',
    description: 'CI/CD Pipelines',
    icon: '⚙',
  }
];

export const commandItems: CommandItem[] = [
  { id: 'about', label: 'About', href: '#about', description: 'Who is Preet Singh' },
  { id: 'audits', label: 'Audit Findings', href: '#audits', description: 'Security research & bug bounty findings' },
  { id: 'stack', label: 'Tech Stack', href: '#stack', description: 'Languages, tools, and platforms' },
  { id: 'experience', label: 'Experience', href: '#experience', description: 'Work history and highlights' },
  { id: 'work', label: 'Projects', href: '#work', description: 'Vesper Chain and more' },
  { id: 'contact', label: 'Contact', href: '#contact', description: 'Get in touch' },
];
