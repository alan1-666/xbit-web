import { IconGlobalStroke } from '@/components/icon'
import { IconChina, IconIndia, IconUSA, IconVietnam } from '@/components/icon/IconFlags'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { languages } from './languages'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'

const DialogLanguages = ({ showLable = true }: { showLable?: boolean }) => {
  const [open, setOpen] = useState(false)

  const { t, i18n } = useTranslation()
  const currentLang = i18n.language
  const changeLanguage = (lang: string) => {
    const region = languages.find((l) => l.key === lang)?.region || lang
    logEvent2(ACTIONS.setting_change_language, { language: region })
    document.body.classList.remove('font-noto', 'font-noto-sc', 'font-noto-tc')
    i18n.changeLanguage(lang).then(() => {
      if (lang === 'zh') {
        document.body.classList.add('font-noto-sc')
      } else if (lang === 'hk') {
        document.body.classList.add('font-noto-tc')
      } else {
        document.body.classList.add('font-noto')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={cn(
            'flex items-center px-1 transition-colors w-full group duration-0 gap-3 h-[36px] rounded-[4px]',
            showLable ? 'hover:bg-neutral-800' : '',
          )}
        >
          <IconGlobalStroke className="text-white" />
          {showLable && <span className="text-[14px] font-medium">{t('appSettings.language')}</span>}
        </button>
      </DialogTrigger>
      <DialogContent className="px-0 py-2" showDialogPrimitiveClose={false}>
        <div className="flex flex-col">
          <div className="flex items-center justify-between py-3 border-b">
            <div className="w-[70px]"></div>
            <div className={cn('text-lg font-normal text-center flex-1')}>{t('appSettings.languages.title')}</div>
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

          <div className="overflow-auto max-h-[80vh]">
            {languages.map((lang) => (
              <div
                key={lang.key}
                className="flex items-center gap-2.5 px-3 py-5 cursor-pointer"
                onClick={() => {
                  changeLanguage(lang.key)
                }}
              >
                {lang.flag}
                <span className="text-[calc(15rem/16)] text-[#FFFFFF]">{lang.label}</span>
                <span className="text-[calc(14rem/16)] text-[#FFFFFFCC] flex-1">{lang.region}</span>
                {currentLang === lang.key && (
                  <img src="/images/icons/ic-check-circle-gradient.svg?v=2" alt="" className="size-5" />
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DialogLanguages
