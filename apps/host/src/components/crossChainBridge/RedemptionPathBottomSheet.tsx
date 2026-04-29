import { useState } from 'react'
import BottomSheet from '@/components/common/BottomSheet'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { BLOCKCHAIN_NAMES, getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers.ts'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import MoneyFormatted from '@components/common/MoneyFormatted.tsx'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  routingSelected: string
  onSelectRouting: (routing: any) => void
}
const RedemptionPathBottomSheet = ({ open, setOpen, routingSelected, onSelectRouting }: Props) => {
  const { t } = useTranslation()

  const mockData = {
    token: 'TRUMP',
    chainId: 501424,
    address: '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN',
  }

  const mockRouting = [
    {
      key: '1',
      estimatedTime: '3',
      gasFee: '3.92',
      receiveAmount: '949.32',
    },
    {
      key: '2',
      estimatedTime: '5',
      gasFee: '4.12',
      receiveAmount: '949.32',
    },
    {
      key: '3',
      estimatedTime: '7',
      gasFee: '5.92',
      receiveAmount: '949.32',
    },
  ]

  return (
    <BottomSheet open={open} setOpen={setOpen} title={t('crossChainBridge.redemptionPath.title')}>
      {mockRouting.map((routing) => (
        <div
          key={routing.key}
          className={cn(
            'mt-3 relative px-[14px] py-4 bg-[#ECECED14] border-[0.5px] border-[#ECECED2E] rounded-lg cursor-pointer border-gradient style2 before:invisible hover:before:visible',
            routing.key === routingSelected &&
              'bg-gradient-to-tr from-[#E149F8]/10 via-[#9945FF]/10 to-[#00F3AB]/10 border-gradient style2 before:visible',
          )}
          onClick={() => {
            onSelectRouting(routing.key)
            setOpen(false)
          }}
        >
          {routing.key === routingSelected && (
            <img
              src="/images/icons/border-checked.svg?v=2"
              alt="check"
              className="absolute h-[14px] w-auto top-0 right-0"
            />
          )}
          <div className="flex items-center justify-between">
            <div className="flex item-center gap-2.5">
              <div className="flex items-center gap-0.5">
                <img src="/images/icons/clock.svg" alt="clock" className="w-4 h-4" />
                <span className="text-[11px] text-white">{routing.estimatedTime} mins</span>
              </div>
              <div className="flex items-center gap-0.5">
                <img src="/images/icons/gas.svg" alt="eth" className="w-4 h-4" />
                <span className="text-[11px] text-white">{routing.gasFee}</span>
              </div>
            </div>
            {routing.key === '1' && (
              <div className="flex items-center gap-1">
                <span className="bg-gradient-to-tr from-[#E843FE] via-[#ffffff] to-[#00FFCD] rounded-sm px-1.5 py-[3px] text-[10px] text-[#141414]">
                  {t('crossChainBridge.redemptionPath.optimal')}
                </span>
                <span className="bg-gradient-to-tr from-[#E149F8]/10 via-[#9945FF]/10 to-[#00F3AB]/10 border-gradient style2 before:visible rounded-sm px-1.5 py-[3px] text-[10px]">
                  {t('crossChainBridge.redemptionPath.fastest')}
                </span>
                <span className="bg-gradient-to-tr from-[#E149F8]/10 via-[#9945FF]/10 to-[#00F3AB]/10 border-gradient style2 before:visible rounded-sm px-1.5 py-[3px] text-[10px]">
                  {t('crossChainBridge.redemptionPath.lowestGasFee')}
                </span>
              </div>
            )}
          </div>
          <div className="mt-2.5 flex items-center gap-2.5">
            <LogoWithChain
              logo={getBlockChainLogo(mockData.chainId, mockData.address)}
              logoClassName="w-7 h-7"
              name={mockData.token}
              chainLogo={getBlockchainLogo2(mockData.chainId)}
              chainContainerClassName="w-3 h-3"
            />
            <MoneyFormatted value={routing.receiveAmount} showUnit={true} unit={mockData.token} />
          </div>
        </div>
      ))}
    </BottomSheet>
  )
}

export default RedemptionPathBottomSheet
