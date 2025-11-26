<template>
  <div class="min-h-screen bg-slate-950 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0 bg-grid-pattern"></div>
    <div class="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
    <div class="absolute top-1/2 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>

    <div class="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
      <!-- Header -->
      <header class="mb-10">
        <div class="flex items-center justify-between">
          <NuxtLink to="/" class="flex items-center gap-3">
            <Logo />
          </NuxtLink>
          <NuxtLink to="/">
            <UiButton variant="outline" size="sm">
              <Icon name="mdi:arrow-left" class="mr-2" />
              Back
            </UiButton>
          </NuxtLink>
        </div>
      </header>

      <!-- Whitepaper Hero -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium">
          <Icon name="mdi:file-document" />
          Technical Documentation
        </div>
        <h1 class="text-5xl font-bold mb-4 text-white">AEGIS</h1>
        <p class="text-xl text-slate-400">AI-Optimized DeFi Vaults for Bitcoin</p>
      </div>

      <!-- Main Content -->
      <div class="space-y-8">
        <!-- Section 1: Idea Summary -->
        <section class="group relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-700/50 p-8 transition-all duration-300 hover:border-slate-600/50">
          <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
          <div class="relative">
            <div class="flex items-center gap-3 mb-6">
              <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
                <span class="text-lg font-bold text-emerald-400">1</span>
              </div>
              <h2 class="text-2xl font-bold text-white">Idea Summary</h2>
            </div>
            
            <div class="space-y-4 text-slate-300">
              <p>
                <strong class="text-white">AEGIS</strong> is an AI-enhanced DeFi vault platform designed to optimize yield strategies for Bitcoin-backed assets. 
              The platform combines smart contract security with artificial intelligence to provide personalized, risk-adjusted investment recommendations.
            </p>
              <p>
                <strong class="text-emerald-400">Core Concept:</strong> Users deposit vaultBTC (representing Bitcoin positions) into a secure vault contract. 
              An AI engine analyzes market conditions, user risk profiles, and DeFi opportunities to generate optimized yield strategies. 
            </p>
              <p>
                <strong class="text-emerald-400">Novelty:</strong> This is the first DeFi vault concept specifically designed for Bitcoin trustless vaults, 
                combining AI-powered strategy generation with secure smart contract infrastructure.
            </p>
              <p>
                <strong class="text-emerald-400">Impact:</strong> Enables Bitcoin holders to participate in DeFi yield opportunities with AI-guided risk management.
            </p>
            </div>
          </div>
        </section>

        <!-- Section 2: Technical Architecture -->
        <section class="group relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-700/50 p-8 transition-all duration-300 hover:border-slate-600/50">
          <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div class="relative">
            <div class="flex items-center gap-3 mb-6">
              <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/20 ring-1 ring-blue-500/30">
                <span class="text-lg font-bold text-blue-400">2</span>
              </div>
              <h2 class="text-2xl font-bold text-white">Technical Architecture</h2>
            </div>
            
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Icon name="mdi:file-code" class="text-blue-400" />
                  Smart Contracts
                </h3>
                <ul class="space-y-2 text-slate-300">
                  <li class="flex items-start gap-2">
                    <Icon name="mdi:check" class="text-emerald-400 mt-1 flex-shrink-0" />
                    <span><strong class="text-white">AIVault.sol:</strong> Main vault contract with deposits, withdrawals, and time-based yield</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <Icon name="mdi:check" class="text-emerald-400 mt-1 flex-shrink-0" />
                    <span><strong class="text-white">VaultBTC.sol:</strong> ERC20 token representing Bitcoin positions</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <Icon name="mdi:check" class="text-emerald-400 mt-1 flex-shrink-0" />
                    <span><strong class="text-white">Yield System:</strong> 5% APY with 24-hour minimum hold, claimable separately</span>
                  </li>
            </ul>
              </div>

              <div>
                <h3 class="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Icon name="mdi:application-brackets" class="text-blue-400" />
                  Frontend Architecture
                </h3>
                <div class="grid grid-cols-2 gap-3">
                  <div class="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <p class="text-xs text-slate-500 mb-1">Framework</p>
                    <p class="text-sm text-white">Nuxt 4 + Vue 3</p>
                  </div>
                  <div class="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <p class="text-xs text-slate-500 mb-1">Web3</p>
                    <p class="text-sm text-white">Reown AppKit</p>
                  </div>
                  <div class="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <p class="text-xs text-slate-500 mb-1">AI</p>
                    <p class="text-sm text-white">Google Gemini</p>
                  </div>
                  <div class="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <p class="text-xs text-slate-500 mb-1">Styling</p>
                    <p class="text-sm text-white">TailwindCSS</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 3: Security -->
        <section class="group relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-700/50 p-8 transition-all duration-300 hover:border-slate-600/50">
          <div class="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
          <div class="relative">
            <div class="flex items-center gap-3 mb-6">
              <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/20 ring-1 ring-amber-500/30">
                <span class="text-lg font-bold text-amber-400">3</span>
              </div>
              <h2 class="text-2xl font-bold text-white">Security Considerations</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div class="flex items-center gap-2 mb-2">
                  <Icon name="mdi:shield-check" class="text-emerald-400" />
                  <span class="font-semibold text-white">ReentrancyGuard</span>
                </div>
                <p class="text-sm text-slate-400">Protection against reentrancy attacks</p>
              </div>
              <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div class="flex items-center gap-2 mb-2">
                  <Icon name="mdi:lock" class="text-emerald-400" />
                  <span class="font-semibold text-white">SafeERC20</span>
                </div>
                <p class="text-sm text-slate-400">Safe token transfer handling</p>
              </div>
              <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div class="flex items-center gap-2 mb-2">
                  <Icon name="mdi:pause-circle" class="text-amber-400" />
                  <span class="font-semibold text-white">Pausable</span>
                </div>
                <p class="text-sm text-slate-400">Emergency pause functionality</p>
              </div>
              <div class="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div class="flex items-center gap-2 mb-2">
                  <Icon name="mdi:account-key" class="text-blue-400" />
                  <span class="font-semibold text-white">Ownable</span>
                </div>
                <p class="text-sm text-slate-400">Access control for admin functions</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 4: Bitcoin Portability -->
        <section class="group relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-700/50 p-8 transition-all duration-300 hover:border-slate-600/50">
          <div class="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl"></div>
          <div class="relative">
            <div class="flex items-center gap-3 mb-6">
              <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/20 ring-1 ring-orange-500/30">
                <span class="text-lg font-bold text-orange-400">4</span>
              </div>
              <h2 class="text-2xl font-bold text-white">Vault Portability</h2>
            </div>
            
            <div class="space-y-4 text-slate-300">
              <p>
                The architecture is designed to be portable to Bitcoin trustless vaults when the technology matures.
              </p>
              
              <div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <h4 class="font-semibold text-white mb-3">Migration Path</h4>
                <ol class="space-y-2">
                  <li class="flex items-start gap-3">
                    <span class="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold flex-shrink-0">1</span>
                    <span>Bitcoin trustless vaults deploy and mint vaultBTC tokens</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <span class="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold flex-shrink-0">2</span>
                    <span>Tokens bridged to EVM-compatible chains</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <span class="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold flex-shrink-0">3</span>
                    <span>AIVault accepts vaultBTC (no changes needed)</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <span class="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold flex-shrink-0">4</span>
                    <span>AI adapts to Bitcoin-specific market data</span>
                  </li>
            </ol>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 5: Team -->
        <section class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900 border border-emerald-500/20 p-8 transition-all duration-300 hover:border-emerald-500/30">
          <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div class="relative">
            <div class="flex items-center gap-3 mb-6">
              <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
                <span class="text-lg font-bold text-emerald-400">5</span>
              </div>
              <h2 class="text-2xl font-bold text-white">Team & Contact</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <p class="text-xs text-slate-500 mb-1">Project</p>
                <p class="text-sm font-semibold text-white">AEGIS</p>
              </div>
              <div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <p class="text-xs text-slate-500 mb-1">Hackathon</p>
                <p class="text-sm font-semibold text-white">AWS Global Vibe 2025</p>
              </div>
              <div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <p class="text-xs text-slate-500 mb-1">Track</p>
                <p class="text-sm font-semibold text-white">AI-Enhanced Finance</p>
              </div>
            </div>
          </div>
        </section>
      </div>

        <!-- Footer -->
      <div class="text-center mt-12 pt-8 border-t border-slate-800">
        <p class="text-slate-500 text-sm">
            Built for AWS Global Vibe Hackathon 2025 • AI-Enhanced Finance & Risk Track
          </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Whitepaper - AEGIS',
  meta: [
    { name: 'description', content: 'Technical whitepaper for AEGIS - AI-optimized DeFi vaults for Bitcoin' }
  ]
})
</script>
