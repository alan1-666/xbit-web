import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { TabHoldersMobile } from '@/modules/prediction/components/event-details/TabHoldersMobile.tsx'
import { TabHoldersPC } from '@/modules/prediction/components/event-details/TabHoldersPC.tsx'
import { useResponsive } from '@/hooks/useResponsive'
import { useState, useMemo, useEffect } from 'react'
import { useTopMarketHolders } from '@/modules/prediction/hooks/useTopMarketHolders.ts'
import { useEventMarkets } from '@/modules/prediction/hooks/useEventMarkets.ts'
import { MarketHolder } from '@/@generated/gql/graphql-prediction.ts'
import { useTranslation } from 'react-i18next'

interface Holder {
  rank: number
  username: string
  address: string
  shares: number
  avatarColor: string
  avatarGradient: string
  profileImage?: string
}

const HIDDEN_ADDRESS = '0xa5ef39c3d3e10d0b270233af41cac69796b12966'

const transformHolder = (holder: MarketHolder, rank: number): Holder => ({
  rank,
  username: holder.name || holder.pseudonym || '',
  address: holder.proxyWallet,
  shares: Number(holder.amount),
  avatarColor: '',
  avatarGradient: '',
  profileImage: holder.profileImageOptimized || holder.profileImage,
})

export const TabHolders = () => {
  const { event } = useEventDetailsPageContext()
  const { isDesktop } = useResponsive()
  const { displayMarkets, activeMarkets } = useEventMarkets(event?.markets || [])
  const [currentMarketId, setCurrentMarketId] = useState<string>('')
  const { t } = useTranslation()

  const currentActiveMarket = useMemo(() => {
    const isEventEnded = event?.endDate && new Date(event.endDate) < new Date()
    if (isEventEnded) return displayMarkets
    if (activeMarkets.length === 0 && displayMarkets.length > 0) return displayMarkets
    return activeMarkets
  }, [displayMarkets, activeMarkets, event?.endDate])

  const effectiveMarketId = useMemo(() => {
    if (currentActiveMarket.length === 0) return currentMarketId
    const isCurrentInList = currentActiveMarket.some((m) => m.id.toString() === currentMarketId)
    return isCurrentInList ? currentMarketId : (currentActiveMarket[0]?.id ?? '').toString()
  }, [currentActiveMarket, currentMarketId])

  useEffect(() => {
    if (currentActiveMarket.length === 0) return
    if (effectiveMarketId !== currentMarketId) {
      setCurrentMarketId(effectiveMarketId)
    }
  }, [currentActiveMarket, currentMarketId, effectiveMarketId])

  const currentMarket = useMemo(() => {
    return currentActiveMarket.find((market) => market.id.toString() === effectiveMarketId)
  }, [currentActiveMarket, effectiveMarketId])

  const outcomes = currentMarket?.outcomes || [t('prediction.common.yes'), t('prediction.common.no')]
  const conditionIds = currentMarket?.conditionId ? [currentMarket.conditionId] : []

  const { data: holdersData, isLoading } = useTopMarketHolders({
    conditionIds,
    limit: 50,
    enabled: conditionIds.length > 0,
  })

  const yesHolders = useMemo(() => {
    if (!holdersData || holdersData.length === 0) return []
    const yesToken = holdersData.find((token) => token.holders.some((h) => h.outcomeIndex === 0))
    if (!yesToken) return []
    return yesToken.holders
      .filter(
        (h) =>
          h.outcomeIndex === 0 &&
          h.proxyWallet?.toLowerCase() !== HIDDEN_ADDRESS.toLowerCase(),
      )
      .map((h, idx) => transformHolder(h, idx + 1))
  }, [holdersData])

  const noHolders = useMemo(() => {
    if (!holdersData || holdersData.length === 0) return []
    const noToken = holdersData.find((token) => token.holders.some((h) => h.outcomeIndex === 1))
    if (!noToken) return []
    return noToken.holders
      .filter(
        (h) =>
          h.outcomeIndex === 1 &&
          h.proxyWallet?.toLowerCase() !== HIDDEN_ADDRESS.toLowerCase(),
      )
      .map((h, idx) => transformHolder(h, idx + 1))
  }, [holdersData])

  const sharedProps = {
    markets: currentActiveMarket,
    currentMarketId: effectiveMarketId,
    onMarketChange: setCurrentMarketId,
    yesHolders,
    noHolders,
    outcomes: outcomes as [string, string],
    isLoading,
  }

  return isDesktop ? <TabHoldersPC {...sharedProps} /> : <TabHoldersMobile {...sharedProps} />
}
