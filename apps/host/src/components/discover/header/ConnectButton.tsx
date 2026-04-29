import { IconTriangleDown } from '@components/icon/IconTriangleDown.tsx'
import { LoginDrawer } from '@/components/common/LoginDrawer'
import { useTranslation } from 'react-i18next'
import useStateSearchParam from '@/hooks/useStateSearchParam'

export const ConnectButton = () => {
  const { t } = useTranslation()
  const [showLoginDrawer, setShowLoginDrawer] = useStateSearchParam('showLoginDrawer', false)
  const handleClick = () => {
    setShowLoginDrawer(true)
  }

  return (
    <>
      <button className="flex items-center h-full" onClick={handleClick}>
        <span>{t('wallet.connectGuide')}</span>
        <IconTriangleDown />
      </button>
      <LoginDrawer setOpen={setShowLoginDrawer} open={showLoginDrawer} />
    </>
  )
}
