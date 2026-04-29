import { IconCheckCircleSolid } from '@components/icon'
import AppDrawer from '@components/common/AppDrawer.tsx'
import { ReactNode, Ref, useImperativeHandle, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils.ts'

type AccountType = 'funding' | 'futures' | 'spot'

export type ShowOptions = {
  accountType: AccountType
  onChange: (accountType: AccountType) => void
  disabledTypes?: AccountType[]
}

export interface SelectTransferAccountDrawerHandle {
  show: (options: ShowOptions) => void
}

export interface SelectTransferAccountDrawerProps {
  ref: Ref<SelectTransferAccountDrawerHandle>
  accountTypes: Array<{
    key: AccountType
    label: string
    icon: ReactNode
    balanceInUsd: number
  }>
}

export const SelectTransferAccountDrawer = (props: SelectTransferAccountDrawerProps) => {
  const { ref, accountTypes } = props
  const [open, setOpen] = useState(false)
  const [currentAccountType, setCurrentAccountType] = useState<AccountType>('funding')
  const [disabledTypes, setDisabledTypes] = useState<AccountType[]>([])
  const { t } = useTranslation()

  const callbackRef = useRef<Function>(null)

  useImperativeHandle(ref, () => {
    return {
      show: (option: ShowOptions) => {
        setOpen(true)
        setCurrentAccountType(option.accountType)
        setDisabledTypes(option.disabledTypes || [])
        callbackRef.current = option.onChange
      },
    }
  })

  const handleOnClick = (accountType: AccountType) => {
    if (disabledTypes.includes(accountType)) {
      return
    }
    setCurrentAccountType(accountType)
    setOpen(false)
    callbackRef.current?.(accountType)
  }

  return (
    <AppDrawer
      open={open}
      setOpen={setOpen}
      title={t('assets.transfer')}
      drawerClassName="bg-[url(/images/popup-bg.png)] bg-cover bg-center bg-no-repeat pb-10"
      drawerContent={
        <div>
          <div className="space-y-3 pb-4">
            {accountTypes.map((account) => (
              <div
                key={account.key}
                className={cn(
                  'border-gradient h-16 rounded-[8px] before:invisible hover:before:visible cursor-pointer',
                  currentAccountType === account.key ? 'before:visible' : 'before:invisible',
                  disabledTypes.includes(account.key) ? 'opacity-50 cursor-not-allowed hover:before:invisible' : '',
                )}
                onClick={() => handleOnClick(account.key)}
              >
                <div className="flex items-center h-full border border-[#ECECED1F] rounded-[8px] px-3 py-2 cursor-pointer">
                  <span className="flex justify-center items-center bg-[#ECECED14] rounded-[8px] size-10">
                    {account.icon}
                  </span>
                  <div className="block ml-2 flex-1">
                    <div>{account.label}</div>
                    <div className="text-[#FFFFFFB2] text-[calc(12rem/16)]">
                      {t('assets.transfers.availableBalanceInUsd', { balance: account.balanceInUsd })}
                    </div>
                  </div>
                  {account.key === currentAccountType && <IconCheckCircleSolid />}
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    />
  )
}
