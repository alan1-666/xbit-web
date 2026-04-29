import { useTokenAge } from '@hooks/useTokenAge.ts'
import { formatHoldingDuration } from '@/utils/time.ts'

type ItemHoldingLengthProps = {
  holdingLength: string
}

const ItemHoldingLength = ({ holdingLength }: ItemHoldingLengthProps) => {
  const hl = useTokenAge(holdingLength)

  return <div className="app-font-regular text-[14px] leading-[1] !text-[#6C6A74]">{formatHoldingDuration(hl)}</div>
}

export default ItemHoldingLength
