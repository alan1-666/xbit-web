import { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import { adminClient } from '@/lib/gql/apollo-client'
import { getLinkConfigs } from '@/services/admin.service'

export function useLinkConfigs(key: string) {
  const { data, loading, error, refetch } = useQuery(getLinkConfigs, {
    client: adminClient,
    fetchPolicy: 'cache-first',
  })

  const value = useMemo(() => {
    return data?.linkConfigs?.find((config) => config.key === key)?.value || null
  }, [data?.linkConfigs, key])

  return {
    value,
    linkConfigs: data?.linkConfigs || [],
    loading,
    error,
    refetch,
  }
}
