import { ChainType } from '@/@generated/gql/graphql-user.ts'
import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user.ts'
import { formatAmount } from '@/lib/format'
import { formatAddressWallet } from '@/lib/string.ts'
import { useAppSelector } from '@/redux/store'
import { ChainIds } from '@/types/enums'
import { BLOCKCHAIN_NAMES } from '@/utils/helpers'
import { IconCheckbox, IconCheckboxChecked } from '@components/icon'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover.tsx'
import { ChevronDown } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Configs } from '@const/configs.ts'

export interface OverviewWalletSelectProps {
  wallets: UserEmbeddedWalletDto[]
  onWalletChange: (wallets: UserEmbeddedWalletDto[],) => void
}

const getIconChain = (chain: ChainType) => {
  switch (chain) {
    case ChainType.Evm:
      return '/images/icons/ic-ethereum.png'
    case ChainType.Solana:
      return '/images/icons/icon-sol.svg'
    case ChainType.Arb:
      return '/images/icons/ic-ethereum.png'
    case ChainType.Bsc:
      return '/images/bsc.svg'
    case ChainType.Mon:
      return '/images/icons/chains/ic-monad.svg'
    default:
      return '/images/icons/ic-solana.png'
  }
}

interface OverviewWalletProps {
  wallet: UserEmbeddedWalletDto
  selected: boolean
  onSelect: (wallet: UserEmbeddedWalletDto) => void
}

const OverviewWallet = (props: OverviewWalletProps) => {
  const { wallet, selected, onSelect } = props
  const handleSelect = () => {
    onSelect(wallet)
  }

  return (
    <div
      key={`${wallet.walletAddress}-${wallet.chain}`}
      className="flex items-center gap-3 py-2 px-4 border-b border-[#79778C29] last:border-0 cursor-pointer"
      onClick={handleSelect}
    >
      {selected ? (
        <IconCheckboxChecked className="size-4 text-[#843BEA]" />
      ) : (
        <IconCheckbox className="size-4 text-[#843BEA]" />
      )}
      <div className="text-[calc(13rem/16)] font-[330] w-24 truncate flex-1 select-none">
        <div>{wallet.name}</div>
        <div className="text-[#6C6A74] text-[calc(12rem/16)]">{formatAddressWallet(wallet.walletAddress, 5, 5)}</div>
      </div>
      <div className="border border-[#2B2B33] rounded-full flex items-center gap-1 py-1.5 px-2">
        <img src={getIconChain(wallet.chain)} className="w-3 h-3" alt="" />
        <p className="text-[13px] text-white font-[380] leading-none truncate">
          {formatAmount(wallet.balance, {
            roundMode: 'floor',
          })}
        </p>
      </div>
    </div>
  )
}

const getNetworkLabel = (chain: string) => {
  switch (chain) {
    case 'eth':
      return 'Ethereum'
    case 'arb':
      return 'Arbitrum'
    case 'bsc':
      return BLOCKCHAIN_NAMES[ChainIds.Bsc]
    case 'mon':
      return 'Monad'
    default:
      return 'Solana'
  }
}

export const OverviewWalletSelect = ({ wallets, onWalletChange }: OverviewWalletSelectProps) => {
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain as UserEmbeddedWalletDto[])
  const { t } = useTranslation()

  const triggerLabel = useMemo(() => {
    if (!wallets) return t('assets.overview.allWallets')
    if (wallets.length === 0) return t('assets.overview.noWalletSelected')
    if (wallets.length === listWalletsByChain.length) return t('assets.overview.allWallets')
    if (wallets.length > 1) return t('assets.overview.walletsSelected', { count: wallets.length })
    return wallets[0].name
  }, [wallets, listWalletsByChain, t])

  const handleSelect = (wallet: UserEmbeddedWalletDto) => {
    const selectedWallets = wallets ? wallets : listWalletsByChain
    const isAlreadySelected = selectedWallets.some(
      (w) => w.walletAddress === wallet.walletAddress && w.chain === wallet.chain,
    )
    let newSelectedWallets: UserEmbeddedWalletDto[]
    if (isAlreadySelected) {
      newSelectedWallets = selectedWallets.filter(
        (w) => !(w.walletAddress === wallet.walletAddress && w.chain === wallet.chain),
      )
    } else {
      newSelectedWallets = [...selectedWallets, wallet]
    }
    onWalletChange(newSelectedWallets)
  }

  const groupedWallets = useMemo(() => {
    return {
      sol: listWalletsByChain.filter((w) => w.chain === ChainType.Solana),
      eth: listWalletsByChain.filter((w) => w.chain === ChainType.Evm),
      arb: listWalletsByChain.filter((w) => w.chain === ChainType.Arb),
      bsc: listWalletsByChain.filter((w) => w.chain === ChainType.Bsc),
      mon: listWalletsByChain.filter((w) => w.chain === ChainType.Mon),
    }
  }, [listWalletsByChain])

  const chainsByPriority = useMemo(() => {
    if (!Configs.enableSolana()) return ['bsc', 'mon', 'sol'] // Prefer BSC if Solana is disabled
    return ['bsc', 'mon', 'sol'] // Default priority with Solana enabled
  }, [])

  const groupedWalletsOrdered = useMemo(() => {
    const ordered: Record<string, UserEmbeddedWalletDto[]> = {}
    chainsByPriority.forEach((chain) => {
      ordered[chain] = groupedWallets[chain as keyof typeof groupedWallets] || []
    })
    return ordered
  }, [groupedWallets, chainsByPriority])

  const toggleSelectAll = () => {
    if (!wallets || wallets.length === 0 || wallets.length < listWalletsByChain.length) {
      onWalletChange(listWalletsByChain)
    } else {
      onWalletChange([])
    }
  }

  return (
    <Popover>
      <PopoverTrigger className="w-[160px] h-9 bg-[#79778C29] border-none text-[#908E98] rounded-[8px] pl-3 pr-2 py-2.5 text-[calc(14rem/16)] flex-1 flex items-center justify-between">
        <span>{triggerLabel}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="border-[0.6px] border-[#79778C29] bg-[#212127] p-0 max-h-[40vh] overflow-y-auto"
      >
        <div className="flex items-center px-4 py-3 cursor-pointer gap-3" onClick={toggleSelectAll}>
          {!wallets || wallets.length === listWalletsByChain.length ? (
            <IconCheckboxChecked className="size-4 text-[#843BEA]" />
          ) : (
            <IconCheckbox className="size-4 text-[#843BEA]" />
          )}
          <span className="text-[calc(13rem/16)] font-[330] select-none">{t('assets.overview.allWallets')}</span>
        </div>
        {Object.entries(groupedWalletsOrdered).map(([chain, group]) => {
          if (group.length === 0) return null
          return (
            <div key={chain}>
              <div className="px-4 py-2 text-[13px] text-[#6C6A74] font-[500] bg-[#2B2B33]">
                {getNetworkLabel(chain)}
              </div>
              {group.map((wallet) => {
                return (
                  <OverviewWallet
                    key={`${wallet.walletAddress}-${wallet.chain}`}
                    wallet={wallet}
                    selected={
                      !wallets ||
                      wallets.some((w) => w.walletAddress === wallet.walletAddress && w.chain === wallet.chain)
                    }
                    onSelect={handleSelect}
                  />
                )
              })}
            </div>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}
