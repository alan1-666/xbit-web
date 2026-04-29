import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { Button } from '@components/ui/button.tsx'
import { formatNumber, formatMoney } from '@/utils/helpers'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import SetupPositionModal from '@/components/position/SetupPositionModal'
import PositionHistory from '@/components/assets/futures/PositionHistory'

const PositionPage = () => {
  const { t } = useTranslation()
  const { id } = useParams()
  const [openSetupModal, setOpenSetupModal] = useState(false)
  const [modalType, setModalType] = useState<'TPSL' | 'CLOSE'>('TPSL')

  const mockData = {
    id: 1,
    contract: 'BTCUSD',
    contractType: 'Perpetual',
    marginType: 'cross',
    quantity: '123.45',
    unit: 'BTC',
    createdAt: '2023-10-01T12:00:00Z',
    leverage: '20',
    side: 'Long',
    entryPrice: '26700.00',
    markPrice: '26800.00',
    tpPrice: '27000.00',
    slPrice: '26000.00',
    margin: '23.23',
    funding: '-10.34',
  }

  const realtimeMockup = {
    price: '26800.00',
    price24hChange: '0.5',
  }

  const mapData = [
    {
      label: t('position.pnl'),
      value:
        formatNumber(Number(mockData.quantity) * (Number(realtimeMockup.price) - Number(mockData.entryPrice))) +
        ' USDC',
    },
    {
      label: t('position.quantity') + ' (' + mockData.unit + ')',
      value: formatNumber(mockData.quantity) + ' ' + mockData.unit,
    },
    {
      label: t('position.value'),
      value: formatMoney(Number(mockData.quantity) * Number(realtimeMockup.price)),
    },
    {
      label: t('position.entryPrice'),
      value: formatNumber(mockData.entryPrice) + ' USDC',
    },
    {
      label: t('position.markPrice'),
      value: formatNumber(mockData.markPrice) + ' USDC',
    },
    {
      label: t('position.leverage'),
      value: mockData.leverage + 'x',
      className: 'text-[#00FFB4]',
    },
    {
      label: t('position.margin'),
      value: formatNumber(mockData.margin) + ' USDC',
    },
    {
      label: t('position.funding'),
      value: formatNumber(mockData.funding),
      className: Number(mockData.funding) >= 0 ? 'text-[#00FFB4]' : 'text-[#AB57FF]',
    },
  ]

  return (
    <div className="py-3 relative">
      <div className="px-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center">
              <img
                src="/images/icons/arrow-left.svg"
                className="w-6 h-6 cursor-pointer"
                alt="arrow-left"
                onClick={() => {
                  window.history.back()
                }}
              />
              <LogoWithChain logo="" logoClassName="w-[32px] h-[32px]" name={mockData.contract} />
            </div>
            <div>
              <div className="font-[380] text-[18px] text-white leading-none">
                {mockData.contract}{' '}
                <span className="bg-[#132571] rounded-[2px] px-1 py-0.5 color-[#7492FF] text-[10px]">
                  {mockData.contractType}
                </span>
              </div>
              <div
                className={`mt-1 font-medium text-[12px] leading-non ${Number(realtimeMockup.price24hChange) >= 0 ? 'text-[#00CE89]' : 'text-[#AB57FF]'}`}
              >
                {formatNumber(realtimeMockup.price)}{' '}
                <span>
                  {Number(realtimeMockup.price24hChange) >= 0 ? '+' : '-'} {realtimeMockup.price24hChange}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-[14px]">
            <img
              src="/images/futuresDetail/candle-icon.svg"
              className="cursor-pointer h-5 w-5 transition-all duration-100 hover:scale-[1.1]"
              alt="icon candle"
            />
            <img
              src="/images/futuresDetail/share-icon.svg"
              className="cursor-pointer h-5 w-5 transition-all duration-100 hover:scale-[1.1]"
              alt="icon share"
            />
          </div>
        </div>
        <div className="mt-5">
          <div className="font-normal font-[15px] leading-none text-white">{t('position.title')}</div>
          <div className="mt-3 font-bold text-[32px] leading-none text-white">{formatNumber(mockData.quantity)}</div>
          <div className="mt-3 font-normal text-[14px] leading-none text-white/70">
            {formatMoney(Number(mockData.quantity) * Number(realtimeMockup.price))}
          </div>
          <div className="mt-4 flex gap-[6px] items-center">
            <div
              className={`px-1 py-[2.5px] font-medium text-[11px] leading-none rounded-[2px] border border-[0.5px] ${
                mockData.side === 'Long' ? 'border-[#00FFB4] text-[#00FFB4]' : 'border-[#AB57FF] text-[#AB57FF]'
              }`}
            >
              {mockData.side === 'Long' ? t('position.long') : t('position.short')}
            </div>
            <div className="px-1 py-[2.5px] font-medium text-[11px] leading-none rounded-[2px] border border-[0.5px] border-white/50 text-white/50 capitalize">{`${mockData.marginType === 'cross' ? t('position.cross') : t('position.isolated')} ${mockData.leverage}x`}</div>
            <div className="font-medium text-[12px] leading-none text-white/70">
              {dayjs(mockData.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          {mapData.map((item, index) => (
            <div key={index} className="bg-[#24292a] rounded-[8px] px-[14px] py-3">
              <div className="text-[13px] leading-none text-white/70">{item.label}</div>
              <div
                className={`mt-2 font-medium text-[14px] leading-none ${item.className ? item.className : 'text-white'}`}
              >
                {item.value}
              </div>
            </div>
          ))}
          {(mockData.tpPrice || mockData.slPrice) && (
            <div className="bg-[#24292a] rounded-[8px] px-[14px] py-3">
              <div className="text-[13px] leading-none text-white/70 flex items-center gap-0.5">
                <span>
                  {t('position.takeProfit')}/{t('position.stopLoss')}
                </span>
                <img
                  src="/images/futuresDetail/edit-icon.svg"
                  className="cursor-pointer h-3 w-3 transition-all duration-100 hover:scale-[1.1]"
                  onClick={() => {
                    setModalType('TPSL')
                    setOpenSetupModal(true)
                  }}
                  alt="edit"
                />
              </div>
              <div className="mt-2 font-medium text-[14px] leading-none">
                <span className="text-[#00FFB4]">{formatNumber(mockData.tpPrice)}</span>/
                <span className="text-[#AB57FF]">{formatNumber(mockData.slPrice)}</span>
              </div>
            </div>
          )}
        </div>
        <div className="mt-3">
          <div className="font-normal font-[15px] leading-none text-white">{t('assets.futures.positionHistory')}</div>
          <PositionHistory />
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 max-w-[768px] mx-auto px-3 py-4 grid grid-cols-2 items-center justify-between gap-2 bg-[#13191a]">
        <Button
          variant="borderGradient"
          className="rounded-full flex-1 h-11"
          onClick={() => {
            setModalType('TPSL')
            setOpenSetupModal(true)
          }}
        >
          {t('position.setupTPSL')}
        </Button>
        <Button
          variant="gradient"
          className="rounded-full flex-1 h-11 text-black"
          onClick={() => {
            setModalType('CLOSE')
            setOpenSetupModal(true)
          }}
        >
          {t('position.closePosition')}
        </Button>
      </div>
      <SetupPositionModal open={openSetupModal} setOpen={setOpenSetupModal} modalType={modalType} position={mockData} />
    </div>
  )
}

export default PositionPage
