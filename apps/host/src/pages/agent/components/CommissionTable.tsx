import { useTranslation } from 'react-i18next'
import CustomTable from '@components/nodeAgent/CustomTable'
import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'
interface CommissionLevel {
  level: number
  requirement: string
  direct: string
  indirect: string
}

interface CommissionTableProps {
  currentLevel: number
}

const CommissionTable = ({ currentLevel }: CommissionTableProps) => {
  const {isDesktop} = useResponsive()
  const { t } = useTranslation()
  const columns = [
    { key: 'level', title: t('nodeAgent.commissionTable.agentLevel') },
    // { key: 'requirement', title: '等级要求' },
    {
      key: 'reward',
      title: t('nodeAgent.commissionTable.referralReward'),
      children: [
        { key: 'direct', title: t('nodeAgent.commissionTable.directFriend') },
        { key: 'indirect', title: t('nodeAgent.commissionTable.indirectFriend') },
        { key: 'extended', title: t('nodeAgent.commissionTable.extendedFriend') },
      ],
    },
  ]
  
  const data = [
    {id: 1, level: "Lv1",  direct: '10%', indirect: '3%', extended: '1%' },
    {id: 2, level: "Lv2",  direct: '20%', indirect: '4%', extended: '2%' },
    {id: 3, level: "Lv3",  direct: '30%', indirect: '5%', extended: '2.5%' },
    {id: 4, level: "Lv4",  direct: '40%', indirect: '6%', extended: '3%' },
    {id: 5, level: "Lv5",  direct: '50%', indirect: '7%', extended: '4%' },
  ]
  return (
    <div>
      <div className="mb-4">
      {!isDesktop && (
        <h2 className="text-title text-xl font-medium mb-2">
          {t('nodeAgent.commissionTable.title')}
        </h2>
        )}
        <p className={cn('text-title opacity-70 text-sm', isDesktop && 'mt-2')}>
          {t('nodeAgent.commissionTable.subtitle')}
        </p>
      </div>
      <CustomTable columns={columns} data={data} currentLevel={Number(currentLevel)} />
  
    </div>
  )
}

export default CommissionTable
