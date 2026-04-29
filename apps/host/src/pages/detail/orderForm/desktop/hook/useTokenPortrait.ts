import { useQuery } from '@apollo/client'
import { getTokenPortrait } from '@services/tokens.service.ts'
import { futureClient } from '@/lib/gql/apollo-client'
import { useMemo } from 'react'

export const useTokenPortrait = (address: string | null | undefined, chainId: number | null | undefined) => {
  const { data } = useQuery(getTokenPortrait, {
    variables: {
      input: {
        address: address!,
        chainId: chainId!,
      },
    },
    skip: !address || !chainId,
    client: futureClient,
  })
  return useMemo(() => {
    if (!data || !data.getTokenPortrait) return undefined
    return data.getTokenPortrait
  }, [data])
}
