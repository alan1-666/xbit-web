import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { usePreference } from '@/hooks/usePreference'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { Card } from './colors-settings'
import { IconColorPaletteStroke } from '@/components/icon'
import { useState } from 'react'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'

const DialogColorsSettings = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const { updatePreference, preference } = usePreference()
  const handleColorChange = (color: 'normal' | 'inverse') => {
    updatePreference({ priceChangeColor: color })
    switch (color) {
      case 'normal':
        logEvent2(ACTIONS.setting_change_color, { color_mode: 'green_up_red_down' })
        break
      case 'inverse':
        logEvent2(ACTIONS.setting_change_color, { color_mode: 'red_up_green_down' })
        break
    }
  }
  const color = preference?.priceChangeColor || 'normal'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center px-1 hover:bg-neutral-800 transition-colors w-full group duration-0 gap-3 h-[36px] rounded-[4px]">
          <IconColorPaletteStroke className="text-white" />
          <span className="text-[14px] font-medium">{t('appSettings.colorPreference')}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="px-0 py-2" showDialogPrimitiveClose={false}>
        <div className="w-full flex flex-col">
          <div className="flex items-center justify-between py-3 border-b">
            <div className="w-[70px]"></div>
            <div className={cn('text-lg font-normal text-center flex-1')}>{t('appSettings.colors.title')}</div>
            <div className="w-[70px] justify-end flex pr-3">
              <img
                src={'/images/icons/close.svg'}
                alt="icon close"
                className="size-[16px] cursor-pointer"
                onClick={() => {
                  setOpen(false)
                }}
              />
            </div>
          </div>
          <div className="px-3 space-y-4 py-2 pt-3">
            <h1 className="text-white text-[calc(18rem/16)]">{t('appSettings.colors.gainLossColor')}</h1>
            <Card variant="normal" onClick={() => handleColorChange('normal')} selected={color === 'normal'} />
            <Card variant="invert" onClick={() => handleColorChange('inverse')} selected={color === 'inverse'} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DialogColorsSettings
