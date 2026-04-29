import { MouseEvent } from 'react'
import { TokenAvatar } from '@components/discover/cards/TokenAvatar.tsx'
import { formatAddressWallet } from '@/lib/string.ts'
import { CopyButton } from '@components/common/copy-button.tsx'
import { fShortenNumber } from '@/lib/number.ts'
import { TokenAge } from '@components/listCoin/TokenAge.tsx'
import { useNavigate } from 'react-router-dom'
import {cn, getPath } from '@/lib/utils.ts'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant.ts'
import { useTranslation } from 'react-i18next'

export interface SimilarTokenProps {
  avatar: string
  symbol: string
  address: string
  marketCap: number
  createdTime: string
  chainId: number
  className?: string
}

export const SimilarToken = (props: SimilarTokenProps) => {
  const { avatar, symbol, address, marketCap, chainId, createdTime, className } = props
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleClick = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    if (!address || !chainId) return
    navigate(getPath(APP_PATH.MEME_TOKEN_DETAIL, { address: address, chain: CHAIN_SYMBOLS[chainId] }),{
      state: { symbol: symbol },
    })
  }

  return (
    <div
      className={cn('flex items-stretch p-2.5 gap-2 border-[#ECECED14] border-[0.6px] rounded-[8px] mb-2 cursor-pointer', className)}
      onClick={handleClick}
    >
      <TokenAvatar name={symbol} tokenAvatar={avatar} className="size-8" />
      <div className="flex-1 text-[calc(12rem/16)] text-white flex flex-col justify-between">
        <div>{symbol}</div>
        <div className="flex items-center text-white/70">
          {formatAddressWallet(address)}
          <CopyButton icon="/images/icons/ic-copy2.svg" text={address} className="size-4 ml-1" type="tokenAddress" />
        </div>
      </div>
      <div className="flex flex-col justify-between text-[calc(12rem/16)] text-right text-white">
        <div className="text-right">
          {t('listCoin.tooltip.similarTokenMC')}{' '}
          <span className="text-[#FACC14]">{marketCap > 0 ? `$${fShortenNumber(marketCap)}` : '--'}</span>
        </div>
        <TokenAge createdTime={createdTime} />
      </div>
    </div>
  )
}
