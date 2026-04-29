import { formatAddressWallet } from '@/lib/string.ts'
import CopyBtn from '@components/common/CopyBtn.tsx'
import ProgressBarHolder from '@components/detailHolderTab/ProgressBarHolder.tsx'
import IconDev from '@components/detailHolderTab/icons/IconDev.tsx'
import IconInsider from '@components/detailHolderTab/icons/IconInsider.tsx'
import IconSmartMoney from '@components/detailHolderTab/icons/IconSmartMoney.tsx'
import IconTopTrader from '@components/detailHolderTab/icons/IconTopTrader.tsx'
import IconWhale from '@components/detailHolderTab/icons/IconWhale.tsx'
import IconKOL from '@components/detailHolderTab/icons/IconKOL.tsx'
import IconNewWallet from '@components/detailHolderTab/icons/IconNewWallet.tsx'
import IconHolderPercentage from '@components/detailTokenTabs/IconHolderPercentage.tsx'
import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'
import ButtonFollowToken from '@components/detailTokenTabs/ButtonFollowToken.tsx'
import { cn } from '@/lib/utils.ts'
import { useGetTotalFollowings } from '@hooks/useGetTotalFollowings.ts'
import { useEffect, useMemo } from 'react'
import React from 'react'
import { CopyButton } from '@components/common/copy-button.tsx'
import eventBus from '@/lib/eventBus.ts'
import { EDITING_ALIAS_HOLDER, REFETCH_ALIAS_HOLDER, REFETCH_FOLLOWED_HOLDERS } from '@const/tokenDetail.ts'
import { APP_PATH } from '@/lib/constant.ts'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { selectAliasItem, upsertAlias } from '@/redux/modules/cachedAlias.slice.ts'
import IconBundle from '@components/detailHolderTab/icons/IconBundle.tsx'
import IconSniper from '@components/detailHolderTab/icons/IconSniper.tsx'
import IconPhishing from '@components/detailHolderTab/icons/IconPhishing.tsx'
import IconBot from '@components/detailHolderTab/icons/IconBot.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import HolderWalletInfo from '@components/detailLatestTab/pc/HolderWalletInfo.tsx'
import { useTranslation } from 'react-i18next'
import { HolderWithColor } from '@components/detailHolderTab/pc/HoldersTablePc.tsx'

type WalletAddressProps = {
  positionPercentage: number
  isFollowed?: boolean
  holder: HolderWithColor
}

const renderIcon = (tag: string) => {
  const lowerTag = tag.toLowerCase()
  const matchTopLabel = lowerTag.match(/^top(\d+)$/)

  if (matchTopLabel) {
    return (
      <IconHolderPercentage
        percentage={Number(matchTopLabel[1] ?? 0)}
        label=""
        imgClassName="min-w-4 h-4"
        spanClassName="text-[7px] w-[7px] top-[calc(100%-5px)]"
      />
    )
  }

  if (lowerTag === 'dev') {
    return <IconDev />
  }
  if (lowerTag === 'whale') {
    return <IconWhale />
  }
  if (lowerTag === 'insider') {
    return <IconInsider />
  }
  if (lowerTag === 'samesource' || lowerTag === 'bundle' || lowerTag === 'bundler' || lowerTag === 'bundlers') {
    return <IconBundle />
  }
  if (lowerTag === 'toptrader' || lowerTag === 'top100') {
    return <IconTopTrader />
  }
  if (lowerTag === 'smartmoney') {
    return <IconSmartMoney />
  }
  if (lowerTag === 'kol') {
    return <IconKOL />
  }
  if (lowerTag === 'fresh') {
    return <IconNewWallet />
  }
  if (lowerTag === 'sniper') {
    return <IconSniper />
  }
  if (lowerTag === 'phishing') {
    return <IconPhishing />
  }
  if (lowerTag === 'bot' || lowerTag === 'robot') {
    return <IconBot />
  }

  return <div className="min-w-5 h-1"></div>
}

const HolderWalletAddress = ({ positionPercentage, holder, isFollowed }: WalletAddressProps) => {
  const { isDesktop } = useResponsive()
  const { t } = useTranslation()

  const address = holder?.address ?? ''
  const alias = holder?.addressAlias
  const labels = holder?.labels

  const dispatch = useAppDispatch()
  const cachedAlias = useAppSelector((state: RootState) => selectAliasItem(state, address))

  const { data } = useGetTotalFollowings()
  const listFollowings = useMemo(() => data?.map((item) => item?.address), [data])
  const isFavorite = useMemo(() => listFollowings?.some((item) => item === address), [listFollowings, address])

  const shortAddress = useMemo(() => formatAddressWallet(address), [address])

  const itemAlias = useMemo(() => {
    if (!isFavorite || !cachedAlias) return ''
    return cachedAlias.alias
  }, [cachedAlias, isFavorite])

  useEffect(() => {
    const handler = ({ data }: { data: { address: string; alias: string } }) => {
      dispatch(upsertAlias({ address: data?.address, alias: data?.alias }))
    }
    eventBus.on(REFETCH_ALIAS_HOLDER, handler)
    return () => eventBus.remove?.(REFETCH_ALIAS_HOLDER, handler)
  }, [])

  useEffect(() => {
    if (isFollowed && !isFavorite) {
      eventBus.dispatch(REFETCH_FOLLOWED_HOLDERS)
    }
  }, [isFavorite, isFollowed])

  return (
    <div className={'relative z-[1]'}>
      <div className="flex items-center gap-1">
        <div className={cn(isDesktop ? 'min-w-[200px]' : 'w-[95px]')}>
          <TooltipProvider>
            <div className="flex items-center gap-1 app-font-regular leading-[1]" onClick={(e) => e?.stopPropagation()}>
              {isDesktop ? (
                <>
                  <Tooltip>
                    <TooltipTrigger>
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`${APP_PATH.MEME_WALLET}/${address}`}
                        className="text-[14px] leading-[1] truncate hover:underline hover:underline-offset-1"
                        style={{ color: holder?.fundingColor ?? '#FBFBFB' }}
                      >
                        {itemAlias ? itemAlias : shortAddress}
                      </a>
                    </TooltipTrigger>
                    <TooltipContent className="p-0">
                      <HolderWalletInfo holder={holder} />
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger>
                      <ButtonFollowToken
                        address={address}
                        className="w-3.5 h-3.5 flex relative z-10"
                        isFollowing={isFavorite}
                        isStarBottomTabs
                      />
                    </TooltipTrigger>
                    <TooltipContent className="p-0">{t('walletDetail.btn.follow')}</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger>
                      <img
                        alt="filter"
                        src="/images/icons/icon-filter.svg"
                        className="w-3 h-3 !cursor-not-allowed !pointer-events-auto"
                      />
                    </TooltipTrigger>

                    <TooltipContent>{t('smartMoney.latestTrader.filter')}</TooltipContent>
                  </Tooltip>

                  <CopyButton icon="/images/icons/ic-copy2.svg" text={address} className="size-4" />
                  {isFavorite && (
                    <img
                      src={'/images/icons/edit.svg'}
                      className="w-[14px] h-[14px] !pointer-events-auto cursor-pointer"
                      alt="icon filter"
                      onClick={() => {
                        eventBus.dispatch(EDITING_ALIAS_HOLDER, { data: { address, alias } })
                      }}
                    />
                  )}
                </>
              ) : (
                <span style={{ color: holder?.fundingColor }} className={cn('text-[9px] font-[330] leading-none')}>
                  {formatAddressWallet(address, 5, 5)}
                </span>
              )}

              {!isDesktop && (
                <CopyBtn
                  text={address ?? ''}
                  icon={<img src="/images/icons/ic-copy.svg" className="w-3 min-w-3 h-3" alt="" />}
                />
              )}
            </div>
          </TooltipProvider>
          <div className="flex items-center gap-1">
            <ProgressBarHolder percentage={positionPercentage} />
            {labels?.map((label) => (
              <React.Fragment key={label}>{renderIcon(label ?? '')}</React.Fragment>
            ))}
          </div>
        </div>

        {/*{!isDesktop && renderIcon(holder?.label ?? '')}*/}
      </div>
    </div>
  )
}

export default HolderWalletAddress
