import { useEffect, useState } from 'react'
import ls from '@/lib/local-storage'
import { useSearchParams, useLocation } from 'react-router-dom'
import { CHAIN_DEFAULT, getIconChain, LIST_CHAIN_SUPPORTED, SupportedChain, TYPE_CHAIN } from '@/lib/blockchain'
import { useDispatch } from 'react-redux'
import { walletActions } from '@/redux/modules/wallet.slice'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Button } from '../ui/button'
import { useAppSelector } from '@/redux/store'
import { newWalletActions, mapLabelChain } from '@/redux/modules/newWallet.slice'
import { setQuickBuyAmount } from '@/redux/modules/quickBuy.slice'
import { IconTriangleDown, NewCheckboxWallet } from '../icon'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { APP_PATH } from '@/lib/constant'

type SwitchChainsProps = {
  iconRight?: string
  isNotSupportChainBtn?: boolean
  isMemePage?: boolean
}

const SwitchChains = ({
  iconRight = '/images/icons/arrow-right.svg',
  isNotSupportChainBtn = false,
  isMemePage = false,
}: SwitchChainsProps) => {
  const { t } = useTranslation()
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
    if (isNotSupportChainBtn) {
      return (
        <div className="cursor-pointer purple-btn-gradient !text-white !max-h-[42px] mt-4 text-[calc(1rem*(14/16))] leading-[1] font-[500] tracking-[calc(1rem*(0.5/16))] p-[13px_12.5px] rounded-[50px]">
          {t('monitoring.switchNetwork')}
        </div>
      )
    }

    if (isMemePage) {
      return (
        <Button variant="ghost" className="p-1 bg-[#18181d] rounded-[200px] gap-1 h-6 focus-visible:shadow-[none]">
          <img
            src={value === TYPE_CHAIN.SOLANA ? '/images/icons/ic-solana.svg' : getIconChain(value)}
            alt=""
            className="w-4 h-4 rounded-full border-[0.5px] border-[#25242b]"
          />
          <IconTriangleDown
            style={{ width: 14, height: 14, color: '#cacaca' }}
            className={cn('', {
              'rotate-180': open,
            })}
          />
          {/* <img src={iconRight} alt="" className="w-4 h-4 -ml-1" /> */}
        </Button>
      )
    }

    return (
      <Button
        variant="ghost"
        className="px-2 py-1 bg-[#ECECED14] rounded-[50px] gap-1 h-[26px] focus-visible:shadow-[none]"
      >
        <img src={getIconChain(value)} alt="" className="w-3 h-3" />
        <span className="block text-[14px] text-[#ffffff] leading-[12px] tracking-[0px] font-normal">
          {mapLabelChain(value as TYPE_CHAIN)}
        </span>
        <img src={iconRight} alt="" className="w-4 h-4 -ml-1" />
      </Button>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{handleRenderBtn()}</DrawerTrigger>
      <DrawerContent className="w-full bg-[#212127] max-w-3xl mx-auto">
        <DrawerHeader className="py-4.25 px-3.75 flex w-full items-center justify-between">
          <DrawerTitle>{t('detail.switchChain')}</DrawerTitle>
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt=""
          />
        </DrawerHeader>
        <div className="px-3.75 pb-7.5 pt-2 flex items-center flex-col gap-2.5">
          {LIST_CHAIN_SUPPORTED.map((e) => {
            if (pathname === APP_PATH.XSTOCKS && e.value !== TYPE_CHAIN.SOLANA && !isAssetsPage) {
              return { ...e, isActive: false }
            }
            return e
          }).map((item: SupportedChain, index: number) => (
            <div
              key={index}
              onClick={() => {
                console.log('item', item)
                if (isAssetsPage || item.isActive) {
                  handleSelectItem(item)
                }
              }}
              className={cn(
                'w-full',
                !isAssetsPage && !item.isActive ? 'cursor-not-allowed opacity-65' : 'cursor-pointer',
                !isAssetsPage && !item.isActive && 'hidden',
              )}
            >
              <div className="flex items-center gap-3 px-3 py-[13.5px] rounded-[10px] bg-[#2b2b33] border-[#ececed14] border w-full">
                <img
                  src={item.value === TYPE_CHAIN.SOLANA ? '/images/icons/ic-solana.svg' : item.img}
                  className="w-9 h-9"
                  alt=""
                ></img>
                <p className="text-[15px] font-semibold leading-none tracking-[0.25px]">{item.label}</p>
                {value === item.value ? (
                  <div className="ml-auto">
                    <NewCheckboxWallet />
                  </div>
                ) : (
                  <div className="ml-auto w-6.25 h-6.25 rounded-full border border-[#37363d]"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default SwitchChains
