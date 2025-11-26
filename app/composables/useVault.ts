import { useVaultStore } from '~~/stores/vault'
import { AIVaultABI } from '~~/config/abi/ai-vault'
import { VaultBTCABI } from '~~/config/abi/vault-btc'
import { formatUnits } from 'viem'
import { useAppKitAccount } from "@reown/appkit/vue";
import { wagmiAdapter } from '~~/config/appkit';
import { readContract, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import type { Address } from 'viem'

export const useVault = () => {
  const config = useRuntimeConfig()

  const accountData = useAppKitAccount();
  const vaultStore = useVaultStore()
  
  const getVaultBTCBalance = async (userAddress: string): Promise<string> => {
    const vaultBtcAddress = config.public.vaultBtcAddress as string
    
    if (!vaultBtcAddress || vaultBtcAddress.trim() === '') {
      console.warn('VAULTBTC_ADDRESS is not configured')
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
    const vaultAddress = config.public.vaultAddress as string
    
    if (!vaultBtcAddress || vaultBtcAddress.trim() === '') {
      throw new Error('VAULTBTC_ADDRESS is not configured')
    }
    if (!vaultAddress || vaultAddress.trim() === '') {
      throw new Error('VAULT_CONTRACT_ADDRESS is not configured')
    }

    const hash = await writeContract(wagmiAdapter.wagmiConfig, {
      address: vaultBtcAddress as Address,
      abi: VaultBTCABI,
      functionName: 'approve',
      args: [vaultAddress as Address, amount],
    })
    return hash
  }
  
  const checkAllowance = async (userAddress: string): Promise<bigint> => {
    const vaultBtcAddress = config.public.vaultBtcAddress as string
    const vaultAddress = config.public.vaultAddress as string
    
    if (!vaultBtcAddress || vaultBtcAddress.trim() === '' || !vaultAddress || vaultAddress.trim() === '') {
      return BigInt(0)
    }

    try {
      const allowance = await readContract(wagmiAdapter.wagmiConfig, {
        address: vaultBtcAddress as Address,
        abi: VaultBTCABI,
        functionName: 'allowance',
        args: [userAddress, vaultAddress as Address],
      })
      
      return allowance as bigint
    } catch {
      return BigInt(0)
    }
  }
  
  const deposit = async (amount: string) => {
    const addressValue = accountData.value?.address
    const vaultAddress = config.public.vaultAddress as string
    
    if (!addressValue) throw new Error('No wallet address')
    if (!vaultAddress || vaultAddress.trim() === '') {
      throw new Error('VAULT_CONTRACT_ADDRESS is not configured')
    }
    
    // Check and approve if needed
    const hasAllowance = await checkAllowance(addressValue)
    if (!hasAllowance) {
      await approveVaultBTC(amount)
    }
    
    // Then deposit
    const hash = await writeContract(wagmiAdapter.wagmiConfig, {
      address: vaultAddress as Address,
      abi: AIVaultABI,
      functionName: 'deposit',
      args: [amount],
    })
    const receipt = await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, {hash})
    return receipt.transactionHash
  }
  
  const withdraw = async (amount: string) => {
    const vaultAddress = config.public.vaultAddress as string
    
    if (!vaultAddress || vaultAddress.trim() === '') {
      throw new Error('VAULT_CONTRACT_ADDRESS is not configured')
    }

    const hash = await writeContract(wagmiAdapter.wagmiConfig, {
      address: vaultAddress as Address,
      abi: AIVaultABI,
      functionName: 'withdraw',
      args: [amount],
    })
    const receipt = await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, {hash})
    return receipt.transactionHash
  }
  
  const getBalance = async (userAddress: string): Promise<string> => {
    const vaultAddress = config.public.vaultAddress as string
    
    if (!vaultAddress || vaultAddress.trim() === '') {
      console.warn('VAULT_CONTRACT_ADDRESS is not configured')
      return '0'
    }

    try {
      const balance = await readContract(wagmiAdapter.wagmiConfig, {
        address: vaultAddress as Address,
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
    const vaultAddress = config.public.vaultAddress as string
    
    if (!vaultAddress || vaultAddress.trim() === '') {
      console.warn('VAULT_CONTRACT_ADDRESS is not configured')
      return '0'
    }

    try {
      const yieldAmount = await readContract(wagmiAdapter.wagmiConfig, {
        address: vaultAddress as Address,
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
    const vaultAddress = config.public.vaultAddress as string
    
    if (!vaultAddress || vaultAddress.trim() === '') {
      console.warn('VAULT_CONTRACT_ADDRESS is not configured')
      return '0'
    }

    try {
      const totalDeposits = await readContract(wagmiAdapter.wagmiConfig, {
        address: vaultAddress as Address,
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

    const hash = await writeContract(wagmiAdapter.wagmiConfig, {
      address: vaultBtcAddress as Address,
      abi: VaultBTCABI,
      functionName: 'mint',
      args: [accountData.value.address as Address, amount],
    })
    const receipt = await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, {hash})
    return receipt.transactionHash
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
