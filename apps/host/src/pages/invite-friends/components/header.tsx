import { cn } from '@/lib/utils'
import { SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'

const Header = ({ setIsOpen }: { setIsOpen?: (value: SetStateAction<boolean>) => void }) => {
  const { t } = useTranslation()
  return (
    <div className={cn(' py-4 w-full relative')}>
      <div className={cn('text-[calc(17rem/16)] font-[500] text-center flex-1')}>{t('inviteFriends.title')}</div>
      <img
        src={'/images/icons/close.svg'}
        alt="icon close"
        className="size-[16px] cursor-pointer absolute top-1/2 right-3 -translate-y-1/2"
        onClick={() => {
          setIsOpen ? setIsOpen(false) : window.history.back()
        }}
      />
    </div>
  )
}

export default Header
