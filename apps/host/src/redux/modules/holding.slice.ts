import { mergePortfolioWithPendingOrders, PendingOrder, PortfolioDTO, PortfolioWithOrders } from '@/types/holding.ts'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CurrencyUnit } from '@/types/currency'
import { RootState } from '../store'
import { ChainIds } from '@/types/enums'

export interface HoldingState {
  loading: boolean
  loadingCurrent: boolean
  loadingMore: boolean
  data: PortfolioDTO[]
  currentData: PortfolioDTO[]
  mergedPortfolio: PortfolioWithOrders[]
  mergedCurrentPortfolio: PortfolioWithOrders[]
  page: number
  hasMore: boolean
  isHiddenSmallPoll: boolean
  isHiddenSmallerThan1U: boolean
  isShowOnlyCurrentCurrency: boolean
  hideModestBalance: boolean
  hideZeroBalance: boolean
  currentToken: string | undefined
  newPortfolioFromMqtt?: PortfolioDTO
  sortBy: string
  totalUnrealizedPnL: number
  totalHoldingTokens: number
  unitCurrentPosition: CurrencyUnit
  listPendingOrders: PendingOrder[]
  tempNewHoldings: PortfolioDTO[]
  shadowHoldingUpdates: PortfolioDTO[]
}

const initialState: HoldingState = {
  loading: false,
  loadingCurrent: false,
  loadingMore: false,
  data: [],
  currentData: [],
  mergedPortfolio: [],
  mergedCurrentPortfolio: [],
  page: 1,
  hasMore: true,
  isHiddenSmallPoll: false,
  isHiddenSmallerThan1U: false,
  isShowOnlyCurrentCurrency: false,
  hideModestBalance: false,
  hideZeroBalance: false,
  currentToken: undefined,
  newPortfolioFromMqtt: undefined,
  sortBy: '-holdingValue',
  totalUnrealizedPnL: 0,
  totalHoldingTokens: 0,
  unitCurrentPosition: 'SOL',
  listPendingOrders: [] as PendingOrder[],
  tempNewHoldings: [],
  shadowHoldingUpdates: [],
}

export type MergePortfolioPayload = {
  priceNativeToken: number
  chainId: ChainIds
  shadowHoldingUpdates: PortfolioDTO[]
}

export const updateMergedPortfolio = createAsyncThunk<
  PortfolioWithOrders[],
  MergePortfolioPayload,
  { state: RootState }
>('holding/updateMergedPortfolio', (payload, { getState }) => {
  const state = getState()

  const { data, listPendingOrders, currentData } = state.holding

  const { priceNativeToken, chainId, shadowHoldingUpdates } = payload

  const sourcePortfolios = [...data]

  const mergedData = mergePortfolioWithPendingOrders(
    sourcePortfolios,
    listPendingOrders,
    priceNativeToken,
    chainId,
    shadowHoldingUpdates,
    currentData ? currentData?.[0] : {}
  )

  return mergedData
})

export const updateMergedCurrentPortfolio = createAsyncThunk<
  PortfolioWithOrders[],
  MergePortfolioPayload,
  { state: RootState }
>('holding/updateMergedCurrentPortfolio', (payload, { getState }) => {
  const state = getState()

  const { currentData, listPendingOrders } = state.holding

  const { priceNativeToken, chainId, shadowHoldingUpdates } = payload

  const sourcePortfolios = [...currentData]

  const mergedData = mergePortfolioWithPendingOrders(
    sourcePortfolios,
    listPendingOrders,
    priceNativeToken,
    chainId,
    shadowHoldingUpdates,
  )

  return mergedData
})

export const holdingSlice = createSlice({
  name: 'holding',
  initialState: initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setloadingCurrent: (state, action: PayloadAction<boolean>) => {
      state.loadingCurrent = action.payload
    },
    setLoadingMore: (state, action: PayloadAction<boolean>) => {
      state.loadingMore = action.payload
    },
    setData: (state, action: PayloadAction<PortfolioDTO[]>) => {
      state.data = action.payload
    },
    setDataCurrentToken: (state, action: PayloadAction<PortfolioDTO>) => {
      const itemMapped = action.payload
      const newData = state.data.map((item) => {
        if (item?.token === itemMapped?.token) {
          return itemMapped
        }
        return item
      })
      state.data = newData

      const newCurrentData = state.currentData.map((item) => {
        if (item?.token === itemMapped?.token) {
          return itemMapped
        }
        return item
      })
      state.currentData = newCurrentData

      const newShadowHoldingUpdates = state.shadowHoldingUpdates.map((item) => {
        if (item?.token === itemMapped?.token) {
          return itemMapped
        }
        return item
      })
      state.shadowHoldingUpdates = newShadowHoldingUpdates

      const newListPendingOrders = state.listPendingOrders.filter((item) => {
        return item?.baseAddress !== itemMapped.token
      })
      state.listPendingOrders = newListPendingOrders
    },
    setCurrentData: (state, action: PayloadAction<PortfolioDTO[]>) => {
      state.currentData = action.payload
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload
    },
    setIsHiddenSmallPoll: (state, action: PayloadAction<boolean>) => {
      state.isHiddenSmallPoll = action.payload
    },
    setIsHiddenSmallerThan1U: (state, action: PayloadAction<boolean>) => {
      state.isHiddenSmallerThan1U = action.payload
    },
    setHideModestBalance: (state, action: PayloadAction<boolean>) => {
      state.hideModestBalance = action.payload
    },
    setHideZeroBalance: (state, action: PayloadAction<boolean>) => {
      state.hideZeroBalance = action.payload
    },
    setIsShowOnlyCurrentCurrency: (state, action: PayloadAction<boolean>) => {
      state.isShowOnlyCurrentCurrency = action.payload
    },
    setCurrentToken: (state, action: PayloadAction<string | undefined>) => {
      state.currentToken = action.payload
    },
    setNewPortfolioFromMqtt: (state, action: PayloadAction<PortfolioDTO | undefined>) => {
      if (action.payload) {
        state.newPortfolioFromMqtt = action.payload
      }
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload
    },
    setTotalUnrealizedPnL: (state, action: PayloadAction<number>) => {
      state.totalUnrealizedPnL = action.payload
    },
    setTotalHoldingTokens: (state, action: PayloadAction<number>) => {
      state.totalHoldingTokens = action.payload
    },
    setUnitCurrentPosition: (state, action: PayloadAction<CurrencyUnit>) => {
      state.unitCurrentPosition = action.payload
    },
    setListPendingOrders: (state, action: PayloadAction<PendingOrder[]>) => {
      state.listPendingOrders = action.payload
    },
    addTempHolding: (state, action: PayloadAction<PortfolioDTO>) => {
      const newItem = action.payload
      const exists = state.tempNewHoldings.some((item) => item.token === newItem.token)
      if (!exists) {
        state.tempNewHoldings.push(newItem)
      }
    },
    updateTempHolding: (state, action: PayloadAction<any>) => {
      const { tokenAddress, updates } = action.payload
      const index = state.tempNewHoldings.findIndex((item) => item.token === tokenAddress)

      if (index !== -1) {
        state.tempNewHoldings[index] = {
          ...state.tempNewHoldings[index],
          ...updates,
        }
      }
    },
    updateHolding: (state, action: PayloadAction<any>) => {
      const { tokenAddress, updates } = action.payload
      const { completedTxs: newCompletedTxs, relatedTxHashes: newRelatedTxHashes, ...otherUpdates } = updates
      const txIdsToDelete = new Set<string>()

      const processItemCrossCheck = (item: any) => {
        item.completedTxs = item.completedTxs || []
        item.relatedTxHashes = item.relatedTxHashes || []

        Object.assign(item, otherUpdates)

        const incomingCompleted = newCompletedTxs || []
        if (incomingCompleted.length > 0) {
          incomingCompleted.forEach((newTxId: string) => {
            const relatedIndex = item.relatedTxHashes.findIndex((tx: string) => tx === newTxId)

            if (relatedIndex !== -1) {
              // item.relatedTxHashes.splice(relatedIndex, 1)

              txIdsToDelete.add(newTxId)
            }
            if (!item.completedTxs.includes(newTxId)) {
              item.completedTxs.push(newTxId)
            }
          })
        }

        const incomingRelated = newRelatedTxHashes || []
        if (incomingRelated.length > 0) {
          incomingRelated.forEach((newTxId: string) => {
            const completedIndex = item.completedTxs.findIndex((tx: string) => tx === newTxId)

            if (completedIndex !== -1) {
              // item.completedTxs.splice(completedIndex, 1)

              txIdsToDelete.add(newTxId)
            }
            if (!item.relatedTxHashes.includes(newTxId)) {
              item.relatedTxHashes.push(newTxId)
            }
          })
        }
      }
      const index = state.data.findIndex((item) => item.token === tokenAddress)
      if (index !== -1) {
        processItemCrossCheck(state.data[index])
      }

      const indexCurrent = state.currentData.findIndex((item) => item.token === tokenAddress)
      if (indexCurrent !== -1) {
        processItemCrossCheck(state.currentData[indexCurrent])
      }
      if (txIdsToDelete.size > 0) {
        state.listPendingOrders = state.listPendingOrders.filter((order) => !txIdsToDelete.has(order.txid))
      }
    },
    updaShadowHolding: (state, action: PayloadAction<any>) => {
      const { tokenAddress, updates } = action.payload
      const { completedTxs: newCompletedTxs, relatedTxHashes: newRelatedTxHashes, ...otherUpdates } = updates
      const txIdsToDelete = new Set<string>()

      const processItemCrossCheck = (
        item: any,
        incomingCompleted: string[] | undefined,
        incomingRelated: string[] | undefined,
      ) => {
        item.completedTxs = item.completedTxs || []
        item.relatedTxHashes = item.relatedTxHashes || []
        Object.assign(item, otherUpdates)

        const incCompleted = incomingCompleted || []
        const incRelated = incomingRelated || []

        if (incCompleted.length > 0) {
          incCompleted.forEach((newTxId: string) => {
            const relatedIndex = item.relatedTxHashes.findIndex((tx: string) => tx === newTxId)

            if (relatedIndex !== -1) {
              // item.relatedTxHashes.splice(relatedIndex, 1)
              txIdsToDelete.add(newTxId)
            }
            if (!item.completedTxs.includes(newTxId)) {
              item.completedTxs.push(newTxId)
            }
          })
        }

        if (incRelated.length > 0) {
          incRelated.forEach((newTxId: string) => {
            const completedIndex = item.completedTxs.findIndex((tx: string) => tx === newTxId)

            if (completedIndex !== -1) {
              // item.completedTxs.splice(completedIndex, 1)
              txIdsToDelete.add(newTxId)
            }
            if (!item.relatedTxHashes.includes(newTxId)) {
              item.relatedTxHashes.push(newTxId)
            }
          })
        }
      }
      const index = state.shadowHoldingUpdates.findIndex((item) => item.token === tokenAddress)
      if (index !== -1) {
        processItemCrossCheck(state.shadowHoldingUpdates[index], newCompletedTxs, newRelatedTxHashes)
      } else {
        state.shadowHoldingUpdates = [updates, ...state.shadowHoldingUpdates]
      }
      if (txIdsToDelete.size > 0) {
        state.listPendingOrders = state.listPendingOrders.filter((order) => !txIdsToDelete.has(order.txid))
      }
    },
    cleanupShadowHoldingUpdates: (state, _) => {
      state.shadowHoldingUpdates = []
    },
    cleanupTempHoldings: (state, action: PayloadAction<string[]>) => {
      state.shadowHoldingUpdates = []
    },
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    ;(builder.addCase(updateMergedPortfolio.fulfilled, (state, action) => {
      state.mergedPortfolio = action.payload
    }),
      builder.addCase(updateMergedCurrentPortfolio.fulfilled, (state, action) => {
        state.mergedCurrentPortfolio = action.payload
      }))
  },
})

export const {
  setLoading,
  setloadingCurrent,
  setData,
  setDataCurrentToken,
  setCurrentData,
  setPage,
  setHasMore,
  setLoadingMore,
  setIsHiddenSmallerThan1U,
  setHideModestBalance,
  setHideZeroBalance,
  setIsHiddenSmallPoll,
  setIsShowOnlyCurrentCurrency,
  setCurrentToken,
  setNewPortfolioFromMqtt,
  setSortBy,
  setTotalHoldingTokens,
  setTotalUnrealizedPnL,
  setUnitCurrentPosition,
  setListPendingOrders,
  addTempHolding,
  updateTempHolding,
  updaShadowHolding,
  updateHolding,
  cleanupTempHoldings,
  cleanupShadowHoldingUpdates,
  reset,
} = holdingSlice.actions

export default holdingSlice
