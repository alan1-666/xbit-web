import { APP_PATH } from '@/lib/constant'
import { formatPriceChange } from '@/lib/number'
import { cn } from '@/lib/utils'
import { ISymbolList } from '@/redux/modules/symbolList.slide'
import { formatNumberWithCommas } from '@/utils/helpers'
import { useNavigate } from 'react-router-dom'

interface FuturesFooterCardProps {
  cardItem: ISymbolList
}

const PriceChangeText = (props: { priceChange?: number }) => {
  const { priceChange } = props
  const isZero = !priceChange || Math.abs(priceChange) < 0.01
  if (isZero) return <span className="text-white">0%</span>
  const isPositive = priceChange >= 0.01
  return (
    <span className={cn(isPositive ? 'text-rise' : 'text-fall')}>
      {isPositive ? '+' : ''}
      {formatPriceChange(priceChange)}
    </span>
  )
}

const FuturesFooterCard = ({ cardItem }: FuturesFooterCardProps) => {
  const { changPxPercent, currentPrice, symbol } = cardItem
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`${APP_PATH.FUTURES}/${cardItem.symbol}`)
  }


  return (
    <div
      className="flex items-center gap-1.5 text-[calc(13rem/16)] cursor-pointer relative h-full font-[305] flex-shrink-0"
      onClick={handleClick}
    >
      <div className="text-white whitespace-nowrap ">{symbol}USDT</div>
      <div className=" text-[#908E98] break-keep whitespace-nowrap">{formatNumberWithCommas(`${currentPrice}`)}</div>
      <div>
        <PriceChangeText priceChange={Number(changPxPercent)} />
      </div>
    </div>
  )
}

export default FuturesFooterCard
