import { Result } from '../types/Route'
import { Reminder } from '../Reminder'
import { useEffect, useState } from 'react'
import { MathFun } from '@/lib/utils'

interface RouteInfoProps {
  swapRate: number
  estimatedFee: number
  estimatedTime?: number
  hasArbEth: boolean
}

export const RouteInfo = ({
  swapRate,
  estimatedFee,
  estimatedTime,
  hasArbEth,
}: RouteInfoProps) => {
  // if (!selectedRoute) return null;

  // const [swapRate, setSwapRate] = useState<string>()

/*
  useEffect(() => {
    const fromUSDPrice = selectedRoute.swaps[0].from.usdPrice
    const toUSDPrice = selectedRoute.swaps[selectedRoute.swaps.length - 1].to.usdPrice

    const fromToken = selectedRoute.swaps[selectedRoute.swaps.length - 1].from.symbol
    const toToken = selectedRoute.swaps[selectedRoute.swaps.length - 1].to.symbol

    setSwapRate(`1 ${toToken} ≈ ${MathFun.div(toUSDPrice, fromUSDPrice)} ${fromToken}`)
  }, [selectedRoute])
 */
  return (
    <>
      <div className="relative mt-1 p-[1px]">
        {/* <div className="flex flex-row justify-between pt-[10px]">
          <span className="inline-flex items-center gap-1 text-[12px] text-[#FFFFFFB2]">兑换路径</span>
          <div className="inline-flex items-center gap-1 cursor-pointer" onClick={onRouteSelect}>
            <span className="px-[6px] py-[2px] bg-[#00FFB41A] text-[#00FFB4] rounded-[4px] text-[11px]">最优</span>
            <img src="/images/cryptoDeposit/arrow-right.svg" alt="" className="w-[10px] h-[10px]" />
          </div>
        </div> */}

        {/* {swapRate && <div className="flex flex-row justify-between pt-[10px]">
          <span className="inline-flex items-center gap-1 text-[12px] text-[#FFFFFFB2]">兑换率</span>
          <div className="inline-flex items-center gap-1">
            <span className="px-[6px] text-[12px]">{swapRate}</span>
            <img src="/images/cryptoDeposit/swap-solid.png" alt="" className="w-[14px] h-[15px]" />
          </div>
        </div>} */}
{/* 
        <div className="flex flex-row justify-between pt-[10px]">
          <span className="inline-flex items-center gap-1 text-[12px] text-[#FFFFFFB2]">预估时间</span>
          <div className="inline-flex items-center gap-1">
            <span className="px-[6px] text-[12px]">{estimatedTime}s</span>
          </div>
        </div>
 */}
        {/* <div className="flex flex-row justify-between pt-[10px]">
          <span className="inline-flex items-center gap-1 text-[12px] text-[#FFFFFFB2]">预估网络费用</span>
          <div className="inline-flex items-center gap-1">
            <span className="px-[6px] text-[12px]">${selectedRoute.fee}</span>
          </div>
        </div> */}
      </div>

      {!hasArbEth && (
        <div className="relative mt-1 p-[1px]">
          <div className="flex flex-row justify-between pt-[10px]">
            <Reminder />
            <div className="inline-flex items-center gap-1">
              <span className="pl-[6px] pr-[6px] rounded-[4px] text-[12px]">0.0001ETH</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 