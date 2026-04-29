import { ChainType, FollowingWalletInfo } from '@/@generated/gql/graphql-future'
import { CACHE_KEY } from '@/lib/constant'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { loadFirstPageFromStorage, saveFirstPageToStorage } from '@/utils/storage'
import { getFollowingWallets } from '@services/smartMoney.service.ts'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { get, isArray } from 'lodash-es'
import { useActiveChainType } from './useActiveChain'
import { useActiveWallet } from './useActiveWallet'

// const useGetTotalFollowingAddress = () => {
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<Error | null>(null)
//   const [data, setData] = useState<string[]>([])
//   const [cached, setCached] = useState<Record<string, XWalletFavourite> | null>(null)
//   useEffect(() => {
//     //loading cache, if cache is not empty, set data from cache, else will fetch from api
//     getDataFromDB();
//   }, [])
//   async function getDataFromDB() {
//     const data = await getXWalletsFavourite()
//     try {
//       if (data && data.length > 0) {
//         setData(data.map((item) => item.address))
//         setCached(data.reduce((acc, item) => {
//           acc[item.address] = item
//           return acc
//         }, {} as Record<string, XWalletFavourite>))
//       } else {
//         await getDataFromAPI();
//       }
//       setLoading(false)
//     } catch (error) {
//       setError(error as Error)
//     }
//   }

//   async function getDataFromAPI() {
//     try {
//       const res = await futureClient.query<GetTotalFollowingAddressResponse>({
//         query: getFollowingWallets,
//         variables: {
//           filter: {
//             chain: ChainType.Solana,
//           },
//         },
//         fetchPolicy: 'network-only',
//       })
//       const _arr = get(res, 'data.getFollowingWallets', [])
//       addXWalletsFavourite(_arr.map((i: FollowingWalletInfo) => ({
//         id: i.address,
//         address: i.address,
//         alias: i.alias
//       })))
//       setData(_arr.map((i: FollowingWalletInfo) => i.address))
//       setCached(_arr.reduce((acc, item) => {
//         acc[item.address] = {
//           id: item.address,
//           address: item.address,
//           alias: item.alias
//         }
//         return acc
//       }, {} as Record<string, XWalletFavourite>))
//     } catch (error) {
//       setError(error as Error)
//     }
//   }

//   return { data, loading, error, cached }
// }
type TXWalletFavourite = Omit<FollowingWalletInfo, '__typename'>

function getWalletFavoriteKeyWithChain(chain: ChainType) {
  return `${CACHE_KEY.WALLET_FAVORITE}_${chain}`
}

const useGetTotalFollowingAddress = () => {
  const activeWallet = useActiveWallet()
  const queryClient = useQueryClient()
  const activeChainType = useActiveChainType()
  const cacheKey = getWalletFavoriteKeyWithChain(activeChainType)
  const { data, isLoading, error, refetch } = useQuery<string[]>({
    queryKey: ['getTotalFollowingAddress', activeChainType],
    queryFn: async () => {
      const res = await futureClient.query({
        query: getFollowingWallets,
        variables: { filter: { chain: activeChainType } },
      })
      const _data = (get(res, 'data.getFollowingWallets', []) as TXWalletFavourite[]).map((i) => {
        return {
          address: i.address,
          alias: i.alias,
        }
      })
      // persist
      saveFirstPageToStorage<TXWalletFavourite[]>(cacheKey, _data)
      return _data.map((item) => item.address)
    },
    initialData: isArray(loadFirstPageFromStorage<TXWalletFavourite[]>(cacheKey, []))
      ? loadFirstPageFromStorage<TXWalletFavourite[]>(cacheKey, []).map((i) => i.address)
      : [],
    refetchOnMount: 'always',
    placeholderData: isArray(loadFirstPageFromStorage<TXWalletFavourite[]>(cacheKey, []))
      ? loadFirstPageFromStorage<TXWalletFavourite[]>(cacheKey, []).map((i) => i.address)
      : [],
    enabled: activeWallet.isConnected,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
  const updateCacheData = (address: string) => {
    queryClient.setQueryData(['getTotalFollowingAddress', activeChainType], (oldData: string[]) => {
      if (!oldData) return oldData
      return oldData.includes(address) ? oldData.filter((item) => item !== address) : [...oldData, address]
    })
  }
  return {
    data,
    loading: isLoading,
    error,
    refetch,
    updateCacheData,
    cached: loadFirstPageFromStorage<TXWalletFavourite[]>(cacheKey),
  }
}

export function getNameAliasFromAddress(address: string, chain: ChainType): string {
  const cacheKey = getWalletFavoriteKeyWithChain(chain)
  const db = loadFirstPageFromStorage<TXWalletFavourite[]>(cacheKey, [])
  return db.find((item) => item.address === address)?.alias ?? ''
}

// export function getXWalletsFavourite(): TXWalletFavourite[] {
//   const db = loadFirstPageFromStorage<TXWalletFavourite[]>(CACHE_KEY.WALLET_FAVORITE, [])
//   return db
// }

export function addXWalletFavourite(address: string, activeChainType: ChainType, alias = '') {
  const cacheKey = getWalletFavoriteKeyWithChain(activeChainType)
  const db = loadFirstPageFromStorage<TXWalletFavourite[]>(cacheKey, [])
  if (db.find((item) => item.address === address)) {
    return
  }
  db.push({ address, alias })
  saveFirstPageToStorage<TXWalletFavourite[]>(cacheKey, db)
}

export function addXWalletsFavourite(wallets: TXWalletFavourite[], activeChainType: ChainType) {
  const cacheKey = getWalletFavoriteKeyWithChain(activeChainType)
  const db = loadFirstPageFromStorage<TXWalletFavourite[]>(cacheKey, [])
  if (db.length >= 100) {
    return
  }
  db.push(...wallets)
  saveFirstPageToStorage<TXWalletFavourite[]>(cacheKey, db)
}

//edit wallet favourite by address
export const editXWalletFavourite = async (wallet: TXWalletFavourite, activeChainType: ChainType) => {
  const cacheKey = getWalletFavoriteKeyWithChain(activeChainType)
  const db = loadFirstPageFromStorage<TXWalletFavourite[]>(cacheKey, [])
  const index = db.findIndex((item) => item.address === wallet.address)
  if (index !== -1) {
    db[index] = wallet
    saveFirstPageToStorage<TXWalletFavourite[]>(cacheKey, db)
  }
}

export const removeXWalletFavourite = async (address: string, activeChainType: ChainType) => {
  const cacheKey = getWalletFavoriteKeyWithChain(activeChainType)
  const db = loadFirstPageFromStorage<TXWalletFavourite[]>(cacheKey, [])
  const index = db.findIndex((item) => item.address === address)
  if (index !== -1) {
    db.splice(index, 1)
    saveFirstPageToStorage<TXWalletFavourite[]>(cacheKey, db)
  }
}
//clean all wallet favourite
export const cleanXWalletsFavourite = async (chain: ChainType) => {
  const cacheKey = getWalletFavoriteKeyWithChain(chain)
  saveFirstPageToStorage<TXWalletFavourite[]>(cacheKey, [])
}

export default useGetTotalFollowingAddress
