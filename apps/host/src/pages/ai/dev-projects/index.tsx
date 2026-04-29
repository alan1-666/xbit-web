import React, { useMemo } from 'react'
import HeaderWithBack from '@/components/header/HeaderWithBack'
import TokenInfo from '@/components/ai/dev-projects/TokenInfo'
import { TokensTable } from '@/components/ai/dev-projects/TokensTable'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { useApolloClient } from '@apollo/client'
import { useQuery } from '@tanstack/react-query'
import { getTokenOfficialInformation } from '@services/tokens.service.ts'
import { getPath } from '@/lib/utils.ts'
import { APP_PATH } from '@/lib/constant.ts'
import { useDevTokens } from '@hooks/useDevTokens.ts'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { ChainIds } from '@/types/enums.ts'

const useDevAddress = (tokenAddress: string, chainId: number) => {
  const client = useApolloClient()
  const { data, ...rest } = useQuery({
    queryKey: ['devAddress', tokenAddress, chainId],
    queryFn: async () => {
      const res = await client.query({
        query: getTokenOfficialInformation,
        variables: { address: tokenAddress, chainId },
      })
      return res.data.getTokenOfficialInformation.projectPartyDevAddress as string
    },
  })
  const devAddress = useMemo(() => {
    if (!data) return ''
    return data
  }, [data])
  return {
    devAddress,
    ...rest,
  }
}

const DevProjectPage: React.FC = () => {
  const { t } = useTranslation()
  const params = useParams()
  const tokenAddress = params.address
  const chainId = useActiveChainId()

  const { devAddress } = useDevAddress(tokenAddress ?? '', chainId ?? ChainIds.Solana)
  const { data, isLoading, loadMore } = useDevTokens({
    devAddress,
    chainId: chainId ?? ChainIds.Solana,
  })
  return (
    <div>
      <div className="fixed top-0 left-0 right-0 z-10">
        <HeaderWithBack
          title={t('detail.devProjects.pageTitle')}
          className="bg-[#121214] z-10 max-w-[786px] mx-auto"
          right={<div />}
          backHref={getPath(APP_PATH.MEME_TOKEN_DETAIL, { chain: params.chain ?? 'sol', address: tokenAddress ?? '' })}
        />
      </div>
      <div className="p-4 pt-18 z-0">
        <TokenInfo
          devAddress={devAddress}
          totalMigrated={data.totalMigrated ?? 0}
          totalRugged={data.totalRug ?? 0}
          totalTokens={data.total ?? 0}
        />
        <div className="mt-4">
          <TokensTable tokens={data.tokens || []} onLoadMore={loadMore} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}

export default DevProjectPage
