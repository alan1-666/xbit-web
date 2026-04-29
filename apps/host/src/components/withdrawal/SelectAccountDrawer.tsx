import AppDrawer from '@components/common/AppDrawer.tsx'
import { Ref, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { IconChevronRight, IconMoneyGradient, IconRecoveryConvertGradient, IconTradeGradient } from '@components/icon'
import { SelectTokenDrawer, SelectTokenDrawerHandle } from '@components/withdrawal/SelectTokenDrawer.tsx'
import { ChainIds } from '@/types/enums.ts'
import { getPath } from '@/lib/utils.ts'
import { APP_PATH } from '@/lib/constant.ts'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils.ts'
import { useActiveAccount } from '@hooks/useActiveAccount.ts'
import { USDC_ADDRESS_ARBITRUM } from '@components/transfer/constants.ts'

export interface SelectAccountDrawerHandle {
  show: () => void
}

export interface SelectAccountDrawerProps {
  ref: Ref<SelectAccountDrawerHandle>
}

const usdcToken = {
  name: 'USDC',
  chainId: ChainIds.Arbitrum,
  address: USDC_ADDRESS_ARBITRUM,
}

export const SelectAccountDrawer = (props: SelectAccountDrawerProps) => {
  const { ref } = props
  const [open, setOpen] = useState(false)
  const selectTokenDrawerRef = useRef<SelectTokenDrawerHandle>(null)
  const navigate = useNavigate()

  const { t } = useTranslation()

  const activeAccount = useActiveAccount()

  const accountTypes = [
    { key: 'funding', label: t('assets.fundingAccount'), icon: <IconMoneyGradient /> },
    {
      key: 'futures',
      label: t('assets.futuresAccount'),
      icon: <IconRecoveryConvertGradient />,
      disabled: true, // Futures account is disabled for now
    },
    // {
    //   key: 'spot',
    //   label: t('assets.spotAccount'),
    //   icon: <IconTradeGradient />,
    //   disabled: true, // Spot account is disabled for now
    // },
  ]

  const shownAccountTypes = useMemo(() => {
    // if (activeAccount === TYPE_ACCOUNT.CHAIN) {
    //   return accountTypes.filter((account) => account.key !== 'funding')
    // }
    return accountTypes
  }, [activeAccount])

  const navigateToWithdraw = (
    token: { name: string; chainId: ChainIds; address: string; decimals: number },
    accountType: string,
  ) => {
    const basePathname = getPath(APP_PATH.WITHDRAWAL, {
      accountType,
    })
    const urlSearchParams = new URLSearchParams()
    urlSearchParams.set('chainId', token.chainId.toString())
    urlSearchParams.set('tokenAddress', token.address)
    urlSearchParams.set('tokenName', token.name)
    urlSearchParams.set('decimals', token.decimals?.toString() || '9')
    navigate(`${basePathname}?${urlSearchParams.toString()}`)
  }

  useImperativeHandle(ref, () => {
    return {
      show: () => {
        setOpen(true)
      },
    }
  })

  const handleSelectAccount = (accountType: string) => {
    // if (activeAccount === TYPE_ACCOUNT.TELEGRAM) {
    //   // Show drawer to select token for withdrawal
    //   selectTokenDrawerRef.current?.show({
    //     variant: 'iconOnly',
    //     onTokenSelect: (token) => navigateToWithdraw(token, accountType),
    //   })
    //   return
    // }

    if (accountType === 'funding') {
      selectTokenDrawerRef.current?.show({
        variant: 'iconOnly',
        onTokenSelect: (token) => navigateToWithdraw(token, accountType),
      })
    }

    // Handle for wallet connection
    if (accountType === 'futures') {
      // Navigate to the withdrawal page to withdraw USDC on Arbitrum, since the future account is on Arbitrum only
      navigateToWithdraw(usdcToken, 'futures')
    } else if (accountType === 'spot') {
      selectTokenDrawerRef.current?.show({
        variant: 'showLabel',
        onTokenSelect: (token) => {
          navigateToWithdraw(token, 'spot')
        },
      })
    }
  }

  return (
    <>
      <AppDrawer
        open={open}
        setOpen={setOpen}
        title={t('assets.withdraw.withdrawLabel')}
        drawerClassName="bg-[url(/images/popup-bg.png)] bg-cover bg-center bg-no-repeat"
        drawerContent={
          <div className="space-y-3">
            {shownAccountTypes.map((account) => (
              <div
                key={account.key}
                className={cn(
                  'border-gradient style2 h-16 rounded-[8px] before:invisible hover:before:visible cursor-pointer',
                  account.disabled ? 'opacity-50 cursor-not-allowed' : '',
                )}
                onClick={() => {
                  if (account.disabled) return
                  handleSelectAccount(account.key)
                }}
              >
                <div className="flex items-center h-full border border-[#ECECED1F] rounded-[8px] px-3 py-2">
                  <span className="flex justify-center items-center bg-[#ECECED14] rounded-[8px] size-10">
                    {account.icon}
                  </span>
                  <span className="block ml-2 flex-1">{account.label}</span>
                  <IconChevronRight />
                </div>
              </div>
            ))}
          </div>
        }
      />
      <SelectTokenDrawer ref={selectTokenDrawerRef} />
    </>
  )
}
