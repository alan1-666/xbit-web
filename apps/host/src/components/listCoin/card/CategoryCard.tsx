import { MarketDisplay } from '@/components/common/FormattingDisplay'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant'
import { cn, getPath } from '@/lib/utils'
import { CardHead, CardWrapper } from '@components/common/Card/CurrencyListCard.tsx'
import { Link, useNavigate } from 'react-router-dom'
import { Category } from '@/types/category.ts'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar.tsx'
import { formatPriceChange, fShortenNumber } from '@/lib/number.ts'
import TrendChart from '@components/listCoin/card/TrendChart.tsx'
import { useMemo } from 'react'
import { listCoinHelper } from '@/utils/list-coin-helper.ts'
import isNumber from 'lodash/isNumber'
import { f } from 'fintech-number'

type MemeCoinCardProps = {
  category: Category
  hot: boolean
  chainId: number
}

const PriceChange = (props: { priceChange: number }) => {
  const { priceChange } = props
  let color = 'text-neutral'
  if (priceChange > 0.01) {
    color = 'text-rise'
  } else if (priceChange < -0.01) {
    color = 'text-fall'
  }

  const isPositive = priceChange >= 0.01
  const formatted = formatPriceChange(priceChange)

  return (
    <span className={cn('text-[calc(1rem*(10/16))] leading-[calc(1rem*(12/16))] mr-1', color)}>
      {isPositive ? '+' : ''}
      {formatted}
    </span>
  )
}

function CategoryCard({ category, hot, chainId }: MemeCoinCardProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const navigateToCategoryDetail = () => {
    navigate(
      getPath(APP_PATH.CATEGORY_DETAIL, {
        category: category.categoryId.toLowerCase(),
      }),
    )
  }

  const details = [
    {
      label: t('categories.volume24h'),
      value: category.volume24h ? `$${fShortenNumber(+category.volume24h)}` : '--',
    },
    {
      label: t('categories.upDown'),
      value: (
        <span>
          {category.priceUpCount}
          <span className="splat">/</span>
          {category.priceDownCount}
        </span>
      ),
    },
    {
      label: t('categories.topToken'),
      value: (
        <>
          {category.top1TokenAddress ? (
            <Link
              to={getPath(APP_PATH.MEME_TOKEN_DETAIL, {
                address: category.top1TokenAddress,
                chain: CHAIN_SYMBOLS[chainId],
              })}
              state={{ symbol: category.top1TokenSymbol }}
              className="uppercase text-link"
              onClick={(e) => e.stopPropagation()}
            >
              {category.top1TokenSymbol?.slice(0, 10)}
            </Link>
          ) : (
            <span>--</span>
          )}
        </>
      ),
    },
  ]

  const topGainers = category.topGainers?.slice(0, 3).reverse() ?? []
  // const price24hChange = category.price24hChange ?? 0
  const volume1hHistory = category.volume1hHistory?.map((item) => parseFloat(item)) || []
  const barChartData = listCoinHelper.normalizeChartData2(volume1hHistory)

  const price24hChange = useMemo(() => {
    if (category.tokensCount === 0 || !category.price24hChange) {
      return 0
    }
    const change = parseFloat(category.price24hChange)
    return isNaN(change) ? 0 : change / category.tokensCount
  }, [category])

  const lineChartData = category.price1hChangeHistory?.map((item) => parseFloat(item)) || []
  const prices: number[] = useMemo(() => {
    const data: number[] = []
    for (let i = 0; i < lineChartData.length; i++) {
      const lastPrice = i >= 1 ? data[i - 1] : 100
      const currentPrice = (lastPrice * (100 + lineChartData[i])) / 100
      data.push(currentPrice)
    }
    return listCoinHelper.normalizeChartData2(data)
  }, [lineChartData])

  const trend = +price24hChange >= 0 ? 'up' : 'down'

  return (
    <div className="border-[0.6px] border-[#ECECED14] rounded-[6px] bg-[#0F0F0F] box-border">
      <CardWrapper onClick={navigateToCategoryDetail}>
        <CardHead>
          <div className="flex items-center">
            <div className="flex mr-2 -space-x-3.5 w-12">
              {topGainers.map((item, index) => (
                <Avatar key={index} className="size-6 border bg-(--bg-primary) border-[var(--bg-primary)]">
                  <AvatarFallback className="text-[calc(9rem/16)]">
                    {item.symbol?.slice(0, 2).toLowerCase()}
                  </AvatarFallback>
                  <AvatarImage className="object-cover" src={item.logoUrl ?? ''} />
                </Avatar>
              ))}
            </div>
            <div>
              <div className="mb-1 flex items-center">
                {hot && <img src="/images/icons/ic-framer.webp" className="size-3 mr-0.5" alt="" />}
                <span className="text-title font-bold text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))] mr-[calc(1rem*(9/16))]">
                  {category.name ?? '--'}
                </span>
              </div>

              <div className="flex items-center">
                <span className="text-[calc(1rem*(10/16))] leading-[calc(1rem*(10/16))] text-(--text-tertiary) mr-1">
                  {t('categories.change24h')}
                </span>
                <PriceChange priceChange={+price24hChange} />
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="mr-4 text-center">
              <MarketDisplay
                value={category.marketCap ? +category.marketCap : 0}
                className={'text-title text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))] font-bold mb-1'}
              />
              <p className="text-[calc(1rem*(10/16))] leading-[calc(1rem*(10/16))] text-(--text-tertiary)">
                {t('categories.marketCap')}
              </p>
            </div>

            <TrendChart lineData={prices} barData={barChartData} trend={trend} showLine={false} />
          </div>
        </CardHead>
        {/*<CardBottom tradeDetails={details} cols={3} className="bg-[#EDEDED17]" />*/}
        <div
          className={cn(
            'px-2 pt-0.5 pb-1.5 justify-between grid grid-cols-11 rounded-bl-[6px] rounded-br-[6px] bg-[#ECECED14]',
          )}
        >
          {details.map((item, index) => (
            <div
              key={index}
              className="first:col-span-5 col-span-3 last:col-span-3 last:text-end h-4 flex items-end last:justify-end"
            >
              <div className="text-(--text-tertiary) text-[calc(1rem*(10/16))] leading-[calc(1rem*(11/16))] mr-1">
                {item.label}
              </div>
              <div className="text-(--text-secondary) app-font-medium text-[calc(1rem*(11/16))] leading-[calc(1rem*(11/16))]">
                {isNumber(item.value) ? f(item.value) : item.value}
              </div>
            </div>
          ))}
        </div>
      </CardWrapper>
    </div>
  )
}
export default CategoryCard
