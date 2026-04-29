import { formatBalance, formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import { formatToTimeAgoI18n } from '@/utils/time'
import { ExternalLink } from 'lucide-react'
import { EmptyList } from '@/components/discover/EmptyList'
import { useUserActivities } from '@/modules/prediction/hooks/useUserActivities.ts'
import { useUserProfile } from '@/modules/prediction/context/UserProfileContext.tsx'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { CHAIN_EXPLORER_TX_URLS } from '@/lib/constant.ts'
import { ChainIds } from '@/types/enums.ts'
import { ActivityTitle } from './ActivityTitle'
import { YieldIcon, RewardIcon } from '../icons'
import { ActivitySortField, SortDirection } from '@/@generated/gql/graphql-prediction'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { useEffect } from 'react'
import { Loading } from '@/components/common/Loading'
import { useResponsive } from '@/hooks/useResponsive'
import { UserActivityModel } from '@/modules/prediction/models/UserActivityModel'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTranslation } from 'react-i18next'
import { roundByTickSize } from '@/utils/helpers'

const MakerRebateIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18px"
    height="18px"
    viewBox="0 0 18 18"
    className="text-brand-500 w-8 h-8 lg:w-5 lg:h-5"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9 1C4.58168 1 1 4.58179 1 9C1 13.4182 4.58168 17 9 17C13.4183 17 17 13.4182 17 9C17 4.58179 13.4183 1 9 1ZM9.7499 5.2499C9.7499 4.83569 9.41411 4.4999 8.9999 4.4999C8.58569 4.4999 8.2499 4.83569 8.2499 5.2499V5.50371C7.13452 5.56836 6.25 6.49332 6.25 7.6249C6.25 8.79813 7.201 9.7501 8.3748 9.7501H9.6251C9.97019 9.7501 10.2499 10.0298 10.2499 10.3749C10.2499 10.7201 9.97012 10.9998 9.6251 10.9998H7.2499C6.83569 10.9998 6.4999 11.3356 6.4999 11.7498C6.4999 12.164 6.83569 12.4998 7.2499 12.4998H8.2499V12.7499C8.2499 13.1641 8.58569 13.4999 8.9999 13.4999C9.41411 13.4999 9.7499 13.1641 9.7499 12.7499V12.4962C10.8654 12.4316 11.7499 11.5065 11.7499 10.3749C11.7499 9.20139 10.7986 8.2501 9.6251 8.2501H8.3748C8.03 8.2501 7.75 7.97027 7.75 7.6249C7.75 7.27981 8.02971 7.0001 8.3748 7.0001H10.75C11.1642 7.0001 11.5 6.66431 11.5 6.2501C11.5 5.83589 11.1642 5.5001 10.75 5.5001H9.7499V5.2499Z"
      fill="currentColor"
    />
  </svg>
)

const useActivityLabels = (item: UserActivityModel) => {
  const { t } = useTranslation()
  const isDeposit = item.type === 'DEPOSIT'
  const isTrade = item.type === 'TRADE'
  const isRedeem = item.type === 'REDEEM'
  const isYield = item.type === 'YIELD'
  const isReward = item.type === 'REWARD'
  const isSplit = item.type === 'SPLIT'
  const isMerge = item.type === 'MERGE'
  const isMakerRebate = item.type === 'MAKER_REBATE'

  let typeLabel = item.type
  if (isTrade) {
    typeLabel = item.side === 'BUY' ? t('prediction.profile.buy') : t('prediction.profile.sell')
  } else if (isDeposit) {
    typeLabel = t('prediction.profile.deposit')
  } else if (isRedeem) {
    typeLabel = t('prediction.profile.redeem')
  } else if (isYield) {
    typeLabel = t('prediction.profile.rewards')
  } else if (isReward) {
    typeLabel = t('prediction.profile.reward')
  } else if (isSplit) {
    typeLabel = t('prediction.profile.split')
  } else if (isMerge) {
    typeLabel = t('prediction.profile.merge')
  } else if (isMakerRebate) {
    typeLabel = t('prediction.profile.makerRebate')
  }

  const displayTitle =
    item.title ||
    (isDeposit
      ? t('prediction.profile.fundsDeposited')
      : isYield
        ? t('prediction.profile.fourPercentRewards')
        : isReward
          ? t('prediction.profile.rewardsDistributedForEpoch')
          : isSplit
            ? t('prediction.profile.rewardsDistributedForEpoch')
            : isMerge
              ? t('prediction.profile.mergeTransaction')
              : isMakerRebate
                ? t('prediction.profile.makerRebate', 'Maker rebate')
                : t('prediction.profile.unknown'))

  return {
    isDeposit,
    isTrade,
    isRedeem,
    isYield,
    isReward,
    isSplit,
    isMerge,
    isMakerRebate,
    typeLabel,
    displayTitle,
    t,
  }
}

const ActivityRowDesktop = ({ item }: { item: UserActivityModel }) => {
  const {
    isDeposit,
    isTrade,
    isRedeem,
    isYield,
    isReward,
    isSplit,
    isMerge,
    isMakerRebate,
    typeLabel,
    displayTitle,
    t,
  } = useActivityLabels(item)

  return (
    <div className="w-full border-b border-white/10 transition-colors">
      <div className="flex items-center px-0 py-4">
        <div className="w-25 shrink-0">
          <span className="text-sm font-semibold text-white capitalize">{typeLabel?.toLowerCase()}</span>
        </div>
        <div className="flex-1 min-w-0 flex items-start gap-3">
          {isYield ? (
            <div className="w-10 h-10 rounded-sm overflow-hidden bg-pink-50 flex items-center justify-center shrink-0">
              <YieldIcon />
            </div>
          ) : isReward || (isSplit && !item.title) ? (
            <div className="w-10 h-10 rounded-sm overflow-hidden bg-[#2c2c2e] flex items-center justify-center shrink-0">
              <RewardIcon />
            </div>
          ) : isMakerRebate ? (
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[#103957]">
              <MakerRebateIcon />
            </div>
          ) : item.icon ? (
            <Avatar className="h-10 w-10 min-w-10 shrink-0 rounded-full">
              <AvatarImage src={item.icon} alt="Market icon" className="object-cover" />
              <AvatarFallback className="rounded-full">{item?.title}</AvatarFallback>
            </Avatar>
          ) : null}
          <div className="flex flex-col gap-1 overflow-hidden">
            <ActivityTitle
              eventSlug={item.eventSlug}
              title={displayTitle}
              className="text-sm font-medium text-white truncate text-pretty pr-4"
            />
            {isTrade && (
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[11px] font-medium',
                    item.outcomeIndex === 0 ? 'bg-[#00CE89]/15 text-[#00CE89]' : 'bg-[#EA3B4F]/15 text-[#EA3B4F]',
                  )}
                >
                  {item.outcome}{' '}
                  {formatPrice(roundByTickSize(item.price, item.tokenYesTickSize), { showCurrency: false })}¢
                </span>
                <span className="text-gray-400">
                  {formatBalance(item.size)} {t('prediction.profile.shares')}
                </span>
              </div>
            )}
            {isRedeem && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">
                  {formatBalance(item.size)} {t('prediction.profile.shares')}
                </span>
              </div>
            )}
            {(isSplit || isMerge) && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">
                  {formatBalance(item.size)} {t('prediction.profile.shares')}
                </span>
              </div>
            )}
            {isDeposit && <span className="text-xs text-gray-400">{formatBalance(item.size)} USDC</span>}
            {(isYield || isReward) && <span className="text-xs text-gray-400">{t('prediction.profile.reward')}</span>}
            {isMakerRebate && <span className="text-xs text-gray-400">{t('prediction.profile.makerRebate')}</span>}
          </div>
        </div>
        <div className="w-[150px] shrink-0 text-right flex flex-col items-end justify-center gap-1">
          <span className="text-sm font-medium text-white">
            {formatBalance(Math.abs(item.usdcSize), { showCurrency: true })}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>
              {formatToTimeAgoI18n(item.timestamp * 1000)} {t('prediction.profile.ago')}
            </span>
            <a
              href={`${CHAIN_EXPLORER_TX_URLS[ChainIds.Polygon]}${item.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={12} className="ml-1 cursor-pointer hover:text-white" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

const ActivityRowMobile = ({ item }: { item: UserActivityModel }) => {
  const { isDeposit, isTrade, isYield, isReward, isSplit, isMakerRebate, typeLabel, displayTitle, t } =
    useActivityLabels(item)

  return (
    <div className="w-full border-b border-white/10 transition-colors">
      <div className="py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative rounded-sm overflow-hidden w-12 h-12 min-w-[48px] shrink-0">
              {isYield ? (
                <div className="w-full h-full bg-pink-50 flex items-center justify-center">
                  <YieldIcon />
                </div>
              ) : isReward || (isSplit && !item.title) ? (
                <div className="w-full h-full bg-[#2c2c2e] flex items-center justify-center">
                  <RewardIcon />
                </div>
              ) : isMakerRebate ? (
                <div className="w-full h-full bg-[#103957] flex items-center justify-center">
                  <MakerRebateIcon />
                </div>
              ) : (
                <Avatar className="h-12 w-12 min-w-12 cursor-pointer rounded-sm">
                  <AvatarImage src={item.icon} alt="Market icon" className="object-cover" />
                  <AvatarFallback className="rounded-sm">{item?.title}</AvatarFallback>
                </Avatar>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <ActivityTitle
                eventSlug={item.eventSlug}
                title={displayTitle}
                className="text-sm font-medium text-white line-clamp-2 text-pretty"
              />
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                <span className="text-xs text-gray-400 capitalize">{typeLabel?.toLowerCase()}</span>
                {isTrade && (
                  <div
                    className={cn(
                      'text-xs font-medium py-0.5 px-1 rounded w-fit flex',
                      item.outcomeIndex === 0 ? 'bg-[#00CE89]/15 text-[#00CE89]' : 'bg-[#EA3B4F]/15 text-[#EA3B4F]',
                    )}
                  >
                    {item.outcome}{' '}
                    {formatPrice(roundByTickSize(item.price, item.tokenYesTickSize), { showCurrency: false })}¢
                  </div>
                )}
                {!isYield && !isReward && (
                  <span className="text-gray-400 font-medium text-xs">
                    {isDeposit
                      ? `${formatBalance(item.size)} USDC`
                      : `${formatBalance(item.size)} ${t('prediction.profile.shares')}`}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end justify-center gap-1 shrink-0">
            <p className="text-sm font-medium text-white">
              {formatBalance(Math.abs(item.usdcSize), { showCurrency: true })}
            </p>
            <div className="flex items-center text-xs text-gray-400 gap-1">
              {formatToTimeAgoI18n(item.timestamp * 1000)} {t('prediction.profile.ago')}
              <a
                href={`${CHAIN_EXPLORER_TX_URLS[ChainIds.Polygon]}${item.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={12} className="text-gray-400" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ActivityRow = ({ item, isMobile }: { item: UserActivityModel; isMobile: boolean }) => {
  return isMobile ? <ActivityRowMobile item={item} /> : <ActivityRowDesktop item={item} />
}

export const UserProfileActivity = () => {
  const { t } = useTranslation()
  const { userId } = useUserProfile()
  const { isMobile } = useResponsive()

  const { data, isPending, loadMore, hasNextPage, isFetchingNextPage } = useUserActivities(userId || '', {
    // includePositions: true,
    sortBy: ActivitySortField.Timestamp,
    sortDirection: SortDirection.Desc,
  })

  const items = data || []

  const virtualizer = useWindowVirtualizer({
    count: hasNextPage ? items.length + 1 : items.length,
    estimateSize: () => 80,
    overscan: 5,
  })

  const virtualItems = virtualizer.getVirtualItems()

  useEffect(() => {
    const isLoaderVisible = virtualItems.some((v) => v.index === items.length)
    if (isLoaderVisible && hasNextPage && !isFetchingNextPage) {
      loadMore()
    }

    // console.log({ hasNextPage, isLoaderVisible, isFetchingNextPage })
  }, [hasNextPage, isFetchingNextPage, items.length, loadMore, virtualItems])

  if (isPending) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <Skeleton key={index} className="w-full h-10" />
        ))}
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="w-full flex flex-col">
        {/* Table Header - desktop */}
        <div className="hidden lg:flex border-b border-white/10 px-0 py-3 bg-transparent text-sm font-light text-[#FFFFFF80] tracking-wider">
          <div className="w-[100px]">{t('prediction.profile.type')}</div>
          <div className="flex-1">{t('prediction.profile.market')}</div>
          <div className="w-[150px] text-right">{t('prediction.profile.amount')}</div>
        </div>
        <div className="flex h-[50vh] w-full items-center justify-center">
          <EmptyList emptyText={t('prediction.profile.noActivityFound')} />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col xl:h-[calc(100vh-380px)] xl:overflow-y-auto no-scrollbar">
      {/* Table Header */}
      <div className="hidden lg:flex border-b border-white/10 px-0 pb-3 text-sm font-light text-[#FFFFFF80] tracking-wider sticky top-0 z-10 bg-[#0a0a0a]">
        <div className="w-25">{t('prediction.profile.type')}</div>
        <div className="flex-1">{t('prediction.profile.market')}</div>
        <div className="w-37.5 text-right">{t('prediction.profile.amount')}</div>
      </div>

      {/* Virtual List */}
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const isLoader = virtualItem.index >= items.length
          const item = items[virtualItem.index]

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {isLoader ? (
                <div className="h-[50px] flex items-center justify-center">
                  <Loading />
                </div>
              ) : (
                <ActivityRow item={item} isMobile={isMobile} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
