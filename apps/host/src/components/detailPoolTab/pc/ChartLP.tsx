import { formatVolume } from '@/lib/format'
import { ChainIds } from '@/types/enums.ts'
import { Loader } from '@components/common/MoneyFormatted.tsx'
import LiquidityChart from '@components/detailPoolTab/LiquidityChart.tsx'
import PoolLiqTableChartPc from '@components/detailPoolTab/pc/PoolLiqTableChartPc.tsx'
import { Dialog, DialogContent } from '@components/ui/dialog.tsx'
import useGetLiquidityPool from '@hooks/useGetLiquidityPool.ts'
import { useGetPoolTxInfo } from '@hooks/useGetPoolTxInfo.ts'
import { useHourlyTrigger } from '@hooks/useHourlyTrigger.ts'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface LiquidityChartDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  liquidity?: number
  numberOfPools?: number
  token: string
  chainId: ChainIds
}

const ChartLP = ({
  isOpen,
  onOpenChange,
  liquidity: _liquidity = 0,
  numberOfPools: _numberOfPools = 0,
  token,
  chainId,
}: LiquidityChartDrawerProps) => {
  const { t } = useTranslation()

  const { data: liquidityData, loading } = useGetPoolTxInfo({ token, chainId })
  const { data, refetch } = useGetLiquidityPool({ pageSize: 48, page: 1, token, chainId })

  useHourlyTrigger(() => {
    refetch().catch(console.error)
  })

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showDialogPrimitiveClose={false} className="min-w-[550px]">
        <div className={'flex items-center justify-between'}>
          <span className="flex items-center gap-1 select-none text-[14px] leading-[1] font-light">
            {t('detail.pool.totalLiquidity')}:{' '}
            <span className="text-white/60 font-medium">
              {loading ? (
                <Loader />
              ) : (
                formatVolume(liquidityData?.liquidity, {
                  showCurrency: true,
                })
              )}
            </span>
          </span>
          <X className="cursor-pointer" onClick={() => onOpenChange(false)} />
        </div>
        <div className="min-w-[450px] min-h-[330px]">
          <LiquidityChart data={data?.getLiquidityChart ?? []} className={'!bg-transparent'} />
          <div className="h-[1px] bg-[#343339] mb-4"></div>
          <span className="flex items-center gap-1 select-none rounded px-1 text-[14px] leading-[1] font-light">
            {t('detail.pool.poolCount')}:{' '}
            <span className="text-white/60 font-medium">
              {loading ? <Loader /> : Number(liquidityData?.numberOfPools) < 100 ? liquidityData?.numberOfPools : '99+'}
            </span>
          </span>
          <div className="mt-4">
            <PoolLiqTableChartPc token={token} chainId={chainId} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ChartLP
