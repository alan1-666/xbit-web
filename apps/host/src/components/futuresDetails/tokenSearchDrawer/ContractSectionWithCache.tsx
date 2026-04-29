import { TOKEN_TRENDING_SEARCH_BAR_MS } from '@/components/futuresDiscover/futuresSearch'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { IPUseHandleGetData } from '@/pages/futures-market/hooks/useHandleGetData'
import { ISymbolList } from '@/redux/modules/symbolList.slide'
import { GET_SYMBOL_LIST } from '@/services/symbol.dex.service'
import { getFromLocalStorageWithTTL, saveToLocalStorageWithTTL } from '@/utils/storage'
import { useQuery as useReactQuery } from '@tanstack/react-query'
import { Dispatch, SetStateAction, useEffect, useMemo } from 'react'
import ContractList from './ContractList'
import { cn } from '@/lib/utils'

const uesGetSymbolList = () => {
  const input: { condition: IPUseHandleGetData['condition']; category?: string } = {
    condition: 'volume',
  }

  const { data, isFetching, refetch } = useReactQuery({
    queryKey: ['GET_SYMBOL_LIST', input.condition],
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

export const SYMBOL_LIST_KEY = 'SYMBOL_LIST_KEY'

const ContractSectionWithCache = ({
  search,
  allowShowList,
  symbolsFavorite,
  setOpen,
  setIsFavoriteChange,
  setSymbolsFavorite,
  isfuturesSearch = false,
  className,
}: {
  search: string
  className?: string
  allowShowList?: boolean
  symbolsFavorite: ISymbolList[]
  setOpen: Dispatch<SetStateAction<boolean>>
  setIsFavoriteChange: Dispatch<SetStateAction<boolean>>
  setSymbolsFavorite: (value: SetStateAction<ISymbolList[]>) => void
  isfuturesSearch?: boolean
}) => {
  const { loading, symbolList } = uesGetSymbolList()

  const listTokenDex = useMemo(() => {
    return getFromLocalStorageWithTTL<ISymbolList[]>(SYMBOL_LIST_KEY)?.length
      ? getFromLocalStorageWithTTL<ISymbolList[]>(SYMBOL_LIST_KEY)?.map((item: ISymbolList) => {
          const symbolFavorite = symbolsFavorite.find((symbol) => symbol.symbol === item.symbol)
          return symbolFavorite ? { ...item, isFavorite: true } : { ...item }
        })
      : symbolList.map((item: ISymbolList) => {
          const symbolFavorite = symbolsFavorite.find((symbol) => symbol.symbol === item.symbol)
          return symbolFavorite ? { ...item, isFavorite: true } : { ...item }
        })
  }, [symbolsFavorite, symbolList])
  useEffect(() => {
    return () => {
      if (symbolList.length && !getFromLocalStorageWithTTL<ISymbolList[]>(SYMBOL_LIST_KEY)?.length) {
        saveToLocalStorageWithTTL<ISymbolList[]>(SYMBOL_LIST_KEY, symbolList, TOKEN_TRENDING_SEARCH_BAR_MS)
      }
    }
  }, [symbolList])

  const isLoading = loading && !listTokenDex.length

  return (
    <div className={cn('relative flex flex-col h-full', className)}>
      {/* Scrollable Content Container */}
      <div className={`flex-1 ${isfuturesSearch ? 'overflow-y-auto' : 'overflow-hidden'} _hidescrollbar`}>
        <ContractList
          symbolDataInitial={listTokenDex}
          // symbolDataInitial={[]}
          isfuturesSearch={isfuturesSearch}
          search={search}
          isLoading={isLoading}
          allowShowList={allowShowList}
          favoriteTokens={symbolsFavorite}
          setOpen={setOpen}
          setIsFavoriteChange={setIsFavoriteChange}
          setSymbolsFavorite={setSymbolsFavorite}
        />
      </div>
    </div>
  )
}

export default ContractSectionWithCache
