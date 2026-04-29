import { CACHE_KEY } from '@/lib/constant'
import { tradingClient } from '@/lib/gql/apollo-client.ts'
import { ChainIds } from '@/types/enums.ts'
import { loadFirstPageFromStorage, saveFirstPageToStorage } from '@/utils/storage'
import { listCopiedAddresses } from '@services/smartMoney.service.ts'
import { useQuery } from '@tanstack/react-query'
import { get } from 'lodash-es'
import { useActiveChainId } from './useActiveChain'
import { useActiveWallet } from './useActiveWallet'

type TListCopiedAddresses = string[]

function getCopyTradeCacheKey(chainId: ChainIds) {
  return `${CACHE_KEY.WALLET_COPY_TRADE}_${chainId}`
}

const useGetCopyTradeAddress = () => {
  const activeChainId = useActiveChainId() ?? ChainIds.Solana
  const activeWallet = useActiveWallet()
  const skip = !activeWallet.isConnected
  const cacheKey = getCopyTradeCacheKey(activeChainId)
 
  const { isLoading, error } = useQuery<string[]>(
  {
    queryKey: ['getCopyTradeAddress', activeChainId],
    queryFn: async () => {
      const res = await tradingClient.query({
        query: listCopiedAddresses,
        variables: {
          input: {
            chainId: activeChainId
          }
        },
      },
    )
      // persist
      saveFirstPageToStorage<string[]>(cacheKey, get(res, 'data.listCopiedAddresses', []))
      return get(res, 'data.listCopiedAddresses', [])
    },
    initialData: loadFirstPageFromStorage<TListCopiedAddresses>(cacheKey, []),
    refetchOnMount: 'always',
    enabled: !skip,
  },
 )
  return {
    data: !skip ? loadFirstPageFromStorage<string[]>(`${CACHE_KEY.WALLET_COPY_TRADE}_${activeChainId}`, []) : [],
    loading: isLoading,
    error,
  }
}

export function getCopyTradeAddress({ chainId }: { chainId: ChainIds }): TListCopiedAddresses {
  const db = loadFirstPageFromStorage<TListCopiedAddresses>(getCopyTradeCacheKey(chainId), [])
  return db
}
export function addCopyTradeAddress({ chainId }: { chainId: ChainIds }, address: string) {
  const db = loadFirstPageFromStorage<TListCopiedAddresses>(getCopyTradeCacheKey(chainId), [])
  if (db.includes(address)) {
    return
  }
  db.push(address);
  saveFirstPageToStorage<TListCopiedAddresses>(getCopyTradeCacheKey(chainId), db)
}


export const removeCopyTradeAddress = async ({ chainId }: { chainId: ChainIds }, address: string) => {
  const db = loadFirstPageFromStorage<TListCopiedAddresses>(getCopyTradeCacheKey(chainId), [])
  db.splice(db.indexOf(address), 1)
  saveFirstPageToStorage<TListCopiedAddresses>(getCopyTradeCacheKey(chainId), db)
}

//clean all wallet copy trade
export const cleanCopyTradeAddress = async ({ chainId }: { chainId: ChainIds }) => {
  saveFirstPageToStorage<TListCopiedAddresses>(getCopyTradeCacheKey(chainId), [])
}

export default useGetCopyTradeAddress
