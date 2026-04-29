import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { formatNumberWithCommas } from '@/utils/helpers'
import { useTranslation } from 'react-i18next'
interface DialogGradeProps {
  open: boolean
  setOpen: (value: boolean) => void
  currentLevel?: number
  invitationData?: {
    memeVolume?: number
    contractVolume?: number
  }
}

const DialogGrade = ({ open, setOpen, currentLevel = 1, invitationData }: DialogGradeProps) => {
  const [selectedLevel, setSelectedLevel] = useState(currentLevel)
  const { t } = useTranslation()
  // 等级数据
  const levels = [
    { id: 1, name: 'LV1',img: '/images/nodeAgent/LV1.svg',bg:"/images/nodeAgent/pc_bg_1.svg", commissionRate: 10, memeThreshold: "$0-$10,000", contractThreshold: "$0-$900,000" },
    { id: 2, name: 'LV2',img: '/images/nodeAgent/LV2.svg',bg:"/images/nodeAgent/pc_bg_2.svg", commissionRate: 20, memeThreshold: "$10,000-$30,000", contractThreshold: "$900,000-$2.7M" },
    { id: 3, name: 'LV3',img: '/images/nodeAgent/LV3.svg',bg:"/images/nodeAgent/pc_bg_3.svg", commissionRate: 30, memeThreshold: "$30,000-$100,000", contractThreshold: "$2.7M-$9M" },
    { id: 4, name: 'LV4',img: '/images/nodeAgent/LV4.svg',bg:"/images/nodeAgent/pc_bg_4.svg", commissionRate: 40, memeThreshold: "$100,000-$300,000", contractThreshold: "$9M-$27M" },
    { id: 5, name: 'LV5',img: '/images/nodeAgent/LV5.svg',bg:"/images/nodeAgent/pc_bg_5.svg", commissionRate: 50, memeThreshold: "$300,000-$1M", contractThreshold: "$27M-$90M" },
  ]

  useEffect(() => {
    if (currentLevel) {
      setSelectedLevel(currentLevel)
    }
  }, [currentLevel])

  const levelInfo = levels[selectedLevel - 1] || levels[0]
  const isCurrentLevel = selectedLevel === currentLevel
  // 如果当前等级 >= 选中等级，说明已达标（例如：当前等级是5，那么1-4都显示为已达标）
  const isQualified = currentLevel >= selectedLevel

  const handlePrevLevel = () => {
    if (selectedLevel > 1) {
      setSelectedLevel(selectedLevel - 1)
    }
  }

  const handleNextLevel = () => {
    if (selectedLevel < levels.length) {
      setSelectedLevel(selectedLevel + 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTitle></DialogTitle>
      <DialogContent
        className="p-0 w-full max-w-[512px] _hidescrollbar gap-0 flex flex-col bg-[#121214] rounded-[16px]"
        showDialogPrimitiveClose={false}
      >
        {/* Content */}
        <div className="relative p-6 flex flex-col gap-4" style={{backgroundImage: `url(${levelInfo.bg})`, backgroundSize: '', backgroundRepeat: 'no-repeat'}}>
          {/* 节点等级信息 */}
          <div className="relative flex items-start justify-between gap-6">
            {/* 左侧：返佣比例信息 */}
            <div className="flex-1 flex flex-col gap-[14px]">
              {/* 返佣比例标题和状态 */}
              <div className="flex items-center gap-2">
                <span className="text-[22px] font-semibold text-white">{t('nodeAgent.commissionRate')}</span>
                {isQualified ? (
                    <div className="bg-[rgba(0,255,180,0.1)] px-[11px] rounded-full">
                        <span className="text-[14px] font-medium text-[#00ffb4]">{t('nodeAgent.qualified')}</span>
                    </div>
                )
                : (
                    <div className="bg-[#461A1A] px-[11px] rounded-full">
                        <span className="text-[14px] font-medium text-[#E14650]">{t('nodeAgent.unqualified')}</span>
                    </div>
                )}
              </div>

              {/* 返佣比例数值 */}
              <div className="flex flex-col gap-[10px]">
                <div
                  className="text-[40px] font-bold leading-none"
                  style={{
                    background: 'linear-gradient(73.67deg, #01AC79 0%, #00E9A4 83.97%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {levelInfo.commissionRate}%
                </div>
                <p className="text-[14px] text-[#ffffff80] leading-[1.4]">

                    {isQualified ? t('nodeAgent.completeCurrentLevel') :  t('nodeAgent.upgradeToThisLevel')}
                </p>
              </div>
            </div>

            {/* 右侧：等级徽章 */}
            <div className="relative shrink-0">
              <div className="flex flex-col items-center">
                <div className="relative w-[138px] h-[138px]">
                  <img
                    src={`${levelInfo.img}`}
                    alt={levelInfo.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      // Fallback to default image if level image doesn't exist
                      e.currentTarget.src = '/images/nodeAgent/LV1.svg'
                    }}
                  />
                </div>
                <span className="text-[29px] font-semibold text-white text-center">{levelInfo.name}</span>
              </div>
              {/* 装饰图标 */}
              <div className="absolute top-[41px] left-0 w-[33px] h-[33px]">
                <img src="/images/nodeAgent/diamond.svg" alt="" className="w-full h-full" />
              </div>
              <div className="absolute top-[69px] right-[-0px] w-[21px] h-[21px] ">
                <img src="/images/nodeAgent/diamond2.svg" alt="" className="w-full h-full" />
              </div>
            </div>
          </div>

          {/* 节点等级条件 */}
          <div className="relative flex flex-col gap-8">
            {/* Meme 交易量要求 */}
            <div className="border border-[#ECECED14] rounded-[10px] p-[12px] flex flex-col gap-[17px]">
              <h3 className="text-[18px] font-medium text-white text-center">{t('nodeAgent.tabs.meme')}</h3>
              <div className="bg-[#ECECED0A] rounded-[10px] py-4 flex flex-col gap-3 items-center">
                <p className="text-[14px] text-[#ffffffB3]">{t('nodeAgent.teamTransactionVolume')}</p>
                <div className="flex items-center gap-1 text-[20px]">
                  <span className="font-semibold text-[#00ffb4]">
                    {invitationData?.memeVolume || 0}
                  </span>
                  <span className="font-normal text-[#ffffff80]">/</span>
                  <span className="font-semibold text-white">
                    {levelInfo.memeThreshold}
                  </span>
                </div>
              </div>
            </div>

            {/* "或" 连接符 */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#232329] border border-[#1b1b1d] px-3 py-2 rounded-full">
              <span className="text-[18px] font-medium text-[#00ffb4]">{t('nodeAgent.or')}</span>
            </div>

            {/* 合约交易量要求 */}
            <div className="border border-[#ECECED14] rounded-[10px] p-[12px] flex flex-col gap-[17px]">
              <h3 className="text-[18px] font-medium text-white text-center">{t('assets.futures.futures')}</h3>
              <div className="bg-[#ECECED0A] rounded-[10px] py-4 flex flex-col gap-3 items-center">
                <p className="text-[14px] text-[#ffffffB3]">{t('nodeAgent.teamTransactionVolume')}</p>
                <div className="flex items-center gap-1 text-[20px]">
                  <span className="font-semibold text-[#00ffb4]">
                    {invitationData?.contractVolume || 0}
                  </span>
                  <span className="font-normal text-[#ffffff80]">/</span>
                  <span className="font-semibold text-white">
                      {levelInfo.contractThreshold}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 分页指示器 */}
          <div className="flex gap-1 items-center justify-center mt-4">
            {levels.map((level, index) => (
              <div
                key={level.id}
                className={cn(
                  'rounded-full transition-all',
                  index === selectedLevel - 1
                    ? 'h-[4px] w-[13px] bg-gradient-to-r from-[#9035FF] to-[#EE69FF]'
                    : 'w-[4px] h-[4px] bg-[#ffffff5C]'
                )}
              />
            ))}
          </div>

          {/* 底部按钮 */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={handlePrevLevel}
              disabled={selectedLevel === 1}
              className={cn(
                'flex-1 h-[40px] rounded-full flex items-center justify-center text-[14px] font-medium transition-all',
                selectedLevel === 1
                  ? 'bg-[#1e1e1e] text-[#ffffff80] cursor-not-allowed'
                  : 'bg-[#1e1e1e] text-white hover:bg-[#2a2a2a]'
              )}
            >
              {t('nodeAgent.previousLevel')}
            </button>
            <button
              onClick={handleNextLevel}
              disabled={selectedLevel === levels.length}
              className={cn(
                'flex-1 h-[40px] rounded-full flex items-center justify-center text-[14px] font-medium transition-all',
                selectedLevel === levels.length
                  ? 'bg-[#1e1e1e] text-[#ffffff80] cursor-not-allowed'
                  : 'bg-[#fbfbfb] text-[#0a0a0a] hover:bg-[#ffffff]'
              )}
            >
              {t('nodeAgent.nextLevel')}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DialogGrade

