import { useMemo } from 'react'
import { useAppSelector } from '@/redux/store'
import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user.ts'
import { useQuery } from '@tanstack/react-query'
import { ethers } from 'ethers'
import { ARB_USDC_ADDRESS } from '@/lib/constant.ts'

const usePrices = () => {
  const priceList = useAppSelector((state) => state.price.list)
  return useMemo(() => {
    return {
      solPrice: priceList['SOL'],
      ethPrice: priceList['ETH'],
    }
  }, [priceList])
}

const fetchArbUsdcBalance = async (walletAddress: string): Promise<number> => {
  const endpoint = `https://arb1.arbitrum.io/rpc`
  const ERC20_ABI = ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)']
  const provider = new ethers.JsonRpcProvider(endpoint)
  const usdcContract = new ethers.Contract(ARB_USDC_ADDRESS, ERC20_ABI, provider)
  const [balanceRaw, decimals] = await Promise.all([usdcContract.balanceOf(walletAddress), usdcContract.decimals()])
  const balance = ethers.formatUnits(balanceRaw, decimals)
  return parseFloat(balance)
}

export const useWalletBalances = () => {
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain as UserEmbeddedWalletDto[])
  const solWallets = listWalletsByChain.filter((wallet) => wallet.chain === 'SOLANA')
  const ethWallets = listWalletsByChain.filter((wallet) => wallet.chain === 'EVM')
  const arbWallets = listWalletsByChain.filter((wallet) => wallet.chain === 'ARB')

  const { solPrice, ethPrice } = usePrices()

  const solBalances = useMemo(() => {
    const balances: Record<string, number> = {}
    solWallets.forEach((wallet) => {
      const address = wallet.walletAddress
      balances[address] = wallet.balance || 0
    })
    return balances
  }, [solWallets])

  const ethBalances = useMemo(() => {
    const balances: Record<string, number> = {}
    ethWallets.forEach((wallet) => {
      const address = wallet.walletAddress
      balances[address] = wallet.balance || 0
    })
    return balances
  }, [ethWallets])

  const arbEthBalances = useMemo(() => {
    const balances: Record<string, number> = {}
    arbWallets.forEach((wallet) => {
      const address = wallet.walletAddress
      balances[address] = wallet.balance || 0
    })
    return balances
  }, [arbWallets])

  const { data: arbUsdcBalances = {} } = useQuery({
    queryKey: ['arbUsdcBalances', arbWallets],
    queryFn: async () => {
      const balances: Record<string, number> = {}
      for (const wallet of arbWallets) {
        balances[wallet.walletAddress] = await fetchArbUsdcBalance(wallet.walletAddress)
      }
      return balances
    },
  })

  return useMemo(() => {
    const solUsdBalances: Record<string, number> = {}
    const ethUsdBalances: Record<string, number> = {}
    const arbEthUsdBalances: Record<string, number> = {}
    const arbUsdcUsdBalances: Record<string, number> = {}

    Object.entries(solBalances).forEach(([address, balance]) => {
      solUsdBalances[address] = balance * (solPrice || 0)
    })

    Object.entries(ethBalances).forEach(([address, balance]) => {
      ethUsdBalances[address] = balance * (ethPrice || 0)
    })

    Object.entries(arbEthBalances).forEach(([address, balance]) => {
      arbEthUsdBalances[address] = balance * (ethPrice || 0)
    })

    Object.entries(arbUsdcBalances).forEach(([address, balance]) => {
      arbUsdcUsdBalances[address] = balance
    })

    return {
      sol: solBalances,
      eth: ethBalances,
      arbEth: arbEthBalances,
      arbUsdc: arbUsdcBalances,
      solUsd: solUsdBalances,
      ethUsd: ethUsdBalances,
      arbEthUsd: arbEthUsdBalances,
      arbUsdcUsd: arbUsdcUsdBalances,
    }
  }, [solBalances, ethBalances, arbEthBalances, arbUsdcBalances, solPrice, ethPrice])
}
