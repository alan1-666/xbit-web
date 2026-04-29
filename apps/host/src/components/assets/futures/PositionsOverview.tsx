import { Skeleton } from '@/components/ui/skeleton' // Import Skeleton component
import MoneyFormatted from '@components/common/MoneyFormatted.tsx'
import { useTranslation } from 'react-i18next'
import { formatMoney, formatPercentage } from '@/utils/helpers'
import { EnhancedOverviewData } from './Futures'
import AppDrawer from '@components/common/AppDrawer'
import { Button } from '@components/ui/button'
import { useState } from 'react'
const PositionsOverview = ({
  data,
  isLoading = false,
}: {
  data: EnhancedOverviewData | undefined
  isLoading?: boolean
}) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const handleOpenDrawer = (key: string) => {
    setOpen(true)
    switch (key) {
      case '1':
        setTitle(t('assets.futures.availableForWithdraw'))
        setContent(t('assets.futures.availableForWithdrawContent'))
        break
      case '2':
        setTitle(t('assets.futures.leverage'))
        setContent(t('assets.futures.leverageContent'))
        break
      case '3':
        setTitle(t('assets.futures.crossMarginRatio'))
        setContent(t('assets.futures.crossMarginRatioContent'))
        break
      case '4':
        setTitle(t('assets.futures.maintenanceMargin'))
        setContent(t('assets.futures.maintenanceMarginContent'))
        break
    }
  }
  // Render skeleton loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 ">
        {/* Balance and Unrealized PnL skeleton */}
        <div className="flex justify-between">
          <div className="text-left">
            <Skeleton className="h-[22px] w-32 mb-3" />
            <Skeleton className="h-[14px] w-20" />
          </div>
          <div className="text-right">
            <Skeleton className="h-[22px] w-28 mb-3" />
            <Skeleton className="h-[14px] w-24" />
          </div>
        </div>

        {/* Position details skeleton */}
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex justify-between py-[12px]">
            <Skeleton className="h-[14px] w-32" />
            <Skeleton className="h-[14px] w-20" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col ">
      <div className="flex justify-between pb-[12px]">
        <div className="text-left">
          <div className="font-[450] text-[22px] leading-none text-[#00FFB4]">
            {data?.balance ? <MoneyFormatted value={data.balance} /> : '--'}
          </div>
          <div className="mt-3 font-[330] text-[14px] leading-none text-[#FFFFFFB2]">{t('assets.futures.balance')}</div>
        </div>
        <div className="text-right">
          <div
            className={`font-[450] text-[22px] leading-none ${Number(data?.unrealizedPnl ?? 0) >= 0 ? 'text-rise' : 'text-fall'}`}
          >
            {data?.unrealizedPnl ? (
              <>
                {Number(data.unrealizedPnl) >= 0 ? '+' : '-'}
                <MoneyFormatted value={Math.abs(Number(data.unrealizedPnl))} />
              </>
            ) : (
              '--'
            )}
          </div>
          <div className="mt-3 font-[330] text-[14px] leading-none text-[#FFFFFFB2]">
            {t('assets.futures.unrealizedPnl')}{' '}
          </div>
        </div>
      </div>
      <div className="flex justify-between py-[12px]">
        <div className="font-[330] text-[14px] leading-none text-[#FFFFFFB2]">{t('assets.futures.positionValue')}</div>
        <div className="font-[450] text-[14px] leading-none text-white">
          {data?.positionValue !== undefined && data?.positionValue !== null ? (
            <MoneyFormatted value={Math.abs(Number(data.positionValue))} />
          ) : (
            '--'
          )}
        </div>
      </div>
      <div className="flex justify-between py-[12px]">
        <div className="font-[330] text-[14px] leading-none text-[#FFFFFFB2]">{t('assets.futures.availableMargin')}</div>
        <div className="font-[450] text-[14px] leading-none text-white">
          {data?.availableMargin ? <MoneyFormatted value={Math.abs(Number(data.availableMargin))} /> : '--'}
        </div>
      </div>
      <div className="flex justify-between py-[12px]">
        <div className="font-[330] text-[14px] leading-none text-[#FFFFFFB2] decoration-dashed underline cursor-pointer" onClick={() => handleOpenDrawer('1')}>
          {t('assets.futures.availableForWithdraw')}
        </div>
        <div className="font-[450] text-[14px] leading-none text-white">
          {data?.availableWithdraw ? formatMoney(data.availableWithdraw) : 0}
        </div>
      </div>
      <div className="flex justify-between py-[12px]">
        <div className="font-[330] text-[14px] leading-none text-[#FFFFFFB2] decoration-dashed underline cursor-pointer" onClick ={() => handleOpenDrawer('2')}>{t('assets.futures.leverage')}</div>
        <div className="font-[450] text-[14px] leading-none text-[#00FFB4]">
          {data?.crossAccountLeverage !== undefined && data?.crossAccountLeverage !== null
            ? `${data.crossAccountLeverage.toFixed(2)}X`
            : '--'}
        </div>
      </div>
      <div className="flex justify-between py-[12px]">
        <div className="font-[330] text-[14px] leading-none text-[#FFFFFFB2] decoration-dashed underline cursor-pointer" onClick={() => handleOpenDrawer('3')}>{t('assets.futures.crossMarginRatio')}</div>
        <div className="font-[450] text-[14px] leading-none">
          {data?.crossMarginRatio ? formatPercentage(data?.crossMarginRatio) : '--'}
        </div>
      </div>
      <div className="flex justify-between py-[12px]">
        <div className="font-[330] text-[14px] leading-none text-[#FFFFFFB2] decoration-dashed underline cursor-pointer" onClick={() => handleOpenDrawer('4')}>
          {t('assets.futures.maintenanceMargin')}
        </div>
        <div className="font-[450] text-[14px] leading-none text-white">
          {data?.maintenanceMargin ? formatMoney(Number(data?.maintenanceMargin.toFixed(2))) : '--'}
        </div>
      </div>
      <AppDrawer open={open} setOpen={setOpen} 
      title={title} 
      rightIcon={<></>}
      drawerContent={
        <div> 
          <p className='text-[calc(1rem*(15/16))] leading-[calc(1rem*(22/16))] text-[#FFFFFFB2]'>{content}</p>
          <Button variant="gradient" className="rounded-full text-[#261236] w-full mt-9 mb-5" type="button" onClick={() => setOpen(!open)}>
            {t('assets.overview.estimatedAssetsAgree')}
          </Button>
          </div>
        } 
      />

    </div>
  )
}

export default PositionsOverview
