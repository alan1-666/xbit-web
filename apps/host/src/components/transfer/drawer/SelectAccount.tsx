import Text from '@/components/common/Text'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { tConst } from '@/utils/helpers.ts'
import { ACCOUNT_TYPE } from '../lib/enum'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
const ItemSelect = ({
  isSelect,
  accountType,
  onClick,
}: {
  isSelect: boolean
  onClick: () => void
  accountType: 'MEME' | 'CONTRACT'
}) => {
  return (
    <div
      className={cn(
        'border-[1px] rounded-[8px] flex justify-between items-center h-[64px] px-[12px] bg-[#0F0F0F] relative cursor-pointer border-[#ECECED1F]',
        isSelect && 'border-gradient-toolbar-klineStyle',
      )}
      onClick={onClick}
    >
      <div className="inline-flex gap-2 items-center relative z-1">
        <div className="bg-[#ECECED14] rounded-[8px] size-[40px] flex justify-center items-center">
          {accountType === 'MEME' && <img src="/images/icons/dollar-circle.svg" alt="" className="size-[20px]" />}
          {accountType === 'CONTRACT' && (
            <img src="/images/icons/icon-swap-transparent.svg" alt="" className="size-[20px]" />
          )}
        </div>
        <Text
          text={
            accountType === 'MEME' ? tConst('assets.transfers.memeAccount') : tConst('assets.transfers.contractAccount')
          }
          fontSize={16}
        />
      </div>
      {isSelect && (
        <div className="">
          <img src={'/images/icons/icon-success.svg'} alt="icon error" className="size-[20px]" />
        </div>
      )}
    </div>
  )
}

const SelectAccount = ({
  label,
  isContractAccountType,
  onSelect,
}: {
  label: string
  onSelect: (accountType: ACCOUNT_TYPE) => void
  isContractAccountType: boolean
}) => {
  const [open, setOpen] = useState(false)
  const [account, setAccount] = useState(isContractAccountType ? ACCOUNT_TYPE.CONTRACT : ACCOUNT_TYPE.MEME)
  const { t } = useTranslation()

  const { isDesktop } = useResponsive()

  useEffect(() => {
    setAccount(isContractAccountType ? ACCOUNT_TYPE.CONTRACT : ACCOUNT_TYPE.MEME)
  }, [isContractAccountType])

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="cursor-pointer inline-flex items-center gap-1">
            {/* <Text text={`到 ${account}`} fontSize={14} fontWeight="light" color="#FFFFFFB2" /> */}
            <Text text={label} fontSize={14} fontWeight="light" color="#FFFFFFB2" />

            <img src="/images/cryptoDeposit/arrow-down.svg" alt="" className="w-[10px] h-[10px]" />
          </div>
        </DialogTrigger>
        <DialogContent className="w-full bg-[#232329] max-w-[768px] mx-auto p-0" showDialogPrimitiveClose={false}>
          <DialogHeader className="py-5 px-3.5 flex w-full items-center justify-between flex-row pb-2">
            <DialogTitle className="flex items-center">
              <Text text={t('assets.transfers.selectAccount')} fontSize={18} fontWeight="medium" />
            </DialogTitle>
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setOpen(false)}
              alt=""
            />
          </DialogHeader>
          <div className="px-3 pb-8 space-y-[12px]">
            <ItemSelect
              accountType="MEME"
              isSelect={account === ACCOUNT_TYPE.MEME}
              onClick={() => {
                setAccount(ACCOUNT_TYPE.MEME)
                setOpen(false)
                onSelect(ACCOUNT_TYPE.MEME)
              }}
            />
            <ItemSelect
              accountType="CONTRACT"
              isSelect={account === ACCOUNT_TYPE.CONTRACT}
              onClick={() => {
                setAccount(ACCOUNT_TYPE.CONTRACT)
                setOpen(false)
                onSelect(ACCOUNT_TYPE.CONTRACT)
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <div className="cursor-pointer inline-flex items-center gap-1">
            {/* <Text text={`到 ${account}`} fontSize={14} fontWeight="light" color="#FFFFFFB2" /> */}
            <Text text={label} fontSize={14} fontWeight="light" color="#FFFFFFB2" />

            <img src="/images/cryptoDeposit/arrow-down.svg" alt="" className="w-[10px] h-[10px]" />
          </div>
        </DrawerTrigger>
        <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto">
          <DrawerHeader className="py-5 px-3.5 flex w-full items-center justify-between">
            <DrawerTitle className="flex items-center">
              <Text text={t('assets.transfers.selectAccount')} fontSize={18} fontWeight="medium" />
            </DrawerTitle>
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setOpen(false)}
              alt=""
            />
          </DrawerHeader>
          <div className="px-3 pb-8 space-y-[12px] mt-[12px]">
            <ItemSelect
              accountType="MEME"
              isSelect={account === ACCOUNT_TYPE.MEME}
              onClick={() => {
                setAccount(ACCOUNT_TYPE.MEME)
                setOpen(false)
                onSelect(ACCOUNT_TYPE.MEME)
              }}
            />
            <ItemSelect
              accountType="CONTRACT"
              isSelect={account === ACCOUNT_TYPE.CONTRACT}
              onClick={() => {
                setAccount(ACCOUNT_TYPE.CONTRACT)
                setOpen(false)
                onSelect(ACCOUNT_TYPE.CONTRACT)
              }}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default SelectAccount
