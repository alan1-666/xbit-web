import { HolderDto } from '@/@generated/gql/graphql-meme2.ts'
import { formatAmount, formatPercent } from '@/lib/format.ts'
import ProgressBarHolder from '@components/detailHolderTab/ProgressBarHolder.tsx'
import { RootState, useAppSelector } from '@/redux/store'

type ItemHoldingPctProps = {
  holder: HolderDto
  circulatingSupply?: number
}

const ItemHoldingPct = ({ holder, circulatingSupply }: ItemHoldingPctProps) => {
  const price = useAppSelector((state: RootState) => state.tokenDetail.price)
  const positionPercentage = (Number(holder?.balance) / Number(circulatingSupply ?? 1)) * 100
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <div className="app-font-regular text-[13px] leading-[1] text-[#CACACA]">
          {formatAmount(Number(holder?.balance) * price, {
            showCurrency: true,
            roundMode: 'floor',
          })}
        </div>
        <div className="app-font-regular text-[12px] leading-[1] text-[#CACACA] p-1 rounded-[4px] bg-[#3E2761]">
          {formatPercent((Number(holder?.balance) / Number(circulatingSupply ?? 1)) * 100, {
            showSmallAsAngleBracket: true,
          })}
        </div>
      </div>
      {/*Progress*/}
      <ProgressBarHolder percentage={positionPercentage} minWClass="w-4/5" maxWClass="max-w-[85px]!" />
    </div>
  )
}

export default ItemHoldingPct
