import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant'
import BottomSheet from '@/components/common/BottomSheet'
import { Button } from '@components/ui/button.tsx'
import { useTranslation } from 'react-i18next'
import { ChainIds } from '@/types/enums.ts'
import { BLOCKCHAIN_NAMES, formatNumber, getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers.ts'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import MoneyFormatted from '@components/common/MoneyFormatted.tsx'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  onSelectToken: (token: any) => void
}

const ChooseTokenBottomSheet = ({ open, setOpen, onSelectToken }: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  const networkSupported = [ChainIds.Solana, ChainIds.Ethereum, ChainIds.Bsc]
  const [networkSelected, setNetworkSelected] = useState<ChainIds | undefined>(undefined)

  const mockTokens = [
    {
      token: 'TRUMP',
      name: 'Trump Official',
      chainId: ChainIds.Solana,
      address: '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN',
      amount: '12345',
      price: '15',
    },
    {
      token: 'RAY',
      name: 'Raydium',
      chainId: ChainIds.Solana,
      address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
      amount: '1000',
      price: '115',
    },
  ]

  return (
    <BottomSheet open={open} setOpen={setOpen} title={t('assets.deposit.chooseToken')}>
      <div className="h-[75vh]">
        <div className="relative w-full]">
          <input
            ref={inputRef}
            value={searchValue}
            onChange={(e) => {
              const value = e.target.value.replace(/\s+/g, '')
              setSearchValue(value)
            }}
            placeholder={t('assets.deposit.searchToken')}
            type="text"
            className="w-full p-3 pl-[50px] bg-(--bg-secondary) border border-solid border-(--bg-secondary) rounded-[200px] text-[14px] leading-[14px]"
          />
          <img alt="" className="size-[16px] absolute top-[15px] left-[28px]" src="/images/icons/search-icon-2.svg" />
          {searchValue.length !== 0 && (
            <img
              className="size-[16px] absolute top-[15px] right-[25px]"
              src="/images/icons/icon-x.svg"
              alt=""
              onClick={() => {
                setSearchValue('')
                if (inputRef.current) {
                  inputRef.current.focus()
                }
              }}
            />
          )}
        </div>
        <div className="mt-[14px]">
          <div className="text-[14px] text-white/50 leading-none">{t('assets.deposit.selectNetwork')}</div>
          <div className="mt-3 flex gap-2">
            {networkSupported.map((network) => (
              <div
                key={network}
                className={`h-[30px] px-[8px] py-[6px] bg-[#ECECED14] rounded-[6px] cursor-pointer text-center text-[14px] text-white leading-none flex items-center gap-1 border-gradient style2 ${networkSelected === network ? 'bg-gradient-to-r from-[#E149F8]/10 via-[ #9945FF]/10 to-[#00F3AB]/10' : 'before:invisible hover:before:visible'}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setNetworkSelected(network)
                }}
              >
                <LogoWithChain
                  logo={getBlockchainLogo2(network)}
                  logoClassName="w-[18px] h-[18px] min-w-none"
                  name={BLOCKCHAIN_NAMES[network]}
                />
                {BLOCKCHAIN_NAMES[network]}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <div className="text-[14px] text-white/50 leading-none">{t('assets.deposit.selectToken')}</div>
          <div className="mt-3 flex flex-col gap-3">
            {mockTokens.map((item) => (
              <div
                className="flex items-center justify-between p-3 rounded-[8px] border-[0.5px] border-[#ECECED1F] cursor-pointer border-gradient style2 before:invisible hover:before:visible"
                onClick={() => {
                  setOpen(false)
                  onSelectToken(item)
                }}
              >
                <div className="flex items-center gap-2.5">
                  <LogoWithChain
                    logo={getBlockChainLogo(item.chainId, item.address)}
                    logoClassName="w-9 h-9"
                    name={item.name}
                  />
                  <div>
                    <div className="font-[380] text-[16px] text-white leading-none">{item.token}</div>
                    <div className="mt-[6px] font-[320] text-[12px] text-white/50 leading-none">{item.name}</div>
                  </div>
                </div>
                <div>
                  <div className="font-sembold text-[16px] text-white leading-none">{formatNumber(item.amount)}</div>
                  <MoneyFormatted
                    value={Number(item.amount) * Number(item.price)}
                    className="mt-[6px] font-[320] text-[12px] text-white/50 leading-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}

export default ChooseTokenBottomSheet
