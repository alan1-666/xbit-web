import { useQuery } from '@apollo/client'
import { getCategories } from '@services/tokens.service.ts'
import { useMemo } from 'react'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { ChainIds } from '@/types/enums.ts'
import { futureClient } from '@/lib/gql/apollo-client.ts'

export const useCategories = () => {
  const activeChainId = useActiveChainId()
  const { data, ...rest } = useQuery(getCategories, {
    variables: {
      input: {
        chainId: activeChainId ?? ChainIds.Solana,
      },
    },
    client: futureClient,
  })
  const categories = useMemo(() => {
    if (!data) return []
    return data.getAllCategories.data
  }, [data])

  return { categories, ...rest }
}
