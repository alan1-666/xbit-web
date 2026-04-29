import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { CHAIN_DEFAULT, getIconChain, LIST_CHAIN_SUPPORTED, SupportedChain, TYPE_CHAIN } from '@/lib/blockchain'
import { APP_PATH } from '@/lib/constant'
import ls from '@/lib/local-storage'
import { mapLabelChain, newWalletActions } from '@/redux/modules/newWallet.slice'
import { setQuickBuyAmount } from '@/redux/modules/quickBuy.slice'
import { walletActions } from '@/redux/modules/wallet.slice'
import { useAppSelector } from '@/redux/store'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useSearchParams } from 'react-router-dom'
import { CheckboxWallet } from '../icon'
import { Button } from '../ui/button'

type SwitchChainsProps = {
  iconRight?: string
}

const MobileSwitchChains = ({ iconRight = '/images/icons/arrow-right.svg' }: SwitchChainsProps) => {
  const [params] = useSearchParams()
  const { pathname } = useLocation()
  const isAssetsPage = pathname.includes('/assets')
  const [open, setOpen] = useState(false)
  const selectedChain = useAppSelector((state) => state.newWallet.activeChain)

  const paramChain = params.get('chain')
  const dispatch = useDispatch()
  const [value, setValue] = useState<string>(selectedChain)

  useEffect(() => {
    if (!selectedChain && !paramChain) {
      ls.set('meme_chain', CHAIN_DEFAULT)
    }
  }, [])

  useEffect(() => {
    if (paramChain) {
      ls.set('meme_chain', paramChain)
      setValue(paramChain)
    }
  }, [paramChain])

  useEffect(() => {
    if (selectedChain) {
      setValue(selectedChain)
      setChainToLS(selectedChain)
    }
  }, [selectedChain])

  const setChainToLS = (val: string) => {
    if (val !== TYPE_CHAIN.ARB && pathname !== APP_PATH.XSTOCKS) {
      ls.set('meme_chain', val)
    }
  }

  const handleSelectItem = (item: any) => {
    const value = item.value
    setValue(value)
    setChainToLS(value)
    dispatch(walletActions.setActiveChain(value))
    dispatch(newWalletActions.setActiveChain(value))
    dispatch(setQuickBuyAmount(''))
    setOpen(false)
    if (isAssetsPage) {
      ls.set('asset_chain_id', item.chain_id)
    }
  }

  const handleRenderBtn = () => {
    return (
      <Button
        variant="ghost"
        className="px-2 py-1 bg-[#ECECED14] rounded-[50px] gap-1 h-[26px] focus-visible:shadow-[none]"
      >
        <img src={value === TYPE_CHAIN.ARB ? '/images/arbitrum-arb-logo.svg' : getIconChain(value)} alt="" className="w-3 h-3" />
        {<span className="block text-[12px] text-[#ffffff] leading-[12px] tracking-[0px] font-normal mapLabelChain">
          {mapLabelChain(value as TYPE_CHAIN).slice(0, 3).toLocaleUpperCase()}
        </span>}
        <img src={iconRight} alt="" className="w-4 h-4 -ml-1" />
      </Button>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{handleRenderBtn()}</DrawerTrigger>
      <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto">
        <DrawerHeader className="py-3 px-3.5 flex w-full items-center justify-between">
          <DrawerTitle></DrawerTitle>
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt=""
          />
        </DrawerHeader>
        <div className="px-3 pb-8">
          {LIST_CHAIN_SUPPORTED.map((e) => {
            if (selectedChain === TYPE_CHAIN.ARB && e.value !== TYPE_CHAIN.ARB) {
              return { ...e, isActive: false }
            } else if (selectedChain === TYPE_CHAIN.ARB && e.value === TYPE_CHAIN.ARB) {
              return { ...e, isActive: true }
            } else if (pathname === APP_PATH.XSTOCKS && e.value !== TYPE_CHAIN.SOLANA) {
              return { ...e, isActive: false }
            }
            return e
          }).map((item: SupportedChain, index: number) => (
            <div
              key={index}
              onClick={() => {
                if (isAssetsPage || item.isActive) {
                  handleSelectItem(item)
                }
              }}
              className={
                !isAssetsPage && !item.isActive ? 'cursor-not-allowed opacity-65' : 'cursor-pointer hover:bg-[#26282C]'
              }
            >
              <div className="flex items-center gap-3 py-3.5 border-b-[#ececed14] border-b-[0.5px] w-full">
                <img
                  src={item.value === TYPE_CHAIN.SOLANA ? '/images/icons/ic-solana.svg' : item.img}
                  className="w-8 h-8"
                  alt=""
                ></img>
                <p className="text-base font-medium leading-none">{item.label}</p>
                {/* <p className="text-base font-medium leading-none">{item.label.slice(0, 3).toLocaleUpperCase()}</p> */}
                {value === item.value && (
                  <div className="ml-auto">
                    <CheckboxWallet />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default MobileSwitchChains
