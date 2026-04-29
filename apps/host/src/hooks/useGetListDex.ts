import { useQuery } from '@apollo/client'
import { getListDex } from '@/services/tokens.service'
import { Dex } from '@/@generated/gql/graphql-core'

interface DexWithPair extends Dex {
  pair: string
}

interface UseGetListDexProps {
  token: string
  chainId: number
  skipCondition?: boolean
}

interface UseGetListDexReturn {
  data: DexWithPair[] | undefined
  loading: boolean
  error: any
}

export const useGetListDex = ({ token, chainId, skipCondition = false }: UseGetListDexProps): UseGetListDexReturn => {
  const { data, loading, error } = useQuery(getListDex, {
    variables: {
      token,
      chainId,
    },
    skip: skipCondition || !token || !chainId,
    errorPolicy: 'all',
  })

  return {
    data: data?.getListDex as DexWithPair[],
    loading,
    error,
  }
}
