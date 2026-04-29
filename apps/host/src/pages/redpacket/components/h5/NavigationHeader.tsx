import { useState } from "react"
import { cn } from "@/lib/utils"
import { useNavigate } from 'react-router-dom'
import { getFuturesTradePath } from '@/components/futuresDetails/trade/tools.ts'
import { useTranslation } from 'react-i18next'

export type activeMenuType = 'home' | 'leaderboard' | 'rewards'
interface NavigationHeaderProps {
  /** 页面标题 */
  title: string
  /** 返回按钮点击事件 */
  onBack?: () => void
  /** 关闭按钮点击事件 */
  onClose?: () => void
  /** 是否显示返回按钮，默认 true */
  showBack?: boolean
  /** 是否显示菜单按钮（三个点），默认 true */
  showMenu?: boolean
  /** 是否显示关闭按钮，默认 true */
  showClose?: boolean
  activeMenu?: activeMenuType
  activeMenuChange?: (menu: activeMenuType) => void
  showLeaderboard?: boolean
}

/**
 * 通用导航头部组件
 *
 * @example
 * ```tsx
 * // 完整功能
 * <NavigationHeader
 *   title="邀请好友"
 *   onBack={() => navigate(-1)}
 *   onClose={() => setIsOpen(false)}
 * />
 *
 * // 只显示标题和关闭
 * <NavigationHeader
 *   title="设置"
 *   onClose={() => setIsOpen(false)}
 *   showBack={false}
 *   showMenu={false}
 * />
 * ```
 */

const NavigationHeader = ({
  title,
  onBack,
  onClose,
  activeMenu = 'home',
  activeMenuChange,
  showBack = true,
  showMenu = true,
  showClose = true,
  showLeaderboard = false
}: NavigationHeaderProps) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [isShowMenu, setIsShowMenu] = useState<boolean>(false)

  let menuItems = [
    { id: 'home', label: t('red.packet.home') },
    { id: 'rewards', label: t('red.packet.rewards') },
  ]
  if(showLeaderboard) {
    menuItems.splice(1, 0, { id: 'leaderboard', label: t('red.packet.new.leaderboard') })
  }
  const activeMenuText = menuItems.find(mi => mi.id === activeMenu)?.label || ''

  const renderIcon = (id: string) => {
    switch (id) {
      case 'home':
        return (
          <div className="w-6 h-6 relative overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4.5 9V21H19.5V9L12 3L4.5 9Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9.5 14.5V21H14.5V14.5H9.5Z" stroke="white" stroke-width="2" stroke-linejoin="round"/>
                <path d="M4.5 21H19.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
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
              <path d="M20.5 22V10H3.5V22H20.5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 22V10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20.5 22H3.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22 6H2V10H22V6Z" stroke="white" stroke-width="2" stroke-linejoin="round"/>
              <path d="M8 2L12 6L16 2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        )
      default:
        return null
    }
  }

  const handleGoDeposit = () => {
      navigate('/perps-deposit')
    }
  
  const handleGoTrade = () => {
    navigate(getFuturesTradePath())
  }

  return (
    <>
     {/*  <div className="flex items-center justify-between  pt-[10px] pb-[10px]  bg-[#121212]">
        {showBack && onBack && (
          <div onClick={onBack}>
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="16" viewBox="0 0 10 16" fill="none">
              <path d="M9.25 1L2.25 7.87719L9.25 15" stroke="white" strokeWidth="2" />
            </svg>
          </div>
        )}

        <div className="flex-1 flex items-center justify-center">
          <h1 className="text-white text-[17px]">{title}</h1>
        </div>

        {showClose && onClose && (
          <div
            className="flex items-center justify-center absolute right-[10px] w-[50px] h-[32px]  bg-[#ECECED1F] rounded-[16px]"
            onClick={onClose}
          >
            <div className="cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        )}
      </div> */}
     
      <div className="self-stretch px-4 py-2 bg-[#0A0A0A] border-t inline-flex justify-center w-full items-center gap-2.5 overflow-hidden">
        <div className="flex-1 justify-start text-white text-xl font-medium ">{activeMenuText}</div>
        {showMenu && (
          <div className="w-7 h-7 relative overflow-hidden" onClick={() => setIsShowMenu(true)}>
            <img src="/images/redpacket/menu-icon.svg" />
          </div>
        )}
      </div>
      {
        isShowMenu && (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex justify-center flex-col items-start overflow-auto"  >
          <div className="self-stretch px-4 py-2 bg-[#0A0A0A] border-t inline-flex justify-center w-full items-center gap-2.5 overflow-hidden">
            <div className="flex-1 justify-start text-white text-xl font-medium ">{t('red.packet.home')}</div>
            <div className="w-7 h-7 relative overflow-hidden" onClick={() => setIsShowMenu(false)}>
              <img src="/images/redpacket/close-icon.svg" />
            </div>
          </div>

          <div className="w-full max-w-[960px] h-full  mx-auto" onClick={(e) => e.stopPropagation()}>
            <div className="w-full h-full inline-flex flex-col justify-start items-center bg-neutral-900">
                <div className="self-stretch flex-1 p-6 flex flex-col justify-start items-start gap-4">
                  {menuItems.map((mi) => (
                    <div 
                      key={mi.id} 
                      className={cn("cursor-pointer relative self-stretch p-2.5 rounded-2xl inline-flex justify-start items-center gap-2 overflow-hidden", activeMenu !== mi.id ? ' opacity-60 ' : 'bg-gradient-to-r from-rose-600 to-orange-300')}
                      onClick={() => {
                        setIsShowMenu(false); activeMenuChange && activeMenuChange(mi.id as activeMenuType)
                      }}
                    >
                      {activeMenu === mi.id && <img src="/images/redpacket/nav-btn-bg.png" className="absolute left-0 top-0 w-full h-full object-cover "/>}
                      {renderIcon(mi.id)}
                      <div className="justify-start text-white text-base font-medium ">{mi.label}</div>
                    </div>
                  ))}
                </div>
              <div className="self-stretch p-6 border-t border-white/0 flex flex-col justify-start items-center gap-6">
                <div className="navigationHeader-border-gradient w-full mb-6"></div>
                <div className="self-stretch flex flex-col justify-start items-start gap-3">
                  <div className="self-stretch opacity-60 justify-start text-white text-xs font-medium ">{t('red.packet.quick.links')}</div>
                  <div className="self-stretch inline-flex justify-start items-center gap-[5px] cursor-pointer" onClick={handleGoTrade}>
                    <div className="justify-start text-white text-base font-medium ">{t('red.packet.trade.title')}</div>
                    <img src="/images/redpacket/enter-icon.svg" />
                  </div>
                  <div className="self-stretch inline-flex justify-start items-center gap-1.5 cursor-pointer" onClick={handleGoDeposit}>
                    <div className="justify-start text-white text-base font-medium ">{t('red.packet.deposit.title')}</div>
                    <img src="/images/redpacket/enter-icon.svg" />
                  </div>
                </div>
                <div className="self-stretch px-3.5 py-3 bg-yellow-300/10 rounded-2xl outline outline-1 outline-offset-[-1px] outline-yellow-300/30 flex flex-col justify-start items-start gap-2.5 overflow-hidden">
                  <div className="self-stretch flex flex-col justify-start items-center gap-4">
                    <div className="self-stretch inline-flex justify-start items-center gap-2">
                      <div className="w-4 h-4 relative overflow-hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M3.33325 12.6667V6.00004C3.33325 3.42271 5.42259 1.33337 7.99992 1.33337C10.5773 1.33337 12.6666 3.42271 12.6666 6.00004V12.6667M1.33325 12.6667H14.6666" stroke="#FFDC3E" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M7.99992 14.6666C8.92039 14.6666 9.66659 13.9204 9.66659 13V12.6666H6.33325V13C6.33325 13.9204 7.07945 14.6666 7.99992 14.6666Z" stroke="#FFDC3E" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                      <div className="justify-start text-yellow-300 text-sm font-normal ">{t('red.packet.coming.soon.title')}:</div>
                    </div>
                    <div className="self-stretch justify-start text-white text-xs font-normal  leading-4">{t('red.packet.coming.soon.content1')}<br />{t('red.packet.coming.soon.content2')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>)
      }

    </>

  )
}

export default NavigationHeader
