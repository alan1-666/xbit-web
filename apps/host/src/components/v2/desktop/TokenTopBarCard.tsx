import { MouseEvent, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar.tsx'
import { formatPriceChange, fShortenNumber } from '@/lib/number.ts'
import { cn, getPath } from '@/lib/utils.ts'
import { IconX } from '@components/icon'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { useNavigate, useParams } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant.ts'
import { ChainIds } from '@/types/enums.ts'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import useItemTokenOHLC from '@components/futuresDetails/tokenSearchDrawer/hooks/useItemTokenOHLC.tsx'

export interface TopBarToken {
  avatar?: string
  name?: string
  marketCap?: number
  priceChange?: number
  address?: string
  chainId?: number
  sector?: 'futures' | 'meme' | 'xstock'
}

export interface TokenTopBarCardProps {
  token: TopBarToken
  onRemove?: (token: TopBarToken) => void
  showRemoveIcon?: boolean
}

const PriceChangeText = (props: { priceChange?: number }) => {
  const { priceChange } = props
  const isZero = !priceChange || Math.abs(priceChange) < 0.01
  if (isZero) return <span className="text-white">0%</span>
  const isPositive = priceChange >= 0.01
  return (
    <span className={cn(isPositive ? 'text-rise' : 'text-fall')}>
      {isPositive ? '+' : ''}
      {formatPriceChange(priceChange)}
    </span>
  )
}

export const TokenTopBarCard = (props: TokenTopBarCardProps) => {
  const { token, onRemove, showRemoveIcon } = props
  const { avatar, name, marketCap, priceChange, sector, chainId, address } = token
  const navigate = useNavigate()
  const { t } = useTranslation()
  const pageParams = useParams()
  const activeTokenAddress = pageParams.address
  const { price: updatedData } = useItemTokenOHLC({
    address: address || '',
    initChangePercent: priceChange,
    initMarketcap: marketCap,
  })

  const tokenHref = useMemo(() => {
    if (sector === 'meme' || sector === 'xstock') {
      const path = sector === 'meme' ? APP_PATH.MEME_TOKEN_DETAIL : APP_PATH.X_STOCK_DETAIL
      let chain = 'sol'
      if (chainId === ChainIds.Ethereum) {
        chain = 'eth'
      } else if (chainId === ChainIds.Arbitrum) {
        chain = 'arb'
      } else if (chainId === ChainIds.Bsc) {
        chain = 'bsc'
      }
      else if (chainId === ChainIds.Mon) {
        chain = 'mon'
      }
      if (!address) return ''
      return (
        getPath(path, {
          chain: chain,
          address,
        }) ?? ''
      )
    } else {
      return ''
    }
  }, [address, chainId, sector])

  const handleRemove = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    onRemove?.(token)
  }

  return (
    <Link
      className="flex items-center gap-1.5 text-[calc(12rem/16)] cursor-pointer relative h-full"
      to={tokenHref}
      state={{ symbol: name || '' }}
    >
      <Avatar className="size-5">
        <AvatarImage src={avatar} />
        <AvatarFallback className="bg-[#232323]">{name?.slice(0, 2)?.toLowerCase()}</AvatarFallback>
      </Avatar>
      <div className="text-white font-medium whitespace-nowrap">{name}</div>
      <div className=" text-white font-medium break-keep whitespace-nowrap">
        <span className="text-[calc(12rem/16)] text-white/50 font-medium">
          {t('listCoin.filters.fields.marketCap.title')}
        </span>{' '}
        ${fShortenNumber(Number(updatedData.marketcap ?? marketCap ?? 0))}
      </div>
      <div>
        <PriceChangeText priceChange={Number(updatedData.price24hChange ?? priceChange)} />
      </div>
      {showRemoveIcon && (
        <TooltipProvider delayDuration={50}>
          <Tooltip>
            <TooltipTrigger>
              <IconX className="text-[#878787]" onClick={handleRemove} />
            </TooltipTrigger>
            <TooltipContent>Remove</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {activeTokenAddress?.toLowerCase() === address?.toLowerCase() && (
        <motion.div
          layoutId="underline-top-bar"
          className="absolute bottom-0 bg-white/36 h-0.5 left-0 right-0 rounded-full"
        />
      )}
    </Link>
  )
}
