import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import { ChainType } from '@/@generated/gql/graphql-user.ts'
import ls from '@/lib/local-storage.ts'
import { cn } from '@/lib/utils.ts'
import { useAppSelector } from '@/redux/store'
import { ChainIds } from '@/types/enums.ts'
import { UITab } from '@/types/uiTabs.ts'
import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import { Checkbox } from '@components/ui/checkbox.tsx'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import Header from './Header'
import { Holdings } from './Holdings'
import { Statistics } from './Statistics'
import { TransactionHistory } from './TransactionHistory'
import { Configs } from '@const/configs.ts'

const tabs: UITab[] = [
  {
    label: 'assets.meme.holdings.title',
    value: 'holdings',
  },
  {
    label: 'assets.meme.transactionHistory.title',
    value: 'history',
  },
]

const extractTabFromUrl = () => {
  const href = window.location.href
  const url = new URL(href)
  const tab = url.searchParams.get('tab')
  if (tab) {
    const foundTab = tabs.find((item) => item.value === tab)
    return foundTab ? foundTab.value : tabs[0].value
  }
  return tabs[0].value
}

/**
 * Get default chain in case no cached preference
 * @returns {string} - Default chain ('solana' or 'bsc')
 */
const getDefaultChainWithoutCache = () => {
  if (Configs.enableSolana()) return 'solana'
  if (Configs.enableBSC()) return 'bsc'
  if (Configs.enableMonad()) return 'monad'
  return 'solana'
}

/**
 * Get default chain considering enabled chains and cached preference
 * @returns {string} - Default chain ('solana' or 'bsc')
 */
const getDefaultChainFromCache = () => {
  const chainCached = ls.get('asset_meme_chain') as string
  if (Configs.enableSolana() && chainCached === 'solana') return 'solana'
  if (Configs.enableBSC() && chainCached === 'bsc') return 'bsc'
  if (Configs.enableMonad() && chainCached === 'monad') return 'monad'
  return getDefaultChainWithoutCache()
}

const Meme = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentTab, setCurrentTab] = useState(() => extractTabFromUrl())
  const wlCached = ls.get('asset_meme_wallet') || 'all'
  const [chain, setChain] = useState(getDefaultChainFromCache())
  const [walletSelected, setWalletSelected] = useState<string>(chain === 'solana' ? wlCached : 'all')
  const handleTabChanged = (tab: string) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('tab', tab)
    newParams.delete('type')
    setSearchParams(newParams)
    setCurrentTab(tab)
  }

  const allWallets = useAppSelector((state) => state.newWallet.listWalletsByChain)

  const walletsByChain = useMemo(() => {
    switch (chain) {
      case 'solana':
        return allWallets.filter((wallet: UserEmbeddedWalletDto) => wallet.chain === ChainType.Solana)
      case 'ethereum':
        return allWallets.filter((wallet: UserEmbeddedWalletDto) => wallet.chain === ChainType.Evm)
      case 'arbitrum':
        return allWallets.filter((wallet: UserEmbeddedWalletDto) => wallet.chain === ChainType.Arb)
      case 'bsc':
        return allWallets.filter((wallet: UserEmbeddedWalletDto) => wallet.chain === ChainType.Bsc)
      case 'monad':
        return allWallets.filter((wallet: UserEmbeddedWalletDto) => wallet.chain === ChainType.Mon)
      default:
        return allWallets.filter((wallet: UserEmbeddedWalletDto) => wallet.chain === ChainType.Solana)
    }
  }, [allWallets, chain])

  useEffect(() => {
    ls.set('asset_meme_chain', chain)
    switch (chain) {
      case 'solana':
        ls.set('asset_chain_id', ChainIds.Solana)
        break
      case 'ethereum':
        ls.set('asset_chain_id', ChainIds.Ethereum)
        break
      case 'arbitrum':
        ls.set('asset_chain_id', ChainIds.Arbitrum)
        break
      case 'bsc':
        ls.set('asset_chain_id', ChainIds.Bsc)
        break
      case 'monad':
        ls.set('asset_chain_id', ChainIds.Mon)
        break
      default:
        ls.set('asset_chain_id', ChainIds.Solana)
    }
    if (walletsByChain.length === 1) {
      setWalletSelected(walletsByChain[0]?.id)
    } else {
      setWalletSelected(wlCached)
    }
  }, [chain])

  useEffect(() => {
    if (chain === 'solana') {
      ls.set('asset_meme_wallet', walletSelected)
    } else {
      ls.set('asset_meme_wallet', 'all')
    }
  }, [walletSelected, chain])

  const walletAddressSelected = useMemo(() => {
    return walletsByChain.find((item: UserEmbeddedWalletDto) => item?.id === walletSelected)?.walletAddress || undefined
  }, [walletSelected, walletsByChain])

  const chainIdSelected = useMemo(() => {
    const wallet = walletsByChain.find((item: UserEmbeddedWalletDto) => item?.id === walletSelected)
    const chain = wallet?.chain
    switch (chain) {
      case 'EVM':
        return ChainIds.Ethereum
      case 'ARB':
        return ChainIds.Arbitrum
      case 'SOLANA':
        return ChainIds.Solana
      case 'BSC':
        return ChainIds.Bsc
      case 'MON':
        return ChainIds.Mon
      default:
        return undefined
    }
  }, [walletSelected, walletsByChain])

  const [hideZeroBalance, setHideZeroBalance] = useState(false)
  const [hideSmallBalance, setHideSmallBalance] = useState(false)
  const [hideSmallLiquidity, setHideSmallLiquidity] = useState(false)

  return (
    <div className="grid grid-cols-13 2xl:grid-cols-11 gap-3">
      <div className="col-span-9 2xl:col-span-8 space-y-3">
        <Header
          walletsByChain={walletsByChain}
          walletSelected={walletSelected}
          walletAddressSelected={walletAddressSelected}
          setWalletSelected={setWalletSelected}
          chain={chain}
          setChain={setChain}
        />
        <div className="bg-[#141418] border border-[#79778C29] rounded-xl overflow-hidden">
          <div className="flex justify-between items-center border-b border-[#79778C29] pt-1.5 pr-4">
            <MovingLineTabs
              tabs={tabs.map((tab) => ({
                label: t(tab.label),
                value: tab.value,
              }))}
              disabledTabs={[]}
              defaultTab={currentTab}
              onTabChange={(tab) => handleTabChanged(tab)}
              containerClassName="bg-[none] after:hidden justify-start bg-transparent"
            />
            {currentTab === 'holdings' && (
              <div className="flex justify-start items-center gap-4">
                <div className="flex justify-start items-center gap-2">
                  <div
                    className={cn(
                      'justify-center text-[calc(13rem/16)] leading-3 flex items-center gap-2 transition-colors duration-200',
                      hideZeroBalance ? 'text-white' : 'text-[#79778C]',
                    )}
                  >
                    <Checkbox
                      className="size-3.5 border-[#79778C] [&_*_svg]:size-2.5 data-[state=checked]:text-white data-[state=checked]:border-white data-[state=checked]:bg-transparent"
                      onCheckedChange={(checked) => setHideZeroBalance(!!checked)}
                      checked={hideZeroBalance}
                    />
                    <span className="cursor-pointer" onClick={() => setHideZeroBalance(!hideZeroBalance)}>
                      {t('assets.overview.hideSellAll')}
                    </span>
                  </div>
                </div>
                <div className="flex justify-start items-center gap-2">
                  <div
                    className={cn(
                      'justify-center text-[calc(13rem/16)] leading-3 flex items-center gap-2 transition-colors duration-200',
                      hideSmallBalance ? 'text-white' : 'text-[#79778C]',
                    )}
                  >
                    <Checkbox
                      className="size-3.5 border-[#79778C] [&_*_svg]:size-2.5 data-[state=checked]:text-white data-[state=checked]:border-white data-[state=checked]:bg-transparent"
                      onCheckedChange={(checked) => setHideSmallBalance(!!checked)}
                      checked={hideSmallBalance}
                    />
                    <span className="cursor-pointer" onClick={() => setHideSmallBalance(!hideSmallBalance)}>
                      {t('assets.overview.hideSmallAmount')}
                    </span>
                  </div>
                </div>
                <div className="flex justify-start items-center gap-2">
                  <div
                    className={cn(
                      'justify-center text-[calc(13rem/16)] leading-3 flex items-center gap-2 data-[state=checked]:text-white',
                      hideSmallLiquidity ? 'text-white' : 'text-[#79778C]',
                    )}
                  >
                    <Checkbox
                      className="size-3.5 border-[#79778C] [&_*_svg]:size-2.5 data-[state=checked]:text-white data-[state=checked]:border-white data-[state=checked]:bg-transparent"
                      onCheckedChange={(checked) => setHideSmallLiquidity(!!checked)}
                      checked={hideSmallLiquidity}
                    />
                    <span className="cursor-pointer" onClick={() => setHideSmallLiquidity(!hideSmallLiquidity)}>
                      {t('holding.filter.hideSmallLiquidityPool')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div>
            <Holdings
              hidden={currentTab !== 'holdings'}
              walletsByChain={walletsByChain}
              wallet={walletAddressSelected}
              chainId={chainIdSelected}
              hideZeroBalance={hideZeroBalance}
              hideSmallBalance={hideSmallBalance}
              hideSmallLiquidity={hideSmallLiquidity}
            />
            <TransactionHistory
              hidden={currentTab !== 'history'}
              walletsByChain={walletsByChain}
              wallet={walletAddressSelected}
              chainId={chainIdSelected}
            />
          </div>
        </div>
      </div>
      <div className="h-full col-span-4 2xl:col-span-3">
        <Statistics walletsByChain={walletsByChain} wallet={walletAddressSelected} chainId={chainIdSelected} />
      </div>
    </div>
  )
}

export default Meme
