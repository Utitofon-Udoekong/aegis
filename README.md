# Bitcoin Vault AI

AI-optimized Bitcoin DeFi vault concept demonstrating smart contract integration with AI-powered strategy recommendations.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)
- Hardhat
- Reown AppKit Project ID ([Get one here](https://cloud.reown.com))
- Anthropic API Key ([Get one here](https://console.anthropic.com))

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Fill in your `.env` file (for Nuxt app):
```env
# Contract Addresses (set after deployment)
VAULT_CONTRACT_ADDRESS=
VAULTBTC_ADDRESS=

# Reown AppKit
REOWN_PROJECT_ID=your_reown_project_id

# Anthropic AI
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Smart Contract Deployment

Hardhat uses the Keystore plugin to securely store deployment secrets. You'll need to set up your Sepolia RPC URL and private key in the keystore.

1. **Set up Hardhat Keystore** (first time only):
```bash
cd contract
pnpm hardhat keystore set SEPOLIA_RPC_URL
# Enter your Sepolia RPC URL (e.g., from Alchemy or Infura)
# You'll be prompted to create a keystore password

pnpm hardhat keystore set SEPOLIA_PRIVATE_KEY
# Enter your private key (the account that will deploy contracts)
# Make sure this account has Sepolia ETH

pnpm hardhat keystore set ETHERSCAN_API_KEY
# Enter your Etherscan API key (optional, for contract verification)
```

2. **Compile contracts**:
```bash
pnpm compile
```

3. **Test deployment** (simulated network):
```bash
pnpm deploy:simulate
```

This runs the deployment on a simulated network to verify your module works correctly.

4. **Deploy to Sepolia testnet**:
```bash
pnpm deploy
```

This will:
- Prompt for your keystore password
- Deploy VaultBTC contract first
- Deploy AIVault contract with VaultBTC address
- Store deployment results in `ignition/deployments/chain-11155111/`
- Show you the deployed contract addresses

5. **Update `.env` with deployed contract addresses**:
```env
VAULTBTC_ADDRESS=<deployed_vaultbtc_address>
VAULT_CONTRACT_ADDRESS=<deployed_aivault_address>
```

6. **(Optional) Verify contracts on Etherscan**:
```bash
cd contract
pnpm hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

**Note**: Ignition automatically handles:
- Parallel transaction execution
- Error recovery
- Gas price bumps for stuck transactions
- Contract verification on Etherscan
- Deployment state management

### Development

Start the development server:
```bash
pnpm dev
```

Visit `http://localhost:3000`

## 📁 Project Structure

```
bitcoin-vault-ai/
├── app/                # Nuxt 4 app directory
│   ├── assets/         # CSS and other assets
│   ├── components/     # Vue components
│   ├── composables/    # Vue composables
│   ├── pages/          # File-based routing
│   ├── plugins/        # Vue plugins
│   ├── utils/          # App utilities
│   └── app.vue         # Root component
├── contract/           # Hardhat project
│   ├── contracts/      # Smart contracts (Solidity)
│   ├── scripts/        # Deployment scripts (legacy)
│   ├── ignition/       # Hardhat Ignition modules
│   ├── test/           # Contract tests
│   └── hardhat.config.ts
├── server/             # Nuxt server API routes
├── shared/              # Shared code (app + server)
│   └── types/          # TypeScript types
├── stores/              # Pinia stores (root level)
└── public/              # Public static files
```

## 🎯 Features

- **Vault Operations**: Deposit and withdraw vaultBTC with yield calculation
- **AI Strategy Engine**: Get AI-powered DeFi strategy recommendations
- **Wallet Integration**: Multi-wallet support via Reown AppKit
- **Real-time Analytics**: Portfolio tracking and transaction history
- **Security**: ReentrancyGuard, Pausable contracts, access control

## 🔧 Tech Stack

- **Framework**: Nuxt 4
- **Web3**: Reown AppKit (WalletConnect)
- **Smart Contracts**: Hardhat + Solidity
- **Styling**: TailwindCSS
- **State Management**: Pinia
- **AI**: Anthropic Claude Sonnet 4

## 📝 License

MIT
