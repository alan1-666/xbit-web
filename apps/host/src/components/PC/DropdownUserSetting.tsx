import { useGridLayout } from '@/hooks/useGridLayout'
import eventBus from '@/lib/eventBus'
import { EVENT_MESSAGE_CHANGE_LAYOUT } from '@/pages/detail/layout'
import DialogActivityRewards from '@/pages/settings/dialog-activity-rewards'
import DialogColorsSettings from '@/pages/settings/dialog-colors-settings'
import DialogLanguages from '@/pages/settings/dialog-languages'
import DialogMnemonicBackup from '@/pages/settings/dialog-mnemonic-backup'
import DialogReferralCommission from '@/pages/settings/dialog-referral-commission'
import DialogShareXBIT from '@/pages/settings/dialog-shareXBIT'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import AccountOverview from '../common/AccountOverview'
import { IconResetStroke } from '../icon/stroke/IconResetStroke'
import { IconSettings2 } from '../icon/stroke/IconSettings2'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Switch } from '@components/ui/switch.tsx'
import {
  selectFuturesTradePreferences,
  futuresTradePreferencesActions,
} from '@/redux/modules/futuresTradePreferences.slice'
import {
  IconOrderConfirm
} from '@components/icon'


const DropdownUserSetting = () => {
  const { t } = useTranslation()
  const { resetLayout } = useGridLayout('futures-grid-layout')
  const headerTab = useAppSelector((state) => state.router.headerTab)
  const { isShowOrderConfirm } = useAppSelector(selectFuturesTradePreferences)
  const dispatch = useAppDispatch()

  const [open, setOpen] = useState<boolean>(false)
  const isDex = headerTab === 'crypto'
  const isMeme = headerTab === 'meme' || headerTab === 'xstocks'

  const handleResetLayout = () => {
    if (isDex) {
      resetLayout()
    }

    if (isMeme) {
      eventBus.dispatch(EVENT_MESSAGE_CHANGE_LAYOUT, {
        data: 'reset',
      })
    }
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div
          role="button"
          aria-label="Open menu"
          className="border-[0.5px] border-[#79778C29] bg-[#212127] size-[34px] rounded-full items-center justify-center flex cursor-pointer flex-shrink-0"
        >
          <IconSettings2 className="size-[18px] text-[#CACACA]" />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="gap-[4px] p-[5px] bg-[#212127] border border-[#79778C29] flex flex-col max-w-[350px] w-full min-w-[250px]"
        side="bottom"
        align="end"
        alignOffset={0}
        sideOffset={10}
      >
        <div className="flex gap-2 border-b pb-2">
          <AccountOverview />
        </div>
        <DialogColorsSettings />
        <DialogLanguages />
        {/* <DialogReferralCommission /> */}
        {/* <DialogActivityRewards /> */}
        <DialogMnemonicBackup />
        <DialogShareXBIT />
        {/* 重置合约布局 */}
        <button
          className="flex items-center px-1 hover:bg-neutral-800 transition-colors w-full group duration-0 gap-3 h-[36px] rounded-[4px]"
          onClick={handleResetLayout}
        >
          <IconResetStroke className="text-white" />
          <span className="text-[14px] font-medium">{t('appSettings.resetLayout')}</span>
        </button>

        <div
          className="flex items-center justify-between px-1 hover:bg-neutral-800 transition-colors w-full group duration-0 gap-3 h-[36px] rounded-[4px]"
        >
          <div className="flex items-center">
            <IconOrderConfirm className="text-white" />
            <span className="ml-3 text-[14px] font-medium">{t('futuresDetails.common.orderComfirmTitle')}</span>
          </div>
          <Switch
            checked={isShowOrderConfirm}
            className="data-[state=checked]:bg-[#6A2AE0]"
            disabled={false}
            onCheckedChange={(val: boolean) => {
              dispatch(
              futuresTradePreferencesActions.updateTradePreferences({
                isShowOrderConfirm: val
              }))
              
            }}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DropdownUserSetting
