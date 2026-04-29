import { useEffect, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useResponsive } from '@/hooks/useResponsive'
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from '@/components/ui/drawer'
import { X } from 'lucide-react'
import PastWinterItem from './PastWinterItem'
import DateSelector from './DateSelector'
import DateSelectorDrawer from './DateSelectorDrawer'
import { LuckyLottoDrawHistory, LottoWinner } from '@/@generated/gql/graphql-redpacket'
import { IconEmpty } from '@/components/icon'
import dayjs from 'dayjs'
import { formatUserId } from '@/lib/utils'



interface PastWintersProps {
  luckyLottoHistory: Array<LuckyLottoDrawHistory>
}

const PastWinters = ({ luckyLottoHistory }: PastWintersProps) => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  const [open, setOpen] = useState(false)

  // 获取所有可用的日期（去重）
  const availableDates = useMemo(() => {
    const dates = luckyLottoHistory.map((item: LuckyLottoDrawHistory) => {
      const drawTime = item.drawDate || new Date().toISOString()
      return dayjs(drawTime).startOf('day').toDate()
    })
    // 去重并按时间倒序排序
    const uniqueDates = Array.from(new Set(dates.map(d => d.getTime())))
      .map(time => new Date(time))
      .sort((a, b) => b.getTime() - a.getTime())
    return uniqueDates
  }, [luckyLottoHistory])

  // 默认选择最新的日期
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    return availableDates.length > 0 ? availableDates[0] : new Date()
  })

  // 当弹窗打开时，重置为最新日期
  useEffect(() => {
    if (open && availableDates.length > 0) {
      setSelectedDate(availableDates[0])
    }
  }, [open, availableDates])

  // 根据选中的日期筛选数据
  const items = useMemo(() => {
    return luckyLottoHistory
      .filter((item: LuckyLottoDrawHistory) => {
        const drawTime = item.drawDate || new Date().toISOString()
        return dayjs(drawTime).isSame(selectedDate, 'day')
      })
      .flatMap((item: LuckyLottoDrawHistory) => {
        const drawTime = item.drawDate || new Date().toISOString()
        const winners = item.winners || []
        
        return winners.map((winner: any) => ({
          address: winner.username || '',
          date: dayjs(drawTime).format('YYYY-MM-DD'),
          // 这里应该展示 walletAddress，但因为该起来比较复杂，就不改 userId 了
          userId: formatUserId(winner.walletAddress || ''),
          rank: String(winner.rank || ''),
          randomNumber: String(winner.randomNumber || ''),
          transactionHash: item.transactionHashes || ''
        }))
      })
  }, [luckyLottoHistory, selectedDate])




  

  const renderContent = (
    <>
      <div className="w-full">
        {/* 日期选择器 */}
        <div className="mb-4 w-[250px] z-10">
          {isDesktop ? (
            <DateSelector
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              availableDates={availableDates}
            />
          ) : (
            <DateSelectorDrawer
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              availableDates={availableDates}
            />
          )}
        </div>

        {/* 获奖者列表 */}
        <div className="self-stretch h-[542px] flex flex-col justify-start items-start overflow-auto">
          {!items.length && (
            <div className="flex flex-col items-center justify-center h-80 w-full -z-1">
              <IconEmpty />
              <span className="text-[#FFFFFF80] text-[0.75rem]">{t('futuresDetails.tips.noData')}</span>
            </div>
          )}
          {items.length > 0 && items.map((it, idx) => (
            <PastWinterItem 
              key={idx} 
              address={it.address} 
              date={it.date} 
              userId={it.userId} 
              rank={it.rank} 
              transactionHash={it.transactionHash[idx]}  
              randomNumber={it.randomNumber}
            />
          ))}
        </div>
      </div>
    </>
  )

  return (
    isDesktop ?

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {
            isDesktop ? 
             <Button
              variant={'ghost'}
              className="flex-1 text-[#fff] text-[12px] leading-[12px] px-[12px] py-[12px]  past-winner-border-gradient rounded-[14px]"
          >
            <div className="flex items-center px-[6px] py-[6px]  gap-2">
              <div className="justify-start text-white text-xs font-normal leading-4">{t('red.packet.past.winner')}</div>
              <img src="/images/redpacket/enter-icon.svg" />
            </div>
          </Button>
            :
            <Button
            variant={'ghost'}
            className="flex-1 text-[#fff] h-[32px]  text-[12px] leading-[12px] px-[10px] py-[7px] rounded-[6px] bg-[#212127]"
          >
            <div className="inline-flex justify-start items-center gap-2">
              <div className="justify-start text-white text-xs font-normal leading-4">{t('red.packet.past.winner')}</div>
              <img src="/images/redpacket/enter-icon.svg" />
            </div>
          </Button>
          }
          
        </DialogTrigger>

        <DialogContent className="bg-[#121214] w-[630px] py-4 px-0" showDialogPrimitiveClose={false}>
          <DialogHeader className='border-b border-[#302E38] px-4 pb-4'>
            <div className='flex items-center justify-between'>
            <div className="w-80 h-5 text-left text-white text-[20px] font-normal leading-6">{t('red.packet.past.winner')}</div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full text-white/60 hover:text-white/80 transition-colors z-10"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </DialogHeader>
          <div className='px-4'>
            {renderContent}
          </div>
        </DialogContent>
      </Dialog>
      : <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <div className="inline-flex justify-start items-center gap-2">
            <div className="justify-start text-white text-xs font-normal leading-4">{t('red.packet.past.winner')}</div>
            <img src="/images/redpacket/enter-icon.svg" />
          </div>
        </DrawerTrigger>
        <DrawerContent className="w-full bg-[#121214] max-w-[768px] mx-auto">
          <DrawerHeader className="px-3.5  flex w-full items-center justify-between">
           <div className="w-80 h-5 text-left text-white text-[20px] font-normal leading-6">{t('red.packet.past.winner')}</div>
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setOpen(false)}
              alt="close"
            />
          </DrawerHeader>
          <div className="px-3 pb-8">
            {renderContent}
          </div>
        </DrawerContent>
      </Drawer>
  )
}

export default PastWinters
