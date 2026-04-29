import { IconShareStroke } from '@/components/icon'
import { ShareXbitDrawer } from '@/components/settings/ShareXbitDrawer'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const DialogShareXBIT = () => {
  const { t } = useTranslation()
  const [showShare, setShowShare] = useState(false)

  return (
    <div>
      <button
        className="group flex h-[36px] w-full items-center gap-3 rounded-[4px] px-1 transition-colors duration-0 hover:bg-neutral-800"
        onClick={() => setShowShare(true)}
      >
        <IconShareStroke className="h-[20px] w-[20px] text-white" />
        <span className="text-[14px] font-medium">{t('appSettings.shareXBIT')}</span>
      </button>

      <ShareXbitDrawer open={showShare} setOpen={setShowShare} />
    </div>
  )
}

export default DialogShareXBIT
