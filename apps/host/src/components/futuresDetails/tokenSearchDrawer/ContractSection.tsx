import { symbolDexClient } from '@/lib/gql/apollo-client'
import CategoryTabs from '@/pages/futures-market/components/category-tabs'
import { CATEGORY_ALL, IPUseHandleGetData } from '@/pages/futures-market/hooks/useHandleGetData'
import { ISymbolList } from '@/redux/modules/symbolList.slide'
import { GET_CATEGORY_LIST, GET_SYMBOL_LIST } from '@/services/symbol.dex.service'
import { useQuery as useReactQuery } from '@tanstack/react-query'
import { Dispatch, memo, SetStateAction, useCallback, useMemo, useState } from 'react'
import ContractList from './ContractList'

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
  hideFavoriteTokens?: boolean
}) => {
  const { categories, loading: isLoadingCategory } = useGetCategories()

  const { loading: isLoading, symbolList } = uesGetSymbolList('category', selectedCategory)

  const handleCategoryChange = useCallback((categoryValue: string) => {
    setSelectedCategory(categoryValue)
  }, [])

  const listTokenDex = useMemo(() => {
    return symbolList.map((item: ISymbolList) => {
      const symbolFavorite = symbolsFavorite.find((symbol) => symbol.symbol === item.symbol)
      return symbolFavorite ? { ...item, isFavorite: true } : { ...item }
    })
  }, [symbolsFavorite, symbolList])

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
          symbolDataInitial={selectedCategory === CATEGORY_ALL ? listTokenDex : listTokenDex.slice(0, 20)}
          // symbolDataInitial={[]}
          isfuturesSearch={isfuturesSearch}
          search={search}
          isLoading={isLoading}
          allowShowList={allowShowList}
          favoriteTokens={symbolsFavorite}
          setOpen={setOpen}
          setIsFavoriteChange={setIsFavoriteChange}
          setSymbolsFavorite={setSymbolsFavorite}
          hideFavoriteTokens={hideFavoriteTokens}
        />
      </div>
    </div>
  )
}

export default memo(ContractSection)
