import { Configs } from '@/const/configs'
import { getShortNameByTypeChain, LIST_CHAIN_SUPPORTED, SupportedChain, TYPE_CHAIN } from '@/lib/blockchain'
import ls from '@/lib/local-storage'
import { cn } from '@/lib/utils'
import { newWalletActions } from '@/redux/modules/newWallet.slice'
import { setQuickBuyAmount } from '@/redux/modules/quickBuy.slice'
import { walletActions } from '@/redux/modules/wallet.slice'
import { IconTriangleDown } from '@components/icon/IconTriangleDown.tsx'
import { useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import Text from '../common/Text'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { useLocation, useNavigate } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant'
import { useActiveChain } from '@hooks/useActiveChain.ts'

const ChangeChainButton = () => {
  const dispatch = useDispatch()
  const activeChain = useActiveChain()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isAssetsPage = pathname.includes('/assets')

  const nativeTokenLogo = useMemo(() => {
    if (activeChain === TYPE_CHAIN.SOLANA) return '/images/icons/icon-sol.svg'
    if (activeChain === TYPE_CHAIN.ETH) return '/images/ether.svg'
    if (activeChain === TYPE_CHAIN.ARB) return '/images/ether.svg'
    return LIST_CHAIN_SUPPORTED.find((item) => item.value === activeChain)?.img
  }, [activeChain])

  const handleShowChainLogo = (chain: string) => {
    if (chain === TYPE_CHAIN.SOLANA) return '/images/icons/icon-sol.svg'
    if (chain === TYPE_CHAIN.ETH) return '/images/ethereum-eth.svg'
    if (chain === TYPE_CHAIN.ARB) return '/images/arbitrum-arb-logo.svg'
    return LIST_CHAIN_SUPPORTED.find((item) => item.value === chain)?.img
  }

  const handleSelectItem = (value: TYPE_CHAIN) => {
    setChaintoLS(value)
    dispatch(walletActions.setActiveChain(value))
    dispatch(newWalletActions.setActiveChain(value))
    dispatch(setQuickBuyAmount(''))
    if (!isAssetsPage) {
      navigate(`${APP_PATH.MEME_DISCOVER}`)
    }
  }

  const setChaintoLS = (val: string) => {
    ls.set('meme_chain', val)
  }

  // useEffect(() => {
  //   const selectedChain = ls.get('meme_chain')
  //   if (selectedChain && selectedChain === TYPE_CHAIN.ARB) {
  //     handleSelectItem(Configs.enableSolana() ? TYPE_CHAIN.SOLANA : TYPE_CHAIN.BSC)
  //     return
  //   }
  //   if (selectedChain && selectedChain === TYPE_CHAIN.MON) {
  //     handleSelectItem(TYPE_CHAIN.MON)
  //     return
  //   }
  //   if (!Configs.enableSolana() && (!selectedChain || selectedChain === TYPE_CHAIN.SOLANA)) {
  //     handleSelectItem(TYPE_CHAIN.BSC)
  //   }
  // }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-[34px] w-[88px] cursor-pointer items-center justify-center rounded-full border-[0.5px] border-[#79778C29] bg-[#212127]"
        >
          <div className="flex items-center gap-1.5 pl-0.5">
            <img src={nativeTokenLogo} alt="" className="size-[12px]" />
            <Text text={getShortNameByTypeChain(activeChain)} className="!font-[380]" fontSize={13} />
          </div>
          <IconTriangleDown />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={'start'} className="w-[80px] border border-[#ECECED0A] bg-[#232329] p-[6px]">
        {LIST_CHAIN_SUPPORTED.map((item: SupportedChain) => (
          <DropdownMenuItem
            className={cn(
              'cursor-pointer focus:bg-[#ECECED14]',
              activeChain === item.value && 'bg-[#ECECED14]',
              !item.isActive && 'cursor-not-allowed focus:bg-transparent',
            )}
            onClick={() => {
              if (item.isActive) {
                handleSelectItem(item.value)
              }
            }}
          >
            <img
              src={handleShowChainLogo(item.value)}
              alt=""
              className={cn('size-[12px]', !item.isActive && 'opacity-50')}
            />
            <Text
              text={item.label as string}
              className={cn('text-left !font-[330]', !item.isActive && '!text-[#AFAFAF]')}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ChangeChainButton
