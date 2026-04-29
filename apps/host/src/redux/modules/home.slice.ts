import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LifecycleStates, TokenDirection } from '@/@generated/gql/graphql-core.ts'
import { MEME_TABS, TRENDING_TABS } from '@/lib/constant.ts'
import { FilterFormData, getDefaultFilters } from '@/components/discover/filter/FilterFormData.ts'

const getInitialMemeSubTab = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const memeSubTab = urlParams.get('tab')
  switch (memeSubTab) {
    case MEME_TABS.NEW:
      return LifecycleStates.NewCreation
    case MEME_TABS.SOARING:
      return LifecycleStates.Soaring
    case MEME_TABS.COMPLETING:
      return LifecycleStates.Completing
    case MEME_TABS.COMPLETED:
      return LifecycleStates.Completed
    default:
      return LifecycleStates.NewCreation
  }
}

const getInitialTrendingSubTab = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const trendingSubTab = urlParams.get('tab')
  // return trendingSubTab || TokenDirection.Popular
  switch (trendingSubTab) {
    case TRENDING_TABS.HOT:
      return TokenDirection.Popular
    case TRENDING_TABS.GAINERS:
      return TokenDirection.Gainer
    case TRENDING_TABS.LOSERS:
      return TokenDirection.Loser
    case TRENDING_TABS.AI_MINING:
      return TokenDirection.AiAnalysis
    default:
      return TokenDirection.Popular
  }
}

export interface HomeState {
  currentTab: string
  memeSubTab: LifecycleStates
  trendingSubTab: TokenDirection
  filters: Record<string, FilterFormData>
  xStockTab: string
  showTopBar?: boolean
}

const initialState: HomeState = {
  currentTab: 'meme',
  memeSubTab: getInitialMemeSubTab() as LifecycleStates,
  trendingSubTab: getInitialTrendingSubTab() as TokenDirection,
  filters: {
    watchlist: getDefaultFilters('watchlist'),
    meme: getDefaultFilters('meme'),
    trending: getDefaultFilters('trending'),
    classification: getDefaultFilters('classification'),
    market_trending: getDefaultFilters('trending'), // market 页面独立的过滤器
    // meme sub-tabs
    ['TAB_MEME_' + LifecycleStates.NewCreation]: getDefaultFilters('meme'),
    ['TAB_MEME_' + LifecycleStates.Soaring]: getDefaultFilters('meme'),
    ['TAB_MEME_' + LifecycleStates.Completing]: getDefaultFilters('meme'),
    ['TAB_MEME_' + LifecycleStates.Completed]: getDefaultFilters('meme'),
  },
  xStockTab: 'popular',
  showTopBar: true,
}

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setCurrentTab(state, action: PayloadAction<string>) {
      state.currentTab = action.payload
    },
    setMemeSubTab(state, action: PayloadAction<LifecycleStates>) {
      state.memeSubTab = action.payload
    },
    setTrendingSubTab(state, action: PayloadAction<TokenDirection>) {
      state.trendingSubTab = action.payload
    },
    setFilters(state, action: PayloadAction<{ key: string; filter: FilterFormData }>) {
      state.filters[action.payload.key] = action.payload.filter
    },
    updateFilter(state, action: PayloadAction<{ key: string; filter: Partial<FilterFormData> }>) {
      const { key, filter } = action.payload
      state.filters[key] = {
        ...state.filters[key],
        ...filter,
      }
    },
    resetFilter(state, action: PayloadAction<string>) {
      const key = action.payload
      if (key.startsWith('TAB_MEME_')) {
        state.filters[key] = getDefaultFilters('meme')
      } else {
        state.filters[key] = getDefaultFilters(key as 'watchlist' | 'meme' | 'trending' | 'classification')
      }
    },
    setXStockTab(state, action: PayloadAction<string>) {
      state.xStockTab = action.payload
    },
    toggleTopBar(state, action: PayloadAction<boolean | undefined>) {
      if (action.payload === undefined) {
        state.showTopBar = !state.showTopBar
      } else {
        state.showTopBar = action.payload
      }
    },
  },
})

export const homeActions = homeSlice.actions
export const homeReducer = homeSlice.reducer
export default homeSlice
