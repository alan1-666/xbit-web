import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user.ts'
import BottomSheet from '@/components/common/BottomSheet'
import { formatBalance } from '@/lib/format'
import { formatAddressWallet } from '@/lib/string'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/redux/store'
import { ChainIds } from '@/types/enums.ts'
import { BLOCKCHAIN_NAMES } from '@/utils/helpers.ts'
import AddNewWallet from '@components/auth/ManagementWallets/AddNewWallet.tsx'
import { IconArrowDown2 } from '@components/icon'
import { useNativeTokenPrices } from '@hooks/useNativeTokenPrices.ts'
import { useFuturesBalance } from '@pages/assets/overview/hooks/useTotalBalance.ts'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  title?: string
  onAccountSelected?: (account: { chainId: ChainIds; wallet?: string; tokenAddress?: string }) => void
  defaultExpanded?: boolean
  showAddWallet?: boolean
  showPerpsAccount?: boolean
}

const SelectAccount = ({
  open,
  setOpen,
  title,
  onAccountSelected,
  defaultExpanded = false,
  showAddWallet = false,
  showPerpsAccount = false,
}: Props) => {
  const { t } = useTranslation()
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const { solPrice, bnbPrice, monPrice } = useNativeTokenPrices()
  const [expanded, setExpanded] = useState(defaultExpanded)
  const futuresBalance = useFuturesBalance()

  const accounts = useMemo(() => {
    const solWallets = listWalletsByChain.filter((wallet: UserEmbeddedWalletDto) => wallet.chain === 'SOLANA')
    const bscWallets = listWalletsByChain.filter((wallet: UserEmbeddedWalletDto) => wallet.chain === 'BSC')
    const monadWallets = listWalletsByChain.filter((wallet: UserEmbeddedWalletDto) => wallet.chain === 'MON')
    return [
      {
        chainId: ChainIds.Solana,
        icon: '/images/icons/sol-rounded-icon.svg',
        tokenAddress: 'So11111111111111111111111111111111111111111',
        balance: solWallets.reduce(
          (acc: number, wallet: UserEmbeddedWalletDto) => acc + (wallet.balance || 0) * (solPrice || 0),
          0,
        ),
        children: solWallets.map((wallet: UserEmbeddedWalletDto) => {
          const balanceUsd = wallet?.balance ? wallet.balance * (solPrice || 0) : 0
          return {
            ...wallet,
            balanceUsd,
          }
        }),
      },
      {
        chainId: ChainIds.Bsc,
        icon: '/images/bsc.svg',
        tokenAddress: '0x0000000000000000000000000000000000000000',
        balance: bscWallets.reduce(
          (acc: number, wallet: UserEmbeddedWalletDto) => acc + (wallet.balance || 0) * (bnbPrice || 0),
          0,
        ),
        children: bscWallets.map((wallet: UserEmbeddedWalletDto) => {
          const balanceUsd = wallet?.balance ? wallet.balance * (bnbPrice || 0) : 0
          return {
            ...wallet,
            balanceUsd,
          }
        }),
      },
      {
        chainId: ChainIds.Mon,
        icon: '/images/icons/chains/ic-monad.svg',
        tokenAddress: '0x0000000000000000000000000000000000000000',
        balance: monadWallets.reduce(
          (acc: number, wallet: UserEmbeddedWalletDto) => acc + (wallet.balance || 0) * (monPrice || 0),
          0,
        ),
        children: monadWallets.map((wallet: UserEmbeddedWalletDto) => {
          const balanceUsd = wallet?.balance ? wallet.balance * (monPrice || 0) : 0
          return {
            ...wallet,
            balanceUsd,
          }
        }),
      },
      {
        chainId: ChainIds.Hyperliquid,
        icon: '/images/icons/chains/ic-hyperliquid.png',
        balance: futuresBalance,
        hidden: !showPerpsAccount,
      },
    ]
  }, [listWalletsByChain, solPrice, bnbPrice, monPrice])

  useEffect(() => {
    if (!open) return
    setExpanded(defaultExpanded)
  }, [open])

  return (
    <BottomSheet open={open} setOpen={setOpen} title={title ?? t('exchange.selectAccount')} hiddenBgImg>
      <div className="space-y-2">
        {accounts.map((account) => (
          <div
            key={account.chainId}
            className={`p-3.5 bg-[#2B2B33] border-[0.5px] border-[#444455] rounded-[10px] cursor-pointer ${account?.hidden ? 'hidden' : ''}`}
            onClick={() => {
              if (account.chainId === ChainIds.Solana && account.children.length > 1) {
                setExpanded(!expanded)
              } else {
                onAccountSelected?.({
                  chainId: account.chainId,
                  wallet: account.children ? account.children[0].walletAddress : undefined,
                  tokenAddress: account.tokenAddress || undefined,
                })
                setExpanded(false)
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-[16px] leading-4">
                  {account.chainId === ChainIds.Hyperliquid ? t('assets.futures.futures') : t('assets.funding.meme')}
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <span className="text-[12px] leading-5.5 text-[#908E98]">{BLOCKCHAIN_NAMES[account.chainId]}</span>
                  <img className="size-4 rounded-full overflow-hidden" src={account.icon} alt="" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-[16px] text-[#9D9CA2]">
                  {formatBalance(account.balance, {
                    showCurrency: true,
                    roundMode: 'floor',
                  })}
                </span>
                {account.chainId === ChainIds.Solana && account.children.length > 1 && (
                  <IconArrowDown2
                    className={cn('size-4.5 text-#DBD8E5', {
                      'transform rotate-180': expanded,
                    })}
                  />
                )}
              </div>
            </div>
            {account.chainId === ChainIds.Solana && expanded && (
              <div className="mt-2.5 bg-[#212127] py-3 rounded-xl transition-all duration-300 ease-in-out">
                <div className="px-3 max-h-65 overflow-y-auto no-scrollbar">
                  {account.children.map((child: any) => (
                    <div
                      key={child.walletAddress}
                      className="flex items-center justify-between cursor-pointer mt-2 first:mt-0 pt-2 first:pt-0 border-t border-[#2E2E2E] first:border-0"
                      onClick={() => {
                        onAccountSelected?.({
                          chainId: account.chainId,
                          wallet: child.walletAddress || '',
                          tokenAddress: account.tokenAddress || '',
                        })
                      }}
                    >
                      <div>
                        <div className="font-semibold text-[12px] leading-3">{child.name}</div>
                        <div className="mt-1 flex items-center gap-1">
                          <span className="text-[12px] leading-5.5 text-[#908E98]">
                            {formatAddressWallet(child.walletAddress || '')}
                          </span>
                          <img className="size-4 rounded-full overflow-hidden" src={account.icon} alt="" />
                        </div>
                      </div>
                      <div className="text-[12px] leading-5.5 text-[#908E98]">
                        {formatBalance(child.balanceUsd || 0, {
                          showCurrency: true,
                          roundMode: 'floor',
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {showAddWallet && (
                  <div
                    className="mt-3"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                    }}
                  >
                    <AddNewWallet />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </BottomSheet>
  )
}

export default SelectAccount
