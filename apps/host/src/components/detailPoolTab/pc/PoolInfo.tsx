import { useTranslation } from 'react-i18next'
import { Loader } from '@components/common/MoneyFormatted.tsx'
import { useGetPoolTxInfo } from '@hooks/useGetPoolTxInfo.ts'
import { formatVolume } from '@/lib/format'
import { useContext } from 'react'
import { MemeTokenDetailContext } from '@/contexts/meme/detail/MemeTokenDetailContext.ts'

type PoolInfoProps = {
  token: string
  chainId: number
  liquidityPool?: number
}

const PoolInfo = ({ token, chainId, liquidityPool }: PoolInfoProps) => {
  const { t } = useTranslation()
  const { data, loading } = useGetPoolTxInfo({
    token,
    chainId,
  })
  const { liquidity } = useContext(MemeTokenDetailContext)

  const realtimeLiquidity = liquidity ? liquidity : liquidityPool

  return (
    <div className=" flex gap-3">
      <span className="flex items-center gap-1 select-none text-[14px] leading-[1] font-light">
        {t('detail.pool.totalLiquidity')}:{' '}
        <span className="text-white/60 font-medium">
          {loading ? (
            <Loader />
          ) : (
            formatVolume(realtimeLiquidity, {
              showCurrency: true,
            })
          )}
        </span>
      </span>
      <span className="flex items-center gap-1 select-none rounded px-1 text-[14px] leading-[1] font-light">
        {t('detail.pool.poolCount')}:{' '}
        <span className="text-white/60 font-medium">
          {loading ? <Loader /> : Number(data?.numberOfPools) < 100 ? data?.numberOfPools : '99+'}
        </span>
      </span>
    </div>
  )
}

export default PoolInfo
