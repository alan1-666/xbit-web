import { HolderDto } from '@/@generated/gql/graphql-core.ts'
import TwoValuesColumn from '@components/detailHolderTab/TwoValuesColumn.tsx'
import { formatDecimalLongValue, handleStringPercentage, handleStringValue } from '@/utils/helpers.ts'
import useTokenPrice from '@hooks/useTokenPrice.ts'

type UnrealizedColumnProps = {
  holder: HolderDto,
  fallbackPrice?: number
}

const UnRealizedColumn = ({holder, fallbackPrice}: UnrealizedColumnProps) => {
  const price = useTokenPrice(holder?.token ?? "")

  const unrealizedProfit = price && price !== 0
    ? (Number(price) - Number(holder?.avgPriceUsd)) * Number(holder?.balance) || 0
    : (Number(fallbackPrice) - Number(holder?.avgPriceUsd)) * Number(holder?.balance) || 0
  const unrealizedProfitPercentage = (unrealizedProfit / Number(holder?.totalBuyUsd)) * 100

  return (
    <TwoValuesColumn
      lowerValue={handleStringPercentage(formatDecimalLongValue(unrealizedProfitPercentage, 2))}
      upperValue={handleStringValue(formatDecimalLongValue(unrealizedProfit, 2), unrealizedProfit < 0)}
      upperValueClassName="app-font-medium text-[13px] leading-[1] text-fall"
      lowerValueClassName="app-font-regular text-[11px] leading-[1] text-fall"
    />
  )
}

export default UnRealizedColumn