import { Ref, SetStateAction, useImperativeHandle, useState } from 'react'
import { IconSearch } from '@components/icon'
import ChainCurrencyIcon from '@components/common/ChainCurrencyIcon.tsx'
import { getBlockchainLogo2 } from '@/utils/helpers.ts'
import AppDrawer from '@components/common/AppDrawer.tsx'
import { useTranslation } from 'react-i18next'
import { ChainIds } from '@/types/enums.ts'

export interface SelectTokenDrawerHandle {
  show: () => void
}

export interface SelectTokenDrawerProps {
  tokens: Token[]
  ref: Ref<SelectTokenDrawerHandle>
  onChange: (token: Token) => void
  open?: boolean
  setOpen: React.Dispatch<SetStateAction<boolean>>
}

type Token = {
  name: string
  address: string
  chainId: ChainIds
  logo: string
  balance: number
  balanceInUsd: number
}

export const SelectTokenDrawer = (props: SelectTokenDrawerProps) => {
  const { ref, onChange, tokens, open, setOpen } = props
  const { t } = useTranslation()

  const handleOnClick = (token: Token) => {
    setOpen(false)
    onChange(token)
  }

  useImperativeHandle(ref, () => ({
    show: () => {
      setOpen(true)
    },
  }))

  return (
    <AppDrawer
      open={open}
      setOpen={setOpen}
      title={"选择币种"}
      drawerClassName=" bg-[url(/images/popup-bg.png)] bg-cover bg-center bg-no-repeat"
      drawerContentClassName="h-[75vh]"
      drawerContent={
        <div className="space-y-3.5 pb-10">
          <div className="border border-[#ECECED14] rounded-full px-3 py-2.5 flex items-center gap-2">
            <IconSearch className="text-white" />
            <input className="flex-1 text-[calc(14rem/16)]" placeholder={"搜索币种名称、合约地址"} />
          </div>
          <div>
            <div className="text-[calc(13rem/16)] text-[#FFFFFF80] mb-3">选择币种</div>
            {tokens.map((token) => (
              <div
                key={`${token.chainId}-${token.address}`}
                className="py-4 flex items-center cursor-pointer"
                onClick={() => handleOnClick(token)}
              >
                <ChainCurrencyIcon
                  currencyIcon={token.logo}
                  className="size-9"
                  avatarClassName="size-9"
                  avatarImageClassName="size-9"
                  chainIcon={getBlockchainLogo2(token.chainId)}
                />
                <div className="flex-1 ml-2">
                  <div className="text-[calc(16rem/16)] text-[#FFFFFF]">{token.name}</div>
                  <div className="text-[calc(12rem/16)] text-[#FFFFFFB2]">{token.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-[calc(16rem/16)] text-[#FFFFFF]">{token.balance}</div>
                  <div className="text-[calc(12rem/16)] text-[#FFFFFFB2]">${token.balanceInUsd}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    />
  )
}
