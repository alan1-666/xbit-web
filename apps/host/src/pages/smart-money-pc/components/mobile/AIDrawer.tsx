import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { SmartButton } from '../SmartButton'
import { ReactComponent as RightArrowIcon } from '@/components/icon/smart-money/right_arrow.svg'
import { ReactComponent as EntranceIcon } from '@/components/icon/smart-money/entrance.svg'
import { ReactComponent as PositionIcon } from '@/components/icon/smart-money/position.svg' // 用作“出场策略”也行，或换一个 exit icon
import { ReactComponent as StopLossIcon } from '@/components/icon/smart-money/stop_loss.svg'
import { ReactComponent as StopProfitIcon } from '@/components/icon/smart-money/stop_profit.svg'
import { useMemo, useState } from 'react'
import useSWRMutation from 'swr/mutation'
import { fetchSmartMoneyAnalysis } from '../../Api/api'
import { useLangKey } from '@/utils/address'
import { useSmartMoneyDeepAnalysis } from '@/hooks/useSmartMoneyDeepAnalysis'
import { Loading } from '@/components/common/Loading'
import { EmptyList } from '@/components/discover/EmptyList'
import { StrategyCard } from '../AIDialog'
import { useTranslation } from 'react-i18next'

type AIDrawerProp = {
  address: string
}

const AIDrawer = ({ address }: AIDrawerProp) => {
  const { t } = useTranslation()
  const lang = useLangKey()

  const [open, setOpen] = useState(false)

  const { trigger } = useSWRMutation('/api/v1/smart-money/analyze', fetchSmartMoneyAnalysis)

  const { data, error, isLoading } = useSmartMoneyDeepAnalysis({
    address,
    analysisDays: 7,
    language: lang,
    enabled: open && !!address,
  })

  const entry = useMemo(() => data?.data?.entry_strategy ?? [], [data])
  const exit = useMemo(() => data?.data?.exit_strategy ?? [], [data])
  const stopLoss = useMemo(() => data?.data?.stop_loss_strategy ?? [], [data])
  const takeProfit = useMemo(() => data?.data?.take_profit_strategy ?? [], [data])

  const onAIBtnClick = () => {
    if (!address) return
    trigger(address)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <SmartButton rightIcon={<RightArrowIcon className="h-4 w-4" />} onClick={() => onAIBtnClick()}>
          {t('smartMoney.addressDetail.AIInDepthStrategy')}
        </SmartButton>
      </DrawerTrigger>
      <DrawerContent className="w-full max-w-[768px] max-h-[80vh] bg-[#212127] mx-auto">
        <DrawerHeader className="py-5 px-3.5 flex w-full items-center justify-between">
          <DrawerTitle className="flex items-center">
            <div className="text-[calc(1rem*(18/16))] leading-[calc(1rem*(18/16))]">{t('smartMoney.addressDetail.AIInDepthStrategy')}</div>
          </DrawerTitle>
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt="close"
          />
        </DrawerHeader>
        <div className="w-full flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="h-full w-full grid place-items-center">
              <Loading className="size-20" />
            </div>
          ) : error ? (
            <div className="text-center mt-4">
              <EmptyList emptyText="Analysis failed. Please try again later..." />
            </div>
          ) : (
            <div className="self-stretch w-full px-3 inline-flex flex-col justify-start items-start gap-2.5">
              <div className="self-stretch p-3 bg-[#2B2B33] rounded-lg flex flex-col justify-start items-start gap-3 overflow-hidden">
                <StrategyCard title={t('smartMoney.ai.entryStrategy')} icon={<EntranceIcon className="w-8 h-8" />} color="blue" points={entry} />
              </div>
              <div className="self-stretch w-full p-3 bg-[#2B2B33] rounded-lg flex flex-col justify-start items-start gap-3 overflow-hidden">
                <StrategyCard title={t('smartMoney.ai.exitStrategy')} icon={<PositionIcon className="w-8 h-8" />} color="purple" points={exit} />
              </div>
              <div className="self-stretch w-full p-3 bg-[#2B2B33] rounded-lg flex flex-col justify-start items-start gap-3 overflow-hidden">
                <StrategyCard title={t('smartMoney.ai.stopLossStrategy')} icon={<StopLossIcon className="w-8 h-8" />} color="red" points={stopLoss} />
              </div>
              <div className="self-stretch w-full p-3 bg-[#2B2B33] rounded-lg flex flex-col justify-start items-start gap-3 overflow-hidden">
                <StrategyCard title={t('smartMoney.ai.takeProfitStrategy')} icon={<StopProfitIcon className="w-8 h-8" />} color="green" points={takeProfit} />
              </div>
            </div>
          )}

          <div className="p-4 mt-4 border border-[rgba(121, 119, 144, 0.16)] rounded-md">
            <p className="text-[#FAFAFA] text-sm mb-2.5">{t('smartMoney.ai.disclaimer.name')}</p>
            <p className="text-xs text-[#908E9A]">
              {t('smartMoney.ai.disclaimer.text')}
            </p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default AIDrawer
