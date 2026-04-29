import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@components/ui/button.tsx'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@components/ui/drawer.tsx'
import { _activeWallet, mappedTypeChain } from '@/redux/modules/newWallet.slice'
import InputBorderGradient from '@/components/orderForm/InputBorderGradient'
import { useTurnkey } from '@turnkey/sdk-react'
import { userGqlClient } from '@/lib/gql/apollo-client'
import { approveCreateWalletMutation } from '@/services/auth.service'
import { useDispatch, useSelector } from 'react-redux'
import { updateWallet } from '@/redux/modules/newWallet.slice'
import { useAppSelector } from '@/redux/store'
import { defaultSolanaAccountAtIndex } from '@turnkey/sdk-browser'
import { ChainType, UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { toast } from 'sonner'
import { AddIcon } from '@/components/icon'
import { useLocation } from 'react-router-dom'
import ls from '@/lib/local-storage'
import { ChainIds } from '@/types/enums'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { extractLatestWalletPath } from '@/lib/utils'

const AddNewWallet = () => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()
  const { indexedDbClient } = useTurnkey()
  const dispatch = useDispatch()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const subOrgId = useSelector(_userInfo)?.subOrgId
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { pathname } = useLocation()
  const isAssetsPage = pathname.includes('/assets')

  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const solWallets = useMemo(() => {
    return listWalletsByChain.filter((item: UserEmbeddedWalletDto) => item.chain === ChainType.Solana)
  }, [listWalletsByChain])

  useEffect(() => {
    if (!indexedDbClient) {
      return
    }

    indexedDbClient.config.activityPoller = {
      intervalMs: 0,
      numRetries: 0,
    }
  }, [indexedDbClient])

  const handleCreateWallet = async () => {
    try {
      setLoading(true)
      const firstItem = listWalletsByChain[0]
      const walletId = firstItem?.wallet ? firstItem.wallet.walletId : firstItem?.walletId

      const solanaWallets = listWalletsByChain.filter((item: any) => {
        return item.chain === ChainType.Solana
      })

      const isExist = solanaWallets.some((item: any) => {
        return item.name.trim() === name.trim()
      })

      if (isExist) {
        toast.error(t('wallet.statusErrors.WALLET_NAME_ALREADY_EXISTS'))
        return
      }

      const latestSubPath = extractLatestWalletPath(solanaWallets.map((w: UserEmbeddedWalletDto) => w.hdPath || ''))

      const activity = await indexedDbClient?.createWalletAccounts({
        organizationId: subOrgId,
        walletId,
        accounts: [defaultSolanaAccountAtIndex(latestSubPath + 1)],
      })

      const response = await userGqlClient.mutate({
        mutation: approveCreateWalletMutation,
        variables: {
          input: {
            activityId: activity?.activity?.id,
            name: name,
          },
        },
      })

      const newWallet = response.data.approveCreateWallet?.wallet

      const walletWithBalance = {
        ...newWallet,
        balance: 0,
      }

      dispatch(
        updateWallet({
          listWalletsByChain: [...listWalletsByChain, walletWithBalance],
        }),
      )

      toast.success(t('wallet.createWalletSuccessfully'))
      setOpen(false)
      setName('')
    } catch (error: any) {
      console.error('Error creating wallet:', error)
      const errorCode = error?.[0]?.code

      if (errorCode) {
        toast.error(t(`wallet.statusErrors.${errorCode}`))
      } else {
        toast.error(t('wallet.createWalletFailed'))
      }
    } finally {
      setLoading(false)
    }
  }

  const preventSpecialChars = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End']
    const currentLength = e.currentTarget.value.length

    if (allowedKeys.includes(e.key)) return

    if (currentLength >= 50) {
      e.preventDefault()
      return
    }

    const isValid = /^[a-zA-Z0-9 ]$/.test(e.key)
    if (!isValid) {
      e.preventDefault()
    }
  }

  useEffect(() => {
    if (open) {
      setName('')
      const timeout = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [open])

  const { isDesktop } = useResponsive()

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="px-3">
            <Button
              className="w-full h-[40px] text-[#FFFFFF] rounded-full bg-[#6A2AE0] gap-[2px]"
              disabled={
                (activeChain !== TYPE_CHAIN.SOLANA && !isAssetsPage) ||
                solWallets?.length >= 10 ||
                (isAssetsPage && ls.get('asset_chain_id') !== ChainIds.Solana)
              }
              onClick={() => {
                if (activeChain !== TYPE_CHAIN.SOLANA && !isAssetsPage) return
                setOpen(true)
              }}
            >
              <AddIcon />
              {t('wallet.addWallet.title')}
            </Button>
          </div>
        </DialogTrigger>
        <DialogContent
          className="w-full bg-[#232329] max-w-[768px] mx-auto pb-6 px-0 pt-2"
          showDialogPrimitiveClose={false}
        >
          <DialogTitle></DialogTitle>
          <DialogHeader className="flex justify-between px-3 py-0 flex-row">
            <p>{t('wallet.addWallet.title')}</p>
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              alt="arrow-left"
              onClick={() => setOpen(false)}
            />
          </DialogHeader>
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
              onClick={handleCreateWallet}
              disabled={loading || !name.trim()}
              isLoading={loading}
            >
              <div className="flex items-center text-[16px] leading-none font-medium">{t('wallet.create')}</div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <div className="px-3">
            <Button
              className="w-full h-[40px] text-[#FFFFFF] rounded-full gap-[2px]"
              variant="gradient"
              disabled={(activeChain !== TYPE_CHAIN.SOLANA && !isAssetsPage) || solWallets?.length >= 10}
              onClick={() => {
                if (activeChain !== TYPE_CHAIN.SOLANA && !isAssetsPage) return
                setOpen(true)
              }}
            >
              <AddIcon />
              {t('wallet.addWallet.title')}
            </Button>
          </div>
        </DrawerTrigger>
        <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto pb-6">
          <DrawerTitle></DrawerTitle>
          <DrawerHeader className="flex justify-between p-3">
            <p>{t('wallet.addWallet.title')}</p>
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              alt="arrow-left"
              onClick={() => setOpen(false)}
            />
          </DrawerHeader>
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
              className="rounded-full w-full font-normal mt-6 text-[#FFFFFF]"
              variant="gradient"
              onClick={handleCreateWallet}
              disabled={loading || !name.trim()}
              isLoading={loading}
            >
              <div className="flex items-center text-[16px] leading-none font-medium">{t('wallet.create')}</div>
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default AddNewWallet
