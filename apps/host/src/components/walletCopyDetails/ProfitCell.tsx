import {cn} from "@/lib/utils.ts";
import MoneyFormatted from "../common/MoneyFormatted";
import { getStyleRiseFall } from "@/lib/format";
export interface ProfitCellProps {
  value: string
}

export default function ProfitCell(props: ProfitCellProps) {
  const {value} = props
  return (
    <span className={cn('text-[calc(13rem/16)] block', getStyleRiseFall(Number(value)))}>
      <MoneyFormatted className="block" isShort value={value} showUnit={false} />
    </span>
  )
}
