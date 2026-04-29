import { useSimilarTokens } from '@pages/meme/discover/desktop/hooks/useSimilarTokens.ts'
import { SimilarToken } from '@pages/meme/discover/desktop/components/SimilarToken.tsx'
import { useTranslation } from 'react-i18next'

export interface SimilarTokensListProps {
  chainId: number
  token: string
}

export const SimilarTokensList = (props: SimilarTokensListProps) => {
  const { chainId, token } = props
  const { data: similarTokens = [], isLoading } = useSimilarTokens({ token, chainId })
  const { t } = useTranslation()
  if (isLoading) return null
  if (!similarTokens || !similarTokens.length) return null
  return (
    <div className="max-w-full">
      <div className="relative group">
        <div className="my-2 cursor-pointer">
          {t('listCoin.tooltip.similarTokens')}({similarTokens.length})
        </div>
        <div className="hidden group-hover:block absolute left-0 bottom-[16px] bg-black/80 text-[calc(10rem/16)] p-2 rounded-[4px] max-w-[260px]">
          {t('listCoin.tooltip.similarTokensDescription')}
        </div>
      </div>
      <div>
        {similarTokens.map((token) => (
          <SimilarToken
            avatar={token.image ?? ''}
            symbol={token.symbol}
            address={token.token}
            marketCap={token.marketCap ? +token.marketCap : 0}
            createdTime={token.createdAt}
            chainId={chainId}
          />
        ))}
      </div>
    </div>
  )
}
