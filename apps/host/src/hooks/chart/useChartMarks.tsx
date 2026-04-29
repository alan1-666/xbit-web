import {
  KlineStickerDto,
  KlineStickerUserType,
  KlineWalletStatisticDto,
  Timeframe,
} from '@/@generated/gql/graphql-meme2'
import { PurchaseMark } from '@/components/chart/purchaseMarkDrawer'
import { useKlineStickers } from '@/hooks/chart/useKlineStickers'
import { stickersToTvMarks, TvMark } from '@/utils/tvMarks'
import { useActiveChainId } from '@hooks/useActiveChain'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

type PendingMarkRequest = {
  from: number
  to: number
  callback: (marks: TvMark[]) => void
}

interface UseChartMarksOptions {
  token?: string
  chainId?: string | number | null
  timeframe?: Timeframe
  tvWidgetRef?: React.MutableRefObject<any>
  selectedUserTypes?: Set<KlineStickerUserType | 'all'>
  userAddress?: string
}

function mergeStickers(stickers: KlineStickerDto[]): KlineStickerDto[] {
  return stickers.map((sickersInATime) => {
    const mergedStickers = sickersInATime.data.reduce<KlineWalletStatisticDto[]>((acc, sticker) => {
      const existingSticker = acc.find(
        (s) => s.walletAddress === sticker.walletAddress && s.type === sticker.type && s.userType === sticker.userType,
      )
      if (existingSticker) {
        existingSticker.nativeAmount += sticker.nativeAmount
        existingSticker.usdAmount += sticker.usdAmount
        existingSticker.tokenAmount += sticker.tokenAmount
        existingSticker.txs = (existingSticker.txs ?? 1) + 1
      }
      return [
        ...acc,
        {
          ...sticker,
          nativeAmount: toSafeNumber(sticker.nativeAmount),
          usdAmount: toSafeNumber(sticker.usdAmount),
          tokenAmount: toSafeNumber(sticker.tokenAmount),
          txs: 1,
        },
      ]
    }, [])
    return {
      ts: sickersInATime.ts,
      data: mergedStickers,
    }
  })
}

// Hook to fetch stickers for multiple userTypes separately
const useMultipleKlineStickers = (
  token: string,
  chainId: number,
  timeframe: Timeframe,
  userTypes: KlineStickerUserType[],
  userAddress?: string,
) => {
  // Create queries for each userType
  const queryUser = useKlineStickers({
    input: {
      token,
      chainId,
      timeframe,
      type: userTypes.includes(KlineStickerUserType.User) ? [KlineStickerUserType.User] : undefined,
      userAddress: userAddress ? userAddress : undefined,
    },
  })

  const queryDev = useKlineStickers({
    input: {
      token,
      chainId,
      timeframe,
      type: userTypes.includes(KlineStickerUserType.Dev) ? [KlineStickerUserType.Dev] : undefined,
    },
  })

  const queryBot = useKlineStickers({
    input: {
      token,
      chainId,
      timeframe,
      type: userTypes.includes(KlineStickerUserType.Bot) ? [KlineStickerUserType.Bot] : undefined,
    },
  })

  const queryWhale = useKlineStickers({
    input: {
      token,
      chainId,
      timeframe,
      type: userTypes.includes(KlineStickerUserType.Whale) ? [KlineStickerUserType.Whale] : undefined,
    },
  })

  const querySmart = useKlineStickers({
    input: {
      token,
      chainId,
      timeframe,
      type: userTypes.includes(KlineStickerUserType.Smart) ? [KlineStickerUserType.Smart] : undefined,
    },
  })

  const querySniper = useKlineStickers({
    input: {
      token,
      chainId,
      timeframe,
      type: userTypes.includes(KlineStickerUserType.Sniper) ? [KlineStickerUserType.Sniper] : undefined,
    },
  })

  const queryFresh = useKlineStickers({
    input: {
      token,
      chainId,
      timeframe,
      type: userTypes.includes(KlineStickerUserType.Fresh) ? [KlineStickerUserType.Fresh] : undefined,
    },
  })

  const queryInsider = useKlineStickers({
    input: {
      token,
      chainId,
      timeframe,
      type: userTypes.includes(KlineStickerUserType.Insider) ? [KlineStickerUserType.Insider] : undefined,
    },
  })

  const queryKol = useKlineStickers({
    input: {
      token,
      chainId,
      timeframe,
      type: userTypes.includes(KlineStickerUserType.Kol) ? [KlineStickerUserType.Kol] : undefined,
    },
  })

  const queryRenames = useKlineStickers({
    input: {
      token,
      chainId,
      timeframe,
      type: userTypes.includes(KlineStickerUserType.Renames) ? [KlineStickerUserType.Renames] : undefined,
    },
  })

  const queryTop10 = useKlineStickers({
    input: {
      token,
      chainId,
      timeframe,
      type: userTypes.includes(KlineStickerUserType.Top10) ? [KlineStickerUserType.Top10] : undefined,
    },
  })

  const queryTracking = useKlineStickers({
    input: {
      token,
      chainId,
      timeframe,
      type: userTypes.includes(KlineStickerUserType.Tracking) ? [KlineStickerUserType.Tracking] : undefined,
    },
  })

  // Merge all API results
  return useMemo(() => {
    const timestampMap = new Map<number, KlineStickerDto>()
    const allQueries = [
      queryUser,
      queryDev,
      queryBot,
      queryWhale,
      querySmart,
      querySniper,
      queryFresh,
      queryInsider,
      queryKol,
      queryRenames,
      queryTop10,
      queryTracking,
    ]

    allQueries.forEach((query) => {
      if (query.data?.getKlineSticker) {
        query.data.getKlineSticker.forEach((sticker) => {
          const timestamp = Number(sticker.ts)
          if (!timestamp) return

          const existing = timestampMap.get(timestamp)
          if (existing) {
            // Merge data from same timestamp
            existing.data = [...existing.data, ...sticker.data]
          } else {
            // Create new entry
            timestampMap.set(timestamp, {
              ...sticker,
              data: [...sticker.data],
            })
          }
        })
      }
    })

    // Convert map to array and sort by timestamp
    return {
      getKlineSticker: Array.from(timestampMap.values()).sort((a, b) => Number(a.ts) - Number(b.ts)),
    }
  }, [
    queryUser.data,
    queryDev.data,
    queryBot.data,
    queryWhale.data,
    querySmart.data,
    querySniper.data,
    queryFresh.data,
    queryInsider.data,
    queryKol.data,
    queryRenames.data,
    queryTop10.data,
    queryTracking.data,
  ])
}

export const useChartMarks = ({
  token,
  chainId,
  timeframe = Timeframe.M1,
  tvWidgetRef,
  selectedUserTypes,
  userAddress,
}: UseChartMarksOptions) => {
  const activeChainId = useActiveChainId()
  const { i18n } = useTranslation()

  // Get individual userTypes (excluding 'all')
  // If 'all' is selected, fetch all userTypes
  const individualUserTypes = useMemo(() => {
    if (!selectedUserTypes || selectedUserTypes.size === 0) {
      return []
    }
    if (selectedUserTypes.has('all')) {
      // Return all available userTypes when 'all' is selected
      return [
        KlineStickerUserType.User,
        KlineStickerUserType.Dev,
        KlineStickerUserType.Bot,
        KlineStickerUserType.Whale,
        KlineStickerUserType.Smart,
        KlineStickerUserType.Sniper,
        KlineStickerUserType.Fresh,
        KlineStickerUserType.Insider,
        KlineStickerUserType.Kol,
        KlineStickerUserType.Renames,
        KlineStickerUserType.Top10,
        KlineStickerUserType.Tracking,
      ]
    }
    return Array.from(selectedUserTypes).filter(
      (type): type is KlineStickerUserType => type !== 'all',
    ) as KlineStickerUserType[]
  }, [selectedUserTypes])

  const numericChainId = useMemo(
    () => (typeof chainId === 'number' ? chainId : typeof chainId === 'string' ? Number(chainId) : 0),
    [chainId],
  )

  // Call API separately for each userType
  const klineStickersData = useMultipleKlineStickers(
    token ?? '',
    numericChainId,
    timeframe,
    individualUserTypes,
    userAddress,
  )

  const stickerMarksRef = useRef<TvMark[]>([])
  const pendingMarksRequestsRef = useRef<PendingMarkRequest[]>([])
  // Each userType has its own marksMapRef
  const marksMapRef = useRef<Record<KlineStickerUserType, Record<number, PurchaseMark>>>(
    {} as Record<KlineStickerUserType, Record<number, PurchaseMark>>,
  )

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
  const [selectedTrade, setSelectedTrade] = useState<PurchaseMark | null>(null)

  // Async marks (because stickersToTvMarks is async now)
  const [stickerMarks, setStickerMarks] = useState<TvMark[]>([])
  const [stickerMarksMap, setStickerMarksMap] = useState<Record<KlineStickerUserType, Record<number, PurchaseMark>>>(
    {} as Record<KlineStickerUserType, Record<number, PurchaseMark>>,
  )

  // Compute inputs synchronously (mergedStickers + map), do NOT call async here
  const { mergedStickers, map } = useMemo(() => {
    const result = {
      mergedStickers: [] as KlineStickerDto[],
      map: {} as Record<KlineStickerUserType, Record<number, PurchaseMark>>,
    }

    if (!klineStickersData?.getKlineSticker?.length) {
      return result
    }

    // Server already filters by user type, but we still filter out empty stickers as a safety measure
    let filteredStickers = klineStickersData.getKlineSticker.filter((sticker) => sticker.data.length > 0)

    // Slice maximum 5 entries per sticker to reduce marks
    filteredStickers = filteredStickers.map((sticker) => ({
      ...sticker,
      data: sticker.data.slice(0, 5),
    }))

    const merged = mergeStickers(filteredStickers)
    result.mergedStickers = merged

    const toSafeNumberLocal = (value: unknown) => {
      const numericValue = Number(value ?? 0)
      return Number.isFinite(numericValue) ? numericValue : 0
    }

    merged.forEach((sticker) => {
      const timestamp = Number(sticker.ts)
      if (!timestamp) return

      sticker.data.forEach((walletStat, index) => {
        const side = walletStat.type
        const usdAmount = toSafeNumberLocal(walletStat.usdAmount)
        const tokenAmount = toSafeNumberLocal(walletStat.tokenAmount)
        const price = tokenAmount > 0 ? usdAmount / tokenAmount : 0

        const markId = timestamp * 100 + (index % 100)
        const userType = walletStat.userType

        if (!result.map[userType]) result.map[userType] = {}

        result.map[userType][markId] = {
          id: markId,
          side,
          time: timestamp,
          price,
          amount: tokenAmount,
          wallet: walletStat.walletAddress,
        }
      })
    })

    return result
  }, [klineStickersData, i18n.language])

  // Build marks asynchronously when mergedStickers changes
  useEffect(() => {
    let cancelled = false

    // map is sync; update immediately
    setStickerMarksMap(map)

    // no data
    if (!mergedStickers.length) {
      setStickerMarks([])
      return
    }

    ;(async () => {
      try {
        const marks = await stickersToTvMarks(mergedStickers, activeChainId)
        if (!cancelled) setStickerMarks(marks)
      } catch (e) {
        if (!cancelled) setStickerMarks([])
        console.error('stickersToTvMarks failed:', e)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [mergedStickers, map, activeChainId])

  useEffect(() => {
    stickerMarksRef.current = stickerMarks
    marksMapRef.current = stickerMarksMap

    if (!stickerMarks.length && pendingMarksRequestsRef.current.length) {
      return
    }

    const pendingRequests = [...pendingMarksRequestsRef.current]
    pendingMarksRequestsRef.current = []

    pendingRequests.forEach(({ from, to, callback }) => {
      const marksInRange = stickerMarks.filter((mark) => mark.time >= from && mark.time <= to)
      callback(marksInRange)
    })

    if (stickerMarks.length && !pendingRequests.length && tvWidgetRef?.current) {
      try {
        const activeChart =
          typeof tvWidgetRef.current?.activeChart === 'function' ? tvWidgetRef.current.activeChart() : null
        const fallbackChart =
          activeChart ?? (typeof tvWidgetRef.current?.chart === 'function' ? tvWidgetRef.current.chart() : null)
        fallbackChart?.refreshMarks?.()
      } catch (error: unknown) {
        console.error('Error refreshing marks:', (error as Error).message)
      }
    }
  }, [stickerMarks, stickerMarksMap, tvWidgetRef])

  const getMarks = useCallback(
    (_symbolInfo: any, from: number, to: number, onDataCallback: (marks: TvMark[]) => void, _resolution: string) => {
      // If no user types are selected, return empty array
      if (selectedUserTypes && selectedUserTypes.size === 0) {
        onDataCallback([])
        return
      }

      const currentMarks = stickerMarksRef.current ?? []

      if (!currentMarks.length) {
        // If we don't have marks yet, store the request to fulfill later
        pendingMarksRequestsRef.current = [
          ...pendingMarksRequestsRef.current.filter((request) => request.callback !== onDataCallback),
          { from, to, callback: onDataCallback },
        ]
        return
      }

      // If we have marks, return them immediately
      const marksInRange = currentMarks.filter((mark) => mark.time >= from && mark.time <= to)
      onDataCallback(marksInRange)
    },
    [selectedUserTypes],
  )

  const handleMarkClick = useCallback((markId: string | number) => {
    // Search for the mark in all userType maps
    const numericMarkId = Number(markId)
    for (const userType in marksMapRef.current) {
      const userTypeMap = marksMapRef.current[userType as KlineStickerUserType]
      if (userTypeMap && userTypeMap[numericMarkId]) {
        setSelectedTrade(userTypeMap[numericMarkId])
        setIsDrawerOpen(true)
        return
      }
    }
  }, [])

  useEffect(() => {
    if(tvWidgetRef && tvWidgetRef?.current) {
      tvWidgetRef?.current?.chart()?.clearMarks()
      tvWidgetRef?.current?.chart()?.refreshMarks()
    }
  }, [stickerMarks])

  useEffect(() => {
    if (tvWidgetRef?.current) {
      tvWidgetRef.current.chart().clearMarks()
      tvWidgetRef.current.chart().refreshMarks()
    }
  }, [selectedUserTypes, tvWidgetRef])

  return {
    getMarks,
    handleMarkClick,
    isDrawerOpen,
    setIsDrawerOpen,
    selectedTrade,
  }
}

function toSafeNumber(nativeAmount: string | number | undefined): number {
  const numericValue = Number(nativeAmount ?? 0)
  return Number.isFinite(numericValue) ? numericValue : 0
}
