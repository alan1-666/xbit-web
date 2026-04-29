import ChainCurrencyIcon from '@/components/common/ChainCurrencyIcon'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant.ts'
import { fShortenNumber } from '@/lib/number.ts'
import { cn, getPath } from '@/lib/utils.ts'
import { ChainIds } from '@/types/enums.ts'
import { XStockToken } from '@/types/xstocks'
import { formatLongValue, getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers.ts'
import MoneyFormatted from '@components/common/MoneyFormatted.tsx'
import { IconXStock } from '@components/common/tags/IconXStock.tsx'
import React, { useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { formatMarketCap, formatVolume } from '@/lib/format.ts'
import { XStockListContext } from '@components/xstocks/XStockListContext.ts'

export interface XStockCardProps {
  token: XStockToken
}

const formatPriceChange = (value: number | string | null | undefined): string => {
  const change = value ? +value : 0
  if (change === 0) return '0%'
  const sign = Number(change.toFixed(2)) > 0 ? '+' : ''
  return sign + formatLongValue(Number(change.toFixed(2)), false, 2) + '%' // Format as percentage
}

const XStockCard: React.FC<XStockCardProps> = ({ token }) => {
  const chainId = token.chainId ? +token.chainId : ChainIds.Solana
  const chainLogo = getBlockchainLogo2(chainId)
  const tokenImage = token.logoUrl || getBlockChainLogo(chainId, token.address!)

  const { primaryMetric } = useContext(XStockListContext)

  const primaryMetricValue = useMemo(() => {
    if (primaryMetric === 'volume24h') {
      return formatVolume(token.volume24h ? +token.volume24h : 0)
    }
    return formatMarketCap(token.marketCap ? +token.marketCap : 0)
  }, [primaryMetric, token])

  return (
    <Link
      to={getPath(APP_PATH.X_STOCK_DETAIL, { address: token.address ?? '', chain: CHAIN_SYMBOLS[chainId] })}
      className="no-underline"
      state={{
        symbol: token.symbol,
        tokenLogo: token.logoUrl,
        tokenName: token.name,
        createdTime: token.createdTime,
        address: token.address,
        chainId: token.chainId,
        isXStock: true,
      }}
    >
      <div className="flex items-center shadow cursor-pointer py-2.75 bg-[#0A0A0A] hover:bg-[#27272a] hover:rounded-[6px] ">
        {/* Column 1: Icon + Symbol + Address (40%) */}
        <div className="flex items-center gap-[7px] w-[50%] min-w-0">
          <ChainCurrencyIcon
            chainIcon={chainLogo}
            currencyIcon={tokenImage}
            name={token.symbol ?? ''}
            fallbackClassName="bg-secondary w-[27px] h-[27px]"
            avatarClassName="border-[#261236] ml-0 mt-0 w-6 h-6"
            className="w-6.75 h-6.75"
          />
          <div className="flex flex-col min-w-0 gap-1.5">
            <div className="flex items-baseline gap-[5px]">
              <div className="text-[14px] truncate text-[#908E98] leading-3.5 flex gap-1 items-end">
                <div className="text-white font-semibold leading-3.5 text-[14px]">{token.symbol}</div>{' '}
                <div className="text-[calc(12rem/16)] app-font-regular leading-3.5">
                  {token.name?.replace('xStock', '')}
                </div>
              </div>
              <IconXStock />
            </div>
            <span className="text-[calc(10rem/16)] leading-2.5 app-font-regular text-[#605E68] truncate max-w-[120px]">
              ${primaryMetricValue}
            </span>
          </div>
        </div>
        {/* Column 2: Price + Liquidity (25%) */}
        <div className="flex flex-col w-[25%] min-w-0 items-end text-[calc(14rem/16)] app-font-regular gap-1.5">
          <MoneyFormatted value={token.price!} className="text-[calc(14rem/16)] app-font-regular leading-3.5" />
          <span className="text-[calc(12rem/16)] leading-3 text-[#605E68] app-font-regular">
            ${fShortenNumber(token.liquidity ? +token.liquidity : 0)}
          </span>
        </div>
        {/* Column 3: 24h Price Change (15%) */}
        <div className="flex flex-col text-end w-[25%] min-w-0 items-end">
          <span
            className={cn(
              !token.price24hChange || Number((+token.price24hChange).toFixed(2)) >= 0
                ? 'bg-[var(--bg-positive)]'
                : 'bg-[var(--bg-negative)]',
              'text-white w-[70px] text-center py-1.5 rounded-[6px] text-[calc(14rem/16)] leading-3.5 app-font-regular ',
            )}
          >
            {formatPriceChange(token.price24hChange)}
            {/* <MoneyFormatted value={token.price24hChange ? +token.price24hChange : 0} showUnit={false} decimal={2} />% */}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default XStockCard
