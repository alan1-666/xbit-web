import { useTranslation } from 'react-i18next'
import CustomTable from './CustomTable'
interface CommissionExplanationProps {
  currentLevel: number
}
const CommissionExplanation = ({ currentLevel }: CommissionExplanationProps) => {
  
  const { t } = useTranslation()
  const memeColumns = [
    { key: 'level', title: t('nodeAgent.level') },
    {
      key: 'tradingVolume',
      title: t('nodeAgent.tradingVolumeRequirements'),

    },
  ]
  
  const memeData = [
    { id: 1, level: "Lv1",  tradingVolume: '$0-$10,000'},
    { id: 2, level: "Lv2",  tradingVolume: '$10,000-$30,000' },
    { id: 3, level: "Lv3",  tradingVolume: '$30,000-$100,000' },
    { id: 4, level: "Lv4",  tradingVolume: '$100,000-$300,000' },
    { id: 5, level: "Lv5",  tradingVolume: '$300,000-$1M' },
  ]
  const futuresColumns = [
    { key: 'level', title: t('nodeAgent.level') },
    {
      key: 'tradingVolume',
      title: t('nodeAgent.tradingVolumeRequirements'),

    },
  ]
  
  const futuresData = [
    { id: 1, level: "Lv1",  tradingVolume: '$0-$900,000'},
    { id: 2, level: "Lv2",  tradingVolume: '$900,000-$2.7M' },
    { id: 3, level: "Lv3",  tradingVolume: '$2.7M-$9M' },
    { id: 4, level: "Lv4",  tradingVolume: '$9M-$27M' },
    { id: 5, level: "Lv5",  tradingVolume: '$27M-$90M' },
  ]

  return (
    <div className="mt-[24px]">
      {/* 推荐奖励说明 */}
      <div className="mb-6">
        <h3 className="text-white text-[18px] mb-2">{t('nodeAgent.whatIsTheRecommendReward')}</h3>
        <p className="text-[#FFFFFF70] text-[14px]">{t('nodeAgent.whatIsTheRecommendRewardDescription')}</p>
        <div className="text-[#FFFFFF70] text-[14px] leading-[22px]">
           {t('nodeAgent.whatIsTheRecommendRewardCalculation')}<br />
          1. {t('nodeAgent.whatIsTheRecommendRewardCalculation1')}<br />
          2. {t('nodeAgent.whatIsTheRecommendRewardCalculation2')}<br />
          3. {t('nodeAgent.whatIsTheRecommendRewardCalculation3')}<br />
          4. {t('nodeAgent.whatIsTheRecommendRewardCalculation4')}<br />
        </div>
      </div>
      {/* 层级结构图 */}
      <div className="mb-8 flex flex-col items-center relative">
        <img src="/images/nodeAgent/commission-structure.svg" alt="commission-structure" className="w-full h-auto" />
      </div>

      {/* Meme 交易量要求 */}
      <div className="mb-6">
        <h3 className="text-white text-[18px] mb-2">{t('nodeAgent.memeTransactionVolumeRequirements')}</h3>
        <CustomTable columns={memeColumns} data={memeData} currentLevel={currentLevel}  />
      </div>

      {/* 合约交易量要求 */}
      <div className="mb-6">
        <h3 className="text-white text-[18px] mb-2">{t('nodeAgent.futuresTransactionVolumeRequirements')}</h3>
        <CustomTable columns={futuresColumns} data={futuresData} currentLevel={currentLevel}/>
      </div>
      <div className="w-full mt-[40px] flex justify-center">
        <img src="/images/nodeAgent/footerLogin.svg" alt="line" className="w-[196px] h-[48px]" />
      </div>
    </div>
  )
}

export default CommissionExplanation
