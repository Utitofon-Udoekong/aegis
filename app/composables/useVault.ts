import { AIVaultABI } from '~~/config/abi/ai-vault'
import { VaultBTCABI } from '~~/config/abi/vault-btc'
import { formatUnits, parseUnits } from 'viem'
import { useAppKitAccount } from "@reown/appkit/vue";
import { wagmiAdapter } from '~~/config/appkit';
import { readContract, writeContract, waitForTransactionReceipt, estimateGas } from '@wagmi/core'
import { encodeFunctionData } from 'viem'
import type { Address } from 'viem'

export const useVault = () => {
  const config = useRuntimeConfig()

  const accountData = useAppKitAccount();
  
  /**
   * Get user's wallet balance of vaultBTC tokens (ERC20 token balance)
   * This is the amount available in their wallet to deposit
   */
  const getVaultBTCBalance = async (userAddress: string): Promise<string> => {
    const vaultBtcAddress = config.public.vaultBtcAddress as string
    
    if (!vaultBtcAddress || vaultBtcAddress.trim() === '') {
      return '0'
    }

    try {
      const balance = await readContract(wagmiAdapter.wagmiConfig, {
        address: vaultBtcAddress as Address,
        abi: VaultBTCABI,
        functionName: 'balanceOf',
        args: [userAddress],
      })
      return formatUnits(balance as bigint, 18)
    } catch {
      return '0'
    }
  }
  
  // Maximum uint256 for unlimited approval
  const MAX_UINT256 = 2n ** 256n - 1n
  
  const approveVaultBTC = async (amount: string): Promise<any> => {
    const vaultBtcAddress = config.public.vaultBtcAddress as string
    const vaultContractAddress = config.public.vaultContractAddress as string
    
    if (!vaultBtcAddress || vaultBtcAddress.trim() === '') {
      throw new Error('VAULT_BTC_ADDRESS is not configured')
    }
    if (!vaultContractAddress || vaultContractAddress.trim() === '') {
      throw new Error('VAULT_CONTRACT_ADDRESS is not configured')
    }

    // Use MAX_UINT256 for unlimited approval to avoid repeated approvals
    const approveAmount = MAX_UINT256

    // Estimate gas - approve is a simple operation, ~50k gas
    let gasLimit = 100000n // Reasonable default for approve
    try {
      const estimatedGas = await estimateGas(wagmiAdapter.wagmiConfig, {
        account: accountData.value?.address as Address,
        to: vaultBtcAddress as Address,
        data: encodeFunctionData({
          abi: VaultBTCABI,
          functionName: 'approve',
          args: [vaultContractAddress as Address, approveAmount],
        }),
      })
      // Add 50% buffer
      gasLimit = (estimatedGas * 150n) / 100n
      if (gasLimit < 50000n) gasLimit = 50000n
      if (gasLimit > 200000n) gasLimit = 200000n
    } catch (error: any) {
      // Use default if estimation fails
    }

    const hash = await writeContract(wagmiAdapter.wagmiConfig, {
      address: vaultBtcAddress as Address,
      abi: VaultBTCABI,
      functionName: 'approve',
      args: [vaultContractAddress as Address, approveAmount],
      gas: gasLimit,
    })
    return hash
  }
  
  const checkAllowance = async (userAddress: string): Promise<bigint> => {
    const vaultBtcAddress = config.public.vaultBtcAddress as string
    const vaultContractAddress = config.public.vaultContractAddress as string
    
    if (!vaultBtcAddress || vaultBtcAddress.trim() === '' || !vaultContractAddress || vaultContractAddress.trim() === '') {
      return BigInt(0)
    }

    try {
    const allowance = await readContract(wagmiAdapter.wagmiConfig, {
        address: vaultBtcAddress as Address,
      abi: VaultBTCABI,
      functionName: 'allowance',
        args: [userAddress, vaultContractAddress as Address],
    })
    
    return allowance as bigint
    } catch {
      return BigInt(0)
    }
  }
  
  const deposit = async (amount: string) => {
    const addressValue = accountData.value?.address
    const vaultContractAddress = config.public.vaultContractAddress as string
    
    if (!addressValue) throw new Error('No wallet address')
    if (!vaultContractAddress || vaultContractAddress.trim() === '') {
      throw new Error('VAULT_CONTRACT_ADDRESS is not configured')
    }
    
    // Convert amount to wei (18 decimals)
    const amountInWei = parseUnits(amount, 18)
    
    // Diagnostic: Check if vault is paused
    try {
      const isPaused = await readContract(wagmiAdapter.wagmiConfig, {
        address: vaultContractAddress as Address,
        abi: AIVaultABI,
        functionName: 'paused',
      })
      if (isPaused) {
        throw new Error('Vault is currently paused. Deposits are not available.')
      }
    } catch (error: any) {
    }
    
    // Diagnostic: Check vaultBTC address in contract vs our config
    const vaultBtcAddress = config.public.vaultBtcAddress as string
    try {
      const contractVaultBTC = await readContract(wagmiAdapter.wagmiConfig, {
        address: vaultContractAddress as Address,
        abi: AIVaultABI,
        functionName: 'vaultBTC',
      })
      
      if ((contractVaultBTC as string).toLowerCase() !== vaultBtcAddress.toLowerCase()) {
        throw new Error(`Token address mismatch! Contract expects ${contractVaultBTC}, but config has ${vaultBtcAddress}`)
      }
    } catch (error: any) {
      if (error.message?.includes('mismatch')) throw error
    }
    
    // Check balance first
    const walletBalance = await getVaultBTCBalance(addressValue)
    const walletBalanceWei = parseUnits(walletBalance, 18)
    
    if (amountInWei > walletBalanceWei) {
      throw new Error(`Insufficient balance. You have ${walletBalance} vaultBTC, but trying to deposit ${amount} vaultBTC`)
    }
    
    // Check and approve if needed - check if allowance is sufficient for the amount
    const currentAllowance = await checkAllowance(addressValue)
    
    if (currentAllowance < amountInWei) {
      // Need to approve - wait for approval to complete
      const approveHash = await approveVaultBTC(amount)
      const approveReceipt = await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, { hash: approveHash })
      
      if (approveReceipt.status !== 'success') {
        throw new Error('Approval transaction failed')
      }
      
      // Wait a bit for state to update (RPC caching issue)
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Verify allowance was set correctly
      const newAllowance = await checkAllowance(addressValue)
      if (newAllowance < amountInWei) {
        throw new Error(`Approval failed or insufficient. Got ${newAllowance.toString()}, needed ${amountInWei.toString()}`)
      }
    }
    
    // Then deposit
    try {
      // Estimate gas - deposit involves token transfer + state updates, ~150k-300k gas
      let gasLimit = 300000n // Reasonable default for deposit
      try {
        const estimatedGas = await estimateGas(wagmiAdapter.wagmiConfig, {
          account: addressValue as Address,
          to: vaultContractAddress as Address,
          data: encodeFunctionData({
            abi: AIVaultABI,
            functionName: 'deposit',
            args: [amountInWei],
          }),
        })
        // Add 50% buffer
        gasLimit = (estimatedGas * 150n) / 100n
        if (gasLimit < 150000n) gasLimit = 150000n
        if (gasLimit > 500000n) gasLimit = 500000n
      } catch (error: any) {
        // Use default if estimation fails
      }

      const hash = await writeContract(wagmiAdapter.wagmiConfig, {
        address: vaultContractAddress as Address,
      abi: AIVaultABI,
      functionName: 'deposit',
        args: [amountInWei],
        gas: gasLimit,
    })
    const receipt = await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, {hash})
    return receipt.transactionHash
    } catch (error: any) {
      // Try to decode the revert reason for better error messages
      console.error('Deposit error:', error)
      
      // Check for specific revert reasons
      if (error.message?.includes('insufficient') || error.message?.includes('allowance')) {
        throw new Error('Insufficient allowance or balance. Please try approving again.')
      }
      if (error.message?.includes('paused') || error.message?.includes('Pausable')) {
        throw new Error('Vault is currently paused.')
      }
      if (error.message?.includes('revert') || error.message?.includes('reverted')) {
        // Try to extract revert reason if available
        const revertReason = error.cause?.data || error.data
        if (revertReason) {
          throw new Error(`Deposit failed: ${revertReason}`)
        }
        throw new Error('Deposit failed. Please check your balance, allowance, and that the vault is not paused.')
      }
      throw new Error(error.message || 'Deposit failed. Please check your balance and try again.')
    }
  }
  
  const withdraw = async (amount: string) => {
    const vaultContractAddress = config.public.vaultContractAddress as string
    
    if (!vaultContractAddress || vaultContractAddress.trim() === '') {
      throw new Error('VAULT_CONTRACT_ADDRESS is not configured')
    }

    // Convert human-readable amount to wei (18 decimals)
    const amountInWei = parseUnits(amount, 18)
    
    // Estimate gas - withdraw involves token transfer + yield calculation, ~150k-300k gas
    let gasLimit = 300000n // Reasonable default for withdraw
    const addressValue = accountData.value?.address
    if (addressValue) {
      try {
        const estimatedGas = await estimateGas(wagmiAdapter.wagmiConfig, {
          account: addressValue as Address,
          to: vaultContractAddress as Address,
          data: encodeFunctionData({
            abi: AIVaultABI,
            functionName: 'withdraw',
            args: [amountInWei],
          }),
        })
        // Add 50% buffer
        gasLimit = (estimatedGas * 150n) / 100n
        if (gasLimit < 150000n) gasLimit = 150000n
        if (gasLimit > 500000n) gasLimit = 500000n
      } catch (error: any) {
        // Use default if estimation fails
      }
    }
    
    const hash = await writeContract(wagmiAdapter.wagmiConfig, {
      address: vaultContractAddress as Address,
      abi: AIVaultABI,
      functionName: 'withdraw',
      args: [amountInWei],
      gas: gasLimit,
    })
    const receipt = await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, {hash})
    return receipt.transactionHash
  }
  
  /**
   * Get user's deposited balance in the AIVault
   * This is the amount they've deposited and is locked in the vault (earning yield)
   */
  const getBalance = async (userAddress: string): Promise<string> => {
    const vaultContractAddress = config.public.vaultContractAddress as string
    
    if (!vaultContractAddress || vaultContractAddress.trim() === '') {
      return '0'
    }

    try {
    const balance = await readContract(wagmiAdapter.wagmiConfig, {
        address: vaultContractAddress as Address,
      abi: AIVaultABI,
      functionName: 'balances',
      args: [userAddress as Address],
    })
    return formatUnits(balance as bigint, 18)
    } catch {
      return '0'
    }
  }
  
  const calculateYield = async (userAddress: string): Promise<string> => {
    const vaultContractAddress = config.public.vaultContractAddress as string
    
    if (!vaultContractAddress || vaultContractAddress.trim() === '') {
      return '0'
    }

    try {
    const yieldAmount = await readContract(wagmiAdapter.wagmiConfig, {
        address: vaultContractAddress as Address,
      abi: AIVaultABI,
      functionName: 'calculateYield',
      args: [userAddress as Address],
    })
    return formatUnits(yieldAmount as bigint, 18)
    } catch {
      return '0'
    }
  }
  
  const getTotalDeposits = async (): Promise<string> => {
    const vaultContractAddress = config.public.vaultContractAddress as string
    
    if (!vaultContractAddress || vaultContractAddress.trim() === '') {
      return '0'
    }

    try {
    const totalDeposits = await readContract(wagmiAdapter.wagmiConfig, {
        address: vaultContractAddress as Address,
      abi: AIVaultABI,
      functionName: 'totalDeposits',
    })
    return formatUnits(totalDeposits as bigint, 18)
    } catch {
      return '0'
    }
  }
  
  /**
   * Claim accrued yield without withdrawing principal
   */
  const claimYield = async () => {
    const vaultContractAddress = config.public.vaultContractAddress as string
    const addressValue = accountData.value?.address
    
    if (!addressValue) throw new Error('No wallet address')
    if (!vaultContractAddress || vaultContractAddress.trim() === '') {
      throw new Error('VAULT_CONTRACT_ADDRESS is not configured')
    }
    
    // Estimate gas - claimYield involves yield calculation + transfer, ~100k-200k gas
    let gasLimit = 200000n // Reasonable default
    try {
      const estimatedGas = await estimateGas(wagmiAdapter.wagmiConfig, {
        account: addressValue as Address,
        to: vaultContractAddress as Address,
        data: encodeFunctionData({
          abi: AIVaultABI,
          functionName: 'claimYield',
          args: [],
        }),
      })
      // Add 50% buffer
      gasLimit = (estimatedGas * 150n) / 100n
      if (gasLimit < 100000n) gasLimit = 100000n
      if (gasLimit > 400000n) gasLimit = 400000n
    } catch (error: any) {
    }
    
    const hash = await writeContract(wagmiAdapter.wagmiConfig, {
      address: vaultContractAddress as Address,
      abi: AIVaultABI,
      functionName: 'claimYield',
      args: [],
      gas: gasLimit,
    })
    const receipt = await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, { hash })
    return receipt.transactionHash
  }
  
  /**
   * Get detailed deposit info for a user
   */
  const getDepositInfo = async (userAddress: string) => {
    const vaultContractAddress = config.public.vaultContractAddress as string
    
    if (!vaultContractAddress || vaultContractAddress.trim() === '') {
      return {
        amount: '0',
        depositTime: 0,
        lastClaimTime: 0,
        pendingYield: '0',
      }
    }
    
    try {
      const result = await readContract(wagmiAdapter.wagmiConfig, {
        address: vaultContractAddress as Address,
        abi: AIVaultABI,
        functionName: 'getDepositInfo',
        args: [userAddress as Address],
      }) as [bigint, bigint, bigint, bigint]
      
      return {
        amount: formatUnits(result[0], 18),
        depositTime: Number(result[1]),
        lastClaimTime: Number(result[2]),
        pendingYield: formatUnits(result[3], 18),
      }
    } catch (error) {
      console.error('Error fetching deposit info:', error)
      return {
        amount: '0',
        depositTime: 0,
        lastClaimTime: 0,
        pendingYield: '0',
      }
    }
  }
  
  /**
   * Get yield reserves in the vault
   */
  const getYieldReserves = async (): Promise<string> => {
    const vaultContractAddress = config.public.vaultContractAddress as string
    
    if (!vaultContractAddress || vaultContractAddress.trim() === '') {
      return '0'
    }
    
    try {
      const reserves = await readContract(wagmiAdapter.wagmiConfig, {
        address: vaultContractAddress as Address,
        abi: AIVaultABI,
        functionName: 'yieldReserves',
      })
      return formatUnits(reserves as bigint, 18)
    } catch {
      return '0'
    }
  }
  
  /**
   * Fund yield reserves (typically done by owner/admin)
   */
  const fundYieldReserves = async (amount: string | number) => {
    const vaultContractAddress = config.public.vaultContractAddress as string
    const vaultBtcAddress = config.public.vaultBtcAddress as string
    const addressValue = accountData.value?.address
    
    if (!addressValue) throw new Error('No wallet address')
    if (!vaultContractAddress || vaultContractAddress.trim() === '') {
      throw new Error('VAULT_CONTRACT_ADDRESS is not configured')
    }
    
    const amountInWei = parseUnits(String(amount), 18)
    
    // First approve the vault to spend tokens
    const currentAllowance = await checkAllowance(addressValue)
    if (currentAllowance < amountInWei) {
      const approveHash = await writeContract(wagmiAdapter.wagmiConfig, {
        address: vaultBtcAddress as Address,
        abi: VaultBTCABI,
        functionName: 'approve',
        args: [vaultContractAddress as Address, MAX_UINT256],
      })
      await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, { hash: approveHash })
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    // Estimate gas - fundYieldReserves is a simple transfer, needs ~100k gas
    let gasLimit = 200000n // Reasonable default for token transfer
    try {
      const estimatedGas = await estimateGas(wagmiAdapter.wagmiConfig, {
        account: addressValue as Address,
        to: vaultContractAddress as Address,
        data: encodeFunctionData({
          abi: AIVaultABI,
          functionName: 'fundYieldReserves',
          args: [amountInWei],
        }),
      })
      // Add 50% buffer but keep it reasonable
      gasLimit = (estimatedGas * 150n) / 100n
      if (gasLimit < 100000n) gasLimit = 100000n
      if (gasLimit > 500000n) gasLimit = 500000n
    } catch (error: any) {
    }
    
    const hash = await writeContract(wagmiAdapter.wagmiConfig, {
      address: vaultContractAddress as Address,
      abi: AIVaultABI,
      functionName: 'fundYieldReserves',
      args: [amountInWei],
      gas: gasLimit,
    })
    const receipt = await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, { hash })
    return receipt.transactionHash
  }
  
  /**
   * Get minimum deposit time required for yield
   */
  const getMinDepositTime = async (): Promise<number> => {
    const vaultContractAddress = config.public.vaultContractAddress as string
    
    if (!vaultContractAddress || vaultContractAddress.trim() === '') {
      return 86400 // Default 1 day in seconds
    }
    
    try {
      const minTime = await readContract(wagmiAdapter.wagmiConfig, {
        address: vaultContractAddress as Address,
        abi: AIVaultABI,
        functionName: 'MIN_DEPOSIT_TIME',
      })
      return Number(minTime)
    } catch {
      return 86400
    }
  }
  
  /**
   * Get APY in basis points
   */
  const getAPY = async (): Promise<number> => {
    const vaultContractAddress = config.public.vaultContractAddress as string
    
    if (!vaultContractAddress || vaultContractAddress.trim() === '') {
      return 500 // Default 5%
    }
    
    try {
      const apy = await readContract(wagmiAdapter.wagmiConfig, {
        address: vaultContractAddress as Address,
        abi: AIVaultABI,
        functionName: 'APY_BPS',
      })
      return Number(apy)
    } catch {
      return 500
    }
  }
  
  /**
   * Get the contract owner address
   */
  const getOwner = async (): Promise<string> => {
    const vaultContractAddress = config.public.vaultContractAddress as string
    
    if (!vaultContractAddress || vaultContractAddress.trim() === '') {
      return ''
    }
    
    try {
      const owner = await readContract(wagmiAdapter.wagmiConfig, {
        address: vaultContractAddress as Address,
        abi: AIVaultABI,
        functionName: 'owner',
      })
      return owner as string
    } catch {
      return ''
    }
  }
  
  const mintVaultBTC = async (amount: string): Promise<any> => {
    const vaultBtcAddress = config.public.vaultBtcAddress as string
    
    if (!vaultBtcAddress || vaultBtcAddress.trim() === '') {
      throw new Error('VAULTBTC_ADDRESS is not configured')
    }
    if (!accountData.value?.address) {
      throw new Error('Wallet not connected')
    }

    // Convert human-readable amount to wei (18 decimals)
    const amountInWei = parseUnits(amount, 18)
    
    // Estimate gas - mint is a simple token operation, ~100k-200k gas
    let gasLimit = 200000n // Reasonable default for mint
    try {
      const estimatedGas = await estimateGas(wagmiAdapter.wagmiConfig, {
        account: accountData.value.address as Address,
        to: vaultBtcAddress as Address,
        data: encodeFunctionData({
          abi: VaultBTCABI,
          functionName: 'mint',
          args: [accountData.value.address as Address, amountInWei],
        }),
      })
      // Add 50% buffer
      gasLimit = (estimatedGas * 150n) / 100n
      if (gasLimit < 100000n) gasLimit = 100000n
      if (gasLimit > 400000n) gasLimit = 400000n
    } catch (error: any) {
      // Use default if estimation fails
    }
    
    try {
      const hash = await writeContract(wagmiAdapter.wagmiConfig, {
        address: vaultBtcAddress as Address,
      abi: VaultBTCABI,
      functionName: 'mint',
        args: [accountData.value.address as Address, amountInWei],
        gas: gasLimit,
    })
    const receipt = await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, {hash})
    return receipt.transactionHash
    } catch (error: any) {
      console.error('Error minting vaultBTC:', error)
      throw error
    }
  }
  
  const getFaucetInfo = async (userAddress: string) => {
    const vaultBtcAddress = config.public.vaultBtcAddress as string
    
    if (!vaultBtcAddress || vaultBtcAddress.trim() === '') {
      return {
        remainingDaily: '0',
        remainingLifetime: '0',
        cooldownRemaining: 0,
        canMint: false,
      }
    }

    try {
    const remainingDaily = await readContract(wagmiAdapter.wagmiConfig, {
        address: vaultBtcAddress as Address,
      abi: VaultBTCABI,
      functionName: 'getRemainingDaily',
      args: [userAddress],
    })
    const remainingLifetime = await readContract(wagmiAdapter.wagmiConfig, {
        address: vaultBtcAddress as Address,
      abi: VaultBTCABI,
      functionName: 'getRemainingLifetime',
      args: [userAddress],
    })
    const cooldownRemaining = await readContract(wagmiAdapter.wagmiConfig, {
        address: vaultBtcAddress as Address,
      abi: VaultBTCABI,
      functionName: 'getCooldownRemaining',
      args: [userAddress],
    })
      const cooldownSeconds = Number(formatUnits(cooldownRemaining as bigint, 18))
    return {
      remainingDaily: formatUnits(remainingDaily as bigint, 18),
      remainingLifetime: formatUnits(remainingLifetime as bigint, 18),
        cooldownRemaining: cooldownSeconds,
        // Use same threshold (0.1 seconds) as formatCooldown to determine if cooldown is active
        canMint: cooldownSeconds < 0.1 && Number(remainingDaily) > 0 && Number(remainingLifetime) > 0,
      }
    } catch (error) {
      console.error('Error fetching faucet info:', error)
      return {
        remainingDaily: '0',
        remainingLifetime: '0',
        cooldownRemaining: 0,
        canMint: false,
      }
    }
  }
  
  return {
    deposit,
    withdraw,
    getBalance,
    calculateYield,
    getVaultBTCBalance,
    approveVaultBTC,
    checkAllowance,
    getTotalDeposits,
    mintVaultBTC,
    getFaucetInfo,
    // New yield functions
    claimYield,
    getDepositInfo,
    getYieldReserves,
    fundYieldReserves,
    getMinDepositTime,
    getAPY,
    getOwner,
  }
}
