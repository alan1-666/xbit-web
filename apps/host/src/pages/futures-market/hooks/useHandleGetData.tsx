import { symbolDexClient } from '@/lib/gql/apollo-client'
import { GET_CATEGORY_LIST, GET_FAVORITE_SYMBOLS, GET_SYMBOL_LIST } from '@/services/symbol.dex.service'
import { useEffect, useMemo, useState } from 'react'
import { ISymbolList } from '../type'
import { loadSymbolListSnapshot, saveSymbolListSnapshot } from '@/utils/indexedDB/symbolListDB'
import {
  setCategories,
  setCategoryData,
  setData,
  setFavorites,
  setFavoritesHasCache,
  SymbolListCondition,
} from '@/redux/modules/symbolList.slide'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { loadCategorySnapshot, saveCategorySnapshot } from '@/utils/indexedDB/categoryDB'
import { ServiceConfig } from '@/lib/gql/service-config'

export interface IPUseHandleGetData {
  condition: 'gainer' | 'volume' | 'loser' | 'trend' | 'marketCap' | 'openInterest' | 'category'
  isFavorite?: boolean
  isCategory?: boolean
  isDisabledNomalList?: boolean
  skip?: boolean
  refetchOnFavoritesChange?: boolean
}

export interface UpsertFavoriteSymbolResponse {
  upsertFavoriteSymbol: {
    error: string | null
    status: boolean
  }
}

export const useSearchFilter = (data: ISymbolList[], searchValue: string) => {
  return useMemo(() => {
    if (!searchValue || !searchValue.trim()) {
      return data
    }

    const searchTerm = searchValue.toLowerCase().trim()

    return data.filter((item) => {
      const symbolMatch = item.symbol?.toLowerCase().includes(searchTerm)
      return symbolMatch
    })
  }, [data, searchValue])
}

export const CATEGORY_ALL = '全部'

const useHandleGetData = ({ condition, isFavorite, isCategory, isDisabledNomalList, skip, refetchOnFavoritesChange }: IPUseHandleGetData) => {
  const dispatch = useAppDispatch()
  const favoritesLength = useAppSelector((state) => state.symbolListSlice.favorites.length)
  const [symbolList, setSymbolList] = useState<ISymbolList[]>([])
  const [symbolsFavorite, setSymbolsFavorite] = useState<ISymbolList[]>([])
  const [isLoadingSymbol, setIsLoadingSymbol] = useState(true)
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(true)
  const [categoryList, setCategoryList] = useState<string[]>([])
  const [isLoadingCategory, setIsLoadingCategory] = useState(false)

  const loadSymbolListFromCache = async (condition: SymbolListCondition | 'favorite', category?: string) => {
    try {
      const cachedData = await loadSymbolListSnapshot(condition, category)
      return cachedData?.list
    } catch (error) {
      console.warn(error)
    }
  }

  const loadCategoryListFromCache = async () => {
    try {
      const cachedData = await loadCategorySnapshot()
      return cachedData?.list
    } catch (error) {
      console.warn(error)
    }
  }

  const handleGetCategoryList = async () => {
    try {
      setIsLoadingCategory(true)
      const { data } = await symbolDexClient.query({
        query: GET_CATEGORY_LIST,
      })
      setCategoryList([CATEGORY_ALL, ...(data?.getCategory?.categories || [])])
      dispatch(setCategories([CATEGORY_ALL, ...(data?.getCategory?.categories || [])]))
      await saveCategorySnapshot({
        list: [CATEGORY_ALL, ...(data?.getCategory?.categories || [])],
        lastUpdated: Date.now(),
        condition: condition,
      })
    } catch (error) {
      console.error('Error fetching category list:', error)
    } finally {
      setIsLoadingCategory(false)
    }
  }

  const handleGetSymbolList = async (categoryArgs?: string) => {
    try {
      let input: { condition: IPUseHandleGetData['condition']; category?: string } = {
        condition: condition === 'category' && categoryArgs === CATEGORY_ALL ? 'volume' : condition,
        ...(categoryArgs && categoryArgs !== 'Contract' && { category: categoryArgs })
      }

      if (condition === 'category' && categoryArgs && categoryArgs !== CATEGORY_ALL) {
        input = {
          condition: 'category',
          category: categoryArgs,
        }
      }

      setIsLoadingSymbol(true)
      const { data, loading } = await symbolDexClient.query({
        query: GET_SYMBOL_LIST,
        variables: { input },
      })

      const symbolData = data?.getSymbolList?.list || []
      setSymbolList(symbolData)

      await saveSymbolListSnapshot(
        condition,
        {
          list: symbolData,
          lastUpdated: Date.now(),
          condition: condition,
          category: categoryArgs,
        },
        categoryArgs,
      )

      if (condition === 'category' && categoryArgs) {
        dispatch(
          setCategoryData({
            category: categoryArgs,
            data: symbolData,
          }),
        )

        dispatch(
          setData({
            condition: 'category',
            data: symbolData,
          }),
        )
      } else {
        dispatch(
          setData({
            condition: condition,
            data: symbolData,
          }),
        )
      }

      setIsLoadingSymbol(loading)
    } catch (error) {
      console.error('Error fetching symbol list:', error)
    } finally {
      setIsLoadingSymbol(false)
      setIsLoadingCategory(false)
    }
  }

  const getFavoriteSymbols = async () => {
    try {
      setIsLoadingFavorite(true)
      const { data, loading } = await symbolDexClient.query({
        query: GET_FAVORITE_SYMBOLS,
      })
      setSymbolsFavorite(data?.getFavoriteSymbols?.list || [])
      setIsLoadingFavorite(loading)
      await saveSymbolListSnapshot('favorite', {
        list: data?.getFavoriteSymbols?.list || [],
        lastUpdated: Date.now(),
        condition: 'favorite',
      })
      dispatch(setFavorites(data?.getFavoriteSymbols?.list))
      if (data?.getFavoriteSymbols?.list.length === 0) {
        dispatch(setFavoritesHasCache(true))
      }
    } catch (error) {
      console.error('Error fetching favorite symbols:', error)
      setIsLoadingFavorite(false)
    } finally {
      setIsLoadingFavorite(false)
    }
  }

  useEffect(() => {
    if (skip) {
      return
    }

    // 登录状态或依赖变化时，重新拉取收藏
    if (isFavorite && ServiceConfig.token) {
      getFavoriteSymbols()
    }

    if (isDisabledNomalList) {
      return
    }

    if (!isCategory) {
      handleGetSymbolList()
    } else {
      handleGetCategoryList()
    }
  }, [skip, isFavorite, isCategory, isDisabledNomalList, condition, ServiceConfig.token])

  // 收藏数量变化时按需重新拉取，确保与服务端同步
  useEffect(() => {
    if (skip) return
    if (!refetchOnFavoritesChange) return
    if (!isFavorite) return
    if (!ServiceConfig.token) return
    // 避免在加载中重复触发
    if (isLoadingFavorite) return
    getFavoriteSymbols()
  }, [favoritesLength, refetchOnFavoritesChange, isFavorite, skip, ServiceConfig.token])

  return {
    symbolList,
    isLoading: isLoadingSymbol,
    symbolsFavorite,
    isLoadingFavorite,
    categoryList,
    isLoadingCategory,
    getFavoriteSymbols,
    handleGetCategoryList,
    handleGetSymbolList,
    loadSymbolListFromCache,
    setIsLoadingSymbol,
    setIsLoadingFavorite,
    setIsLoadingCategory,
    loadCategoryListFromCache,
  }
}

export default useHandleGetData
