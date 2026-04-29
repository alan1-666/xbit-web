import { useTranslation } from 'react-i18next'
import { UITab } from '@/types/uiTabs.ts'
import PoolViewType from '@components/detailPoolTab/pc/PoolViewType.tsx'
import { useState } from 'react'
import { ChainIds } from '@/types/enums.ts'
import LiquidityChartPc from '@components/detailPoolTab/pc/LiquidityChartPc.tsx'
import PoolInfo from '@components/detailPoolTab/pc/PoolInfo.tsx'
import PoolLiqTablePc from '@components/detailPoolTab/pc/PoolLiqTablePc.tsx'
import PcLPChangeTable from '@components/detailPoolTab/pc/PcLPChangeTable.tsx'

type Props = {
  token?: string
  chainId?: number
  icon?: string
  symbol?: string
  liquidity?: number
  isLaunchpad?: boolean
}

const DetailPoolTabPc = (props: Props) => {
  const { t } = useTranslation()
  const { chainId, icon, symbol, token, liquidity, isLaunchpad } = props

  const poolPcTabs: UITab[] = [
    {
      label: t('detail.pool.liquidityChange'),
      value: 'liquidityChange',
    },
    {
      label: t('detail.pool.liquidityPool'),
      value: 'liquidityPool',
    },
  ]
  const [activeTab, setActiveTab] = useState<UITab>(poolPcTabs[0])

  const handleRenderContent = () => {
    if (activeTab.value === poolPcTabs[0].value) {
      return (
        <PcLPChangeTable
          token={token ?? ''}
          chainId={chainId ?? ChainIds.Solana}
          icon={icon}
          symbol={symbol}
          isLaunchpad={isLaunchpad}
        />
      )
    }
    return <PoolLiqTablePc token={token ?? ''} chainId={chainId ?? ChainIds.Solana} />
  }

  return (
    <div className="py-3">
      <div className="flex px-4 items-center justify-between">
        <div className="flex items-center gap-5">
          <PoolViewType activeTab={activeTab} tabs={poolPcTabs} setActiveTab={setActiveTab} />
          <PoolInfo token={token ?? ''} chainId={chainId ?? ChainIds.Solana} liquidityPool={liquidity} />
        </div>

        <LiquidityChartPc token={token} chainId={chainId} />
      </div>
      <div className="mt-3 h-full">{handleRenderContent()}</div>
    </div>
  )
}

export default DetailPoolTabPc
