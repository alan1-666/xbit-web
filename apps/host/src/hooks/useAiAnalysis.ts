import { useApolloClient } from '@apollo/client'
import { useQueries } from '@tanstack/react-query'
import { getAiAnalyzedInfo } from '@services/tokens.service.ts'
import { AiAnalyzedInfoLang } from '@/@generated/gql/graphql-core.ts'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

type UseAiAnalysisOptions = {
  tokenAddress?: string
  enabled?: boolean
}

const languageMap: Record<string, AiAnalyzedInfoLang> = {
  zh: AiAnalyzedInfoLang.ZhHans,
  en: AiAnalyzedInfoLang.En,
  hi: AiAnalyzedInfoLang.Hi,
  vi: AiAnalyzedInfoLang.Vi,
  ja: AiAnalyzedInfoLang.Ja,
  hk: AiAnalyzedInfoLang.Hk,
}

export const useAiAnalysis = (options: UseAiAnalysisOptions) => {
  const { i18n } = useTranslation()
  const client = useApolloClient()
  const { enabled = true, tokenAddress } = options
  const queries = useQueries({
    queries: [
      {
        queryKey: ['getAiAnalyzedInfo', 'avatar', tokenAddress, i18n.language],
        enabled: enabled,
        queryFn: async () => {
          const res = await client.query({
            query: getAiAnalyzedInfo,
            variables: {
              input: {
                tokenAddress: tokenAddress ?? '',
                lang: languageMap[i18n.language] ?? AiAnalyzedInfoLang.En,
                includeAvatarAnalytic: true,
                includeSocialWebsiteAnalytic: false,
                includeThemeNarrativeAnalytic: false,
              },
            },
          })
          return res.data.getAiAnalyzedInfo.avatarAnalytic
        },
      },
      {
        queryKey: ['getAiAnalyzedInfo', 'narrative', tokenAddress, i18n.language],
        enabled: enabled,
        queryFn: async () => {
          const res = await client.query({
            query: getAiAnalyzedInfo,
            variables: {
              input: {
                tokenAddress: tokenAddress ?? '',
                lang: languageMap[i18n.language] ?? AiAnalyzedInfoLang.En,
                includeAvatarAnalytic: false,
                includeSocialWebsiteAnalytic: false,
                includeThemeNarrativeAnalytic: true,
              },
            },
          })
          return res.data.getAiAnalyzedInfo.themeNarrativeAnalytic
        },
      },
      {
        queryKey: ['getAiAnalyzedInfo', 'website', tokenAddress, i18n.language],
        enabled: enabled,
        queryFn: async () => {
          const res = await client.query({
            query: getAiAnalyzedInfo,
            variables: {
              input: {
                tokenAddress: tokenAddress ?? '',
                lang: languageMap[i18n.language] ?? AiAnalyzedInfoLang.En,
                includeAvatarAnalytic: false,
                includeSocialWebsiteAnalytic: true,
                includeThemeNarrativeAnalytic: false,
              },
            },
          })
          return res.data.getAiAnalyzedInfo.socialWebsiteAnalytic
        },
      },
    ],
  })

  return useMemo(() => {
    const [avatarQuery, narrativeQuery, websiteQuery] = queries
    return {
      avatar: {
        isLoading: avatarQuery.isLoading,
        content: avatarQuery.data,
      },
      narrative: {
        isLoading: narrativeQuery.isLoading,
        content: narrativeQuery.data,
      },
      website: {
        isLoading: websiteQuery.isLoading,
        content: websiteQuery.data,
      },
    }
  }, [queries])
}
