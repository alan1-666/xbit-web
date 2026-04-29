import { TokenDetail } from '@/@generated/gql/graphql-core.ts'
import { formatVolume } from '@/lib/format'
import { useOfficialPool } from '@hooks/useTokenPools.ts'
import { useMemo } from 'react'

type PairDetailProps = {
  tokenData: TokenDetail
  tokenPrice?: number
}

const PairDetail = ({ tokenData }: PairDetailProps) => {
  const officialPool = useOfficialPool(tokenData?.address as string, tokenData?.chainId as number)
  const baseTokenValue = useMemo(() => {
    if (!officialPool) return null
    return officialPool.baseTokenLiquidity * tokenData.price
  }, [officialPool])
  const quoteTokenInUsd = useMemo(() => {
    if (!officialPool) return null
    const { quoteTokenPrice, quoteLiquidity } = officialPool
    if (!quoteTokenPrice || !quoteLiquidity) return null
    return Number(quoteTokenPrice) * Number(quoteLiquidity)
  }, [officialPool, tokenData])

  return (
    <div className="p-2.5 border-[0.5px] border-[#ECECED1F] rounded-sm grid grid-cols-3 gap-2.5 leading-none">
      <div className="space-y-2">
        <div className="flex items-center gap-0.5">
          <span className="font-[330] text-[12px] text-white/50">Pool</span>
          <img src="/images/icons/locked.svg" className="size-3" alt="icon locked" />
        </div>
        <div className="font-[380] text-[12px] text-white">{tokenData?.symbol}</div>
        <div className="font-[380] text-[12px] text-white">{officialPool?.quoteSymbol}</div>
      </div>
      <div className="space-y-2 text-center">
        <div className="font-[330] text-[12px] text-white/50">Quantity</div>
        <div className="font-[380] text-[12px] text-white">
          {officialPool ? formatVolume(officialPool.baseTokenLiquidity) : '--'}
        </div>
        <div>{officialPool ? formatVolume(officialPool.quoteLiquidity) : '--'}</div>
      </div>
      <div className="space-y-2 text-right">
        <div className="font-[330] text-[12px] text-white/50">Value</div>
        <div className="font-[380] text-[12px] text-white">
          {baseTokenValue
            ? formatVolume(baseTokenValue, {
                showCurrency: true,
              })
            : '--'}
        </div>
        <div className="font-[380] text-[12px] text-white">
          {quoteTokenInUsd
            ? formatVolume(quoteTokenInUsd, {
                showCurrency: true,
              })
            : '--'}
        </div>
      </div>
    </div>
  )
}

export default PairDetail
