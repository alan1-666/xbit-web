import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import { RPC_URL, TYPE_CHAIN } from '@/lib/blockchain'
import { mappedTypeChain, newWalletActions } from '@/redux/modules/newWallet.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useEffect } from 'react'
import { useNewMultiWalletRealtimeBalance } from './useNewMultiChainRealtimeBalance'

const getWalletIds = (chain: TYPE_CHAIN, listWalletsByChain: UserEmbeddedWalletDto[]) => {
  return listWalletsByChain
    ?.filter((w: UserEmbeddedWalletDto) => w?.chain === mappedTypeChain(chain))
    ?.map((w: UserEmbeddedWalletDto) => w.walletAddress)
}

const getInitBalance = (chain: TYPE_CHAIN, listWalletsByChain: UserEmbeddedWalletDto[]) => {
  return listWalletsByChain
    ?.filter((w: UserEmbeddedWalletDto) => w?.chain === mappedTypeChain(chain))
    ?.reduce((acc: { [address: string]: number }, w: UserEmbeddedWalletDto) => {
      acc[w.walletAddress] = w.balance
      return acc
    }, {})
}
export default function NewBalanceWalletSubcription() {
  const dispatch = useAppDispatch()
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const endpointByChain = {
    [TYPE_CHAIN.SOLANA]: `${RPC_URL}?chain=SOLANA`,
    [TYPE_CHAIN.ETH]: `${RPC_URL}?chain=ETHEREUM`,
    [TYPE_CHAIN.ARB]: `${RPC_URL}?chain=ARBITRUM`,
    [TYPE_CHAIN.BSC]: `${RPC_URL}?chain=BSC`,
    [TYPE_CHAIN.MON]: `${RPC_URL}?chain=MONAD`,
  }

  const solWalletBalances = useNewMultiWalletRealtimeBalance(
    TYPE_CHAIN.SOLANA,
    getWalletIds(TYPE_CHAIN.SOLANA, listWalletsByChain),
    getInitBalance(TYPE_CHAIN.SOLANA, listWalletsByChain),
    endpointByChain[TYPE_CHAIN.SOLANA],
    15000,
    true,
  )

  const bscWalletBalances = useNewMultiWalletRealtimeBalance(
    TYPE_CHAIN.BSC,
    getWalletIds(TYPE_CHAIN.BSC, listWalletsByChain),
    getInitBalance(TYPE_CHAIN.BSC, listWalletsByChain),
    endpointByChain[TYPE_CHAIN.BSC],
    15000,
    true,
  )

  const monWalletBalances = useNewMultiWalletRealtimeBalance(
    TYPE_CHAIN.MON,
    getWalletIds(TYPE_CHAIN.MON, listWalletsByChain),
    getInitBalance(TYPE_CHAIN.MON, listWalletsByChain),
    endpointByChain[TYPE_CHAIN.MON],
    15000,
    true,
  )

  useEffect(() => {
    if (solWalletBalances && solWalletBalances?.length > 0) {
      const solBalanceMap = Object.fromEntries(solWalletBalances.map((b) => [b.walletId, b.balance]))
      dispatch(
        newWalletActions.updateBalanceByWalletAddresses({
          balances: solBalanceMap,
          chain: mappedTypeChain(TYPE_CHAIN.SOLANA),
        }),
      )
    }
  }, [solWalletBalances])

  useEffect(() => {
    if (bscWalletBalances && bscWalletBalances?.length > 0) {
      const bscBalanceMap = Object.fromEntries(bscWalletBalances.map((b) => [b.walletId, b.balance]))
      dispatch(
        newWalletActions.updateBalanceByWalletAddresses({
          balances: bscBalanceMap,
          chain: mappedTypeChain(TYPE_CHAIN.BSC),
        }),
      )
    }
  }, [bscWalletBalances])

  useEffect(() => {
    if (monWalletBalances && monWalletBalances?.length > 0) {
      const monBalanceMap = Object.fromEntries(monWalletBalances.map((b) => [b.walletId, b.balance]))
      dispatch(
        newWalletActions.updateBalanceByWalletAddresses({
          balances: monBalanceMap,
          chain: mappedTypeChain(TYPE_CHAIN.MON),
        }),
      )
    }
  }, [monWalletBalances])

  return <></>
}
