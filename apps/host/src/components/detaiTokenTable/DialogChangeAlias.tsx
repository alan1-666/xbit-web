import { ChainType } from '@/@generated/gql/graphql-meme2.ts'
import InputBorderGradient from '@components/orderForm/InputBorderGradient.tsx'
import { Button } from '@components/ui/button.tsx'
import { DrawerClose } from '@components/ui/drawer.tsx'
import { Loader2, X } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { useTranslation } from 'react-i18next'
import { useEffect, useMemo, useState } from 'react'
import { futureClient } from '@/lib/gql/apollo-client'
import { addFollowingWallet } from '@/services/wallet.service'
import { useQueryClient } from '@tanstack/react-query'
import { editXWalletFavourite } from '@/hooks/useGetTotalFollowingAddress'
import { useActiveWallet } from '@/hooks/useActiveWallet'
import { useDetailTokenTableContext } from './DetailTokenTableContext'
import { toast } from 'sonner'
import { useActiveChainType } from '@/hooks/useActiveChain'

interface DialogChangeAliasProps {
  open: boolean
  address: string
  setOpen: (value: boolean) => void
}

const DialogChangeAlias = () => {
  const { editNameState, setEditNameState, aliasTotalFollowings } = useDetailTokenTableContext()

  const address = editNameState?.id ?? ''

  const { t } = useTranslation()
  const activeWallet = useActiveWallet()
  const addr = activeWallet?.walletAddress ?? 'anonymous'
  const [loading, setLoading] = useState(false)
  const [addressValue, setAddressValue] = useState(editNameState?.id || '')
  const queryClient = useQueryClient()
  const activeChainType = useActiveChainType()

  const aliasTotalFollowing = useMemo(
    () => aliasTotalFollowings?.find((item) => item?.address === address)?.alias ?? '',
    [address],
  )

  useEffect(() => {
    if (aliasTotalFollowing) {
      setAddressValue(aliasTotalFollowing)
    }
    // console.log()
  }, [aliasTotalFollowing, editNameState?.status, address])

  function changeAliasLocal(address: string, alias: string) {
    editXWalletFavourite({
      address,
      alias,
    }, activeChainType)
  }

  const handleSaveName = () => {
    setLoading(true)
    futureClient
      .mutate({
        mutation: addFollowingWallet,
        variables: {
          input: {
            chain: 'SOLANA',
            follows: [
              {
                address,
                name: addressValue.trim(),
              },
            ],
          },
        },
      })
      .then(() => {
        changeAliasLocal(address, addressValue)
        queryClient.setQueryData(['totalFollowings', ChainType.Solana, addr], (oldData: any) => {
          if (!oldData) return oldData
          const newData = [...oldData]
          const idx = newData.findIndex((e) => e.address === address)
          if (idx !== -1) {
            newData[idx] = {
              address,
              alias: addressValue,
            }
          } else {
            newData.push({
              address,
              alias: addressValue,
            })
          }
          return newData
        })
        toast.success(t('detail.tokenDetail.changeAliasToast'))
      }).catch(() => {
        toast.error(t('detail.tokenDetail.changeAliasFail'))
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleConfirmClick = () => {
    setLoading(true)
    handleSaveName()
    setLoading(false)
    if (editNameState) {
      setEditNameState?.({ ...editNameState, status: false })
    }
  }

  const handleResetClick = () => {
    setAddressValue('')
    // onAddressChange?.('')
    // setOpen(false)
  }

  return (
    <Dialog
      open={editNameState?.status}
      onOpenChange={(e) => {
        if (editNameState) {
          setEditNameState?.({ ...editNameState, status: e })
        }
      }}
    >
      <DialogContent className="w-full bg-[#232329] max-w-[768px] p-4" showDialogPrimitiveClose={false}>
        <DialogHeader>
          <DialogTitle className="mt-1.5">
            <div className="text-[cal c(1rem*(22/16))] leading-[1] app-font-regular text-left">
              {t('detail.tokenDetail.changeAlias')}
            </div>
          </DialogTitle>
          <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="size-5" />
          </DrawerClose>
        </DialogHeader>

        <DialogDescription className="flex flex-col gap-3 ">
          <div className="relative flex items-center">
            <div className="flex flex-col flex-1 gap-3">
              <div className="text-[cal c(1rem*(22/16))] leading-[1] app-font-regular text-left">
                {t('detail.tokenDetail.changeAliasDes', { address })}
              </div>
              <InputBorderGradient
                unit=""
                placeHolder={t('detail.tokenDetail.changeAlias')}
                containerClassName="h-[48px] px-[14px] py-[12px] rounded-[8px] flex-1"
                innerBgClassName="rounded-[8px] bg-[#141414]"
                inputClassName="placeholder:text-[#FFFFFF5C] placeholder:text-[calc(1rem*(14/16))] text-[calc(1rem*(14/16))] max-w-[100%] flex-1"
                unitClassName="min-w-[auto] text-[calc(1rem*(14/16))] text-[#FFFFFF99] leading-[1]"
                value={addressValue}
                onChange={(value) => setAddressValue(value)}
              />
            </div>

            {addressValue && (
              <button
                type="button"
                className="absolute right-2 top-1/2  p-1 text-[#fff] hover:text-[#ff4d4f]"
                onClick={() => {
                  setAddressValue('')
                  //   onClear?.()
                }}
                aria-label="Clear"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </DialogDescription>

        <DialogFooter className="pt-0 border-t-[0.5px] border-t-[#ECECED0A]">
          <div className="flex justify-center items-center flex-row gap-2.5 pt-4 flex-1">
            <Button
              size="lg"
              disabled={loading}
              variant="borderGradient"
              className="flex-1 rounded-full h-11"
              onClick={handleResetClick}
            >
              {t('orderForm.buySettings.reset')}
            </Button>

            <Button
              size="lg"
              disabled={loading}
              variant="gradient"
              className="text-[#261236] flex-1 rounded-[50px] h-11"
              onClick={handleConfirmClick}
            >
              {loading && <Loader2 className="animate-spin w-4 h-4 mr-1" />}
              {t('chart.buttons.confirm')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DialogChangeAlias
