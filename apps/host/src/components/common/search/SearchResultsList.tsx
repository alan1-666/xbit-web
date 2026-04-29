import { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import { SearchTokenResponse } from '@/types/responses.ts'
import { searchTokens } from '@services/tokens.service.ts'
import { SearchResultItem } from './SearchResultItem'
import { SearchListSkeleton } from '@components/common/search/SearchListSkeleton.tsx'
import { IconEmpty } from '@components/icon'
import { useTranslation } from 'react-i18next'

interface SearchResultsListProps {
  debounceValue: string
}

export const SearchResultsList = (props: SearchResultsListProps) => {
  const { debounceValue } = props
  const { t } = useTranslation()
  const { data, loading } = useQuery<SearchTokenResponse>(searchTokens, {
    variables: {
      input: debounceValue,
    },
  })

  const tokens = useMemo(() => {
    return data?.searchToken || []
  }, [debounceValue, data])

  if (loading) return <SearchListSkeleton />

  if (tokens.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-80">
        <IconEmpty />
        <span className="text-[#FFFFFF80] text-[0.75rem]">{t('listCoin.noData')}</span>
      </div>
    )

  return (
    <div>
      {tokens.map((token) => (
        <SearchResultItem key={token.token} token={token} />
      ))}
    </div>
  )
}
