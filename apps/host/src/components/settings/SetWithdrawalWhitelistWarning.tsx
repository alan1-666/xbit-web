import { Trans, useTranslation } from 'react-i18next'
import { BaseBottomDrawer, BaseBottomDrawerProps } from './BaseBottomDrawer'
import { IconWarning } from '@components/icon/stroke/IconWarning.tsx'
import { Button } from '@components/ui/button.tsx'
import { useNavigate } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant.ts'

export const SetWithdrawalWhitelistWarning = (props: BaseBottomDrawerProps) => {
  const { ref } = props
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleLinkNow = () => {
    ref?.current?.close()
    navigate(APP_PATH.MEME_SETTINGS_WHITELIST_GOOGLE_AUTH)
  }
  return (
    <BaseBottomDrawer
      title={
        <div className="size-11 p-2.5 bg-[#EC46991A] rounded-full">
          <IconWarning />
        </div>
      }
      className="z-[150]"
      {...props}
    >
      <div className="text-[calc(15rem/16)]">
        <Trans
          i18nKey="appSettings.withdrawalWarningMessage"
          components={{ span: <span className="text-[#FF353C]" /> }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 pt-4 pb-6 border-t mt-4">
        <Button variant="borderGradient" className="rounded-full" onClick={() => ref?.current?.close()}>
          {t('appSettings.cancel')}
        </Button>
        <Button variant="gradient" className="rounded-full text-[#141414]" onClick={handleLinkNow}>
          {t('appSettings.googleAuth.linkNow')}
        </Button>
      </div>
    </BaseBottomDrawer>
  )
}
