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
      console.warn('VAULT_BTC_ADDRESS is not configured')
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
  
  const approveVaultBTC = async (amount: string): Promise<any> => {
    const vaultBtcAddress = config.public.vaultBtcAddress as string
    const vaultContractAddress = config.public.vaultContractAddress as string
    
    if (!vaultBtcAddress || vaultBtcAddress.trim() === '') {
      throw new Error('VAULT_BTC_ADDRESS is not configured')
    }
    if (!vaultContractAddress || vaultContractAddress.trim() === '') {
      throw new Error('VAULT_CONTRACT_ADDRESS is not configured')
    }

    // Convert human-readable amount to wei (18 decimals)
    const amountInWei = parseUnits(amount, 18)

    // Estimate gas and set limit with buffer
    let gasLimit = 2000000n // Default fallback (2M - higher to prevent drops)
    try {
      const estimatedGas = await estimateGas(wagmiAdapter.wagmiConfig, {
        account: accountData.value?.address as Address,
        to: vaultBtcAddress as Address,
        data: encodeFunctionData({
          abi: VaultBTCABI,
          functionName: 'approve',
          args: [vaultContractAddress as Address, amountInWei],
        }),
      })
      console.log('Gas estimate for approve:', estimatedGas.toString())
      // Add 100% buffer (double) to prevent drops, but cap at 15M
      gasLimit = estimatedGas * 2n
      if (gasLimit > 15000000n) gasLimit = 15000000n
      if (gasLimit < 2000000n) gasLimit = 2000000n // Higher minimum
      console.log('Final gas limit for approve:', gasLimit.toString())
    } catch (error: any) {
      // Use default if estimation fails
      console.warn('Gas estimation failed for approve, using default:', error.message)
    }

    const hash = await writeContract(wagmiAdapter.wagmiConfig, {
      address: vaultBtcAddress as Address,
      abi: VaultBTCABI,
      functionName: 'approve',
      args: [vaultContractAddress as Address, amountInWei],
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
    
    // Check if vault is paused
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
      // If paused() doesn't exist or fails, continue (might not be available in ABI)
      console.warn('Could not check paused status:', error.message)
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
      await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, { hash: approveHash })
      
      // Verify allowance was set correctly
      const newAllowance = await checkAllowance(addressValue)
      if (newAllowance < amountInWei) {
        throw new Error('Approval failed or insufficient. Please try again.')
      }
    }
    
    // Then deposit
    try {
      // Estimate gas and set limit with buffer
      let gasLimit = 10000000n // Default fallback (10M - higher to prevent drops)
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
        console.log('Gas estimate for deposit:', estimatedGas.toString())
        // Add 100% buffer (double) to prevent drops, but cap at 15M (below block limit of 16,777,216)
        gasLimit = estimatedGas * 2n
        if (gasLimit > 15000000n) gasLimit = 15000000n
        if (gasLimit < 10000000n) gasLimit = 10000000n // Higher minimum
        console.log('Final gas limit for deposit:', gasLimit.toString())
      } catch (error: any) {
        // Use default if estimation fails
        console.warn('Gas estimation failed for deposit, using default:', error.message)
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
    
    // Estimate gas and set limit with buffer
    let gasLimit = 10000000n // Default fallback (10M - higher to prevent drops)
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
        console.log('Gas estimate for withdraw:', estimatedGas.toString())
        // Add 100% buffer (double) to prevent drops, but cap at 15M
        gasLimit = estimatedGas * 2n
        if (gasLimit > 15000000n) gasLimit = 15000000n
        if (gasLimit < 10000000n) gasLimit = 10000000n // Higher minimum
        console.log('Final gas limit for withdraw:', gasLimit.toString())
      } catch (error: any) {
        // Use default if estimation fails
        console.warn('Gas estimation failed for withdraw, using default:', error.message)
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
      console.warn('VAULT_CONTRACT_ADDRESS is not configured')
      return '0'
    }

    try {
    const balance = await readContract(wagmiAdapter.wagmiConfig, {
        address: vaultContractAddress as Address,
      abi: AIVaultABI,
      functionName: 'balances',
      args: [userAddress],
    })
    return formatUnits(balance as bigint, 18)
    } catch {
      return '0'
    }
  }
  
  const calculateYield = async (userAddress: string): Promise<string> => {
    const vaultContractAddress = config.public.vaultContractAddress as string
    
    if (!vaultContractAddress || vaultContractAddress.trim() === '') {
      console.warn('VAULT_CONTRACT_ADDRESS is not configured')
      return '0'
    }

    try {
    const yieldAmount = await readContract(wagmiAdapter.wagmiConfig, {
        address: vaultContractAddress as Address,
      abi: AIVaultABI,
      functionName: 'calculateYield',
      args: [userAddress],
    })
    return formatUnits(yieldAmount as bigint, 18)
    } catch {
      return '0'
    }
  }
  
  const getTotalDeposits = async (): Promise<string> => {
    const vaultContractAddress = config.public.vaultContractAddress as string
    
    if (!vaultContractAddress || vaultContractAddress.trim() === '') {
      console.warn('VAULT_CONTRACT_ADDRESS is not configured')
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
    
    // Estimate gas and set limit with buffer
    let gasLimit = 10000000n // Default fallback (10M - higher to prevent drops)
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
      console.log('Gas estimate for mint:', estimatedGas.toString())
      // Add 100% buffer (double) to prevent drops, but cap at 15M
      gasLimit = estimatedGas * 2n
      if (gasLimit > 15000000n) gasLimit = 15000000n
      if (gasLimit < 10000000n) gasLimit = 10000000n // Higher minimum
      console.log('Final gas limit for mint:', gasLimit.toString())
    } catch (error: any) {
      // Use default if estimation fails
      console.warn('Gas estimation failed for mint, using default:', error.message)
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
      console.warn('VAULTBTC_ADDRESS is not configured')
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
    console.log("remainingDaily", remainingDaily)
    console.log("remainingLifetime", remainingLifetime)
    console.log("cooldownRemaining", cooldownRemaining)
    console.log("canMint", Number(cooldownRemaining) === 0 && Number(remainingDaily) > 0 && Number(remainingLifetime) > 0)
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
  }
}
