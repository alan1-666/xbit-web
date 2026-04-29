import PositionHistory from '@/components/assets/futures/PositionHistory'
import PositionHistoryV2 from '@/components/assets/futures/PositionHistoryV2'
import Text from '@/components/common/Text'
import SetupPositionModal from '@/components/position/SetupPositionModal'
import { formatMoney, formatNumber } from '@/utils/helpers'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { Button } from '@components/ui/button.tsx'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

const FuturesPositionPage = () => {
  const { t } = useTranslation()
  const { id } = useParams()
  const [openSetupModal, setOpenSetupModal] = useState(false)
  const [modalType, setModalType] = useState<'TPSL' | 'CLOSE'>('TPSL')

  const mockData = {
    id: 1,
    contract: 'BTC',
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
      label: t('position.liquidationPrice'),
      value: mockData.leverage + 'x',
      className: 'text-[#00FFB4]',
    },
    {
      label: t('position.margin'),
      value: formatNumber(mockData.margin) + ' USDC',
    },
    {
      label: t('position.fundingRate'),
      value: formatMoney(Number(mockData.funding)),
      className: Number(mockData.funding) >= 0 ? 'text-[#00FFB4]' : 'text-[#AB57FF]',
    },
  ]

  return (
    <div className="py-3 relative bg-[#121214]">
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
              <div className="flex items-end gap-1">
                <Text
                  text={mockData.contract}
                  fontSize={15}
                  fontWeight="medium"
                  className="leading-[calc(1rem*(15/16))]"
                />
                <Text
                  text="/"
                  fontSize={12}
                  fontWeight="light"
                  color="#FFFFFF80"
                  className="leading-[calc(1rem*(12/16))]"
                />
                <Text
                  text={'USDC'}
                  fontSize={13}
                  fontWeight="light"
                  color="#FFFFFF80"
                  className="leading-[calc(1rem*(11/16))]"
                />
                <span className="bg-[#132571] rounded-[2px] px-1 color-[#7492FF] text-[10px] pb-[3px] leading-[calc(1rem*(11/16))] text-[#7492FF]">
                  {mockData.contractType}
                </span>
              </div>
              <div
                className={`mt-1 font-medium text-[12px] leading-none ${Number(realtimeMockup.price24hChange) >= 0 ? 'text-[#00CE89]' : 'text-[#AB57FF]'}`}
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

        <div className="mt-3 flex flex-col gap-2">
          <Text
            text={t('position.title')}
            fontSize={15}
            fontWeight="medium"
            className="leading-[calc(1rem*(15/16))] text-white"
          />
          <div className="flex flex-row gap-1 items-end">
            <Text
              text={formatNumber(mockData.quantity)}
              fontSize={32}
              fontWeight="semibold"
              className="leading-[calc(1rem*(32/16))] text-white"
            />
            <Text
              text={formatMoney(Number(mockData.quantity) * Number(realtimeMockup.price))}
              fontSize={14}
              fontWeight="regular"
              color="#FFFFFFB2"
            />
          </div>

          <div className="flex gap-[6px] items-center mt-1">
            <div
              className={`px-1 py-[2.5px] font-medium text-[11px] rounded-[2px] border-[0.5px] leading-[calc(1rem*(11/16))] pb-[5px] ${
                mockData.side === 'Long' ? 'border-[#00FFB4] text-[#00FFB4]' : 'border-[#AB57FF] text-[#AB57FF]'
              }`}
            >
              {mockData.side === 'Long' ? t('position.long') : t('position.short')}
            </div>
            <div className="px-1 py-[2.5px] font-medium text-[11px] rounded-[2px] border-[0.5px] leading-[calc(1rem*(11/16))] pb-[5px] border-white/50 text-white/50 capitalize">{`${mockData.marginType === 'cross' ? t('position.cross') : t('position.isolated')} ${mockData.leverage}x`}</div>
            <div className=" text-[12px] leading-[calc(1rem*(12/16))] text-white/70 mb-0.5 font-[400]">
              {dayjs(mockData.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {mapData.map((item, index) => (
            <div key={index} className="bg-[#ECECED14] rounded-[8px] px-[14px] py-3">
              <div className="text-[13px] leading-none text-white/70">{item.label}</div>
              <div
                className={`mt-2 font-medium text-[14px] leading-none ${item.className ? item.className : 'text-white'}`}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>


        <div className="mt-3">
          <div className="flex items-center gap-2">
            <div className="w-[2px] h-[12px] bg-[#00FFB4] rounded-r-[2px]" />
            <Text text={t('assets.futures.positionHistory')} fontSize={16} fontWeight="medium" className="leading-[calc(1rem*(16/16))] text-white" />
          </div>
          <PositionHistoryV2 />
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 max-w-[768px] mx-auto px-3 py-4 items-center justify-between gap-2 bg-[#13191a] ">
        <Button
          variant="gradient"
          className="rounded-full flex-1 h-11 text-black w-full"
          onClick={() => {
            setModalType('CLOSE')
            setOpenSetupModal(true)
          }}
        >
          {t('bottomNav.trading')}
        </Button>
      </div>
      {/* <SetupPositionModal open={openSetupModal} setOpen={setOpenSetupModal} modalType={modalType} position={mockData} /> */}
    </div>
  )
}

export default FuturesPositionPage
