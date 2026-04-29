import { formatPercentage } from '@/utils/helpers'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

const PositionHistory = () => {
  const { t } = useTranslation()

  const mockupData = [
    {
      id: 1,
      contract: 'BTCUSD',
      contractType: 'Perp',
      marginType: 'cross',
      leverage: '100',
      side: 'Short',
      createdAt: '2023-10-01T00:00:00Z',
      pnl: '-920.62',
      openInterest: '0.08638',
      positionValue: '90.67',
      entryPrice: '75000',
      fee: '10.34',
    },
    {
      id: 2,
      contract: 'BTCUSD',
      contractType: 'Perp',
      marginType: 'cross',
      leverage: '100',
      side: 'Long',
      createdAt: '2023-10-01T00:00:00Z',
      pnl: '12690.78',
      openInterest: '0.08638',
      positionValue: '90.67',
      entryPrice: '29975.74',
      fee: '-10.34',
    },
  ]

  const getPercentagePnl = (size: number, pnl: number) => {
    if (size === 0) return 0
    return (pnl / size) * 100
  }

  return (
    <div className="">
      {mockupData.map((item) => (
        <div
          key={item.id}
          className={`mt-2 rounded-[8px] bg-gradient-to-r border border-[#ECECED14] ${item.side === 'Long' ? 'from-[#00996C00] to-[#00FFB40F]' : 'from-[#67349900] to-[#AB57FF0D]'}`}
        >
          <div
            className={`flex justify-between items-center p-3 bg-gradient-to-r  ${item.side === 'Long' ? 'from-[#00FFB40F] to-[#00996C00]' : 'from-[#AB57FF0D] to-[#67349900]'}`}
          >
            <div className="flex gap-2 items-center">
              <LogoWithChain logo="" logoClassName="w-[28px] h-[28px]" name={item.contract} />
              <div>
                <div className="flex gap-1 items-center">
                  <div className="font-medium text-[14px] leading-none text-white whitespace-nowrap">
                    {item.contract} {item.contractType}
                  </div>
                  <div
                    className={`px-1 py-[2.5px] font-medium text-[10px] leading-none rounded-[2px] border border-[0.5px] ${
                      item.side === 'Long' ? 'border-[#00FFB4] text-[#00FFB4]' : 'border-[#AB57FF] text-[#AB57FF]'
                    }`}
                  >
                    {item.side === 'Long' ? t('position.long') : t('position.short')}
                  </div>
                  <div className="px-1 py-[2.5px] font-medium text-[10px] leading-none rounded-[2px] border border-[0.5px] border-[#00FFF6] text-[#00FFF6] bg-[#00FFF633] capitalize whitespace-nowrap">{`${item.marginType === 'cross' ? t('position.cross') : t('position.isolated')} ${item.leverage}x`}</div>
                </div>
                <div className="mt-1 font-normal text-[11px] leading-none text-white/50">
                  {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                </div>
              </div>
            </div>
            <img
              src="/images/icons/share.svg"
              alt="share"
              className="w-5 h-5 cursor-pointer hover:scale-[1.1]"
              onClick={(e) => {
                e.stopPropagation()
                console.log('Share icon clicked')
              }}
            />
          </div>
          <div className="flex justify-between items-center p-3 border-t border-[#ECECED14]">
            <div>
              <div className="font-normal text-[11px] leading-[12px] text-white/50">
                {t('position.realizedPnl')} (USDT)
              </div>
              <div
                className={`mt-1.5 font-semibold text-[15px] leading-none ${Number(item.pnl) >= 0 ? 'text-[#00FFB4] ' : 'text-[#AB57FF]'}`}
              >
                {item.pnl} ({formatPercentage(getPercentagePnl(Number(item.positionValue), Number(item.pnl)), true)})
              </div>
            </div>
            <div className="text-right">
              <div className="font-normal text-[11px] leading-[12px] text-white/50">
                {t('position.openInterest')} (BTC)
              </div>
              <div className="mt-1.5 font-semibold text-[15px] leading-none text-white">{item.openInterest}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 px-3 pb-3">
            <div>
              <div className="font-normal text-[11px] leading-[12px] text-white/50">{t('position.entryPrice')}</div>
              <div className="mt-1.5 font-semibold text-[15px] leading-none text-white">{item.entryPrice}</div>
            </div>
            <div className="text-center">
              <div className="font-normal text-[11px] leading-[12px] text-white/50">
                {t('assets.futures.positionValue')}
              </div>
              <div className="mt-1.5 font-semibold text-[15px] leading-none text-white">{item.positionValue}</div>
            </div>
            <div className="text-right">
              <div className="font-normal text-[11px] leading-[12px] text-white/50">{t('position.fee')} (USDT)</div>
              <div className="mt-1.5 font-semibold text-[15px] leading-none text-white">{item.fee}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PositionHistory
