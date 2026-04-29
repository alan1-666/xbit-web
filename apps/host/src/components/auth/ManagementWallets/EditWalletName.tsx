import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@components/ui/drawer.tsx'
import InputBorderGradient from '@/components/orderForm/InputBorderGradient'
import { userGqlClient } from '@/lib/gql/apollo-client'
import { updateEmbeddedWalletNameMutation } from '@/services/auth.service'
import { useDispatch } from 'react-redux'
import { updateWallet } from '@/redux/modules/newWallet.slice'
import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useResponsive } from '@hooks/useResponsive.ts'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@components/ui/dialog.tsx'
import { useAppSelector } from '@/redux/store'

interface EditWalletNameProps {
  wallet: UserEmbeddedWalletDto
  children: React.ReactNode
}

const EditWalletName = ({ wallet, children }: EditWalletNameProps) => {
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(wallet.name || '')
  const inputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { isDesktop } = useResponsive()

  const handleUpdateName = async () => {
    if (!name.trim() || name === wallet.name) return

    try {
      setLoading(true)

      const response = await userGqlClient.mutate({
        mutation: updateEmbeddedWalletNameMutation,
        variables: {
          input: {
            id: wallet.id,
            name: name.trim(),
          },
        },
      })

      if (response.data?.updateEmbeddedWalletName) {
        const updatedWalletsByChain = listWalletsByChain.map((item: any) => {
          if (item.wallet) {
            if (item.wallet.id === wallet.id) {
              return {
                ...item,
                wallet: {
                  ...item.wallet,
                  name: name.trim(),
                },
              }
            }
          } else {
            if (item.id === wallet.id) {
              return {
                ...item,
                name: name.trim(),
              }
            }
          }
          return item
        })

        dispatch(
          updateWallet({
            listWalletsByChain: updatedWalletsByChain,
          }),
        )
        toast.success(t('wallet.updateWalletSuccessfully'))
        setOpen(false)
      }
    } catch (error: any) {
      console.error('Error updating wallet name:', error)
      const errorCode = error?.[0]?.code
      if (errorCode) {
        toast.error(t(`wallet.statusErrors.${errorCode}`))
      } else {
        toast.error(t('wallet.updateWalletFailed'))
      }
    } finally {
      setLoading(false)
    }
  }

  const preventSpecialChars = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End']
    if (allowedKeys.includes(e.key)) return
    const isValid = /^[a-zA-Z0-9 ]$/.test(e.key)
    if (!isValid) {
      e.preventDefault()
    }
  }

  useEffect(() => {
    if (open) {
      setName(wallet.name || '')
      const timeout = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [open])

  const renderContent = () => {
    return (
      <div className="px-3">
        <InputBorderGradient
          containerClassName="mt-3"
          unit={''}
          value={name}
          onChange={(value) => {
            if (value.length <= 15) {
              setName(value)
            }
          }}
          placeHolder={t('wallet.enterWalletName')}
          inputProps={{
            onKeyDown: (e) => preventSpecialChars(e),
            ref: inputRef,
            maxLength: 15,
          }}
        />
        <Button
          className="bg-[#6A2AE0] rounded-full w-full font-normal mt-6 text-[#FFFFFF]"
          onClick={handleUpdateName}
          disabled={loading || !name.trim() || name === wallet.name}
          isLoading={loading}
        >
          <div className="flex items-center text-[16px] leading-none font-medium">{t('wallet.updateName')}</div>
        </Button>
      </div>
    )
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DrawerTrigger
          asChild
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            setOpen(true)
          }}
        >
          {children}
        </DrawerTrigger>
        <DialogContent className="w-full bg-[#232329] max-w-[400px] mx-auto pb-6">
          <div>{t('wallet.editWalletName')}</div>
          {renderContent()}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        asChild
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          setOpen(true)
        }}
      >
        {children}
      </DrawerTrigger>
      <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto pb-6">
        <DrawerTitle></DrawerTitle>
        <DrawerHeader className="flex justify-between p-3">
          <p>{t('wallet.editWalletName')}</p>
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            alt="close"
            onClick={() => setOpen(false)}
          />
        </DrawerHeader>
        {renderContent()}
      </DrawerContent>
    </Drawer>
  )
}

export default EditWalletName
