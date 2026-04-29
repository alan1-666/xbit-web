import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DialogTitle } from '@radix-ui/react-dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from '../ui/drawer'
import { IconEdit } from '../icon'

interface ModifyWalletNameProps {
  open: boolean
  toggle: () => void
  disabled?: boolean
  onChangeName: (name: string) => void
  walletName: string
  walletAddress: string
}

const ModifyWalletName = ({
  open,
  toggle,
  disabled = false,
  onChangeName,
  walletName,
  walletAddress,
}: ModifyWalletNameProps) => {
  const { t } = useTranslation()
  const [name, setName] = useState(walletName || walletAddress)
  useEffect(() => {
    setName(walletName || walletAddress)
  }, [walletName, walletAddress])
  function handleSaveName() {
    onChangeName(name)
    toggle()
  }
  function handleDeleteName() {
    setName(walletAddress)
    onChangeName('')
    toggle()
  }
  return (
    <Drawer open={open} onOpenChange={toggle}>
      <DrawerTrigger asChild disabled={disabled}>
        <button>
          <IconEdit className="size-3 text-[#B9B9B9]" />
        </button>
      </DrawerTrigger>
      <DrawerContent className="mx-auto w-full max-w-[768px] bg-[#232329]">
        <DrawerHeader className="flex w-full items-center justify-between px-3.5 py-3">
          <DialogTitle className="mb-0.5 flex w-full items-center justify-between text-[calc(16rem/16)] leading-[calc(18rem/16)] font-normal text-[#FFFFFF]">
            <button onClick={handleDeleteName} className="capitalize">
              {t('walletCopy.cancel')}
            </button>
            <span>{t('walletCopy.changeWalletName')}</span>
            <button onClick={handleSaveName}>{t('walletCopy.save')}</button>
          </DialogTitle>
        </DrawerHeader>
        <div className="px-3">
          <div className="bg-impartal relative mt-3 mb-6 h-12 overflow-visible rounded-[8px] p-[1px]">
            <input
              type="text"
              className="peer no-spin-button h-full w-full rounded-[8px] border-none bg-[#141414] px-4 py-2 text-white focus:outline-none"
              placeholder=""
              value={name}
              onChange={(e) => {
                const value = e.target.value
                if (value.length <= 15) {
                  setName(value)
                }
              }}
              maxLength={15}
            />
            <label className="text-impartal peer-focus:text-impartal pointer-events-none absolute -top-3 left-4 h-5 rounded-sm bg-[#232329] px-2 py-1.5 text-xs leading-3 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:h-3.5 peer-placeholder-shown:p-0 peer-placeholder-shown:text-base peer-placeholder-shown:text-[calc(14rem/16)] peer-placeholder-shown:leading-3.5 peer-placeholder-shown:text-white peer-focus:-top-3 peer-focus:h-6 peer-focus:rounded-sm peer-focus:bg-[#232329] peer-focus:px-2 peer-focus:py-1.5 peer-focus:text-xs">
              {t('walletCopy.enterName')}
            </label>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default ModifyWalletName
