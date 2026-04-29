import { useTranslation } from 'react-i18next'
import CustomTable from '@/components/nodeAgent/CustomTable'
import { ReactNode, useState, useEffect } from 'react'
import { useTradeRewards } from '../hooks/useTradeRewards'

interface TierBenefitsTableProps {
  currentLevel?: number
}


const TierBenefitsTable = ({ currentLevel }: TierBenefitsTableProps) => {
  const { t } = useTranslation()
  const [tierBenefits, setTierBenefits] = useState<any>([])
  const { getTierBenefits } = useTradeRewards()

  useEffect(() => {
    getTierBenefitsData()
  }, [])
  const getTierBenefitsData = async () => {
    const data:any = await getTierBenefits()
    const newData = data?.data.map((item: any) => ({
      id: Number( item.id),
      level: `Lv${item.tierLevel}`,
      futureCashbackPercentage: item.futureCashbackPercentage + '%',
      cashbackPercentage: item.cashbackPercentage + '%',
    }))

    setTierBenefits(newData || [])
  }
  const columns = [
    { key: 'level', title: t('Activityrewards.TierBenefits.level') },
    {
      title: t('Activityrewards.TierBenefits.cashback'),
      children: [
        { key: 'futureCashbackPercentage', title: t('futuresDetails.common.futures') },
        { key: 'cashbackPercentage', title: t('header.meme') },
      ],
      key: 'cashback',
    },
  ]

  const labelContent = () => {
    return (
      <div
        className="absolute left-[-15px] top-[-14px] z-10 h-[18px] px-[5px]"
        style={{
          backgroundImage: 'url(/images/nodeAgent/level.png)',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="text-black text-[10px] whitespace-nowrap">
          {t('Activityrewards.currentLevel')}
        </div>
      </div>
    )
  }

  // 自定义单元格渲染函数
  const renderCell = (col: any, row: any, _isCurrent: boolean, _colIndex: number): ReactNode => {
    // Futures列：显示动态值
    if (col.key === 'futureCashbackPercentage') {
      return (
        <div className="relative w-full">
          {row[col.key]}
          {_isCurrent && labelContent()}
        </div>
      )
    }
    // meme列：显示动态值，如果值为50%，显示当前等级标签
    if (col.key === 'cashbackPercentage') {
      const isFiftyPercent = row[col.key] === '50%' || String(row[col.key]).trim() === '50%'
      return (
        <div className="relative w-full">
          {row[col.key]}
          {isFiftyPercent && labelContent()}
        </div>
      )
    }
    // 其他列正常显示
    return row[col.key]
  }

  return (
    <CustomTable
      columns={columns}
      data={tierBenefits}
      currentLevel={currentLevel}
      renderCell={renderCell}
      showCurrentLevelBadge={false}
    />
  )
}

export default TierBenefitsTable

