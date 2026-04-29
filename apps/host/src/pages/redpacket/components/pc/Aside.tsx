import { cn } from "@/lib/utils"
import { useNavigate } from 'react-router-dom'
import { getFuturesTradePath } from '@/components/futuresDetails/trade/tools.ts'
import { exchangeActions } from '@/redux/modules/exchange.slice'
import { ChainIds } from '@/types/enums.ts'
import { useAppDispatch } from '@/redux/store'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'
import NewLoginDrawer from '@/components/auth/NewLoginDrawer'
export type activeMenuType = 'home' | 'leaderboard' | 'rewards'
interface AsideProps {
  activeMenu?: activeMenuType
  activeMenuChange?: (menu: activeMenuType) => void
  showLeaderboard?: boolean
}

const Aside = ({
  activeMenu = 'home',
  activeMenuChange,
  showLeaderboard = false
}: AsideProps) => {
  const { t } = useTranslation()
  let menuItems = [
    { id: 'home', label: t('red.packet.home') },
    { id: 'rewards', label: t('red.packet.rewards') },
  ]
  if(showLeaderboard) {
    menuItems.splice(1, 0, { id: 'leaderboard', label: t('red.packet.new.leaderboard') })
  }
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isLogin = useCheckLoginOnArb()
  const [showLoginDrawer, setShowLoginDrawer] = useState(false)

  const handleGoDeposit = () => {
    if (!isLogin) {
      setShowLoginDrawer(true)
      return
    }
    dispatch(
      exchangeActions.openExchangeDialog({
        defaultTab: 'deposit',
        defaultChainId: ChainIds.Arbitrum,
      }),
    )
  }
  
  const handleGoTrade = () => {
    navigate(getFuturesTradePath())
  }

  const renderIcon = (id: string) => {
    switch (id) {
      case 'home':
        return (
          <div className="w-6 h-6 relative overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4.5 9V21H19.5V9L12 3L4.5 9Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M9.5 14.5V21H14.5V14.5H9.5Z" stroke="white" stroke-width="2" stroke-linejoin="round" />
              <path d="M4.5 21H19.5" stroke="white" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>
        )
      case 'leaderboard':
        return (
          <div className="w-6 h-6 relative overflow-hidden">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.5 9H2V21H8.5V9Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M15 3H8.5V21H15V3Z" stroke="white" stroke-width="2" stroke-linejoin="round"/>
              <path d="M21.5 13H15V21H21.5V13Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        )
      case 'rewards':
        return (
          <div className="w-6 h-6 relative overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20.5 22V10H3.5V22H20.5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M12 22V10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M20.5 22H3.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M22 6H2V10H22V6Z" stroke="white" stroke-width="2" stroke-linejoin="round" />
              <path d="M8 2L12 6L16 2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        )
      default:
        return null
    }
  }
  return (
    <>
      <NewLoginDrawer setOpen={setShowLoginDrawer} open={showLoginDrawer} />
      <div className="fixed left-0 top-[62px] h-screen w-64 z-50 bg-neutral-900 flex flex-col border-t border-r border-white/10 overflow-auto">
      <div className="flex-1 p-6 flex flex-col justify-start items-start gap-4">
        <div className="w-full flex-1 flex flex-col gap-3">
          {menuItems.map((mi) => (
            <div
              key={mi.id}
              className={cn("cursor-pointer relative w-full p-2.5 rounded-2xl inline-flex justify-start items-center gap-2 overflow-hidden", activeMenu !== mi.id ? 'opacity-60' : 'bg-gradient-to-r from-rose-600 to-orange-300')}
              onClick={() => activeMenuChange && activeMenuChange(mi.id as activeMenuType)}
            > 
              {activeMenu === mi.id && <img src="/images/redpacket/nav-btn-bg.png" className="absolute left-0 top-0 w-full h-full "/>}
              {renderIcon(mi.id)}
              <div className="justify-start text-white text-base font-medium">{mi.label}</div>
            </div>
          ))}
        </div>

        <div className="w-full mt-6 pt-4 border-t border-white/5 flex flex-col gap-4 pb-22">
          <div className="opacity-60 text-white text-xs font-medium">{t('red.packet.quick.links')}</div>
          <div className="inline-flex items-center gap-2 text-white text-sm cursor-pointer" onClick={handleGoTrade}>
            <div>{t('red.packet.trade.title')}</div>
            <img src="/images/redpacket/enter-icon.svg" />
          </div>
          <div className="inline-flex items-center gap-2 text-white text-sm cursor-pointer" onClick={handleGoDeposit}>
            <div>{t('red.packet.deposit.title')}</div>
            <img src="/images/redpacket/enter-icon.svg" />
          </div>

          <div className="w-full px-3.5 py-3 bg-yellow-300/10 rounded-2xl outline outline-1 outline-offset-[-1px] outline-yellow-300/30 mt-4">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-4 h-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3.33325 12.6667V6.00004C3.33325 3.42271 5.42259 1.33337 7.99992 1.33337C10.5773 1.33337 12.6666 3.42271 12.6666 6.00004V12.6667M1.33325 12.6667H14.6666" stroke="#FFDC3E" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M7.99992 14.6666C8.92039 14.6666 9.66659 13.9204 9.66659 13V12.6666H6.33325V13C6.33325 13.9204 7.07945 14.6666 7.99992 14.6666Z" stroke="#FFDC3E" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <div className="text-yellow-300 text-xs">{t('red.packet.coming.soon.title')}:</div>
            </div>
            <div className="text-white text-xs">{t('red.packet.coming.soon.content1')}<br />{t('red.packet.coming.soon.content2')}</div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default Aside
