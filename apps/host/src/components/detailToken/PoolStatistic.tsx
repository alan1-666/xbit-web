import { TokenDetail } from '@/@generated/gql/graphql-core.ts'
import { useOfficialPool } from '@hooks/useTokenPools.ts'
import { formatMoney } from '@/utils/helpers.ts'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export interface PoolStatisticProps {
  tokenData?: TokenDetail
}
//
// const PoolInfo = (props: { logo?: string; name?: string }) => {
//   const { logo, name } = props
//   const { t } = useTranslation()
//   return (
//     <TooltipProvider>
//       <Tooltip>
//         <TooltipTrigger asChild>
//           <div className="flex items-center justify-center gap-0.5 cursor-pointer">
//             {!!logo && <img src={logo} alt={name} className="size-3" />}
//             <span>{t('tokenData.statistic.poolValue')}</span>
//             <img src="/images/icons/locked.svg" alt="v" className="w-[10px] h-[10px]" />
//           </div>
//         </TooltipTrigger>
//         <TooltipContent className="bg-[#232329] text-white p-2 rounded flex items-center gap-1">
//           {!!logo && <img src={logo} alt={name} className="size-3" />}
//           <span>{name}</span>
//         </TooltipContent>
//       </Tooltip>
//     </TooltipProvider>
//   )
// }

const PoolStatistic = (props: PoolStatisticProps) => {
  const { tokenData } = props
  const { t } = useTranslation()
  const officialPool = useOfficialPool(tokenData?.address as string, tokenData?.chainId as number)
  const baseTokenValue = useMemo(() => {
    if (!officialPool) return null
    return officialPool.baseTokenLiquidity * tokenData?.price
  }, [officialPool])
  const quoteTokenInUsd = useMemo(() => {
    if (!officialPool) return null
    const { quoteTokenPrice, quoteLiquidity } = officialPool
    if (!quoteTokenPrice || !quoteLiquidity) return null
    return Number(quoteTokenPrice) * Number(quoteLiquidity)
  }, [officialPool, tokenData])

  if (!officialPool) return null

  return (
    <div className="p-2.5 border-[0.5px] border-[#25242b] rounded-sm grid grid-cols-3 gap-2.5 leading-none">
      <div className="gap-2 flex flex-col items-center">
        <div className="flex items-center gap-0.5">
          <span className="font-[330] text-[11px] text-[#605e68] leading-none">{t('detail.poolDetail.pool')}</span>
        </div>
        <div className="font-[380] text-[12px] text-white leading-none">{tokenData?.symbol}</div>
        <div className="font-[380] text-[12px] text-white leading-none">{officialPool?.quoteSymbol}</div>
      </div>
      <div className="gap-2 flex flex-col items-center">
        <div className="font-[330] text-[11px] text-[#605e68] leading-none">{t('detail.poolDetail.quantity')}</div>
        <div className="font-[380] text-[12px] text-white leading-none">
          {officialPool ? formatMoney(officialPool.baseTokenLiquidity, false) : '--'}
        </div>
        <div className="font-[380] text-[12px] text-white leading-none">
          {officialPool ? formatMoney(officialPool.quoteLiquidity, false) : '--'}
        </div>
      </div>
      <div className="gap-2 flex flex-col items-center">
        <div className="font-[330] text-[11px] text-[#605e68] leading-none">{t('detail.poolDetail.value')}</div>
        <div className="font-[380] text-[12px] text-white leading-none">{baseTokenValue ? formatMoney(baseTokenValue) : '--'}</div>
        <div className="font-[380] text-[12px] text-white leading-none">{quoteTokenInUsd ? formatMoney(quoteTokenInUsd) : '--'}</div>
      </div>
    </div>
  )
}

export default PoolStatistic
