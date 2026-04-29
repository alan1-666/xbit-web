import { MemeTokenWithFormatted } from '@/types/token.ts'
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import QuickBuy from '@components/discover/QuickBuy.tsx'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'
import { TooltipProvider } from '@components/discover/TooltipProvider.tsx'
import { IconPause } from '@components/icon'
import { VirtualizedTokenList } from '@pages/meme/discover/desktop/components/VirtualizedTokenList.tsx'
import uniqBy from 'lodash/uniqBy'
import { FilterButton } from '@pages/meme/discover/desktop/components/FilterButton.tsx'
import { FilterFormData } from '@components/discover/filter/FilterFormData.ts'
import { AiAnalysisSheet, AiAnalysisSheetHandle } from '@pages/meme/discover/desktop/components/AiAnalysisSheet.tsx'
import { useAllBacklistAddresses } from '@pages/meme/discover/desktop/hooks/useBlacklistAddress.ts'
import { useTranslation } from 'react-i18next'
import { useActiveChain } from '@hooks/useActiveChain.ts'
import { IconSearch } from '@components/icon/stroke/IconSearch.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover.tsx'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { TooltipProvider as AppTooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils.ts'
import { IconFlash2 } from '@components/icon/stroke/IconFlash2.tsx'
import { TOPICS } from '@/lib/topics.ts'
import { useDispatch } from 'react-redux'
import { MemeTokenInfoRaw } from '@/types/tokenInfo'
import { memeTokenInfoActions } from '@/redux/modules/memeTokenInfo.slice.ts'
import { useMqttSubscribeIncremental } from '@hooks/useMqttSubscribeIncremental.ts'

export interface TokenListProps {
  title: string
  icon: ReactNode
  tokens: MemeTokenWithFormatted[]
  isLoading: boolean
  hasNextPage?: boolean
  timeframe?: TimeframeOption
  showProgress?: boolean
  useFallbackLogo?: boolean
  paused?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onLoadMore?: () => void
  filter: FilterFormData
  onFilterChange?: (filter: FilterFormData) => void
  onResetAll?: () => void
  allowSorting?: boolean
  getTooltipContent?: (token: MemeTokenWithFormatted) => string | ReactNode
  dataUpdatedAt?: number
  setPaused?: (value: boolean) => void
  type: 'new' | 'completing' | 'completed'
}

export const TokenList = (props: TokenListProps) => {
  const {
    tokens,
    isLoading,
    title,
    icon,
    timeframe,
    showProgress = true,
    useFallbackLogo = true,
    paused = true,
    onMouseEnter,
    onMouseLeave,
    onLoadMore,
    filter,
    onFilterChange,
    onResetAll,
    allowSorting = true,
    getTooltipContent,
    dataUpdatedAt,
    setPaused,
    hasNextPage = false,
    type,
  } = props

  const { blacklistDevs, blacklistTokens, addTokens, addDevs } = useAllBacklistAddresses()
  const [keyword, setKeyword] = useState('')
  const { t } = useTranslation()
  const activeChain = useActiveChain()

  const uniqueTokens = useMemo(() => {
    return uniqBy(tokens, (token) => token.token?.toLowerCase())
  }, [tokens])

  const filteredData = useMemo(() => {
    if (!uniqueTokens) return []
    return uniqueTokens.filter((item) => {
      if (!item.token) return false
      const isDevBlacklisted = blacklistDevs.some((dev) => dev.address === item.creator)
      const isTokenBlacklisted = blacklistTokens.some((token) => token.address === item.token)
      if (isDevBlacklisted) return false
      if (isTokenBlacklisted) return false
      if (keyword) {
        const lowerKeyword = keyword.toLowerCase()
        return (
          item.name?.toLowerCase().includes(lowerKeyword) ||
          item.symbol?.toLowerCase().includes(lowerKeyword) ||
          item.token?.toLowerCase() === lowerKeyword
        )
      }
      return true
    })
  }, [uniqueTokens, blacklistDevs, blacklistTokens, keyword])

  const topics = useMemo(() => tokens.map((token) => TOPICS.tokenInfo(token.chainId, token.token)), [tokens])

  const dispatch = useDispatch()
  const onMessage = useCallback((_: string, message: MemeTokenInfoRaw[]) => {
    dispatch(memeTokenInfoActions.addInfo(message))
  }, [])

  const { clearSubscriptions } = useMqttSubscribeIncremental({
    topics: topics,
    onMessage: onMessage,
  })

  useEffect(() => {
    return () => {
      const unsubscribedTopics = clearSubscriptions()
      const unsubscribedKeys = unsubscribedTopics?.map((topic) => {
        const [, chainIdStr, tokenAddress] = topic.split('/')
        return `${parseInt(chainIdStr)}-${tokenAddress.toLowerCase()}`
      })
      if (unsubscribedKeys) {
        dispatch(memeTokenInfoActions.clearInfo(unsubscribedKeys))
      }
    }
  }, [])

  const ref = useRef<AiAnalysisSheetHandle>(null)

  const handleAiClick = (tokenAddress: string) => {
    ref.current?.open(tokenAddress)
  }

  const hasFilter = useMemo(() => {
    const { timeframe, dexList, bscDexList, ethDexList, arbDexList, solDexList, ...rest } = filter
    const dexes = filter[`${activeChain}DexList`]
    if (dexes && dexes.length > 0) return true
    return Object.values(rest).some((value) => {
      if (Array.isArray(value)) {
        return value.length > 0
      }
      return value !== undefined && value !== null
    })
  }, [filter])

  const handleAddBlacklistToken = (tokenAddress: string) => {
    addTokens([tokenAddress])
  }

  const handleAddBlacklistDev = (devAddress: string) => {
    addDevs([devAddress])
  }

  return (
    <TooltipProvider>
      <div
        className="w-full px-3 flex flex-col max-h-full overflow-y-hidden"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-1">
            {icon}
            <span className="text-[calc(16rem/16)] text-white font-[450]">{title}</span>
            {paused && (
              <div className="flex items-center justify-center size-4 2xl:size-[26px] bg-[#ECECED14] rounded-full">
                <IconPause className="size-4 text-[#EFEFEF]" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Popover>
              <PopoverTrigger>
                <AppTooltipProvider>
                  <SimpleTooltip content={t('listCoin.filters.fields.searchName')}>
                    <div
                      className="size-[26px] flex items-center justify-center bg-[#212127] rounded-full"
                      aria-label="Search"
                    >
                      <IconSearch className={cn(keyword.trim() ? 'text-impartal' : 'text-[#908E98]')} />
                    </div>
                  </SimpleTooltip>
                </AppTooltipProvider>
              </PopoverTrigger>
              <PopoverContent>
                <input
                  className="bg-[#ECECED14] rounded-full w-full text-[calc(12rem/16)] px-2.5 h-6"
                  placeholder={t('listCoin.filters.fields.searchName')}
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                />
              </PopoverContent>
            </Popover>
            <QuickBuy
              className="rounded-full h-[26px] border-none bg-[#212127] "
              icon={<IconFlash2 className="text-[#FBFBFB]" />}
              showUnitIcon={true}
              presetSelectType="list"
            />
            <FilterButton
              currentFilter={filter}
              onFiltersChanged={(filter) => onFilterChange?.(filter)}
              onResetAll={() => onResetAll?.()}
              hasFilters={hasFilter}
              isMemeFilter={true}
              allowSorting={allowSorting}
            />
          </div>
        </div>
        <div className="flex-1" onMouseEnter={() => setPaused?.(true)} onMouseLeave={() => setPaused?.(false)}>
          <VirtualizedTokenList
            tokens={filteredData ?? []}
            isLoading={isLoading}
            hasNextPage={hasNextPage}
            timeframe={timeframe ?? '1h'}
            showProgress={showProgress}
            useFallbackLogo={useFallbackLogo}
            onLoadMore={onLoadMore}
            onAiClick={handleAiClick}
            onHideToken={handleAddBlacklistToken}
            onHideDev={handleAddBlacklistDev}
            getTooltipContent={getTooltipContent}
            dataUpdatedAt={dataUpdatedAt}
            type={type}
          />
        </div>
        <AiAnalysisSheet ref={ref} />
      </div>
    </TooltipProvider>
  )
}
