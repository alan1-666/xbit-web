import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { useUserReferralSnapshot } from '@/hooks/useUserReferralSnapshot'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant'
import { formatBalance } from '@/lib/format'
import { cn, getPath } from '@/lib/utils.ts'
import { memo, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ShareTokenDetail from '../common/ShareTokenDetail'
import ShareTokenHoldingPC from '../common/ShareTokenHoldingPC'
import { isEqual } from 'lodash-es'

type ButtonShareProps = {
  ref?: React.Ref<HTMLDivElement>
  costPrice: string | number
  returnRate: string | number
  avgMC?: string | number
  holdingValue: string | number
  totalBuy: string | number
  holdingQuantity?: string | number
  PnL: string | number
  chainId: number
  tokenAddress: string
  tokenName: string
  tokenAvatar: string
  tokenLatestPrice?: string | number
  realized?: number | string
  unrealized?: number | string
  disabled?: boolean
  showTitle?: boolean
  isXStock?: boolean
  openShare?: boolean
  showIcon?: boolean
  setOpenShare?: (open: boolean) => void
}

const ButtonShare = ({
  ref,
  costPrice,
  returnRate,
  avgMC,
  holdingValue,
  totalBuy,
  holdingQuantity,
  chainId,
  PnL,
  tokenAddress,
  tokenName,
  tokenAvatar,
  tokenLatestPrice,
  disabled = false,
  showTitle = true,
  realized,
  unrealized,
  isXStock,
  openShare,
  showIcon = true,
  setOpenShare,
}: ButtonShareProps) => {
  const { isDesktop } = useResponsive()
  const { t } = useTranslation()
  const [internalOpen, setInternalOpen] = useState<boolean>(false)
  const open = openShare !== undefined ? openShare : internalOpen
  const setOpen = setOpenShare || setInternalOpen
  const [inviteCode, setInviteCode] = useState('')

  const { data } = useUserReferralSnapshot()

  useEffect(() => {
    // console.log(res, 'this is res')
    if (data && data?.referralSnapshot?.user) {
      const user = data?.referralSnapshot?.user

      setInviteCode(user?.invitationCode || '')
    }
  }, [data])

  const memoizedLinkDetail = useMemo(() => {
    const referralSnapshot = inviteCode ? `/@${inviteCode}` : ''
    if (isXStock) {
      return (
        getPath(APP_PATH.X_STOCK_DETAIL, { address: tokenAddress, chain: CHAIN_SYMBOLS[chainId] }) + referralSnapshot
      )
    }

    return (
      getPath(APP_PATH.MEME_TOKEN_DETAIL, { address: tokenAddress, chain: CHAIN_SYMBOLS[chainId] }) + referralSnapshot
    )
  }, [inviteCode, tokenAddress, chainId])

  const currentUrl = useMemo(() => window.location.origin, [])
  const text = isXStock
    ? t('shareBottomSheet.stockShareTemplate', {
        symbol: tokenName,
        returns:
          returnRate !== '--'
            ? formatBalance(returnRate, {
                showCurrency: true,
                roundMode: 'floor',
              })
            : '--',
      })
    : t('shareBottomSheet.shareHoldingTemplate', {
        symbol: tokenName,
        returns:
          returnRate !== '--'
            ? formatBalance(returnRate, {
                showCurrency: true,
                roundMode: 'floor',
              })
            : '--',
      })

  const props = {
    open,
    setOpen,
    title: t('position.share'),
    text,
    data: {
      chainId,
      costPrice,
      PnL,
      tokenAddress,
      tokenAvatar,
      tokenName,
      returnRate,
      balance: holdingValue,
      totalBuy,
    },
    inviteCode,
    url: `${currentUrl}${memoizedLinkDetail}`,
    customShareUrl: `${text}\n${currentUrl}${memoizedLinkDetail}`,
  }
  return (
    <div
      className={cn('min-w-4', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}
      onClick={(e) => {
        e.stopPropagation()
        if (!disabled) setOpen(true)
      }}
      ref={ref}
    >
      <div className="flex items-center">
        {showIcon && <img
          src="/images/futuresDetail/share-icon.svg"
          alt="icon share"
          className="h-4 w-4 transition-all duration-100 hover:scale-[1.1]"
        />}
        {showTitle && (
          <span className="text-[#FFFFFFB2] app-font-regular text-[13px] leading-none">{t('position.share')}</span>
        )}
      </div>
      {isDesktop ? <>{open && <ShareTokenHoldingPC {...props} />}</> : <ShareTokenDetail {...props} />}
    </div>
  )
}

export default memo(ButtonShare, (prev, next) => isEqual(prev, next))
 