import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ReactNode, useState } from 'react'
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet'
import ButtonLogin from '@components/common/LoginSection/ButtonLogin.tsx'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { CopyButton } from '../copy-button'
import { telegramBotConfig } from '@/lib/blockchain'
import { CheckboxXbit } from '@/components/ui/checkbox-xbit'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant'

export interface ButtonTelegramProps {
  customTrigger?: ReactNode
  disabled?: boolean
}

const ButtonTelegram = (props: ButtonTelegramProps) => {
  const { customTrigger, disabled = false } = props
  const [open, setOpen] = useState(false)
  const [checked, setChecked] = useState<boolean>(true)
  const { t } = useTranslation()
  const navigate = useNavigate()
  const handleClickNavigate = (path: string) => {
    navigate(path)
  }
  return (
    <>
      <Drawer
        open={open}
        onOpenChange={(open) => {
          if (disabled) return
          setOpen(open)
        }}
      >
        <DrawerTrigger asChild disabled={disabled}>
          {!customTrigger ? (
            <ButtonLogin toolTip={t('login.recommended')} className="hover-scale">
              <img src="/images/icons/icon-telegram.svg" className="w-[1rem] h-[calc(1rem*(13.43/16))]" alt="" />
              {t('login.telegramLogin')}
            </ButtonLogin>
          ) : (
            customTrigger
          )}
        </DrawerTrigger>
        <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto">
          <DrawerHeader className="py-3 px-3.5 flex w-full items-center justify-between">
            <DrawerTitle>{t('login.bindTelegramBot')}</DrawerTitle>
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setOpen(false)}
              alt=""
            />
          </DrawerHeader>
          <div className="px-3 pt-5 pb-8">
            <div className="py-4 px-3 mb-10 rounded-xl gradient-border bg-[#ececed14] bg-[url(/images/icons/img-bg-login-tele.svg)] bg-cover bg-no-repeat max-w-[349px] mx-auto">
              <div className="flex items-center justify-between mr-1">
                <div>
                  <p className="text-sm leading-none">{t('login.tradingPromptTitle')}</p>
                  <p className="text-sm leading-none pt-3">{t('login.tradingPromptDetail')}</p>
                </div>
                <img src="/images/icons/img-login-tele.svg" className="w-20 h-20" alt=""></img>
              </div>
              <div className="py-10 mt-3 text-center bg-[#232329] rounded-xl">
                <div className="flex items-center justify-center gap-6">
                  <img src="/images/xbit-logo.svg" className="w-14 h-14 bg-[#ececed14] p-2 rounded-xl" alt="" />
                  <img src="/images/icons/ic-next.svg" className="w-5 h-5" alt="" />
                  <img src="/images/logo-tele.svg" className="w-14 h-14" alt="" />
                </div>
                <p className="text-sm leading-none text-[#ffffffcc] mt-5">{t('login.bindingNotice')}</p>
              </div>
              <div className="flex justify-center items-center gap-1 mt-4">
                <p className="text-sm leading-none text-[#ffffff99]">{t('login.openInBrowser')}</p>
                <CopyButton
                  text={`https://t.me/${telegramBotConfig.botName}?start=l_en_t_71c8cee68c731def`}
                  className="w-3 h-3"
                />
              </div>
            </div>
            <DialogConfirm checked={checked} closeDrawer={() => setOpen(false)} />
            <div className="flex items-center gap-1.5 py-3 justify-center">
              <CheckboxXbit checked={checked} onCheckedChange={() => setChecked(!checked)} />
              <p className="text-[#ffffff99] text-[calc(1rem*(11/16))] leading-none">
                {t('login.termsAgreement')}
                <span className="text-[#50A1FF]" onClick={() => handleClickNavigate(APP_PATH.TERMS_OF_USE)}>
                  {t('login.terms')}
                </span>
                {t('login.with')}
                <span className="text-[#50A1FF]" onClick={() => handleClickNavigate(APP_PATH.PRIVACY_POLICY)}>
                  {t('login.privacyPolicy')}
                </span>
              </p>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default ButtonTelegram

const DialogConfirm = ({ checked, closeDrawer }: { checked: boolean; closeDrawer: () => void }) => {
  const [open, setOpen] = useState(false)
  const { connectTelegramForChain } = useMultiChainWallet({})
  const { t } = useTranslation()

  const onClickLoginByTG = () => {
    connectTelegramForChain()
    setOpen(false)
    closeDrawer()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="w-full text-center">
          <Button
            variant="gradient"
            className="text-tertiary w-full max-w-[349px] rounded-[50px] hover-scale"
            disabled={!checked}
          >
            {t('login.telegramLogin')}
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="w-[335px] bg-[#232329] rounded-2xl p-5">
        <DialogHeader>
          <DialogTitle className="text-center">
            <p className="text-xl py-3">{t('login.openTelegramPrompt')}</p>
          </DialogTitle>
          <div className="flex justify-center items-center flex-row gap-2.5 mt-4">
            <Button variant="close" className="flex-1 hover-scale" onClick={() => setOpen(false)}>
              {t('login.cancel')}
            </Button>
            <Button
              variant="gradient"
              className="text-[#261236] flex-1 rounded-[50px] hover-scale"
              onClick={() => onClickLoginByTG()}
            >
              {t('login.open')}
            </Button>
          </div>
        </DialogHeader>
        <DialogDescription />
      </DialogContent>
    </Dialog>
  )
}
