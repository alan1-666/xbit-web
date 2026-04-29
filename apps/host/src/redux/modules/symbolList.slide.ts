import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ISymbolList {
  changPxPercent: number
  currentPrice: number
  marketCap: number
  maxLeverage: number
  symbol: string
  volume: string
  openInterest?: string;
  isFavorite?: boolean,
  fundingRate?: number,
  funding?: number
}

export type SymbolListCondition = 'volume' | 'gainer' | 'loser' | 'marketCap' | 'openInterest' | 'category' | 'trend'

export interface SymbolListState {
  lists: Record<SymbolListCondition, ISymbolList[]>
  categories: string[]
  selectedCategory: string
  favorites: ISymbolList[]
  favoritesHasCache: boolean
  isEmptyFavorites: boolean

  categoryData: Record<string, ISymbolList[]>
}

const initialState: SymbolListState = {
  lists: {
    volume: [],
    gainer: [],
    loser: [],
    marketCap: [],
    openInterest: [],
    category: [],
    trend: [],
  },
  categories: [],
  selectedCategory: '',
  favorites: [],
  favoritesHasCache: false,
  isEmptyFavorites: false,
  categoryData: {},
}

const symbolListSlice = createSlice({
  name: 'symbolList',
  initialState,
  reducers: {
    setData: (
      state,
      action: PayloadAction<{
        condition: SymbolListCondition
        data: ISymbolList[]
      }>,
    ) => {
      const { condition, data } = action.payload
      state.lists[condition] = data
    },

    // Update specific symbol data across all lists
    updateSymbolData: (state, action: PayloadAction<ISymbolList>) => {
      const updatedSymbol = action.payload

      // Update in all relevant lists
      Object.keys(state.lists).forEach((condition) => {
        const conditionKey = condition as SymbolListCondition
        const index = state.lists[conditionKey].findIndex((item) => item.symbol === updatedSymbol.symbol)
        if (index !== -1) {
          state.lists[conditionKey][index] = {
            ...state.lists[conditionKey][index],
            ...updatedSymbol,
          }
        }
      })
    },

    // Categories management
    setCategories: (state, action: PayloadAction<string[]>) => {
      state.categories = action.payload
      // Set first category as default if none selected
      if (action.payload.length > 0 && !state.selectedCategory) {
        state.selectedCategory = action.payload[0]
      }
    },

    setCategoryData: (
      state,
      action: PayloadAction<{
        category: string
        data: ISymbolList[]
      }>,
    ) => {
      const { category, data } = action.payload
      state.categoryData[category] = data
    },

    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload
    },

    // Favorites management
    setFavorites: (state, action: PayloadAction<ISymbolList[]>) => {
      // 直接使用后端返回的顺序（最后收藏的在最前）
      state.favorites = action.payload
    },

    addFavorite: (state, action: PayloadAction<ISymbolList>) => {
      const existingIndex = state.favorites.findIndex(f => f.symbol === action.payload.symbol)
      if (existingIndex === -1) {
        // 新增收藏，放在最前面
        state.favorites.unshift(action.payload)
      }
    },

    removeFavorite: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter((symbol) => symbol.symbol !== action.payload)
    },

    setFavoritesHasCache: (state, action: PayloadAction<boolean>) => {
      state.favoritesHasCache = action.payload
    },

    setIsEmptyFavorites: (state, action: PayloadAction<boolean>) => {
      state.isEmptyFavorites = action.payload
    },

    // Utility actions
    resetCondition: (state, action: PayloadAction<SymbolListCondition>) => {
      const condition = action.payload
      state.lists[condition] = []
    },
  },
})

// export const symbolListActions = symbolListSlice.actions
// export const symbolListReducer = symbolListSlice.reducer

// export default symbolListSlice

export const symbolListActions = symbolListSlice.actions

export const {
  addFavorite,
  removeFavorite,
  resetCondition,
  setCategories,
  setData,
  setFavorites,
  setSelectedCategory,
  updateSymbolData,
  setFavoritesHasCache,
  setCategoryData,
  setIsEmptyFavorites,
} = symbolListSlice.actions

export default symbolListSlice.reducer
