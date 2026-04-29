import { Dispatch, SetStateAction } from 'react'
import AppDrawer from '@components/common/AppDrawer.tsx'
import { useTranslation } from 'react-i18next'
import { CopyButton } from '@components/common/copy-button.tsx'
import { IconEmail } from '@components/icon/brands/IconEmail.tsx'

export interface ContactEmailDrawerProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}
export const ContactEmailDrawer = (props: ContactEmailDrawerProps) => {
  const { open, setOpen } = props
  const { t } = useTranslation()
  return (
    <AppDrawer
      open={open}
      setOpen={setOpen}
      drawerContent={
        <div className="pb-10">
          <div className="text-[calc(16rem/16)] text-[#FFFFFFB2] mb-3">{t('appSettings.aboutUs.officialEmail')}</div>
          <div className="flex items-center bg-[#111111] rounded-[6px] border border-[#1A1A1A14] px-3 py-3.5 gap-2.5">
            <IconEmail className="size-5" />
            <span className="text-[calc(13rem/16)] text-[#FFFFFF80] leading-[calc(13rem/16)] flex-1">
              support@xbit.com
            </span>
            <CopyButton text="support@xbit.com" />
          </div>
        </div>
      }
    />
  )
}
