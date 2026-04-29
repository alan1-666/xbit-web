import { FilterSelectOption } from '@/components/common/FilterSelect'

export const modeOptions: FilterSelectOption[] = [
  {
    value: '1',
    label: '1',
  },
  {
    value: '2',
    label: '2',
  },
  {
    value: '5',
    label: '5',
  },
  {
    value: '10',
    label: '10',
  },
  {
    value: '100',
    label: '100',
  },
  {
    value: '1000',
    label: '1000',
  },
]

export interface OrderRowProps {
  quantity: string
  price: string
  type: 'bid' | 'ask'
  highlightWidth: number
}

export type OrderRecordProps = {
  className?: string
  style?: React.CSSProperties
  depthUnit?: "base" | "quote"
  tokenAccuracyDecimals?: number
} & Omit<ProcessedDepthItem, 'percent'> &
  Pick<OrderRowProps, 'type'>

export interface DepthItem {
  price: number
  quantity: number
}

export interface ProcessedDepthItem extends DepthItem {
  percent: number
  quoteQuantity: number
}
