import { HolderDto } from '@/@generated/gql/graphql-core.ts'
import useTokenPrice from '@hooks/useTokenPrice.ts'
import TwoValuesColumn from '@components/detailHolderTab/TwoValuesColumn.tsx'
import { formatDecimalLongValue, handleStringPercentage, handleStringValue } from '@/utils/helpers.ts'

type TotalProfitColumnProps = {
  holder: HolderDto,
  fallbackPrice?: number
}

const TotalProfitColumn = ({holder, fallbackPrice}: TotalProfitColumnProps) => {
  const price = useTokenPrice(holder?.token ?? "")

  const unrealizedProfit = price
    ? (Number(price) - Number(holder?.avgPriceUsd)) * Number(holder?.balance) || 0
    : (Number(fallbackPrice) - Number(holder?.avgPriceUsd)) * Number(holder?.balance) || 0
  const realizedProfit = Number(holder?.realizedProfit) || 0
  const totalProfit = unrealizedProfit + realizedProfit
  const totalProfitPercentage =
    totalProfit !== 0 && holder?.totalBuyUsd
      ? formatDecimalLongValue((totalProfit / Number(holder?.totalBuyUsd)) * 100, 2)
      : '--'

  return (
    <TwoValuesColumn
      lowerValue={handleStringPercentage(totalProfitPercentage)}
      upperValue={handleStringValue(formatDecimalLongValue(totalProfit, 2), totalProfit < 0)}
      upperValueClassName="app-font-medium text-[13px] leading-[1] text-[#FFFFFF]"
      lowerValueClassName="text-[11px] text-[#605e68] leading-none font-[330]"
    />
  )
}

export default TotalProfitColumn