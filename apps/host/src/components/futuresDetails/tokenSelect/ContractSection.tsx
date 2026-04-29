import { symbolDexClient } from '@/lib/gql/apollo-client'
import CategoryTabs from '@/pages/futures-market/components/category-tabs'
import { CATEGORY_ALL, IPUseHandleGetData } from '@/pages/futures-market/hooks/useHandleGetData'
import { ISymbolList } from '@/redux/modules/symbolList.slide'
import { GET_CATEGORY_LIST, GET_SYMBOL_LIST } from '@/services/symbol.dex.service'
import { useQuery as useReactQuery } from '@tanstack/react-query'
import { Dispatch, memo, SetStateAction, useCallback, useEffect, useMemo } from 'react'
import ContractList from './ContractList'
import { mergeFundingRateToSymbolList } from '@/utils/helpers'
import { FundingRateList, useGetPredictedFundings } from '.'
import { getFromLocalStorageWithTTL, saveToLocalStorageWithTTL } from '@/utils/storage'
import { SYMBOL_LIST_KEY } from '../tokenSearchDrawer/ContractSectionWithCache'
import { TOKEN_TRENDING_SEARCH_BAR_MS } from '@/components/futuresDiscover/futuresSearch'

const useGetCategories = () => {
  const { data, isFetching } = useReactQuery({
    queryKey: ['GET_CATEGORY_LIST'],
    queryFn: async () => {
      const res = await symbolDexClient.query({
        query: GET_CATEGORY_LIST,
      })
      return res?.data
    },
    retry: 1,
    staleTime: 60 * 60 * 1000,
  })

  return {
    categories: [CATEGORY_ALL, ...(data?.getCategory?.categories || [])],
    loading: !data && isFetching,
  }
}

const uesGetSymbolList = (condition: IPUseHandleGetData['condition'], categoryArgs?: string) => {
  let input: { condition: IPUseHandleGetData['condition']; category?: string } = {
    condition: condition === 'category' && categoryArgs === CATEGORY_ALL ? 'volume' : condition,
  }

  if (condition === 'category' && categoryArgs && categoryArgs !== CATEGORY_ALL) {
    input = {
      condition: 'category',
      category: categoryArgs,
    }
  }

  const { data, isFetching, refetch } = useReactQuery({
    queryKey: ['GET_SYMBOL_LIST', condition, categoryArgs],
    queryFn: async () => {
      const res = await symbolDexClient.query({
        query: GET_SYMBOL_LIST,
        variables: { input },
      })
      return res?.data
    },
    retry: 1,
  })
  return {
    symbolList: data?.getSymbolList?.list || [],
    loading: !data && isFetching,
    refetch,
  }
}

const PREDICTED_FUNDINGS_KEY = 'PREDICTED_FUNDINGS_KEY'

const ContractSection = ({
  search,
  allowShowList,
  symbolsFavorite,
  selectedCategory,
  setOpen,
  setIsFavoriteChange,
  setSymbolsFavorite,
  setSelectedCategory,
  isfuturesSearch = false,
  isdesktop = false,
  hideFavoriteTokens = false,
}: {
  search: string
  allowShowList?: boolean
  selectedCategory: string
  symbolsFavorite: ISymbolList[]
  setOpen: Dispatch<SetStateAction<boolean>>
  setSelectedCategory: Dispatch<SetStateAction<string>>
  setIsFavoriteChange: Dispatch<SetStateAction<boolean>>
  setSymbolsFavorite: (value: SetStateAction<ISymbolList[]>) => void
  isfuturesSearch?: boolean
  isdesktop?: boolean
  hideFavoriteTokens?: boolean
}) => {
  const { categories, loading: isLoadingCategory } = useGetCategories()

  const { loading: isLoading, symbolList } = uesGetSymbolList('category', selectedCategory)
  const { isPredictedFundingsLoading, predictedFundingsData } = useGetPredictedFundings()

  const handleCategoryChange = useCallback((categoryValue: string) => {
    setSelectedCategory(categoryValue)
  }, [])

  // check cache and set data to render
  const listTokenDex = useMemo(() => {
    if (selectedCategory === CATEGORY_ALL) {
      return getFromLocalStorageWithTTL<ISymbolList[]>(SYMBOL_LIST_KEY)?.length
        ? getFromLocalStorageWithTTL<ISymbolList[]>(SYMBOL_LIST_KEY)?.map((item: ISymbolList) => {
            const symbolFavorite = symbolsFavorite.find((symbol) => symbol.symbol === item.symbol)
            return symbolFavorite ? { ...item, isFavorite: true } : { ...item }
          })
        : symbolList.map((item: ISymbolList) => {
            const symbolFavorite = symbolsFavorite.find((symbol) => symbol.symbol === item.symbol)
            return symbolFavorite ? { ...item, isFavorite: true } : { ...item }
          })
    }
    return symbolList.map((item: ISymbolList) => {
      const symbolFavorite = symbolsFavorite.find((symbol) => symbol.symbol === item.symbol)
      return symbolFavorite ? { ...item, isFavorite: true } : { ...item }
    })
  }, [symbolsFavorite, symbolList])

  // save to cache only category === CATEGORY_ALL
  useEffect(() => {
    return () => {
      if (
        selectedCategory === CATEGORY_ALL &&
        symbolList.length &&
        !getFromLocalStorageWithTTL<ISymbolList[]>(SYMBOL_LIST_KEY)?.length
      ) {
        saveToLocalStorageWithTTL<ISymbolList[]>(SYMBOL_LIST_KEY, symbolList, TOKEN_TRENDING_SEARCH_BAR_MS)
      }
    }
  }, [symbolList, selectedCategory])
  // save to cache only category === CATEGORY_ALL
  useEffect(() => {
    return () => {
      if (
        selectedCategory === CATEGORY_ALL &&
        symbolList.length &&
        !getFromLocalStorageWithTTL<ISymbolList[]>(SYMBOL_LIST_KEY)?.length
      ) {
        saveToLocalStorageWithTTL<ISymbolList[]>(SYMBOL_LIST_KEY, symbolList, TOKEN_TRENDING_SEARCH_BAR_MS)
      }
    }
  }, [symbolList, selectedCategory])

  const mergeArr = useMemo(() => {
    if (!predictedFundingsData) {
      return listTokenDex
    }
    return mergeFundingRateToSymbolList(predictedFundingsData, listTokenDex)
  }, [predictedFundingsData, listTokenDex])

  const loadingState = useMemo(() => {
    if (mergeArr.length !== 0) {
      return false
    }
    return isLoading || isPredictedFundingsLoading
  }, [isLoading, isPredictedFundingsLoading])

  return (
    <div className="relative flex flex-col h-full">
      {!search && allowShowList && !isfuturesSearch && (
        <div className="sticky top-0 z-40 px-2">
          <CategoryTabs
            tabs={categories}
            activeTab={selectedCategory}
            isLoadingCategory={isLoadingCategory}
            onTabChange={handleCategoryChange}
          />
        </div>
      )}

      {/* Scrollable Content Container */}
      <div className={`flex-1 ${isfuturesSearch ? 'overflow-y-auto' : 'overflow-hidden'}`}>
        <ContractList
          symbolDataInitial={selectedCategory === CATEGORY_ALL ? mergeArr : mergeArr.slice(0, 20)}
          // symbolDataInitial={[]}
          isfuturesSearch={isfuturesSearch}
          search={search}
          isLoading={loadingState}
          allowShowList={allowShowList}
          favoriteTokens={symbolsFavorite}
          setOpen={setOpen}
          setIsFavoriteChange={setIsFavoriteChange}
          setSymbolsFavorite={setSymbolsFavorite}
          isdesktop={isdesktop}
          hideFavoriteTokens={hideFavoriteTokens}
        />
      </div>
    </div>
  )
}

export default memo(ContractSection)
