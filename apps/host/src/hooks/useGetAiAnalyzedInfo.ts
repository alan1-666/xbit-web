import { getAIAnalyzedInfo } from '@services/tokens.service.ts'
import { AiAnalyticResponse } from '@/types/responses.ts'
import { useQuery } from '@tanstack/react-query'
import { useApolloClient } from '@apollo/client'

type useGetAiAnalyzedInfoProps = {
  tokenAddress: string | undefined
  language?: string
}

export const useGetAiAnalyzedInfo = ({ tokenAddress, language }: useGetAiAnalyzedInfoProps) => {
  const client = useApolloClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['getAiAnalyzedInfo', tokenAddress, language],
    queryFn: async () => {
      if (!tokenAddress) return null
      const res = await client.query<AiAnalyticResponse>({
        query: getAIAnalyzedInfo,
        variables: {
          input: {
            tokenAddress,
            includeThemeNarrativeAnalytic: true,
            includeSocialWebsiteAnalytic: true,
            includeAvatarAnalytic: true,
            lang: language || 'en',
          },
        },
      })
      return res.data
    },
  })

  return { data: data?.getAiAnalyzedInfo, loading: isLoading, error }
}
