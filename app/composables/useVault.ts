import { useVaultStore } from '~~/stores/vault'
import { AIVaultABI } from '~~/config/abi/ai-vault'
import { VaultBTCABI } from '~~/config/abi/vault-btc'
import { wagmiAdapter } from '~~/config/appkit'
import { formatUnits } from 'viem'
import { useAppKitAccount } from "@reown/appkit/vue";
import type { Address } from 'viem'
import { readContract, writeContract, simulateContract, waitForTransactionReceipt } from 'viem/actions'

export const useVault = () => {
  const config = useRuntimeConfig()

  const accountData = useAppKitAccount();
  const vaultStore = useVaultStore()
  
  const getVaultBTCBalance = async (userAddress: string): Promise<string> => {
    try {
      const balance = await readContract(wagmiAdapter.wagmiConfig, {
        address: config.public.vaultBtcAddress as Address,
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
    const {result} = await simulateContract(wagmiAdapter.wagmiConfig, {
      address: config.public.vaultBtcAddress as Address,
      abi: VaultBTCABI,
      functionName: 'approve',
      args: [config.public.vaultAddress as Address, amount],
    })
    const hash = await writeContract(wagmiAdapter.wagmiConfig, result)
    return hash
  }
  
  const checkAllowance = async (userAddress: string): Promise<bigint> => {
    const allowance = await readContract(wagmiAdapter.wagmiConfig, {
      address: config.public.vaultBtcAddress as Address,
      abi: VaultBTCABI,
      functionName: 'allowance',
      args: [userAddress, config.public.vaultAddress as Address],
    })
    
    return allowance as bigint
  }
  
  const deposit = async (amount: string) => {
    const addressValue = accountData.value?.address
    
    if (!addressValue) throw new Error('No wallet address')
    
    // Check and approve if needed
    const hasAllowance = await checkAllowance(addressValue)
    if (!hasAllowance) {
      await approveVaultBTC(amount)
    }
    
    // Then deposit
    const {result} = await simulateContract(wagmiAdapter.wagmiConfig, {
      address: config.public.vaultAddress as Address,
      abi: AIVaultABI,
      functionName: 'deposit',
      args: [amount],
    })
    const hash = await writeContract(wagmiAdapter.wagmiConfig, result)
    const receipt = await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, hash)
    return receipt.transactionHash
  }
  
  const withdraw = async (amount: string) => {
    const {result} = await simulateContract(wagmiAdapter.wagmiConfig, {
      address: config.public.vaultAddress as Address,
      abi: AIVaultABI,
      functionName: 'withdraw',
      args: [amount],
    })
    const hash = await writeContract(wagmiAdapter.wagmiConfig, result)
    const receipt = await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, hash)
    return receipt.transactionHash
  }
  
  const getBalance = async (userAddress: string): Promise<string> => {
    const balance = await readContract(wagmiAdapter.wagmiConfig, {
      address: config.public.vaultAddress as Address,
      abi: AIVaultABI,
      functionName: 'balances',
      args: [userAddress],
    })
    return formatUnits(balance as bigint, 18)
  }
  
  const calculateYield = async (userAddress: string): Promise<string> => {
    const yieldAmount = await readContract(wagmiAdapter.wagmiConfig, {
      address: config.public.vaultAddress as Address,
      abi: AIVaultABI,
      functionName: 'calculateYield',
      args: [userAddress],
    })
    return formatUnits(yieldAmount as bigint, 18)
  }
  
  const getTotalDeposits = async (): Promise<string> => {
    const totalDeposits = await readContract(wagmiAdapter.wagmiConfig, {
      address: config.public.vaultAddress as Address,
      abi: AIVaultABI,
      functionName: 'totalDeposits',
    })
    return formatUnits(totalDeposits as bigint, 18)
  }
  
  const mintVaultBTC = async (amount: string): Promise<any> => {
    const {result} = await simulateContract(wagmiAdapter.wagmiConfig, {
      address: config.public.vaultBtcAddress as Address,
      abi: VaultBTCABI,
      functionName: 'mint',
      args: [accountData.value?.address as Address, amount],
    })
    const hash = await writeContract(wagmiAdapter.wagmiConfig, result)
    const receipt = await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, hash)
    return receipt.transactionHash
  }
  
  const getFaucetInfo = async (userAddress: string) => {
    const remainingDaily = await readContract(wagmiAdapter.wagmiConfig, {
      address: config.public.vaultBtcAddress as Address,
      abi: VaultBTCABI,
      functionName: 'getRemainingDaily',
      args: [userAddress],
    })
    const remainingLifetime = await readContract(wagmiAdapter.wagmiConfig, {
      address: config.public.vaultBtcAddress as Address,
      abi: VaultBTCABI,
      functionName: 'getRemainingLifetime',
      args: [userAddress],
    })
    const cooldownRemaining = await readContract(wagmiAdapter.wagmiConfig, {
      address: config.public.vaultBtcAddress as Address,
      abi: VaultBTCABI,
      functionName: 'getCooldownRemaining',
      args: [userAddress],
    })
    
    return {
      remainingDaily: formatUnits(remainingDaily as bigint, 18),
      remainingLifetime: formatUnits(remainingLifetime as bigint, 18),
      cooldownRemaining: Number(formatUnits(cooldownRemaining as bigint, 18)),
      canMint: Number(cooldownRemaining) === 0 && Number(remainingDaily) > 0 && Number(remainingLifetime) > 0,
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
