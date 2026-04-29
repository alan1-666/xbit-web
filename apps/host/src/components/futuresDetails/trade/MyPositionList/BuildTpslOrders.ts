import { formatSize, getAdjustedTriggerPrice } from '../tools'
import { xPositions } from '@/components/futuresDetails/trade/types.ts'

type FormValues = {
  size: string
  tpPrice: string
  slPrice: string
}

export const buildTpslOrders = (
  form_data: FormValues,
  info: xPositions,
  szMap: any,
  coinIndex: number
) => {
  const isBuy = info.side === 'B' ? false : true
  const newSize = formatSize(form_data.size, szMap[info.coin])
  

  const orders = []

  const commitSize = newSize === info.szi.toString() ? "0" : newSize

  

  if (form_data.tpPrice) {
    orders.push({
      a: coinIndex,
      b: isBuy,
      p: getAdjustedTriggerPrice('buy', form_data.tpPrice, false, szMap[info.coin]),
      s: commitSize,
      r: true,
      t: {
        trigger: {
          isMarket: true,
          triggerPx: form_data.tpPrice.toString(),
          tpsl: 'tp',
        }
      }
    })
  }

  if (form_data.slPrice) {
    orders.push({
      a: coinIndex,
      b: isBuy,
      p: getAdjustedTriggerPrice('sell', form_data.slPrice, false, szMap[info.coin]),
      s: commitSize,
      r: true,
      t: {
        trigger: {
          isMarket: true,
          triggerPx: form_data.slPrice.toString(),
          tpsl: 'sl',
        }
      }
    })
  }

  return orders
}
