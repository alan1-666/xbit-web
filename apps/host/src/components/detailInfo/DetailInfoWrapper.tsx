import { TokenDetail } from '@/@generated/gql/graphql-core.ts'
import { useQuery } from '@apollo/client'
import { getTokenPortrait } from '@services/tokens.service.ts'
import { useMemo } from 'react'
import { TokenAlert } from '@components/detailInfo/TokenAlert.tsx'
import DetailInfo from '@components/detailInfo/index.tsx'
import { futureClient } from '@/lib/gql/apollo-client'
import { TokenAlertHoneyPot } from './TokenAlertHoneyPot'

export interface DetailInfoWrapperProps {
  tokenData: TokenDetail
}

const useTokenPortrait = (address: string | null | undefined, chainId: number | null | undefined) => {
  const { data } = useQuery(getTokenPortrait, {
    variables: {
      input: {
        address: address!,
        chainId: chainId!,
      },
    },
    skip: !address || !chainId,
    client: futureClient
  })
  return useMemo(() => {
    if (!data || !data.getTokenPortrait) return undefined
    return data.getTokenPortrait
  }, [data])
}

export const DetailInfoWrapper = (props: DetailInfoWrapperProps) => {
  const { tokenData } = props
  const tokenPortrait = useTokenPortrait(tokenData?.address, tokenData?.chainId)

  return (
    <>
      <TokenAlert tokenData={tokenData} tokenPortrait={tokenPortrait} />
      <TokenAlertHoneyPot tokenData={tokenData} />
      <DetailInfo tokenData={tokenData} tokenPortrait={tokenPortrait} />
    </>
  )
}
