import { MouseEvent } from 'react'
import { cn } from '@/lib/utils'
import ChainCurrencyIcon from '@/components/common/ChainCurrencyIcon'
import { useTranslation } from 'react-i18next'
import { CategoryToken } from '@/types/category.ts'
import { getBlockchainLogo2 } from '@/utils/helpers.ts'
import MoneyFormatted from '@components/common/MoneyFormatted.tsx'
import { formatPriceChange, fShortenNumber } from '@/lib/number.ts'
import { formatMarketValue } from '@/lib/format.ts'

interface CategoryTokenCardProps {
  token: CategoryToken
  onClick?: (token: CategoryToken) => void
  className?: string
  top?: 'top1' | 'top2' | 'top3'
}

/**
 * Token card component specifically for category detail page
 * Displays token information with price change indication and optional tag
 */
export const CategoryTokenCard = ({ token, onClick, className, top }: CategoryTokenCardProps) => {
  const { t } = useTranslation()
  const price24hChange = token.price24hChange ? +token.price24hChange : 0
  const priceColor = price24hChange > 0 ? 'text-rise' : price24hChange < 0 ? 'text-fall' : 'text-white'
  const chainLogo = getBlockchainLogo2(token.chainId ?? 1)

  const handleClick = (event: MouseEvent) => {
    event.stopPropagation()
    onClick?.(token)
  }

  return (
    <div
      className={cn(
        'py-3 border-b-[0.5px] border-[#ECECED08] flex justify-between items-center cursor-pointer hover:bg-[#27272a] transition-colors',
        className,
      )}
      onClick={handleClick}
    >
      <div className="flex items-center w-[40%] md:w-[50%]">
        <div className="relative mr-2">
          <div className="flex -space-x-4">
            <ChainCurrencyIcon chainIcon={chainLogo} currencyIcon={token.logoUrl ?? ''} name={token.symbol ?? ''} />
          </div>
        </div>
        <div>
          <div className="text-white font-medium text-[calc(13rem/16)]">{token.symbol}</div>
          <div className={`text-[calc(11rem/16)] leading-[calc(11rem/16)] font-normal text-[#ffffff70] `}>
            {formatMarketValue(token.marketCap ? +token.marketCap : 0, '$')}
            {top && (
              <span
                className="px-1 py-0.5 bg-gradient-to-tr from-fuchsia-500 via-white to-teal-400 rounded-tl rounded-tr-[1px] rounded-bl-[1px] 
                rounded-br inline-flex justify-center items-center font-medium text-black ml-1 text-[calc(9rem/16)] leading-[calc(9rem/16)]"
              >
                {t(`categoryDetail.${top}`)}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start w-[30%] pl-[5%] sm:pl-0">
        <MoneyFormatted value={token.price ?? 0} className="text-white font-medium text-[calc(13rem/16)]" />
        <div className={cn('justify-start text-[calc(11rem/16)] font-medium leading-3', priceColor)}>
          {price24hChange > 0 ? '+' : ''}
          {formatPriceChange(price24hChange)}
        </div>
      </div>
      <div className="flex flex-col items-end w-[30%] md:w-[20%]">
        <div className="w-20 text-right justify-start text-primary text-[calc(13rem/16)] font-medium leading-3">
          {token.volume24h ? `$${fShortenNumber(+token.volume24h)}` : '--'}
        </div>
      </div>
    </div>
  )
}

export default CategoryTokenCard

export class CategoryTokenData {}
