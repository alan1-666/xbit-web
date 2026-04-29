import { X } from 'lucide-react'
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from '@components/ui/dialog.tsx'
import { ReactComponent as EntranceIcon } from '@/components/icon/smart-money/entrance.svg'
import { ReactComponent as PositionIcon } from '@/components/icon/smart-money/position.svg' // 用作“出场策略”也行，或换一个 exit icon
import { ReactComponent as StopLossIcon } from '@/components/icon/smart-money/stop_loss.svg'
import { ReactComponent as StopProfitIcon } from '@/components/icon/smart-money/stop_profit.svg'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { cn } from '@/lib/utils'
import type { SmartMoneyDeepAnalysisResp } from '@/hooks/useSmartMoneyDeepAnalysis'
import { Loading } from '@components/common/Loading.tsx'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import { useResponsive } from '@/hooks/useResponsive'

export const StrategyCard = ({
  title,
  points,
  color,
  icon,
}: {
  title: string
  points: string[]
  color: 'blue' | 'purple' | 'red' | 'green'
  icon: React.ReactNode
}) => {
  const { isDesktop } = useResponsive()
  
  const { t } = useTranslation()
  const dotColorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-400',
    red: 'bg-red-500',
    green: 'bg-green-400',
  }

  return (
    <div className={cn('h-full flex flex-col p-4 rounded-md bg-gradient-to-b', isDesktop ? 'from-[#17171B] to-[#23232A]' : 'bg-[#2B2B33]')}>
      <h3 className="flex items-center text-base text-[#FBFBFB] font-normal mb-4">
        <span className="mr-2.5">{icon}</span>
        <span>{title}</span>
      </h3>

      <div className="flex-1">
        {points?.length ? (
          <ul className="space-y-2 text-sm text-[#908E9A] leading-6">
            {points.map((text, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="flex items-center justify-center pt-2">
                  <span className={`w-2 h-2 rounded-full ${dotColorMap[color]}`} />
                </span>
                <span className="whitespace-pre-line">{text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-white/40">{t('smartMoney.addressDetail.noStrategy')}</div>
        )}
      </div>
    </div>
  )
}

export const AIDialog = ({
  open,
  data,
  loading,
  error,
  onOpenChange,
}: {
  open: boolean
  data?: SmartMoneyDeepAnalysisResp
  loading: boolean
  error: any
  onOpenChange: (open: boolean) => void
}) => {
  const { t } = useTranslation()
  const analyzedAt = data?.data?.analyzed_at

  const entry = data?.data?.entry_strategy ?? []
  const exit = data?.data?.exit_strategy ?? []
  const stopLoss = data?.data?.stop_loss_strategy ?? []
  const takeProfit = data?.data?.take_profit_strategy ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* <DialogTrigger asChild>
        <Button variant="outline">查看 AI 策略解析</Button>
      </DialogTrigger> */}

      <DialogContent
        showDialogPrimitiveClose={false}
        className={cn(
          'max-w-[900px]',
          'max-h-[75vh]',
          'bg-[#212129]',
          'text-[#FBFBFB]',
          'p-6',
          'rounded-lg',
          'flex flex-col'
        )}
        overlayClassName="bg-black/80 backdrop-blur-md"
      >
        {/* 标题 */}
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(121, 119, 144, 0.16)] shrink-0">
          <div>
            <DialogTitle className="text-lg text-[#FBFBFB] font-medium">{t('smartMoney.addressDetail.AIInDepthStrategy')}</DialogTitle>
            {analyzedAt ? (
              <div className="mt-1 text-xs text-white/40">
                {t('smartMoney.ai.analysisTime')}：{dayjs(analyzedAt).format('YYYY-MM-DD HH:mm:ss')}
              </div>
            ) : null}
          </div>

          <DialogClose asChild>
            <button className="text-[#878787] hover:text-white transition">
              <X className="w-6 h-6" />
            </button>
          </DialogClose>
        </div>

        {/* loading / error */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="h-full w-full grid place-items-center">
              <Loading className="size-20" />
            </div>
          ) : error ? (
            <div className="text-center mt-4 px-8">
              <EmptyList emptyText={t('smartMoney.ai.analysisError')} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 items-stretch">
              <StrategyCard title={t('smartMoney.ai.entryStrategy')} icon={<EntranceIcon className="w-8 h-8" />} color="blue" points={entry} />
              <StrategyCard title={t('smartMoney.ai.exitStrategy')} icon={<PositionIcon className="w-8 h-8" />} color="purple" points={exit} />
              <StrategyCard title={t('smartMoney.ai.stopLossStrategy')} icon={<StopLossIcon className="w-8 h-8" />} color="red" points={stopLoss} />
              <StrategyCard title={t('smartMoney.ai.takeProfitStrategy')} icon={<StopProfitIcon className="w-8 h-8" />} color="green" points={takeProfit} />
            </div>
          )}
        </div>


        {/* 免责声明 */}
        <div className="p-4 mt-4 border border-[rgba(121, 119, 144, 0.16)] rounded-md">
          <p className="text-[#FAFAFA] text-sm mb-2.5">{t('smartMoney.ai.disclaimer.name')}</p>
          <p className="text-xs text-[#908E9A]">
            {t('smartMoney.ai.disclaimer.text')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
