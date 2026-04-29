import { formatAddressWallet } from '@/lib/string.ts'
import ButtonFollowToken from '@components/detailTokenTabs/ButtonFollowToken.tsx'
import IconInsiderLatest from '@components/detailLatestTab/IconInsiderLatest.tsx'
import NativeWalletIconLatest from '@components/detailLatestTab/NativeWalletIconLatest.tsx'
import { IconWalletLabel } from '@components/detailLatestTab/IconWalletLabel.tsx'
import { useTranslation } from 'react-i18next'
import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'
import { useGetTotalFollowings } from '@hooks/useGetTotalFollowings.ts'
import { TransactionDto } from '@/@generated/gql/graphql-meme2.ts'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { selectAliasItem, upsertAlias } from '@/redux/modules/cachedAlias.slice.ts'
import { useEffect, useMemo, MouseEvent } from 'react'
import { CopyButton } from '@components/common/copy-button.tsx'
import eventBus from '@/lib/eventBus.ts'
import { EDITING_ALIAS_LATEST, REFETCH_ALIAS_LATEST } from '@const/tokenDetail.ts'
import { CHAIN_EXPLORER_ADDRESS_URLS } from '@/lib/constant.ts'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { ChainIds } from '@/types/enums.ts'
import { Button } from '@components/ui/button.tsx'
import { LastFollowedState, setHolder } from '@/redux/modules/latestFollowed.slice.ts'

type ItemTraderProps = {
  item: TransactionDto
  onWalletClick?: (event: MouseEvent) => void
}

const ItemTrader = ({ item, onWalletClick }: ItemTraderProps) => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  const currentChainId = useActiveChainId() ?? ChainIds.Solana

  const dispatch = useAppDispatch()

  const {
    maker,
    baseToken,
    tx24h: tx24hRaw,
    isDev,
    isWhale,
    isInsider,
    isNativeWallet,
    isSmartMoney,
    isFreshWallet,
  } = item
  const { holder } = useAppSelector((state: RootState) => state.latestFollowed as LastFollowedState)
  const cachedAlias = useAppSelector((state: RootState) => selectAliasItem(state, maker))

  const shortAddress = useMemo(() => formatAddressWallet(maker), [maker])

  const { data } = useGetTotalFollowings()
  const listFollowings = useMemo(() => data?.map((item) => item?.address), [data])
  const isFavorite = useMemo(() => listFollowings?.some((wallet) => wallet === maker), [listFollowings, maker])

  const itemAlias = useMemo(() => {
    if (!isFavorite || !cachedAlias) return ''
    return cachedAlias.alias
  }, [cachedAlias, isFavorite])

  const tx24h = Number(tx24hRaw)

  useEffect(() => {
    const handler = ({ data }: { data: { address: string; alias: string } }) => {
      dispatch(upsertAlias({ address: data?.address, alias: data?.alias }))
    }

    eventBus.on(REFETCH_ALIAS_LATEST, handler)
    return () => eventBus.remove?.(REFETCH_ALIAS_LATEST, handler)
  }, [])

  return (
    <div>
      {isDesktop ? (
        <div className="flex items-center gap-1">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`${CHAIN_EXPLORER_ADDRESS_URLS[currentChainId]}/${maker}`}
            className="text-[14px] leading-[1] truncate text-[#79778C] hover:underline hover:underline-offset-1 hover:text-white"
            onClick={onWalletClick}
          >
            {itemAlias ? itemAlias : shortAddress}
          </a>
          {tx24h > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="text-[12px] leading-[1] text-[#79778C] font-light p-0.5 rounded-[4px] bg-[#212127]">
                    {tx24h}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <span className="text-[13px] text-white leading-[1] font-light">
                    {t('detail.followed.tx24h', { tx24h })}
                  </span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button
            className="!border-none !outline-none !bg-transparent !hover:bg-transparent flex w-fit p-0"
            onClick={(e) => {
              e?.stopPropagation()
              dispatch(setHolder(holder ? '' : maker))
            }}
          >
            <img
              src={holder !== maker ? '/images/icons/icon-filter.svg' : '/images/icons/icon-close-filter.svg'}
              alt="icon filter"
              className="w-[12px] h-[12px]"
            />
          </Button>
          <CopyButton icon="/images/icons/ic-copy2.svg" text={maker} className="size-4" />
          <ButtonFollowToken address={maker} className="w-3 h-3" isFollowing={isFavorite} isStarBottomTabs />
          {isFavorite && (
            <img
              src={'/images/icons/edit.svg'}
              className="w-[14px] h-[14px] !pointer-events-auto cursor-pointer"
              alt="icon filter"
              onClick={(e) => {
                e?.stopPropagation()
                eventBus.dispatch(EDITING_ALIAS_LATEST, { data: { address: maker, alias: itemAlias } })
              }}
            />
          )}
        </div>
      ) : (
        <a
          className="app-font-regular text-[11px] leading-[1] text-[#CACACA] underline cursor-pointer"
          target="_blank"
          rel="noopener noreferrer"
          href={`${CHAIN_EXPLORER_ADDRESS_URLS[currentChainId]}/${item.maker}`}
        >
          {formatAddressWallet(maker, 5, 5)}
        </a>
      )}

      <div className="mt-1 flex items-center gap-1">
        {!isDesktop && <ButtonFollowToken address={baseToken} className="w-3 h-3" />}

        {isDev && (
          <IconWalletLabel icon="/images/icons/wallets/icon-top-holder.svg" label={t('detail.wallet.tags.dev')} />
        )}

        {isWhale && (
          <IconWalletLabel icon="/images/icons/wallets/icon-whale.svg" label={t('detail.wallet.tags.whale')} />
        )}

        {isInsider && <IconInsiderLatest />}

        {isNativeWallet && <NativeWalletIconLatest />}

        {isSmartMoney && (
          <IconWalletLabel
            icon="/images/icons/wallets/icon-smart-money.svg"
            label={t('detail.wallet.tags.smartMoney')}
          />
        )}

        {isFreshWallet && (
          <IconWalletLabel icon="/images/icons/wallets/icon-new-wallet.svg" label={t('detail.wallet.tags.fresh')} />
        )}
      </div>
    </div>
  )
}

export default ItemTrader
