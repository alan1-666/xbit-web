import { ChainType, UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user.ts'
import { LIST_CHAIN_SUPPORTED, TYPE_CHAIN } from '@/lib/blockchain.ts'
import { formatAmount } from '@/lib/format'
import { formatAddressWallet } from '@/lib/string.ts'
import { PortfolioDTO } from '@/types/holding.ts'
// import { getAvatarFromAddress } from '@/utils/list-coin-helper'
import { CopyButton } from '@components/common/copy-button.tsx'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { f } from 'fintech-number'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { generateAvatar } from '@/utils/xbitAvatar/XbitAvatarGenerator.ts'

export interface ItemWalletPresentationProps {
  isSelected?: boolean
  onSelected?: () => void
  wallet: UserEmbeddedWalletDto
  portfolioData?: PortfolioDTO[]
  totalHoldingTokens?: number
  nativeTokenLogo?: string
}

const getTypeChainFromWallet = (wallet: UserEmbeddedWalletDto): TYPE_CHAIN => {
  switch (wallet.chain) {
    case ChainType.Arb:
      return TYPE_CHAIN.ARB
    case ChainType.Evm:
      return TYPE_CHAIN.ETH
    case ChainType.Solana:
      return TYPE_CHAIN.SOLANA
    case ChainType.Bsc:
      return TYPE_CHAIN.BSC
    case ChainType.Mon:
      return TYPE_CHAIN.MON   
    default:
      return TYPE_CHAIN.SOLANA
  }
}

export const ItemWalletPresentation = (props: ItemWalletPresentationProps) => {
  const { isSelected, onSelected, wallet, portfolioData = [], totalHoldingTokens = 0, nativeTokenLogo } = props
  const { pathname } = useLocation()
  const isFuturesPage = pathname.includes('/futures')

  const fallbackTokenLogo = useMemo(() => {
    if (wallet.chain === ChainType.Solana) return '/images/icons/icon-sol.svg'
    if (wallet.chain === ChainType.Evm) return '/images/ether.svg'
    if (wallet.chain === ChainType.Arb) {
      if (isFuturesPage) return '/images/icons/chains/ic-usdc.svg'
      return '/images/ether.svg'
    }
    if (wallet.chain === ChainType.Bsc) return '/images/bsc.svg'
    return LIST_CHAIN_SUPPORTED.find((item) => item.value === getTypeChainFromWallet(wallet))?.img
  }, [wallet])

  const [src, setSrc] = useState('')
  useEffect(() => {
    generateAvatar(wallet?.walletAddress).then(setSrc)
  }, [wallet?.walletAddress])

  return (
    <div
      className={`relative flex items-end justify-between px-2.5 py-3 rounded-lg border-[0.5px] cursor-pointer ${
        isSelected ? 'border-[#843BEA] bg-[#584487]' : 'bg-[#2B2B33] border-[#2B2B33]'
      }`}
      onClick={onSelected}
    >
      {isSelected && (
        <img
          src="/images/icons/border-checked.svg?v=2"
          alt="check"
          className="absolute h-[14px] w-auto top-0 right-0"
        />
      )}
      <div className="flex items-center gap-2.5 w-full">
        <img data-avatar-type="wallet" src={src} className="w-10 h-10 rounded-full" alt="logo xbit" />
        <div className="flex items-center justify-between w-full">
          <div className="w-full">
            <div className="flex items-center gap-1.5">
              <div className="font-medium text-white text-[14px] leading-none truncate max-w-40 md:max-w-90">
                {wallet.name}
              </div>
              <div className="font-normal text-white/50 text-[12px] leading-none">
                {formatAddressWallet(wallet.walletAddress)}
              </div>
              <CopyButton text={wallet.walletAddress} className="h-[14px] w-[14px]" />
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <img src={nativeTokenLogo || fallbackTokenLogo} alt="" className="w-3 h-3 mt-[1px]" />
              <p className="text-sm font-medium text-[#ffffffb3] leading-none">
                {formatAmount(wallet.balance, {
                  roundMode: 'floor',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center">
        {portfolioData?.length > 0 &&
          portfolioData?.slice(0, 3)?.map((holding: PortfolioDTO, index: number) => (
            <div key={index + holding.token} className={index !== 0 ? '-ml-2' : ''}>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger>
                    <LogoWithChain logo={holding?.logoUrl} logoClassName="w-4 h-4 min-w-none" name="" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[360px]">
                    <p className="text-xs leading-none">{holding?.symbol}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
        {totalHoldingTokens > 3 && (
          <div className="font-semibold text-white text-[14px] ml-1.5">+{f(totalHoldingTokens - 3)}</div>
        )}
      </div>
    </div>
  )
}
