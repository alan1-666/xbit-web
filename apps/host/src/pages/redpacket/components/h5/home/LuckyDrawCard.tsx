import { useMemo, useState } from 'react'
import HowWork from '../../HowWork'
import PastWinters from '../../PastWinters'
import LuckyNumberDrawer from '../../LuckyNumberDrawer'
import { LuckyLottoStatus, LuckyLottoDrawHistory } from '@/@generated/gql/graphql-redpacket'
import { cn } from '@/lib/utils'
import dayjs from "dayjs";
import { useTranslation } from 'react-i18next'


interface LuckyDrawCardProps {
  luckyLottoStatus: LuckyLottoStatus | null
  luckyLottoHistory: Array<LuckyLottoDrawHistory>
  showOverlay: boolean
}
const LuckyDrawCard: React.FC<LuckyDrawCardProps> = ({ luckyLottoStatus, luckyLottoHistory, showOverlay }) => {
  const { t } = useTranslation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedNumber, setSelectedNumber] = useState<{ number: string; hash: string }>({ number: '', hash: '' })

  // 幸运数字数组
  const luckyNumbers = useMemo(() => {
    if (!luckyLottoStatus?.todayLuckyNumbers || !Array.isArray(luckyLottoStatus.todayLuckyNumbers)) {
      return []
    }
    return luckyLottoStatus.todayLuckyNumbers.map(num => String(num).padStart(2, '0'))
  }, [luckyLottoStatus?.todayLuckyNumbers])
  		// const luckyNumbers = ['01', '02', '03','01', '02', '03','01', '02', '03', '08' ]


  // 交易哈希数组
  const transactionHashes = useMemo(() => {
    if (!luckyLottoStatus?.todayDrawTransactionHashes || !Array.isArray(luckyLottoStatus.todayDrawTransactionHashes)) {
      return []
    }
    return luckyLottoStatus.todayDrawTransactionHashes
  }, [luckyLottoStatus?.todayDrawTransactionHashes])

  const formattedLatestRank = useMemo(() => {
    if (luckyLottoStatus?.todayYourNumber === null || luckyLottoStatus?.todayYourNumber === undefined) return '--'
    return String(luckyLottoStatus.todayYourNumber).padStart(2, '0')
  }, [luckyLottoStatus?.todayYourNumber])

  // 计算倒计时（只在 API 请求时计算，不实时更新）
  const countdownText = useMemo(() => {
    if (!luckyLottoStatus?.nextDrawTime) {
      return '--'
    }

    const now = dayjs()
    const nextDraw = dayjs(luckyLottoStatus.nextDrawTime)
    const diff = nextDraw.diff(now, 'minute') // 计算分钟差

    if (diff <= 0) {
      return '--'
    }

    const hours = Math.floor(diff / 60)
    const minutes = diff % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `00h ${minutes}m`
    }
  }, [luckyLottoStatus?.nextDrawTime])

  const handleNumberClick = (number: string, index: number) => {
    const hash = transactionHashes[index] || ''
    setSelectedNumber({ number, hash })
    setDrawerOpen(true)
  }
  return (
    <div className="bg-[url('/images/redpacket/bg-3.png')]  relative bg-cover bg-center w-full self-stretch px-4 py-6 mb-6 bg-gradient-to-b from-zinc-800/5 to-black/0 rounded-3xl shadow-[inset_0px_-7px_15px_0px_rgba(255,255,255,0.06)] border-l border-r border-yellow-400/0 inline-flex flex-col justify-start items-center gap-5">
      <div className="self-stretch inline-flex justify-between items-start">
        <div className={cn("rounded-2xl inline-flex flex-col justify-between items-start", luckyLottoStatus?.isEligible ? "bg-green-950" : "bg-white/10 ")}>
          <div className="inline-flex justify-start items-center gap-2 py-2.5 px-2 text-[calc(12rem/16)] leading-[calc(12rem/16)]">
            {
              luckyLottoStatus?.isEligible ? <>
                <img src="/images/redpacket/success-icon.svg"/>
                <div className="justify-start text-emerald-600 text-xs font-normal">{t('red.packet.you.are.eligible')}</div>
              </>
              : <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <g clip-path="url(#clip0_3031_6234)">
                      <path d="M8.00004 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8.00004C14.6667 4.31814 11.6819 1.33337 8.00004 1.33337C4.31814 1.33337 1.33337 4.31814 1.33337 8.00004C1.33337 11.6819 4.31814 14.6667 8.00004 14.6667Z" stroke="white" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M10.6667 10.6667C10.6667 10.6667 9.66671 9.33337 8.00004 9.33337C6.33337 9.33337 5.33337 10.6667 5.33337 10.6667" stroke="white" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M6 6H6.00667" stroke="white" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M10 6H10.0067" stroke="white" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_3031_6234">
                        <rect width="16" height="16" fill="white"/>
                      </clipPath>
                    </defs>
                </svg>
                 <div className="justify-start text-[#fff] text-xs font-normal">{t('red.packet.not.eligible')}</div>
              </>
            }
           
          </div>
        </div>
        <div className="p-3 bg-neutral-900 rounded-2xl outline-1 outline-offset-[-1px] outline-white/30 inline-flex flex-col justify-start items-start overflow-hidden">
          <PastWinters luckyLottoHistory={luckyLottoHistory} />
        </div>
      </div>

      <div className="flex flex-col justify-start items-start gap-4 w-full">
        <div className="w-full flex flex-col justify-center items-start">
          <div className="justify-start text-white text-xl font-normal leading-6">{t('red.packet.lucky.draw')}</div>
        </div>
        <div className="relative w-full p-3 bg-neutral-900 rounded-2xl outline-1 outline-offset-[-1px] outline-white/10 flex flex-col justify-start items-center gap-4">
         {/* 背景蒙层 */}
         {!showOverlay && (
						<div className="absolute inset-0 bg-[rgba(24, 24, 27, 0.9)] border-1 border-white/10 backdrop-blur-[50px] rounded-[16px] w-full h-full z-10 flex items-center justify-center">
              <div className="text-white text-xl font-normal ">{t('red.packet.coming.soon.title')}</div>
            </div>
					)}
          <div className="self-stretch inline-flex justify-between items-center">
            <div className="inline-flex flex-col justify-center items-start">
              <div className="inline-flex justify-start items-center">
                <div className="text-center justify-start text-white text-base font-medium">{t('red.packet.mystery.reward')}</div>
              </div>
            </div>
            <HowWork/>
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-2 overflow-hidden">
            <div className="self-stretch flex flex-col justify-start items-start gap-3">
              <div className="text-center justify-start text-[#FFD209] text-xs font-normal leading-[1.2]">{t('red.packet.lucky.number')}</div>
              <div className="w-full flex flex-col gap-3 text-center text-[#FFD209] text-sm font-bold">
                {luckyNumbers.length > 0 ? (
                  <>
                    <div className="flex justify-between">
                      {luckyNumbers.slice(0, 5).map((num, index) => (
                        <div 
                          key={index} 
                          className="w-[42px] h-[42px] rounded-full bg-[#FFDC3E1A] active:bg-[#FFDC3E4D] transition-colors cursor-pointer flex items-center justify-center"
                          onClick={() => handleNumberClick(num, index)}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between">
                      {luckyNumbers.slice(5, 10).map((num, index) => (
                        <div 
                          key={index + 5} 
                          className="w-[40px] h-[40px] rounded-full bg-[#FFDC3E1A] active:bg-[#FFDC3E4D] transition-colors cursor-pointer flex items-center justify-center"
                          onClick={() => handleNumberClick(num, index + 5)}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      {[0, 1, 2, 3, 4].map((num) => (
                        <div 
                          key={num} 
                          className="w-[42px] h-[42px] rounded-full bg-[#FFDC3E1A] flex items-center justify-center"
                        >
                          --
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between">
                      {[5, 6, 7, 8, 9].map((num) => (
                        <div 
                          key={num} 
                          className="w-[40px] h-[40px] rounded-full bg-[#FFDC3E1A] flex items-center justify-center"
                        >
                          --
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="self-stretch inline-flex justify-start items-start gap-3">
                <div className="flex-1 px-3 py-2 bg-emerald-600/20 rounded-2xl inline-flex flex-col justify-start items-start gap-1 overflow-hidden">
                  <div className="self-stretch text-center justify-start text-emerald-600 text-xs font-normal leading-4">{t('red.packet.you.rank')}</div>
                  <div className="self-stretch text-center justify-start text-emerald-600 text-base font-bold">{ luckyLottoStatus?.currentRank ? `#${luckyLottoStatus?.currentRank}` : '--' }</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-emerald-600/20 rounded-2xl inline-flex flex-col justify-start items-start gap-1 overflow-hidden">
                  <div className="self-stretch text-center justify-start text-emerald-600 text-xs font-normal leading-4">{t('red.packet.your.number')}</div>
                  <div className="self-stretch text-center justify-start text-emerald-600 text-base font-bold">{formattedLatestRank}</div>
                </div>
              </div>
            </div>
            <div className="self-stretch inline-flex justify-between items-center">
              <div className="opacity-60 justify-start text-white text-xs font-normal leading-4">{t('red.packet.nex.draw')}</div>
              <div className="flex justify-end items-center gap-1">
                <div className="w-4 h-4 relative overflow-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <g clip-path="url(#clip0_3071_4993)">
                      <path d="M8 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8.00004C14.6667 4.31814 11.6819 1.33337 8 1.33337C4.3181 1.33337 1.33333 4.31814 1.33333 8.00004C1.33333 11.6819 4.3181 14.6667 8 14.6667Z" stroke="#FFD209" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M8 4V8L10.6667 9.33333" stroke="#FFD209" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_3071_4993">
                        <rect width="16" height="16" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div className="justify-start text-yellow-400 text-xs font-normal">{countdownText}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LuckyNumberDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        luckyNumber={selectedNumber.number}
        transactionHash={selectedNumber.hash}
      />
    </div>
  )
}

export default LuckyDrawCard
