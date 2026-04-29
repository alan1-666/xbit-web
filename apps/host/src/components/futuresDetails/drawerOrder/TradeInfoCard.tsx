import { cn } from '@/lib/utils'
import InfoRow from './InfoRow'

const TradeInfoCard = () => {
  const tradeData = [
    { label: '买入时间', value: '03/08 12:12' },
    { label: '买入价格', value: '83,862.12' },
    { label: '建议止盈', value: '83,881.12', suffix: '(5%)' },
    { label: '建议止损', value: '83,868.33', suffix: '(-4%)' },
    { label: '近1个月收益', value: '+1092.34%', valueColor: 'text-[#00FFB4]' },
    { label: '累计收益', value: '273663.11%', valueColor: 'text-[#00FFB4]' },
  ]

  return (
    <div className={cn(`rounded-[6px] p-2 flex justify-between flex-col flex-1 bg-[#53538814] mt-1`)}>
      {tradeData.map((item, index) => (
        <InfoRow key={index} label={item.label} value={item.value} suffix={item.suffix} valueColor={item.valueColor} />
      ))}
    </div>
  )
}

export default TradeInfoCard
