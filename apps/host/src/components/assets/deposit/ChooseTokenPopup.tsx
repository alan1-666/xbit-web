import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant'
import BottomSheet from '@/components/common/BottomSheet'
import { useTranslation } from 'react-i18next'
import { ChainIds } from '@/types/enums.ts'
import { BLOCKCHAIN_NAMES, getBlockchainLogo2 } from '@/utils/helpers.ts'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  walletToDeposit: string | undefined
}

const nativeTokenSupported = [
  {
    token: 'SOL',
    name: 'Solana',
    chainId: ChainIds.Solana,
  },
  {
    token: 'ETH',
    name: 'Ethereum',
    chainId: ChainIds.Ethereum,
  },
]

const ChooseTokenPopup = ({ open, setOpen, walletToDeposit }: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)
  const activeWallet = useSelector(_activeWallet)

  const networkSupported = [ChainIds.Solana, ChainIds.Ethereum]
  const [networkSelected, setNetworkSelected] = useState<ChainIds | undefined>(undefined)

  const [listTokens, setListTokens] = useState<any[]>(nativeTokenSupported)

  useEffect(() => {}, [searchValue])

  useEffect(() => {
    if (networkSelected) {
      const tokens = nativeTokenSupported.filter((item) => item.chainId === networkSelected)
      setListTokens(tokens)
    } else {
      setListTokens(nativeTokenSupported)
    }
  }, [networkSelected])

  return (
    <BottomSheet open={open} setOpen={setOpen} title={t('assets.deposit.selectToken')}>
      <div className="h-[75vh]">
        <div className="relative w-full] mb-[14px]">
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
        <div className="">
          <div className="text-[14px] text-white/50 leading-none">{t('assets.deposit.selectNetwork')}</div>
          <div className="mt-3 flex gap-2">
            <div
              className={`h-[30px] px-[8px] py-[6px] bg-[#ECECED14] rounded-[6px] cursor-pointer text-center text-[14px] text-white leading-none flex items-center gap-1 border-gradient style2 ${networkSelected === undefined ? 'bg-gradient-to-r from-[#E149F8]/10 via-[ #9945FF]/10 to-[#00F3AB]/10' : 'before:invisible hover:before:visible'}`}
              onClick={(e) => {
                e.stopPropagation()
                if (networkSelected === undefined) {
                  setNetworkSelected(undefined)
                } else {
                  setNetworkSelected(undefined)
                }
              }}
            >
              <img src="/images/icons/global.svg" className="size-5" alt="" />
              {t('assets.switchNetwork.allNetwork')}
            </div>
            {networkSupported.map((network) => (
              <div
                key={network}
                className={`h-[30px] px-[8px] py-[6px] bg-[#ECECED14] rounded-[6px] cursor-pointer text-center text-[14px] text-white leading-none flex items-center gap-1 border-gradient style2 ${networkSelected === network ? 'bg-gradient-to-r from-[#E149F8]/10 via-[ #9945FF]/10 to-[#00F3AB]/10' : 'before:invisible hover:before:visible'}`}
                onClick={(e) => {
                  e.stopPropagation()
                  if (networkSelected === network) {
                    setNetworkSelected(undefined)
                  } else {
                    setNetworkSelected(network)
                  }
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
            {listTokens.map((item) => (
              <div
                className="flex items-center justify-between p-3 rounded-[8px] border-gradient style2 border-[0.5px] border-[#ECECED1F] before:invisible hover:before:visible  cursor-pointer"
                onClick={() => {
                  setOpen(false)
                  navigate(`${APP_PATH.DEPOSIT}`)
                }}
                key={item.token}
              >
                <div className="flex items-center gap-2.5">
                  <LogoWithChain logo={getBlockchainLogo2(item.chainId)} logoClassName="w-9 h-9" name={item.name} />
                  <div>
                    <div className="font-[380] text-[16px] text-white leading-none">{item.token}</div>
                    <div className="mt-[6px] font-[320] text-[12px] text-white/50 leading-none">{item.name}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}

export default ChooseTokenPopup
