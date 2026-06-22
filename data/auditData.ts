export interface CodeBlock {
  lang: string;
  label: string;
  code: string;
}

export interface ImpactItem {
  category: string;
  description: string;
  level: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface AuditFinding {
  slug: string;
  protocol: string;
  logo: string;
  platform: 'Code4rena' | 'Cantina' | 'Sherlock';
  platformLogo: string;
  severity: 'HIGH' | 'MEDIUM';
  title: string;
  findingId: string;
  date: string;
  status: string;
  summary: {
    overview: string;
    affectedComponent: string;
    riskClassification: string;
  };
  rootCause: {
    description: string;
    vulnerableCode: CodeBlock;
    incorrectAssumptions: string[];
    affectedContracts: string[];
  };
  attackScenario: {
    title: string;
    steps: string[];
  };
  impact: ImpactItem[];
  mitigation: {
    description: string;
    vulnerableCode: string;
    fixedCode: string;
    considerations: string[];
  };
  researcherNotes: string[];
  reportLink: string;
  websiteLink?: string;
  githubLink?: string;
}

export const auditFindings: AuditFinding[] = [
  {
    slug: 'virtuals-protocol',
    protocol: 'Virtuals Protocol',
    logo: '/VirtualProtocol.webp',
    platform: 'Code4rena',
    platformLogo: '',
    severity: 'HIGH',
    title: 'Manual ContributionNFT Minting to Arbitrary Addresses Creates Governance and Functional Risks',
    findingId: 'S-175',
    date: 'Apr 2025',
    status: 'ACCEPTED',
    summary: {
      overview:
        'The protocol inconsistently handles asset ownership between ServiceNFT (auto-minted to TBA) and ContributionNFT (manually minted to any address). Proposers can direct NFTs to non-TBA wallets, breaking the TBA-centric ownership model and blocking voters from accessing isModel metadata before casting votes.',
      affectedComponent: 'ContributionNft.sol — mint() function (L49–51, L66, L82)',
      riskClassification: 'Governance Integrity + Functional Risk',
    },
    rootCause: {
      description:
        'The ContributionNFT mint() function accepts a caller-controlled `to` parameter with no validation, allowing proposers to mint to any address rather than the TBA enforced by ServiceNFT. Additionally, the `isModel` flag is only resolvable after the NFT is minted, leaving voters without proposal type context during the voting window.',
      vulnerableCode: {
        lang: 'solidity',
        label: 'ContributionNft.sol — L49-51 (vulnerable) vs ServiceNFT (correct)',
        code: `// @audit ContributionNFT — caller controls destination
function mint(address to, uint256 proposalId, ...) external {
    _mint(to, proposalId); // 'to' is unvalidated
}

// ServiceNFT — correctly enforces TBA model
function mint(uint256 proposalId, ...) external {
    _mint(info.tba, proposalId); // always mints to TBA ✓
}

// propose() — missing isModel context for voters
function propose(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    string memory description
) public override(GovernorUpgradeable) returns (uint256) {
    // @audit isModel is NOT included here
    // voters cannot distinguish Model vs Dataset proposals
}`,
      },
      incorrectAssumptions: [
        'Proposers will always mint ContributionNFT to the correct TBA address without enforcement',
        'Governance voters have access to isModel metadata before the voting window opens',
        'The TBA-centric ownership model is enforced uniformly across all NFT types',
      ],
      affectedContracts: [
        'ContributionNft.sol (L49–51, L66, L82)',
        'GovernorUpgradeable.sol — propose()',
      ],
    },
    attackScenario: {
      title: 'Governance Manipulation via Off-TBA NFT Minting',
      steps: [
        'Malicious proposer calls propose() to create a governance proposal targeting a ServiceNFT or protocol parameter.',
        'Proposer calls ContributionNFT.mint() with an arbitrary wallet address (not the correct TBA), directing the NFT outside the TBA-centric model.',
        'Voters enter the voting window but cannot resolve isModel — they cannot determine whether the proposal targets a Model or a Dataset.',
        'Proposer holds the ContributionNFT outside TBA, enabling governance manipulation via off-protocol NFT control and breaking the ownership invariant the entire system assumes.',
      ],
    },
    impact: [
      {
        category: 'Governance Integrity',
        description:
          "ContributionNFTs held outside TBAs break the protocol's core ownership invariant. Proposers gain illegitimate control over NFTs that should be TBA-bound, enabling off-protocol governance leverage.",
        level: 'HIGH',
      },
      {
        category: 'Information Asymmetry',
        description:
          'Voters cannot distinguish Model vs Dataset proposals before casting votes. The isModel field is only resolvable after ContributionNFT is minted — a step fully controlled by the proposer.',
        level: 'MEDIUM',
      },
      {
        category: 'Protocol Integrity',
        description:
          "The inconsistency between ServiceNFT's enforced TBA minting and ContributionNFT's arbitrary minting undermines the uniform ownership model the protocol's security relies on.",
        level: 'HIGH',
      },
    ],
    mitigation: {
      description:
        'Remove the arbitrary `to` parameter from ContributionNFT.mint() and enforce TBA-bound minting at the contract level. Add isModel context to propose() so voters have complete proposal information.',
      vulnerableCode: `function mint(address to, uint256 proposalId) external {
    _mint(to, proposalId); // caller controls destination
}`,
      fixedCode: `function mint(uint256 proposalId) external {
    address tba = IAgentNft(personaNft).virtualInfo(virtualId).tba;
    _mint(tba, proposalId); // always mints to TBA
}

// Also add isModel to propose() calldata or description
// so voters can resolve proposal type without waiting for mint`,
      considerations: [
        'Audit all other NFT minting paths in the protocol for the same TBA enforcement gap',
        'Consider emitting a VotingContextSet event after ContributionNFT mint to signal voter readiness',
        'Add integration tests that verify ContributionNFT always lands in TBA after propose()',
      ],
    },
    researcherNotes: [
      "I discovered this by comparing minting patterns across all NFT contracts in the Virtuals codebase. ServiceNFT hardcodes the TBA as recipient — ContributionNFT exposes a `to` parameter with zero validation. The asymmetry was the first red flag.",
      "Protocols that enforce ownership invariants in one place but not another almost always have consistency bugs. Once I saw `_mint(info.tba, proposalId)` in ServiceNFT and `_mint(to, proposalId)` in ContributionNFT, I knew the assumption wasn't being enforced where it mattered.",
      "The isModel gap was a secondary discovery. While tracing the field through the codebase I realized it only existed in ContributionNFT — which the proposer controls and can delay minting indefinitely. Worst case: proposer deliberately withholds the mint to obscure proposal intent during voting.",
      "This finding reinforced a rule I now apply to every NFT-heavy codebase: find every ownership invariant stated in docs or comments, then verify it's enforced uniformly across all minting paths. Trust-but-verify at the contract level, not just the protocol level.",
    ],
    reportLink: 'https://code4rena.com/audits/2025-04-virtuals-protocol/submissions/S-175',
    websiteLink: 'https://app.virtuals.io',
  },
  {
    slug: 'virtuals-frontrun',
    protocol: 'Virtuals Protocol',
    logo: '/VirtualProtocol.webp',
    platform: 'Code4rena',
    platformLogo: '',
    severity: 'MEDIUM',
    title: 'Frontrunnable Pool Creation Blocks Custom Token Agent Initialization Permanently',
    findingId: 'S-171',
    date: 'Apr 2025',
    status: 'ACCEPTED',
    summary: {
      overview:
        'The initFromToken → executeTokenApplication workflow contains a race condition where a malicious actor can permanently DoS agent creation for any custom token by frontrunning Uniswap pool creation. Once the pool exists, executeTokenApplication always reverts with no recovery path.',
      affectedComponent: 'AgentFactoryV4.sol — _createPair() (L543–551), executeTokenApplication() (L226)',
      riskClassification: 'Race Condition / Permanent Denial of Service',
    },
    rootCause: {
      description:
        '_createPair() checks that the Uniswap pair does NOT exist and reverts if it does. Because pool creation is separated from agent registration (initFromToken registers first, pool creation happens in executeTokenApplication), any actor can create the pair in the gap window, permanently blocking the agent.',
      vulnerableCode: {
        lang: 'solidity',
        label: 'AgentFactoryV4.sol — _createPair (L543-551)',
        code: `function _createPair(address tokenAddr) internal returns (address) {
    IUniswapV2Factory factory =
        IUniswapV2Factory(IUniswapV2Router02(_uniswapRouter).factory());

    // @audit Hard reverts if pool already exists — no recovery
    require(
        factory.getPair(tokenAddr, assetToken) == address(0),
        "pool already exists"
    );

    return factory.createPair(tokenAddr, assetToken);
}

// executeTokenApplication calls _createPair AFTER registration
// giving attackers a window to front-run
function executeTokenApplication(...) external {
    // ... token validation ...
    lp = _createPair(token); // reverts if Bob already created pair
}`,
      },
      incorrectAssumptions: [
        'The gap between initFromToken (registration) and executeTokenApplication (pool creation) is safe because only the protocol creates pairs',
        'Uniswap pair creation is permissioned or atomic with agent registration',
        'A pre-existing pair can be reused — the require() check assumes exclusive creation rights',
      ],
      affectedContracts: [
        'AgentFactoryV4.sol — _createPair() (L543–551)',
        'AgentFactoryV4.sol — executeTokenApplication() (L226)',
        'AgentFactoryV4.sol — initFromToken()',
      ],
    },
    attackScenario: {
      title: 'Permanent DoS via Uniswap Pair Pre-creation',
      steps: [
        'Alice calls initFromToken(AliceToken) to register her custom token agent. Registration succeeds and the application is recorded.',
        'Attacker monitors the mempool. Before Alice calls executeTokenApplication(), the attacker calls IUniswapV2Factory.createPair(AliceToken, VirtualToken) directly.',
        'Alice calls executeTokenApplication(). Internally, _createPair() checks factory.getPair(AliceToken, assetToken) != address(0) — the pair exists — and reverts with "pool already exists".',
        "Alice's agent is permanently uninitialized. She cannot recover: the application is registered but the required pair creation reverts every time. The custom token agent is permanently blocked.",
      ],
    },
    impact: [
      {
        category: 'Permanent DoS',
        description:
          'Any custom token agent registration can be permanently blocked by any actor willing to spend the gas to pre-create the Uniswap pair. The attack is cheap and unrecoverable.',
        level: 'HIGH',
      },
      {
        category: 'No Recovery Path',
        description:
          'There is no mechanism to proceed with an existing pair or cancel and re-register. Affected applications are permanently stuck.',
        level: 'HIGH',
      },
      {
        category: 'Competitive Griefing',
        description:
          'Competitors or protocol adversaries can selectively block specific token agents while allowing others, enabling targeted censorship of custom agent creation.',
        level: 'MEDIUM',
      },
    ],
    mitigation: {
      description:
        'Move pool creation into initFromToken so it happens atomically with registration, eliminating the window. Alternatively, modify _createPair() to return an existing pair instead of reverting.',
      vulnerableCode: `// Pool creation is delayed — creates attack window
function initFromToken(address tokenAddr, ...) public {
    _tokenApplication[tokenAddr] = id; // register first
    // pool created later in executeTokenApplication ← gap here
}`,
      fixedCode: `// Option A: atomic creation in initFromToken
function initFromToken(address tokenAddr, ...) public {
    _createPairOrGet(tokenAddr); // create pair first
    _tokenApplication[tokenAddr] = id;
}

// Option B: tolerate existing pair in _createPair
function _createPair(address tokenAddr) internal returns (address) {
    address existing = factory.getPair(tokenAddr, assetToken);
    if (existing != address(0)) return existing; // reuse if exists
    return factory.createPair(tokenAddr, assetToken);
}`,
      considerations: [
        'Atomic pair creation eliminates the race window entirely — prefer Option A',
        'If reusing existing pairs (Option B), verify the pair was created with the correct assetToken to avoid malicious pair substitution',
        'Add a test that pre-creates the Uniswap pair and then calls initFromToken + executeTokenApplication — it should succeed',
      ],
    },
    researcherNotes: [
      "Race conditions in multi-step initialization flows are a recurring pattern in DeFi. Whenever I see a protocol split into 'register then execute' steps, I immediately ask: what can happen in the gap? Here, the gap allowed permanent DoS via a permissionless Uniswap factory call.",
      "The severity driver is the absence of a recovery path. If executeTokenApplication could accept a pre-existing pair or if the application could be cancelled and re-submitted, this would be low severity. The combination of 'no error handling + no recovery' is what makes it matter.",
      "The fix is straightforward once you identify the pattern: either make it atomic (create pair in initFromToken) or make it idempotent (accept existing pair in _createPair). Both solutions are one-line changes. The insight is recognizing that the require() check was written with an assumption of exclusive creation rights that Uniswap's permissionless factory doesn't enforce.",
      "I document this class of bug as 'assumed exclusivity over permissionless infrastructure' — protocols that call permissionless external contracts and then rely on being the only caller create exploitable race windows. Always check: can an attacker call this external contract before the protocol does?",
    ],
    reportLink: 'https://code4rena.com/audits/2025-04-virtuals-protocol/submissions/S-171',
    websiteLink: 'https://app.virtuals.io',
  },
  {
    slug: 'silo-finance',
    protocol: 'Silo Finance',
    logo: '/Silo.webp',
    platform: 'Code4rena',
    platformLogo: '',
    severity: 'MEDIUM',
    title: 'Lack of Slippage Protection in Core EIP-4626 Vault Functions Enables Sandwich Attacks',
    findingId: 'S-277',
    date: 'Mar 2025',
    status: 'ACCEPTED',
    summary: {
      overview:
        "SiloVault's deposit, mint, withdraw, and redeem functions violate EIP-4626 Security Considerations by omitting slippage control parameters. EOA users have no mechanism to bound their execution price, leaving all four core operations open to sandwich attacks and stale-rate execution.",
      affectedComponent: 'SiloVault.sol — deposit() L569, mint() L603, withdraw() L625, redeem() L586',
      riskClassification: 'MEV Vulnerability / User Fund Loss',
    },
    rootCause: {
      description:
        'EIP-4626 explicitly states in its Security Considerations that vaults intended for direct EOA interaction must include slippage protection (minShares for deposits, maxAssets for withdrawals). SiloVault omits these parameters entirely, leaving exchange-rate risk with the user at every interaction.',
      vulnerableCode: {
        lang: 'solidity',
        label: 'SiloVault.sol — All four core functions lack slippage bounds',
        code: `// No minShares → user receives fewer shares than expected
function deposit(uint256 _assets, address _receiver)
    public override returns (uint256 shares) { ... }

// No maxShares → user pays more assets than expected
function mint(uint256 _shares, address _receiver)
    public virtual override returns (uint256 assets) { ... }

// No maxShares → user burns more shares than expected
function withdraw(uint256 _assets, address _receiver, address _owner)
    public virtual override returns (uint256 shares) { ... }

// No minAssets → user receives fewer assets than expected
function redeem(uint256 _shares, address _receiver, address _owner)
    public virtual override returns (uint256 assets) { ... }

// EIP-4626 Security Considerations (violated):
// "implementors intend to support EOA account access directly,
//  they should consider adding [...] means to accommodate
//  slippage loss or unexpected deposit/withdrawal limits"`,
      },
      incorrectAssumptions: [
        'EOA users will always route through a slippage-aware wrapper or aggregator',
        'The vault exchange rate is stable enough that slippage protection is unnecessary',
        'EIP-4626 compliance implies full security compliance without reading Security Considerations',
      ],
      affectedContracts: [
        'SiloVault.sol — deposit() L569–583',
        'SiloVault.sol — mint() L603–622',
        'SiloVault.sol — withdraw() L625–644',
        'SiloVault.sol — redeem() L586–600',
      ],
    },
    attackScenario: {
      title: 'Sandwich Attack on ERC-4626 Vault Deposit',
      steps: [
        'Alice submits a large deposit() transaction to SiloVault. No minShares parameter — she will accept any share amount.',
        'Attacker detects the pending tx and frontruns it by manipulating an underlying market (e.g. Aave or Uniswap) that affects SiloVault\'s previewDeposit() rate.',
        "Alice's deposit executes at the manipulated rate — she receives fewer shares than the fair-value amount. With no minShares check, the transaction succeeds silently.",
        'Attacker backruns to restore the original rate, capturing the spread from Alice\'s slippage as profit.',
      ],
    },
    impact: [
      {
        category: 'User Fund Loss',
        description:
          'Users receive fewer shares on deposit (or fewer assets on redeem) than fair value. Losses are unbounded and scale with vault TVL and attacker capital.',
        level: 'HIGH',
      },
      {
        category: 'MEV Exposure',
        description:
          'All four core vault functions are sandwichable in the same block. Any EOA transaction is an open target with no deadline or slippage floor.',
        level: 'MEDIUM',
      },
      {
        category: 'EIP-4626 Non-Compliance',
        description:
          "The vault violates the EIP's own Security Considerations, creating false trust assumptions for integrators who rely on the standard for safety properties.",
        level: 'MEDIUM',
      },
    ],
    mitigation: {
      description:
        'Add minimum-output parameters to all four core functions and enforce deadline validation per EIP-4626 Security Considerations.',
      vulnerableCode: `function deposit(uint256 _assets, address _receiver)
    public override returns (uint256 shares) {
    shares = previewDeposit(_assets); // no slippage bound
    _deposit(msg.sender, _receiver, _assets, shares);
}`,
      fixedCode: `function deposit(
    uint256 _assets,
    address _receiver,
    uint256 _minSharesOut,   // slippage floor
    uint256 _deadline        // MEV protection
) public override returns (uint256 shares) {
    require(block.timestamp <= _deadline, "EXPIRED");
    shares = previewDeposit(_assets);
    require(shares >= _minSharesOut, "SLIPPAGE");
    _deposit(msg.sender, _receiver, _assets, shares);
}`,
      considerations: [
        'Apply symmetrically: minSharesOut for deposit, maxAssetsIn for mint, maxSharesIn for withdraw, minAssetsOut for redeem',
        'Consider EIP-4626 compliant overloads that preserve original signatures for protocol integrators while adding protected variants for EOAs',
        'Add deadline checks independently from slippage — stale execution can be harmful even without active MEV',
      ],
    },
    researcherNotes: [
      "My EIP-4626 audit checklist always starts with the Security Considerations section of the EIP itself — not the interface. The spec is unusually explicit about slippage for EOA interactions. If a vault targets direct EOA use and lacks minShares/maxAssets, that's a gap regardless of how clean the accounting logic is.",
      "SiloVault had perfectly correct EIP-4626 accounting — the math, the rounding, the share calculation were all fine. The issue was at the user-interaction layer, not the core logic. These bugs are easy to miss precisely because the implementation looks correct when you're focused on the accounting invariants.",
      "The interesting attack surface is the combination of a shared underlying market and the vault's exposure to rate changes. The sandwich doesn't manipulate the vault directly — it temporarily shifts external rates that previewDeposit() uses for share calculation. The vault is a passive victim.",
      "This reinforced treating EIPs as security checklists, not just interface contracts. The Security Considerations section of an EIP encodes the lessons of past exploits. Skipping it to focus only on the function signatures misses the most actionable guidance in the entire document.",
    ],
    reportLink: 'https://code4rena.com/audits/2025-03-silo-finance/submissions/S-277',
    websiteLink: 'https://app.silo.finance',
  },
  {
    slug: 'liquid-ron',
    protocol: 'Liquid Ron',
    logo: '/Liquid.svg',
    platform: 'Code4rena',
    platformLogo: '',
    severity: 'MEDIUM',
    title: 'Inverted Boolean Logic in onlyOperator Modifier Causes Permanent DoS for All Operators',
    findingId: 'S-43',
    date: 'Jan 2025',
    status: 'ACCEPTED',
    summary: {
      overview:
        'The onlyOperator modifier in LiquidRon uses || (OR) where && (AND) is required, inverting the access check. Authorized operators are permanently blocked from all protected functions while only the owner retains access — defeating the entire purpose of the operator role.',
      affectedComponent: 'LiquidRon.sol — onlyOperator modifier (L91)',
      riskClassification: 'Access Control Inversion / Denial of Service',
    },
    rootCause: {
      description:
        'The condition `msg.sender != owner() || operator[msg.sender]` evaluates to true (revert) for any authorized operator who is not also the owner. The || operator makes the second condition (operator[msg.sender] == true) trigger the revert path instead of the allow path.',
      vulnerableCode: {
        lang: 'solidity',
        label: 'LiquidRon.sol — L91 (truth table shows the inversion)',
        code: `modifier onlyOperator() {
    // WRONG: || causes inversion — operators always revert
    if (msg.sender != owner() || operator[msg.sender])
        revert ErrInvalidOperator();
    _;
}

// Truth table:
// sender=owner,    operator[x]=false → NOT revert ✓ (owner OK)
// sender=owner,    operator[x]=true  → NOT revert ✓ (owner OK)
// sender=operator, operator[x]=true  → REVERTS   ✗ (should pass!)
// sender=random,   operator[x]=false → REVERTS   ✓ (correctly blocked)

// Test proof — fails with ErrInvalidOperator():
// liquidRon.updateOperator(protocolAdmin, true);
// vm.prank(protocolAdmin);
// liquidRon.harvest(0, consensusAddrs); // ← REVERT`,
      },
      incorrectAssumptions: [
        'The || condition correctly allows both owner and operator to pass',
        'operator[msg.sender] == true means the sender is authorized (it actually triggers revert)',
        'Access control tests covered the non-owner-operator path — they did not',
      ],
      affectedContracts: [
        'LiquidRon.sol — all functions guarded by onlyOperator (harvest, etc.)',
      ],
    },
    attackScenario: {
      title: 'Operator Role Rendered Non-Functional',
      steps: [
        'Protocol admin deploys LiquidRon and calls updateOperator(protocolAdmin, true) to grant operator access.',
        'Admin calls harvest() or any onlyOperator-protected function from the protocolAdmin address.',
        'Modifier evaluates: (protocolAdmin != owner() → true) || (operator[protocolAdmin] → true) → condition is true → ErrInvalidOperator revert.',
        'All operator-gated protocol operations are permanently inaccessible to all granted operators. Only the owner can call these functions — the operator role provides no access whatsoever.',
      ],
    },
    impact: [
      {
        category: 'Access Control Failure',
        description:
          'The operator role is entirely non-functional. updateOperator(x, true) effectively revokes access rather than granting it. No granted operator can call any protected function.',
        level: 'HIGH',
      },
      {
        category: 'Denial of Service',
        description:
          'All operator-gated protocol operations (harvest, etc.) are permanently unavailable to operators. Critical protocol maintenance functions require owner-key availability at all times.',
        level: 'HIGH',
      },
      {
        category: 'Operational Risk',
        description:
          'If the owner key is in cold storage or a multisig with slow signing, time-sensitive operator operations (like harvest) stall indefinitely with no fallback.',
        level: 'MEDIUM',
      },
    ],
    mitigation: {
      description:
        'Replace || with && and flip the operator condition. The correct logic: revert only if the sender is NEITHER the owner NOR an authorized operator.',
      vulnerableCode: `modifier onlyOperator() {
    if (msg.sender != owner() || operator[msg.sender])
        revert ErrInvalidOperator();
    _;
}`,
      fixedCode: `modifier onlyOperator() {
    // allow: owner OR authorized operator
    if (msg.sender != owner() && !operator[msg.sender])
        revert ErrInvalidOperator();
    _;
}`,
      considerations: [
        'Add an explicit test: grant operator role to a non-owner address, call every onlyOperator function, assert no revert',
        'Consider OpenZeppelin AccessControl to eliminate custom modifier boolean logic entirely',
        'Write the truth table as a comment above any custom access modifier for future maintainers',
      ],
    },
    researcherNotes: [
      "This is a pure logic bug hidden in a three-word modifier. It looks plausible at first glance — 'if sender is not owner OR is an operator, revert' almost reads correctly until you trace the truth table explicitly.",
      "My approach for custom access modifiers: always write the full truth table before trusting the condition. For onlyOperator with two state variables (owner match + operator map), there are four cases. One read-through of the table showed the inversion immediately.",
      "The most dangerous aspect is how long this could go undetected. If the owner handles all operator-gated calls during early deployment (common), the bug only surfaces when someone first tries to use a granted operator role — potentially long after launch.",
      "This reinforced a personal rule: for every permission-granting function, verify that granting the permission actually enables access. updateOperator(x, true) should make x able to call protected functions. Verifying this trivially catches the entire class of inverted-logic access control bugs.",
    ],
    reportLink: 'https://code4rena.com/audits/2025-01-liquid-ron/submissions/S-43',
    websiteLink: 'https://liquidron.io',
  },
  {
    slug: 'aegis-yusd',
    protocol: 'Aegis.im YUSD',
    logo: '/aegis.svg',
    platform: 'Sherlock',
    platformLogo: '/sherlock.webp',
    severity: 'HIGH',
    title: 'Shared _untrackedAvailableAssetBalance Between Redemptions and Rewards Causes Undercollateralization Risk',
    findingId: '#59',
    date: 'Apr 2025',
    status: 'INVALID',
    summary: {
      overview:
        'AegisMinting uses the same _untrackedAvailableAssetBalance function to gatekeep both approveRedeem (user collateral withdrawals) and depositIncome (reward YUSD minting) with no segregation between the two pools. A fund manager calling depositIncome before a pending redemption is approved consumes collateral reserved for the user, causing the redemption to fail or minting unbacked YUSD — directly violating the protocol\'s 1:1 redemption guarantee. Marked invalid by the judge on admin-trust grounds, but the accounting invariant violation is real.',
      affectedComponent: 'AegisMinting.sol — _untrackedAvailableAssetBalance (L340, L407)',
      riskClassification: 'Collateral Accounting Invariant Violation / Stablecoin Peg Risk',
    },
    rootCause: {
      description:
        '_untrackedAvailableAssetBalance returns the raw unaccounted ERC-20 balance of the contract. Both approveRedeem and depositIncome call this same function to check available funds — there is no reservation or earmarking of collateral for pending redemptions. Any collateral deposited for a redemption is immediately visible to depositIncome, which can consume it to mint reward YUSD before the redemption is processed.',
      vulnerableCode: {
        lang: 'solidity',
        label: 'AegisMinting.sol — L340 (approveRedeem) and L407 (depositIncome) share the same balance check',
        code: `// AegisMinting.sol L340 — approveRedeem
function approveRedeemRequest(string calldata requestId, uint256 amount) external {
    // @audit uses raw untracked balance — no reservation for pending redemptions
    uint256 availableAssetFunds = _untrackedAvailableAssetBalance(
        request.order.collateralAsset
    );
    if (availableAssetFunds < collateralAmount) {
        revert NotEnoughFunds();
    }
    // transfers collateral to user
}

// AegisMinting.sol L407 — depositIncome
function depositIncome(OrderLib.Order calldata order, bytes calldata signature) external {
    // @audit same balance check — sees funds reserved for pending redemptions
    uint256 availableAssetFunds = _untrackedAvailableAssetBalance(
        order.collateralAsset
    );
    if (availableAssetFunds < order.collateralAmount) {
        revert NotEnoughFunds();
    }
    // mints new YUSD as rewards — consuming the shared balance
    IYUSD(yusd).mint(aegisRewards, yusdAmount);
}

// _untrackedAvailableAssetBalance — returns raw ERC-20 balance, no reservation
function _untrackedAvailableAssetBalance(address asset) internal view returns (uint256) {
    return IERC20(asset).balanceOf(address(this)); // no earmarking
}

// PoC test output:
// [4/6] Untracked balance after redemption request: 100.0
// ⚠️ PROBLEM: Full amount still available despite pending redemption!
// [5/6] depositIncome succeeded (BUG: Should have failed!)
// [6/6] Redemption failed — NotEnoughFunds()
// Final YUSD rewards balance: 85.5 (minted without proper backing)`,
      },
      incorrectAssumptions: [
        'Collateral deposited for redemptions is implicitly reserved and not visible to depositIncome',
        'Admins will always deposit separate collateral before calling depositIncome — the contract enforces this separation',
        'The _untrackedAvailableAssetBalance check is sufficient to prevent double-allocation of the same funds',
      ],
      affectedContracts: [
        'AegisMinting.sol — approveRedeemRequest() (L340)',
        'AegisMinting.sol — depositIncome() (L407)',
        'AegisMinting.sol — _untrackedAvailableAssetBalance() (shared)',
      ],
    },
    attackScenario: {
      title: 'Fund Manager Drains Redemption Collateral via depositIncome',
      steps: [
        'Admin deposits 100 USDC into AegisMinting to cover Alice\'s pending redemption request for 90 YUSD → 100 USDC.',
        '_untrackedAvailableAssetBalance now returns 100 USDC. The same balance is visible to both approveRedeem and depositIncome.',
        'Fund manager calls depositIncome on Monday (per protocol docs). The check passes — 100 USDC is "available." New YUSD rewards are minted. The 100 USDC is now tracked as income backing.',
        'Admin calls approveRedeemRequest for Alice. _untrackedAvailableAssetBalance now returns 0 (balance was consumed by depositIncome). Transaction reverts with NotEnoughFunds. Alice cannot redeem her YUSD. The newly minted reward YUSD is unbacked.',
      ],
    },
    impact: [
      {
        category: 'Redemption Failure',
        description:
          'Pending redemption requests can fail permanently if depositIncome consumes the collateral earmarked for them. Users holding YUSD cannot redeem 1:1 for collateral.',
        level: 'HIGH',
      },
      {
        category: 'Unbacked YUSD Minting',
        description:
          'depositIncome mints reward YUSD against collateral already committed to pending redemptions. The resulting YUSD supply exceeds actual collateral backing.',
        level: 'HIGH',
      },
      {
        category: 'Peg Integrity',
        description:
          "YUSD's core guarantee — always redeemable 1:1 for collateral — is violated. Any period where rewards are distributed before redemptions are settled creates a backing gap.",
        level: 'HIGH',
      },
    ],
    mitigation: {
      description:
        'Introduce separate tracking for collateral reserved for pending redemptions vs collateral available for rewards. depositIncome must only draw from the excess after all pending redemptions are covered.',
      vulnerableCode: `// Single shared balance — no separation
function _untrackedAvailableAssetBalance(address asset)
    internal view returns (uint256) {
    return IERC20(asset).balanceOf(address(this));
    // @audit redemption collateral and reward collateral are indistinguishable
}`,
      fixedCode: `// Separate reservation tracking
mapping(address => uint256) private _reservedForRedemptions;

function approveRedeemRequest(...) external {
    // reserve collateral at request time
    _reservedForRedemptions[asset] += collateralAmount;
    // ... approve
    _reservedForRedemptions[asset] -= collateralAmount;
}

function depositIncome(...) external {
    uint256 total = IERC20(asset).balanceOf(address(this));
    uint256 reserved = _reservedForRedemptions[asset];
    uint256 available = total > reserved ? total - reserved : 0;
    // @dev only use excess collateral not earmarked for redemptions
    if (available < order.collateralAmount) revert NotEnoughFunds();
}`,
      considerations: [
        'Reserve collateral atomically when a redemption request is submitted, not when it is approved — this closes the window entirely',
        'Add a protocol invariant test: after any sequence of requestRedeem + depositIncome, all pending redemptions must be fully coverable by remaining contract balance',
        'Consider a two-pool architecture: RedemptionVault and RewardVault — transfers between them require explicit admin action with no shared balance view',
      ],
    },
    researcherNotes: [
      "I found this by mapping every function that reads _untrackedAvailableAssetBalance and asking: do any two of these functions compete for the same pool? approveRedeem and depositIncome both called it with no coordination — classic shared-state race condition.",
      "The judge marked this invalid on admin-trust grounds: both functions are admin-only, so a rational admin wouldn't call depositIncome while redemptions are pending. I disagree with the framing. The protocol docs state rewards are distributed every Monday on a fixed schedule. A regular Monday distribution that happens before a pending redemption is approved is not malicious — it's the normal operating sequence. The contract should enforce safety invariants regardless of admin intent.",
      "The PoC made the invariant violation undeniable. After depositIncome succeeds, the hardhat test shows: NotEnoughFunds on the subsequent approveRedeemRequest. 85.5 YUSD in rewards minted with zero net collateral backing. The numbers don't lie even if the judge treated it as a process issue.",
      "This is a recurring pattern I now look for in every stablecoin with admin-gated flows: when multiple admin functions share a single balance pool, ask whether their execution order creates an invariant violation. Fixed schedules (every Monday) make the race condition deterministic, not hypothetical.",
    ],
    reportLink: 'https://audits.sherlock.xyz/contests/799/voting/59',
    websiteLink: 'https://aegis.im',
  },
  {
    slug: 'jigsaw-protocol',
    protocol: 'Jigsaw Protocol',
    logo: '/jigsaw.jpeg',
    platform: 'Cantina',
    platformLogo: '/cantina.webp',
    severity: 'MEDIUM',
    title: 'Incorrect Debt-Collateral Matching in Liquidation Leads to Bad Debt and Liquidator Loss',
    findingId: '#87',
    date: 'May 2025',
    status: 'ACCEPTED',
    summary: {
      overview:
        'The liquidate() function calculates the collateral to seize based on the full jUSD debt amount, then caps that collateral to the user\'s actual balance — but never reduces the jUSD burned to match. Liquidators are forced to burn more jUSD than the seized collateral is worth, generating protocol-level bad debt and destroying any rational incentive to liquidate undercollateralized positions.',
      affectedComponent: 'LiquidationManager.sol — liquidate() L348',
      riskClassification: 'Bad Debt Generation / Liquidator Disincentive',
    },
    rootCause: {
      description:
        'When a position\'s debt exceeds the value of its remaining collateral, liquidate() correctly caps collateralUsed to the user\'s actual balance. However, it does not proportionally reduce the jUSD repayment amount to match. The full debt amount is burned regardless of how much collateral was actually available, creating a guaranteed loss for the liquidator equal to (debtValue − collateralValue).',
      vulnerableCode: {
        lang: 'solidity',
        label: 'LiquidationManager.sol — L348 (collateral capped, debt not scaled)',
        code: `function liquidate(..., uint256 _jUsdAmount, ...) external {
    // Collateral calculated from full debt
    uint256 collateralUsed = (_jUsdAmount / currentPrice) * PRICE_PRECISION;

    // @audit Capped to user's actual balance — but _jUsdAmount is NOT reduced
    if (collateralUsed > holdingCollateral) {
        collateralUsed = holdingCollateral;
        // _jUsdAmount remains unchanged — full debt is still burned
    }

    // Liquidator burns full _jUsdAmount
    jUsd.burnFrom(msg.sender, _jUsdAmount);

    // But only receives capped collateralUsed
    _transferCollateral(msg.sender, collateralUsed);

    // Result: liquidator loss = _jUsdAmount - (collateralUsed * currentPrice)
}

// PoC output (10 WETH @ $2000 → $1100):
// Alice debt:       16,000 jUSD
// Alice collateral: 10 WETH ($11,000 at $1,100)
// Bob burns:        16,000 jUSD  ← full debt
// Bob receives:     10 WETH ($11,000)
// Bob net loss:     $5,000
// Protocol bad debt: $5,000`,
      },
      incorrectAssumptions: [
        'Capping collateralUsed to the holding balance is sufficient — the jUSD burn amount does not also need to be scaled',
        'Liquidators will remain incentivized even when they burn more jUSD than the seized collateral is worth',
        'Protocol solvency is maintained as long as positions are cleared, regardless of the debt/collateral ratio at liquidation time',
      ],
      affectedContracts: [
        'LiquidationManager.sol — liquidate() (L348)',
      ],
    },
    attackScenario: {
      title: 'Guaranteed Liquidator Loss on Any Undercollateralized Position',
      steps: [
        'Alice deposits 10 WETH ($20,000 at $2,000/WETH) and borrows 16,000 jUSD (80% LTV). Position is healthy.',
        'WETH price drops to $1,100. Alice\'s collateral is now worth $11,000 against $16,000 debt — position is liquidatable.',
        'Bob calls liquidate() with the full 16,000 jUSD debt amount. liquidate() calculates ~14.54 WETH needed, but Alice only has 10 WETH. collateralUsed is capped to 10 WETH.',
        'Bob\'s full 16,000 jUSD is burned. Bob receives 10 WETH worth $11,000. Bob suffers a guaranteed $5,000 loss. No rational liquidator will call this function — the position sits undercollateralized indefinitely, accruing as unrecoverable protocol bad debt.',
      ],
    },
    impact: [
      {
        category: 'Liquidator Disincentive',
        description:
          'Any liquidation where debt exceeds available collateral guarantees a net loss for the liquidator. Rational actors will not liquidate, leaving undercollateralized positions permanently unresolved.',
        level: 'HIGH',
      },
      {
        category: 'Protocol Bad Debt',
        description:
          'Each such liquidation generates bad debt equal to (jUSD burned) − (collateral value). At scale and in volatile markets, this silently erodes protocol solvency.',
        level: 'HIGH',
      },
      {
        category: 'Stablecoin Peg Risk',
        description:
          'Accumulating bad debt means jUSD in circulation exceeds the collateral backing it, threatening the peg under redemption pressure.',
        level: 'MEDIUM',
      },
    ],
    mitigation: {
      description:
        'After capping collateralUsed to the holding balance, scale the jUSD repayment down to the maximum value that the available collateral can cover. Never burn more jUSD than the collateral is worth.',
      vulnerableCode: `// Collateral capped, debt unchanged — creates loss
if (collateralUsed > holdingCollateral) {
    collateralUsed = holdingCollateral;
    // _jUsdAmount NOT updated → liquidator overpays
}
jUsd.burnFrom(msg.sender, _jUsdAmount);`,
      fixedCode: `// Scale debt down to match available collateral
if (collateralUsed > holdingCollateral) {
    collateralUsed = holdingCollateral;
    // Recompute max repayable from actual collateral
    uint256 maxRepayable = collateralUsed.mulDiv(
        currentPrice, PRICE_PRECISION
    );
    require(_jUsdAmount <= maxRepayable, "Debt > collateral value");
    _jUsdAmount = maxRepayable; // burn only what collateral covers
}
jUsd.burnFrom(msg.sender, _jUsdAmount);`,
      considerations: [
        'Alternatively, compute maxRepayable before the cap check and use it as the authoritative burn amount — avoids two branches',
        'Add a Forge invariant: after any liquidation, (jUSD burned * PRICE_PRECISION) must be <= (collateralSeized * currentPrice)',
        'Consider a bad-debt socialization mechanism (e.g. protocol insurance fund) to cover residual shortfalls that exceed collateral value',
      ],
    },
    researcherNotes: [
      "I found this by tracing the liquidation math path end-to-end and asking one question: what happens when the collateral cap fires? The cap path modified collateralUsed but left _jUsdAmount untouched. Once I saw that, I wrote the PoC immediately — it's a one-line invariant violation.",
      "The impact is amplified by the liquidation incentive structure. A $5,000 guaranteed loss means no rational liquidator will touch the position. The bug doesn't just create bad debt in theory — it creates a class of positions that will never be liquidated in practice, because the market correctly prices in the loss.",
      "The Forge PoC was straightforward: deposit 10 WETH, borrow at 80% LTV, drop oracle price 45%, liquidate, assert Bob's net loss > 0. The console logs made the discrepancy unmistakable: '16,000 jUSD burned, 11,000 worth of WETH received.' Any passing test that doesn't check liquidator P&L misses this class of bug entirely.",
      "This is a classic asymmetric-update bug: two variables that must move together (debt burned and collateral received) are updated via two separate code paths, and one path forgets to update the other. The fix is always to derive the secondary value from the primary after any cap or floor is applied, not to update them independently.",
    ],
    reportLink: '#',
    websiteLink: 'https://jigsaw.finance',
  },
];
