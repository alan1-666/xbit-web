import { WalletDuration } from '@/@generated/gql/graphql-core.ts'
import { ChainType, UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user.ts'
import { formatAmount, formatBalance } from '@/lib/format'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import { exchangeActions } from '@/redux/modules/exchange.slice'
import { ChainIds } from '@/types/enums.ts'
import { ChainSelect } from '@pages/assets/overview/components/ChainSelect.tsx'
import { useWalletBalances } from '@pages/assets/overview/hooks/useWalletBalances.ts'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import WalletManagement from './WalletManagement.tsx'

type Props = {
  walletsByChain: UserEmbeddedWalletDto[]
  walletSelected: string
  walletAddressSelected?: string
  setWalletSelected: (wallet: string) => void
  chain: string
  setChain: (chain: string) => void
}

const usePrices = () => {
  const priceList = useAppSelector((state) => state.price.list)
  return useMemo(() => {
    return {
      solPrice: priceList['SOL'],
      ethPrice: priceList['ETH'],
      bnbPrice: priceList['BNB'],
      monPrice: priceList['MON'],
    }
  }, [priceList])
}

const mappingChainToChainId = {
  solana: ChainIds.Solana,
  ethereum: ChainIds.Ethereum,
  arbitrum: ChainIds.Arbitrum,
  bsc: ChainIds.Bsc,
}

const Header = ({
  walletsByChain,
  walletSelected,
  walletAddressSelected,
  setWalletSelected,
  chain,
  setChain,
}: Props) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { solPrice, ethPrice, bnbPrice, monPrice } = usePrices()
  const totalHoldingTokens = useAppSelector((state) => state.holding.totalHoldingTokens)
  const totalUnrealizedPnLFromHoldings = useAppSelector((state) => state.holding.totalUnrealizedPnL)
  const chainId = mappingChainToChainId[chain as keyof typeof mappingChainToChainId]
  const wallets = useWalletBalances({
    duration: WalletDuration.D1,
    chainId,
    walletAddress: walletAddressSelected,
  })
  const allWallets = useAppSelector((state) => state.newWallet.listWalletsByChain)

  const nativePrice = useMemo(() => {
    switch (chain) {
      case 'solana':
        return solPrice || 1
      case 'ethereum':
      case 'arbitrum':
        return ethPrice || 1
      case 'bsc':
        return bnbPrice || 1
      case 'monad':
        return monPrice || 1
      default:
        return 1
    }
  }, [chain, solPrice, ethPrice, bnbPrice, monPrice])

  const nativeUnit = useMemo(() => {
    switch (chain) {
      case 'solana':
        return 'SOL'
      case 'ethereum':
      case 'arbitrum':
        return 'ETH'
      case 'bsc':
        return 'BNB'
      case 'monad':
        return 'MON'
      default:
        return 'USD'
    }
  }, [chain])

  const nativeUnitLogo = useMemo(() => {
    switch (chain) {
      case 'solana':
        return '/images/icons/sol.svg'
      case 'bsc':
        return '/images/icons/bnb.svg'
      case 'monad':
        return '/images/icons/chains/ic-monad.svg'
      default:
        return '/images/icons/usd.svg'
    }
  }, [chain])

  useEffect(() => {
    if (unit !== 'USD') {
      setUnit(nativeUnit)
    }
  }, [chain])

  const usdBalanceByChain = useMemo(() => {
    let walletsFilter = wallets?.funding
    if (walletAddressSelected) {
      walletsFilter = walletsFilter?.filter((wallet) => wallet.walletAddress === walletAddressSelected)
    }
    switch (chain) {
      case 'solana':
        return (
          walletsFilter
            ?.filter((wallet) => wallet.chainId === ChainIds.Solana)
            .reduce((acc, wallet) => acc + parseFloat(wallet.usdBalance || '0'), 0) || 0
        )
      case 'ethereum':
        return (
          walletsFilter
            ?.filter((wallet) => wallet.chainId === ChainIds.Ethereum)
            .reduce((acc, wallet) => acc + parseFloat(wallet.usdBalance || '0'), 0) || 0
        )
      case 'arbitrum':
        return (
          walletsFilter
            ?.filter((wallet) => wallet.chainId === ChainIds.Arbitrum)
            .reduce((acc, wallet) => acc + parseFloat(wallet.usdBalance || '0'), 0) || 0
        )
      case 'bsc':
        return (
          walletsFilter
            ?.filter((wallet) => wallet.chainId === ChainIds.Bsc)
            .reduce((acc, wallet) => acc + parseFloat(wallet.usdBalance || '0'), 0) || 0
        )
      case 'monad':
        return (
          walletsFilter
            ?.filter((wallet) => wallet.chainId === ChainIds.Mon)
            .reduce((acc, wallet) => acc + parseFloat(wallet.usdBalance || '0'), 0) || 0
        )
      default:
        return 0
    }
  }, [wallets, chain, walletAddressSelected])

  const nativeBalanceByChain = useMemo(() => {
    let walletsFilter = allWallets
    if (walletAddressSelected) {
      walletsFilter = walletsFilter?.filter(
        (wallet: UserEmbeddedWalletDto) => wallet.walletAddress === walletAddressSelected,
      )
    }
    switch (chain) {
      case 'solana':
        return (
          walletsFilter
            ?.filter((wallet: UserEmbeddedWalletDto) => wallet.chain === ChainType.Solana)
            .reduce((acc: number, wallet: UserEmbeddedWalletDto) => acc + wallet.balance, 0) || 0
        )
      case 'ethereum':
        return (
          walletsFilter
            ?.filter((wallet: UserEmbeddedWalletDto) => wallet.chain === ChainType.Evm)
            .reduce((acc: number, wallet: UserEmbeddedWalletDto) => acc + wallet.balance, 0) || 0
        )
      case 'arbitrum':
        return (
          walletsFilter
            ?.filter((wallet: UserEmbeddedWalletDto) => wallet.chain === ChainType.Arb)
            .reduce((acc: number, wallet: UserEmbeddedWalletDto) => acc + wallet.balance, 0) || 0
        )
      case 'bsc':
        return (
          walletsFilter
            ?.filter((wallet: UserEmbeddedWalletDto) => wallet.chain === ChainType.Bsc)
            .reduce((acc: number, wallet: UserEmbeddedWalletDto) => acc + wallet.balance, 0) || 0
        )
      case 'monad':
        return (
          walletsFilter
            ?.filter((wallet: UserEmbeddedWalletDto) => wallet.chain === ChainType.Mon)
            .reduce((acc: number, wallet: UserEmbeddedWalletDto) => acc + wallet.balance, 0) || 0
        )
      default:
        return 0
    }
  }, [allWallets, chain, walletAddressSelected])

  const unrealizedPnlByChain = useMemo(() => {
    let walletsFilter = wallets?.funding || []
    if (walletAddressSelected) {
      walletsFilter = walletsFilter?.filter(
        (wallet) => wallet.walletAddress.toLocaleUpperCase() === walletAddressSelected.toLocaleUpperCase(),
      )
    }

    switch (chain) {
      case 'solana':
        const walletsSolana = walletsFilter?.filter((wallet) => wallet.chainId === ChainIds.Solana)
        return walletsSolana[0]?.unrealizedPnl || 0
      case 'ethereum':
        const walletsEthereum = walletsFilter?.filter((wallet) => wallet.chainId === ChainIds.Ethereum)
        return walletsEthereum[0]?.unrealizedPnl || 0
      case 'arbitrum':
        const walletsArbitrum = walletsFilter?.filter((wallet) => wallet.chainId === ChainIds.Arbitrum)
        return walletsArbitrum[0]?.unrealizedPnl || 0
      case 'bsc':
        const walletsBsc = walletsFilter?.filter((wallet) => wallet.chainId === ChainIds.Bsc)
        return walletsBsc[0]?.unrealizedPnl || 0
      case 'monad':
        const walletsMonad = walletsFilter?.filter((wallet) => wallet.chainId === ChainIds.Mon)
        return walletsMonad[0]?.unrealizedPnl || 0
      default:
        return 0
    }
  }, [wallets, chain, walletAddressSelected])

  const displayedUnrealizedPnL = useMemo(() => {
    if (totalHoldingTokens <= 20) {
      return totalUnrealizedPnLFromHoldings
    }
    return unrealizedPnlByChain
  }, [totalHoldingTokens, totalUnrealizedPnLFromHoldings, unrealizedPnlByChain, walletAddressSelected])

  const realizedPnlByChain = useMemo(() => {
    let walletsFilter = wallets?.funding || []
    if (walletAddressSelected) {
      walletsFilter = walletsFilter?.filter(
        (wallet) => wallet.walletAddress.toLocaleUpperCase() === walletAddressSelected.toLocaleUpperCase(),
      )
    }
    switch (chain) {
      case 'solana':
        return (
          walletsFilter
            ?.filter((wallet) => wallet.chainId === ChainIds.Solana)
            .reduce((acc, wallet) => acc + parseFloat(wallet.realizedPnl || '0'), 0) || 0
        )
      case 'ethereum':
        return (
          walletsFilter
            ?.filter((wallet) => wallet.chainId === ChainIds.Ethereum)
            .reduce((acc, wallet) => acc + parseFloat(wallet.realizedPnl || '0'), 0) || 0
        )
      case 'arbitrum':
        return (
          walletsFilter
            ?.filter((wallet) => wallet.chainId === ChainIds.Arbitrum)
            .reduce((acc, wallet) => acc + parseFloat(wallet.realizedPnl || '0'), 0) || 0
        )
      case 'bsc':
        return (
          walletsFilter
            ?.filter((wallet) => wallet.chainId === ChainIds.Bsc)
            .reduce((acc, wallet) => acc + parseFloat(wallet.realizedPnl || '0'), 0) || 0
        )
      case 'monad':
        return (
          walletsFilter
            ?.filter((wallet) => wallet.chainId === ChainIds.Mon)
            .reduce((acc, wallet) => acc + parseFloat(wallet.realizedPnl || '0'), 0) || 0
        )
      default:
        return 0
    }
  }, [wallets, chain, walletAddressSelected])

  const [unit, setUnit] = useState<'USD' | 'SOL' | 'ETH' | 'BNB' | 'MON'>('USD')

  const btnList = [
    {
      icon: '/images/icons/asset-deposit.svg',
      label: t('assets.overview.deposit'),
      key: 'deposit',
    },
    {
      icon: '/images/icons/asset-withdraw.svg',
      label: t('assets.withdraw.withdrawLabel'),
      key: 'withdraw',
    },
    {
      icon: '/images/icons/asset-swap.svg',
      label: t('assets.transfer'),
      key: 'transfer',
    },
  ]

  return (
    <div className="p-4 bg-[#141418] border border-[#79778C29] rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center gap-3">
          <span className="font-[380] text-[16px] text-[#FBFBFB] leading-none">{t('assets.meme.totalAssets')}</span>
          <div
            className="relative w-11 h-6 bg-[#2B2B33] rounded-full cursor-pointer"
            onClick={() => setUnit(unit === 'USD' ? nativeUnit : 'USD')}
          >
            <span
              className={`absolute top-[2px] transition-all flex items-center justify-center rounded-full overflow-hidden h-5 w-5 ${unit === 'USD' ? 'bg-white left-[2px]' : 'right-[2px] top-0'}`}
            >
              {unit === 'USD' ? (
                <img src="/images/icons/usd.svg" alt="usd" className="w-3 h-3" />
              ) : (
                <span className="flex items-center justify-center gap-1 bg-white rounded-full">
                  <img src={nativeUnitLogo} alt="nativeLogo" className="w-5 h-5" />
                </span>
              )}
            </span>
          </div>
        </div>
        <div className="">
          <ChainSelect value={chain} onValueChange={setChain} onlyMeme />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 gap-4 flex 2xl:grid 2xl:grid-cols-4">
          <div className="space-y-2">
            <div className="font-[380] text-[12px] text-[#6C6A74] leading-none">{t('assets.meme.totalValue')}</div>
            <div className="font-[450] text-[20px] text-[#FBFBFB] leading-none">
              {unit === 'USD'
                ? formatBalance(usdBalanceByChain, {
                    showCurrency: true,
                    roundMode: 'floor',
                  })
                : formatAmount(usdBalanceByChain / nativePrice, {
                    showCurrency: true,
                    unit: unit,
                    roundMode: 'floor',
                  })}
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-[380] text-[12px] text-[#6C6A74] leading-none">
              {t('assets.meme.balance', { unit: nativeUnit })}
            </div>
            <div className="font-[450] text-[20px] text-[#FBFBFB] leading-none">
              {formatAmount(nativeBalanceByChain, {
                showCurrency: true,
                unit: nativeUnit,
                roundMode: 'floor',
              })}
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-[380] text-[12px] text-[#6C6A74] leading-none">{t('assets.meme.unrealizedPnl')}</div>
            <div
              className={`font-[450] text-[20px] leading-none ${
                displayedUnrealizedPnL > 0 ? 'text-rise' : displayedUnrealizedPnL < 0 ? 'text-fall' : 'text-[#FBFBFB]'
              }`}
            >
              {unit === 'USD'
                ? formatBalance(displayedUnrealizedPnL, {
                    showCurrency: true,
                    roundMode: 'floor',
                  })
                : formatAmount(displayedUnrealizedPnL / nativePrice, {
                    showCurrency: true,
                    unit: unit,
                    roundMode: 'floor',
                  })}
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-[380] text-[12px] text-[#6C6A74] leading-none">{t('assets.meme.realizedPnl')}</div>
            <div
              className={`font-[450] text-[20px] leading-none ${realizedPnlByChain > 0 ? 'text-rise' : realizedPnlByChain < 0 ? 'text-fall' : 'text-[#FBFBFB]'}`}
            >
              {unit === 'USD'
                ? formatBalance(realizedPnlByChain, {
                    showCurrency: true,
                    roundMode: 'floor',
                  })
                : formatAmount(realizedPnlByChain / nativePrice, {
                    showCurrency: true,
                    unit: unit,
                    roundMode: 'floor',
                  })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {btnList.map((item) => (
            <div
              key={item.key}
              onClick={() => {
                dispatch(
                  exchangeActions.openExchangeDialog({
                    defaultTab: item.key as 'deposit' | 'withdraw' | 'transfer',
                    defaultChainId: chainId,
                  }),
                )
              }}
              className="flex px-4 py-2 bg-[#2B2B33] rounded-md items-center justify-center gap-1 cursor-pointer"
            >
              <img src={item.icon} alt={item.label} className="w-[18px]" />
              <span className="text-[14px] text-[#FBFBFB]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      <WalletManagement
        walletsByChain={walletsByChain}
        walletSelected={walletSelected}
        setWalletSelected={setWalletSelected}
        chain={chain}
      />
    </div>
  )
}

export default Header
