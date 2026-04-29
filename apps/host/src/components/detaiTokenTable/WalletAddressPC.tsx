import { fShortenNumber } from '@/lib/number'
import { formatAddressWallet } from '@/lib/string'
import { cn } from '@/lib/utils'
import { listCoinHelper } from '@/utils/list-coin-helper'
import { MouseEvent, useContext, useState } from 'react'
import { CopyButton } from '../common/copy-button'
import { useDetailTokenTableContext } from './DetailTokenTableContext'
import { IconWalletTop100 } from './IconWalletTop100'
import ButtonFollowToken from '@components/detailTokenTabs/ButtonFollowToken.tsx'
import IconDev from '@components/detailHolderTab/icons/IconDev.tsx'
import IconWhale from '@components/detailHolderTab/icons/IconWhale.tsx'
import IconInsider from '@components/detailHolderTab/icons/IconInsider.tsx'
import IconSmartMoney from '@components/detailHolderTab/icons/IconSmartMoney.tsx'
import IconKOL from '@components/detailHolderTab/icons/IconKOL.tsx'
import IconNewWallet from '@components/detailHolderTab/icons/IconNewWallet.tsx'
import IconTopTrader from '@components/detailHolderTab/icons/IconTopTrader.tsx'
import IconSameSource from '@components/detailHolderTab/icons/IconSameSource.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { WalletStatisticTooltipPC } from '@components/detaiTokenTable/WalletStatisticTooltipPC.tsx'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { ChainIds } from '@/types/enums.ts'
import { TradingTransactionsContext } from '@components/detaiTokenTable/TradingTransactionsContext.ts'

type WalletAttributes = {
  isDev?: boolean
  isWhale?: boolean
  isInsider?: boolean
  isNativeWallet?: boolean
  isTop10?: boolean
  isSmartMoney?: boolean
  isKOL?: boolean
  isNewWallet?: boolean
  topHolder?: string
}

type WalletAddressProps = {
  address: string
  walletAttributes: WalletAttributes
  tx24h?: number
  onFilterClick?: () => void
  selectedWallet?: string
  holdingPercentage?: number
  isFollowingWallet?: boolean
  txHash?: string
  tokenAddress?: string
}

const renderIcon = (attributes: WalletAttributes & { className?: string }) => {
  const { className } = attributes
  const icons = []
  if (attributes.isDev) {
    icons.push(<IconDev />)
  }
  if (attributes.isWhale) {
    icons.push(<IconWhale />)
  }
  if (attributes.isInsider) {
    icons.push(<IconInsider />)
  }
  if (attributes.isNativeWallet) {
    icons.push(<IconSameSource />)
  }
  if (attributes.isTop10) {
    if (attributes.topHolder) {
      icons.push(<IconWalletTop100 key="topHolder" top={attributes.topHolder} className={cn('size-5', className)} />)
    } else {
      icons.push(<IconTopTrader />)
    }
  }
  if (attributes.isSmartMoney) {
    icons.push(<IconSmartMoney />)
  }
  if (attributes.isKOL) {
    icons.push(<IconKOL />)
  }
  if (attributes.isNewWallet) {
    icons.push(<IconNewWallet />)
  }
  return icons
}

const WalletAddressPC = ({
  address,
  isFollowingWallet,
  walletAttributes,
  tx24h,
  onFilterClick,
  selectedWallet,
  holdingPercentage = 0,
}: WalletAddressProps) => {
  const handleFilterClick = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (onFilterClick) {
      onFilterClick()
    }
  }

  // console.log('followingWallets', followingWallets)

  // const isFollowingWallet = followingWallets?.some((item) => item === address)

  // const activeWallet = useActiveWallet()
  // const addr = activeWallet?.walletAddress ?? 'anonymous'
  // const queryClient = useQueryClient()

  const { showMakerDrawer } = useContext(TradingTransactionsContext)

  const { setEditNameState, aliasTotalFollowings, setEditName } = useDetailTokenTableContext()

  const aliasTotalFollowing = aliasTotalFollowings?.find((item) => item?.address === address)?.alias ?? ''

  // const [currentName, setCurrentName] = useState(aliasTotalFollowing)

  // useEffect(() => {
  //   if (editNameState?.status && editNameState.id === txHash) {
  //     refInput.current?.focus()
  //   }
  // }, [address, editNameState])

  // function changeAliasLocal(address: string, alias: string) {
  //   editXWalletFavourite({
  //     address,
  //     alias,
  //   })
  // }

  // const handleSetEditNameState = ({ id, status }: { status: boolean; id: string }) => {
  //   setEditNameState?.({
  //     id,
  //     status,
  //   })
  // }

  // const handleSaveName = () => {
  //   if (editName === aliasTotalFollowing) {
  //     handleSetEditNameState({ id: txHash ?? '', status: false })

  //     return
  //   } else {
  //     if (editName.trim() == '') {
  //       setCurrentName(address)

  //       handleSetEditNameState({ id: txHash ?? '', status: false })
  //     } else {
  //       handleSetEditNameState({ id: txHash ?? '', status: false })
  //       setCurrentName(editName)
  //     }

  //     //default change name address
  //     futureClient
  //       .mutate({
  //         mutation: addFollowingWallet,
  //         variables: {
  //           input: {
  //             chain: 'SOLANA',
  //             follows: [
  //               {
  //                 address,
  //                 name: editName.trim(),
  //               },
  //             ],
  //           },
  //         },
  //       })
  //       .then(() => {
  //         //update name success
  //         if (editName && String(editName).length) {
  //           setCurrentName(editName)
  //         }
  //         changeAliasLocal(address, editName)
  //         queryClient.setQueryData(['totalFollowings', ChainType.Solana, addr], (oldData: any) => {
  //           if (!oldData) return oldData
  //           const newData = [...oldData]
  //           const idx = newData.findIndex((e) => e.address === address)
  //           if (idx !== -1) {
  //             newData[idx] = {
  //               address,
  //               alias: editName,
  //             }
  //           } else {
  //             newData.push({
  //               address,
  //               alias: editName,
  //             })
  //           }
  //           return newData
  //         })
  //       })
  //       .catch(() => {
  //         //error
  //         setEditName(currentName)
  //       })
  //       .finally(() => {
  //         //blur input
  //         refInput.current?.blur()
  //       })
  //   }
  // }

  // const handleOnChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   e.stopPropagation() // Stop event bubbling
  //   e.preventDefault() // Prevent default action (for extra safety)
  //   setEditName(e.target.value)
  // }

  // const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === 'Enter') {
  //     handleSaveName()
  //   }
  // }

  return (
    <div className="relative min-w-[140px]">
      <div className="flex items-center gap-1">
        <div className="flex-1">
          <div className="flex gap-1">
            <div className="flex items-center gap-1 app-font-regular leading-[1] justify-between">
              <span
                className="text-[14px] text-[#FFFFFFCC] font-[330] cursor-pointer"
                onClick={() => showMakerDrawer(address)}
              >
                {aliasTotalFollowing
                  ? listCoinHelper.formatWalletNameWithEllipsis(aliasTotalFollowing || '')
                  : formatAddressWallet(address)}
              </span>
              {tx24h ? (
                <span className="text-[12px] font-[330] text-[#FFFFFFB2] p-[2px] rounded-xs bg-[#ECECED14] flex items-center justify-center w-[27px] text-center">
                  {tx24h < 100 ? fShortenNumber(tx24h) : '99+'}
                </span>
              ) : null}
            </div>
            <div className="flex gap-1 items-center">
              {/*{isFollowingWallet && (*/}
              {/*  <img*/}
              {/*    src="/images/tokenDetail/icon_star.svg"*/}
              {/*    className="cursor-pointer size-4"*/}
              {/*    alt="icon star"*/}
              {/*    onClick={(e) => {*/}
              {/*      e.preventDefault()*/}
              {/*      e.stopPropagation()*/}
              {/*    }}*/}
              {/*  />*/}
              {/*)}*/}
              <ButtonFollowToken
                address={address}
                className="w-3.5 h-3.5 flex relative z-10"
                isFollowing={isFollowingWallet}
              />

              {address === selectedWallet ? (
                <div
                  className="cursor-pointer w-4 h-4 flex items-center justify-center text-white/70 text-sm font-bold"
                  onClick={handleFilterClick}
                >
                  ×
                </div>
              ) : (
                <img
                  src="/images/icons/icon-filter.svg"
                  alt="filter"
                  className="cursor-pointer size-[11px] !pointer-events-auto"
                  onClick={handleFilterClick}
                />
              )}

              <CopyButton text={address} />
              {isFollowingWallet && (
                <img
                  src="/images/icons/edit.svg"
                  className="cursor-pointer size-4 !pointer-events-auto"
                  alt="edit name"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setEditNameState({
                      id: address,
                      status: true,
                    })
                    setEditName(aliasTotalFollowing ? aliasTotalFollowing : address)

                    // setTimeout(() => {
                    //   refInput.current?.focus()
                    //   refInput.current?.select()
                    // }, 100)
                  }}
                />
              )}
            </div>
          </div>

          <div className="flex gap-1 mt-1">
            <div className="mt-1 bg-[#00FFB433] h-1 w-[110px] relative rounded-r-full">
              <div
                className="absolute w-1/5 h-full bg-[#009C46] rounded-r-full transition"
                style={{ width: `${Math.min(holdingPercentage, 100)}%` }}
              ></div>
            </div>

            <div className="flex gap-1 items-center">
              {renderIcon({ ...walletAttributes, className: 'size-[12px]' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const WalletAddressWithTooltip = (props: WalletAddressProps) => {
  const { address, holdingPercentage, tokenAddress } = props
  const activeChainId = useActiveChainId() || ChainIds.Solana
  const [open, setOpen] = useState(false)
  return (
    <TooltipProvider disableHoverableContent={false}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger>
          <WalletAddressPC {...props} />
        </TooltipTrigger>
        <TooltipContent className="bg-transparent">
          <WalletStatisticTooltipPC
            address={address}
            chainId={activeChainId}
            token={tokenAddress ?? ''}
            holdingPercentage={holdingPercentage ?? 0}
            open={open}
          />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default WalletAddressPC
