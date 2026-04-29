import { formatAmount, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

type Props = {
  period: string
  data: any
  className?: string
  isPC?: boolean
}

const Distribution = ({ period, data, className, isPC = false }: Props) => {
  const { t } = useTranslation()

  const lvToLabel = (lv: number) => {
    switch (lv) {
      case 1:
        return '< -50%'
      case 2:
        return '0～ -50%'
      case 3:
        return '0～200%'
      case 4:
        return '200～500%'
      case 5:
        return '>500%'
      default:
        return 'Unknown'
    }
  }
  const lvToColor = (lv: number) => {
    switch (lv) {
      case 5:
        // return '#00FFB4'
        return '#21E09D'
      case 4:
        // return '#00DEA0'
        return '#21E09D'
      case 3:
        // return '#009F73'
        return '#21E09D'
      case 2:
        // return '#E14650'
        return '#EA3B4F'
      case 1:
        // return '#E14650'
        return '#EA3B4F'
      default:
        return '#ECECED1F'
    }
  }
  return (
    <div className={cn('mt-5', className)}>
      <div className="font-medium text-[16px] text-[#FBFBFB] leading-none before:content-[''] before:absolute before:top-[50%] before:translate-[-50%] before:left-[-10px] before:h-[12px] before:w-[2px] radius before:bg-[#00FFB4] before:rounded-tr-2xl before:rounded-br-2xl relative">
        {t('walletDetail.distribution.title', { period })}
      </div>
      <div
        className={cn(
          'flex items-center justify-between text-white/50 leading-none mt-5',
          isPC ? 'text-sm' : 'text-[11px]',
        )}
      >
        <div>{t('walletDetail.distribution.annualPercentageYield')}</div>
        <div>{t('walletDetail.distribution.amountPercentage')}</div>
      </div>
      <div className="mt-2">
        {data.map((item: any) => (
          <div
            key={item.lv}
            className={cn('flex items-center justify-center mt-[0px] mb-[2px]', isPC ? 'mt-[15px]' : 'mt-[2px]')}
          >
            <div
              className={cn('grow-0 w-[88px] text-[13px]  whitespace-nowrap', isPC ? 'text-[#908E98]' : 'text-white')}
            >
              {lvToLabel(item.lv)}
            </div>
            <div className="grow-1 h-[6px] bg-[#ECECED1F] rounded-[20px]">
              <div
                className="h-[6px] rounded-[20px] animate-in duration-500 ease-in-out w-0"
                style={{ width: `${Number(item.profitRate) * 100}%`, background: lvToColor(item.lv) }}
              ></div>
            </div>
            <div
              className={cn(
                'grow-0 w-[110px] text-right text-[13px] flex items-center justify-end ml-3',
                isPC ? 'text-[#908E98]' : 'text-white',
              )}
            >
              {formatAmount(item.tradedAmount)}
              <span
                className={cn(
                  'ml-[3px]',
                  Number(item.tradedAmount) && 'inline-block',
                  isPC ? 'text-[#79778C]' : 'text-white/80',
                )}
              >
                {Number(item.tradedAmount) ? `(${formatPercent(item.profitRate * 100)})` : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Distribution
