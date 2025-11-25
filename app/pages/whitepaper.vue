<template>
  <div class="min-h-screen bg-slate-950 dark:bg-slate-950 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0 bg-grid-pattern"></div>
    <div class="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>

    <div class="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
      <!-- Header -->
      <header class="mb-8">
        <div class="flex items-center justify-between">
          <NuxtLink to="/" class="flex items-center gap-3">
            <Logo />
          </NuxtLink>
          <NuxtLink to="/">
            <UiButton variant="outline" size="sm" class="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">
              <Icon name="mdi:arrow-left" class="mr-2" />
              Back
            </UiButton>
          </NuxtLink>
        </div>
      </header>

      <!-- Whitepaper Content -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 mb-8">
        <h1 class="text-4xl md:text-5xl font-bold mb-2 text-gray-900 dark:text-white">
          Bitcoin Vault AI
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 mb-8">
          AI-Optimized DeFi Vaults for Bitcoin
        </p>

        <!-- One-Page Idea Summary -->
        <section class="mb-12">
          <h2 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            1. Idea Summary
          </h2>
          <div class="prose prose-lg dark:prose-invert max-w-none">
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Bitcoin Vault AI</strong> is an AI-enhanced DeFi vault platform designed to optimize yield strategies for Bitcoin-backed assets. 
              The platform combines smart contract security with artificial intelligence to provide personalized, risk-adjusted investment recommendations.
            </p>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Core Concept:</strong> Users deposit vaultBTC (representing Bitcoin positions) into a secure vault contract. 
              An AI engine analyzes market conditions, user risk profiles, and DeFi opportunities to generate optimized yield strategies. 
              The platform tracks performance, calculates yields, and provides real-time analytics.
            </p>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Novelty:</strong> This is the first DeFi vault concept specifically designed for Bitcoin trustless vaults, 
              combining AI-powered strategy generation with secure smart contract infrastructure. The architecture is built to seamlessly 
              port to Bitcoin trustless vaults when the technology matures.
            </p>
            <p class="text-gray-700 dark:text-gray-300">
              <strong>Impact:</strong> Enables Bitcoin holders to participate in DeFi yield opportunities with AI-guided risk management, 
              making DeFi more accessible and optimized for the largest cryptocurrency by market cap.
            </p>
          </div>
        </section>

        <!-- Technical Notes -->
        <section class="mb-12">
          <h2 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            2. Technical Architecture
          </h2>
          <div class="prose prose-lg dark:prose-invert max-w-none">
            <h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Smart Contracts</h3>
            <ul class="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>AIVault.sol:</strong> Main vault contract handling deposits, withdrawals, and yield calculations. Uses OpenZeppelin's ReentrancyGuard, Pausable, and Ownable patterns.</li>
              <li><strong>VaultBTC.sol:</strong> ERC20 token representing Bitcoin positions. In production, this would be minted by Bitcoin trustless vaults.</li>
              <li><strong>Yield Calculation:</strong> Time-based APY calculation (currently 5% APY, configurable). Production version would track deposit timestamps for accurate yield.</li>
            </ul>

            <h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white mt-6">Frontend Architecture</h3>
            <ul class="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Framework:</strong> Nuxt 4 with Vue 3 Composition API</li>
              <li><strong>Web3 Integration:</strong> Reown AppKit (WalletConnect) for multi-wallet support</li>
              <li><strong>State Management:</strong> Pinia stores for vault state, wallet state, and AI conversations</li>
              <li><strong>AI Integration:</strong> Anthropic Claude Sonnet 4 API for strategy generation</li>
              <li><strong>Styling:</strong> TailwindCSS with custom dark theme</li>
            </ul>

            <h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white mt-6">Key Features</h3>
            <ul class="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Deposit/withdraw vaultBTC with automatic yield calculation</li>
              <li>AI-powered strategy recommendations (conservative, moderate, aggressive)</li>
              <li>Real-time analytics dashboard (TVL, users, APY, rewards)</li>
              <li>Transaction history tracking via blockchain events</li>
              <li>Portfolio performance visualization</li>
              <li>Interactive AI chat for strategy consultation</li>
            </ul>
          </div>
        </section>

        <!-- Security Considerations -->
        <section class="mb-12">
          <h2 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            3. Security Considerations
          </h2>
          <div class="prose prose-lg dark:prose-invert max-w-none">
            <h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Smart Contract Security</h3>
            <ul class="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>ReentrancyGuard:</strong> All external calls are protected against reentrancy attacks using OpenZeppelin's ReentrancyGuard modifier</li>
              <li><strong>SafeERC20:</strong> Uses SafeERC20 library for token transfers to handle non-standard ERC20 tokens safely</li>
              <li><strong>Pausable:</strong> Contract can be paused by owner in case of emergency, with emergency withdraw functionality</li>
              <li><strong>Access Control:</strong> Ownable pattern restricts critical functions to contract owner</li>
              <li><strong>Input Validation:</strong> All user inputs are validated (amount > 0, sufficient balance checks)</li>
              <li><strong>Immutable References:</strong> vaultBTC token address is immutable after deployment</li>
            </ul>

            <h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white mt-6">Risk Mitigation</h3>
            <ul class="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Emergency Pause:</strong> Owner can pause all operations if vulnerabilities are discovered</li>
              <li><strong>Emergency Withdraw:</strong> Users can withdraw their funds even when contract is paused</li>
              <li><strong>Yield Calculation:</strong> Simplified for demo; production would require timestamp tracking and more sophisticated yield mechanisms</li>
              <li><strong>Frontend Security:</strong> All blockchain interactions require explicit user approval via wallet</li>
              <li><strong>API Security:</strong> AI API keys stored server-side, never exposed to client</li>
            </ul>

            <h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white mt-6">Known Limitations (Demo)</h3>
            <ul class="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Yield calculation is simplified (30-day fixed yield for demo purposes)</li>
              <li>No timestamp tracking for accurate time-based yield calculation</li>
              <li>VaultBTC is a mock token; production would integrate with actual Bitcoin trustless vaults</li>
              <li>No multi-signature or timelock mechanisms (would be added for production)</li>
            </ul>
          </div>
        </section>

        <!-- Bitcoin Vault Portability -->
        <section class="mb-12">
          <h2 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            4. Portability to Bitcoin Trustless Vaults
          </h2>
          <div class="prose prose-lg dark:prose-invert max-w-none">
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              The architecture is specifically designed to be portable to Bitcoin trustless vaults when the technology becomes available. 
              Here's how the system adapts:
            </p>

            <h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Current Implementation (Ethereum)</h3>
            <ul class="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li>vaultBTC is an ERC20 token minted by a mock contract</li>
              <li>Users deposit vaultBTC into AIVault contract</li>
              <li>Yield is calculated and distributed in vaultBTC</li>
            </ul>

            <h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white mt-6">Future Bitcoin Vault Integration</h3>
            <ul class="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Token Minting:</strong> vaultBTC tokens would be minted by Bitcoin trustless vault contracts when users lock Bitcoin</li>
              <li><strong>Metadata:</strong> vaultBTC tokens would include metadata about the underlying Bitcoin position (amount, lock time, etc.)</li>
              <li><strong>Cross-Chain:</strong> The AIVault contract would remain on Ethereum, but vaultBTC could be bridged from Bitcoin vault chains</li>
              <li><strong>Yield Sources:</strong> Yield would come from DeFi protocols on Ethereum, while the underlying Bitcoin remains secured in trustless vaults</li>
              <li><strong>No Code Changes:</strong> The AIVault contract requires no modifications - it already works with any ERC20 token</li>
            </ul>

            <h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white mt-6">Migration Path</h3>
            <ol class="list-decimal pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Bitcoin trustless vaults deploy and start minting vaultBTC tokens</li>
              <li>vaultBTC tokens are bridged to Ethereum (or deployed on EVM-compatible chains)</li>
              <li>Existing AIVault contract accepts vaultBTC from Bitcoin vaults (no changes needed)</li>
              <li>AI strategy engine adapts to include Bitcoin-specific market data</li>
              <li>Frontend updates to show Bitcoin vault metadata and cross-chain status</li>
            </ol>

            <p class="text-gray-700 dark:text-gray-300 mt-4">
              <strong>Key Design Decision:</strong> By using a standard ERC20 interface for vaultBTC, the system remains chain-agnostic 
              and can work with any Bitcoin trustless vault implementation that mints ERC20-compatible tokens.
            </p>
          </div>
        </section>

        <!-- Team & Contact -->
        <section class="mb-8">
          <h2 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            5. Team & Contact Information
          </h2>
          <div class="prose prose-lg dark:prose-invert max-w-none">
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Project:</strong> Bitcoin Vault AI<br>
              <strong>Hackathon:</strong> AWS Global Vibe Hackathon 2025<br>
              <strong>Track:</strong> AI-Enhanced Finance & Risk Track
            </p>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Repository:</strong> <a href="https://github.com/yourusername/bitcoin-vault-ai" class="text-emerald-400 hover:text-emerald-300" target="_blank">GitHub Repository</a><br>
              <strong>Demo:</strong> <a href="https://your-demo-url.com" class="text-emerald-400 hover:text-emerald-300" target="_blank">Live Demo</a><br>
              <strong>License:</strong> MIT
            </p>
            <p class="text-gray-700 dark:text-gray-300">
              <em>Note: Please update with your actual team information, contact details, and repository links.</em>
            </p>
          </div>
        </section>

        <!-- Footer -->
        <div class="text-center pt-8 border-t border-gray-200 dark:border-gray-700">
          <p class="text-gray-500 dark:text-gray-400 text-sm">
            Built for AWS Global Vibe Hackathon 2025 • AI-Enhanced Finance & Risk Track
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Set page metadata
useHead({
  title: 'Whitepaper - Bitcoin Vault AI',
  meta: [
    { name: 'description', content: 'Technical whitepaper for Bitcoin Vault AI - AI-optimized DeFi vaults for Bitcoin' }
  ]
})
</script>

