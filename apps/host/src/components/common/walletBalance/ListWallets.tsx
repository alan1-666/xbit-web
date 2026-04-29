import { useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronDown, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { ChainType, UserManagedWalletDto } from '@/@generated/gql/graphql-user'
import { formatAddressWallet } from '@/lib/string'
import { CopyButton } from '../copy-button'
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet'
import { walletActions } from '@/redux/modules/wallet.slice'
import { convertChainNameToNativeToken, getImgFromNameWallet, TYPE_ACCOUNT, TYPE_CHAIN } from '@/lib/blockchain'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { EVENT_MESSAGE_MODAL_WALLET_CONNECT } from '@/components/header/wallet-connect'
import eventBus from '@/lib/eventBus'
import clsx from 'clsx'
import { cn } from '@/lib/utils'
import TooltipTag from '../TooltipTag'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { priceChain } from '@/redux/modules/price.slice'
import { f } from 'fintech-number'
import { formatBalanceWallet } from '@/lib/number'
import { useTranslation } from 'react-i18next'
import { ChainIds } from '@/types/enums'
import { saveSymbolListSnapshot } from '@/utils/indexedDB/symbolListDB'
import { setFavorites } from '@/redux/modules/symbolList.slide'

const ListWallets = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useState<boolean>(false)
  const { openConnectModal } = useConnectModal()
  const listWalletTeleGram = useAppSelector((state) => state.wallet.listWalletTeleGram)
  const { wallets, connectTelegramForChain, activeAccount, activeChain } = useMultiChainWallet({})
  const ethWallet = wallets?.eth?.chain
  const solWallet = wallets?.sol?.chain
  const arbWallet = wallets?.arb?.chain
  const isAlikeChain =
    ethWallet?.walletInfo?.name === solWallet?.walletInfo?.name && ethWallet?.isConnected && solWallet?.isConnected
  const chain = useAppSelector((state) => state.newWallet.activeChain)

  const dispatch = useAppDispatch()

  // useEffect(() => {
  //   if (open) {
  //     dispatch(walletActions.getAccountInfo({}))
  //   }
  // }, [open])
  const convertChainNameToToken = (str: string) => {
    switch (str) {
      case 'EVM':
        return 'ETH'
      case 'SOLANA':
        return 'SOL'
      case 'ARB':
        return 'ARB'
      default:
        return 'Unknown Chains'
    }
  }

  const convertChainName = (str: string) => {
    switch (str) {
      case 'EVM':
        return 'Ethereum'
      case 'SOLANA':
        return 'Solana'
      case 'ARB':
        return 'Arbitrum'
      default:
        return 'Unknown Chains'
    }
  }

  const onClickLoginByTG = () => {
    if (listWalletTeleGram?.length > 0) return
    connectTelegramForChain()
    setOpen(false)
  }

  const onSwitchAccountTelegram = (item: UserManagedWalletDto) => {
    const token = convertChainNameToToken(item?.chain).toLocaleLowerCase()
    dispatch(walletActions.setActiveChain(token))
    dispatch(walletActions.setActiveAccount(TYPE_ACCOUNT.TELEGRAM))
  }

  const onClickConnectWallet = () => {
    if (!enableBtnWallet) return
    if ((chain === TYPE_CHAIN.ETH || chain === TYPE_CHAIN.ARB) && openConnectModal) openConnectModal()
    if (chain === TYPE_CHAIN.SOLANA) {
      eventBus.dispatch(EVENT_MESSAGE_MODAL_WALLET_CONNECT, {
        data: {
          isOpen: true,
        },
      })
    }
    setOpen(false)
  }

  const enableBtnWallet =
    (!ethWallet?.isConnected && activeChain === TYPE_CHAIN.ETH) ||
    (!arbWallet?.isConnected && activeChain === TYPE_CHAIN.ARB) ||
    (!solWallet?.isConnected && activeChain === TYPE_CHAIN.SOLANA)

  const priceETH = useAppSelector(priceChain('ETH'))
  const balanceETH = wallets?.eth?.chain?.balance?.formatted
  const balanceARB = wallets?.arb?.chain?.balance?.formatted
  const totalETH =
    +balanceETH > 0
      ? f(priceETH * balanceETH, {
          decimal: 2,
          round: 'down',
        })
      : 0
  const totalARB =
    +balanceARB > 0
      ? f(priceETH * balanceARB, {
          decimal: 2,
          round: 'down',
        })
      : 0
  const priceSol = useAppSelector(priceChain('SOL'))
  const balanceSol = wallets?.sol?.chain?.balance?.formatted
  const totalSol =
    +balanceSol > 0
      ? f(priceSol * wallets?.sol?.chain?.balance?.formatted, {
          decimal: 2,
          round: 'down',
        })
      : 0

  const totalTeleBalance = f(
    listWalletTeleGram.reduce((sum: number, wallet: any) => {
      if (wallet.chain === 'EVM') {
        return sum + (wallets?.eth?.telegram?.balance?.formatted || 0) * priceETH
      } else if (wallet.chain === 'SOLANA') {
        return sum + (wallets?.sol?.telegram?.balance?.formatted || 0) * priceSol
      } else if (wallet.chain === 'ARB') {
        return sum + (wallets?.arb?.telegram?.balance?.formatted || 0) * priceETH
      }
      return sum
    }, 0),
    {
      decimal: 2,
      round: 'down',
    },
  )

  const calculatePriceTele = (item: UserManagedWalletDto, balance: number) => {
    switch (item.chain) {
      case ChainType.Evm:
        return f(balance * priceETH, {
          decimal: 2,
          round: 'down',
        })
      case ChainType.Arb:
        return f(balance * priceETH, {
          decimal: 2,
          round: 'down',
        })
      case ChainType.Solana:
        return f(balance * priceSol, {
          decimal: 2,
          round: 'down',
        })
      default:
        return 0
    }
  }

  const balanceMap = {
    ETH: wallets?.eth?.telegram?.balance?.formatted,
    ARB: wallets?.arb?.telegram?.balance?.formatted,
    SOL: wallets?.sol?.telegram?.balance?.formatted,
  }

  return (
    <></>
    // <Drawer open={open} onOpenChange={setOpen}>
    //   <DrawerTrigger asChild className="cursor-pointer">
    //     {/* <img src="/images/icons/eye-open-icon.svg" /> */}
    //     <div className="mr-[calc(1rem*(6/16))] flex items-center text-[calc(1rem*(15/16))] leading-[calc(1rem*(15/16))] text-title">
    //       <p>{t('wallet.balance', { chain: chain.toUpperCase() })}</p>
    //       <div className={clsx(open && 'rotate-180')}>
    //         <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    //           <path
    //             d="M10.8185 6.00098H7.85197H5.18067C4.72355 6.00098 4.49499 6.7093 4.81878 7.12452L7.28533 10.2875C7.68055 10.7943 8.32338 10.7943 8.7186 10.2875L9.65665 9.08461L11.1852 7.12452C11.5042 6.7093 11.2756 6.00098 10.8185 6.00098Z"
    //             fill="white"
    //           />
    //         </svg>
    //       </div>
    //     </div>
    //   </DrawerTrigger>
    //   <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto">
    //     <DrawerHeader className="flex w-full items-center justify-between pt-1 pb-0">
    //       <DrawerTitle></DrawerTitle>
    //       <img
    //         src="/images/icons/icon-x.svg"
    //         className="w-6 h-6 cursor-pointer"
    //         onClick={() => setOpen(false)}
    //         alt=""
    //       />
    //     </DrawerHeader>
    //     <div className="w-full px-2.5">
    //       <p className="text-lg leading-none">{t('wallet.switchWallet')}</p>
    //       {listWalletTeleGram?.length > 0 && (
    //         <Accordion
    //           className={cn(
    //             'mt-3.5 bg-[url(/images/icons/img-bg-list-wallets.svg)]  bg-cover bg-no-repeat rounded-2xl  mx-auto overflow-hidden',
    //             {
    //               'gradient-border': activeAccount === TYPE_ACCOUNT.TELEGRAM,
    //             },
    //           )}
    //           type="single"
    //           collapsible
    //           defaultValue="telegram"
    //         >
    //           <AccordionItem value="telegram">
    //             <AccordionTrigger className="p-3 border-b-[0.5px] border-b-[#ececed14] gap-0">
    //               <img src="/images/logo-tele.svg" className="w-9 h-9" alt="" />
    //               <p className="text-base leading-none text-[#ffffff] ml-3">{t('wallet.telegramWallet')}</p>
    //               <p className="text-base leading-none text-[#ffffff] ml-auto pr-1.5">${totalTeleBalance}</p>
    //             </AccordionTrigger>
    //             <AccordionContent>
    //               {listWalletTeleGram?.map((item: UserManagedWalletDto, index: number) => {
    //                 const token = convertChainNameToToken(item?.chain)
    //                 const nativeToken = convertChainNameToNativeToken(item?.chain)
    //                 const name = convertChainName(item?.chain)
    //                 const balanceRender = balanceMap[token as keyof typeof balanceMap] ?? 0
    //                 return (
    //                   <div
    //                     className="flex items-center gap-2.5 py-2.5 px-3 cursor-pointer rounded-xl hover:bg-[#232329]"
    //                     key={`${item.id}-${index}`}
    //                     onClick={() => onSwitchAccountTelegram(item)}
    //                   >
    //                     <img src={`/images/icons/ic-${name.toLocaleLowerCase()}.png`} className="w-8 h-8" alt="" />
    //                     <div>
    //                       <div className="flex items-center gap-1.5">
    //                         <p className="text-base text-[#ffffff] font-bold leading-none">{name}</p>
    //                         {activeChain === token.toLowerCase() && activeAccount === TYPE_ACCOUNT.TELEGRAM && (
    //                           <div className="flex items-center gap-1">
    //                             <div className="w-1.5 h-1.5 bg-[#ab57ff] rounded-full"></div>
    //                             <p className="text-xs text-white">{t('wallet.current')}</p>
    //                           </div>
    //                         )}
    //                       </div>
    //                       <p className="text-xs leading-none text-[#ffffff99] mt-1">
    //                         {formatBalanceWallet({ balance: +balanceRender })} {nativeToken}≈$
    //                         {calculatePriceTele(item, balanceRender)}
    //                       </p>
    //                     </div>
    //                     <div className="flex items-center ml-auto gap-1.5">
    //                       <p className="text-xs leading-none text-[#ffffff99]">
    //                         {formatAddressWallet(item.walletAddress)}
    //                       </p>
    //                       <CopyButton text={item.walletAddress} />
    //                     </div>
    //                   </div>
    //                 )
    //               })}
    //               <div className="px-3 py-2">
    //                 <PopupConfirmDisconnected type="telegram">
    //                   <Button variant="secondary" className="w-full bg-[#ececed14] text-[#ffffffcc]">
    //                     {t('wallet.disconnect')}
    //                   </Button>
    //                 </PopupConfirmDisconnected>
    //               </div>
    //             </AccordionContent>
    //           </AccordionItem>
    //         </Accordion>
    //       )}

    //       {isAlikeChain ? (
    //         <>
    //           <Accordion
    //             className={cn(
    //               'mt-3.5 bg-[url(/images/icons/img-bg-list-wallets.svg)] bg-cover bg-no-repeat rounded-2xl  mx-auto overflow-hidden',
    //               {
    //                 'gradient-border': activeAccount !== TYPE_ACCOUNT.TELEGRAM,
    //               },
    //             )}
    //             type="single"
    //             collapsible
    //             defaultValue="isAlikeChain"
    //           >
    //             <AccordionItem value="isAlikeChain">
    //               <AccordionTrigger className="p-3 border-b-[0.5px] border-b-[#ececed14] gap-0">
    //                 <img
    //                   src={
    //                     wallets?.sol?.chain?.walletInfo?.icon
    //                       ? wallets?.sol?.chain?.walletInfo?.icon
    //                       : getImgFromNameWallet(wallets?.sol?.chain?.walletInfo?.name)
    //                   }
    //                   className="w-9 h-9"
    //                   alt=""
    //                 />
    //                 <p className="text-base leading-none text-[#ffffff] ml-3">
    //                   {wallets?.sol?.chain?.walletInfo?.name ?? 'Wallet'}
    //                 </p>
    //                 <p className="text-base leading-none text-[#ffffff] ml-auto pr-1.5">${+totalETH + +totalSol}</p>
    //               </AccordionTrigger>
    //               <AccordionContent>
    //                 <div>
    //                   <RowWalletEth />
    //                   <RowWalletSol />
    //                 </div>
    //                 <div className="px-3 my-2">
    //                   <PopupConfirmDisconnectedAll />
    //                 </div>
    //               </AccordionContent>
    //             </AccordionItem>
    //           </Accordion>
    //         </>
    //       ) : (
    //         <>
    //           {wallets?.eth?.chain?.isConnected && (
    //             <Accordion
    //               className={cn(
    //                 'mt-3.5 bg-[url(/images/icons/img-bg-list-wallets.svg)] bg-cover bg-no-repeat rounded-2xl  mx-auto overflow-hidden',
    //                 {
    //                   'gradient-border': activeAccount === TYPE_ACCOUNT.CHAIN && activeChain === TYPE_CHAIN.ETH,
    //                 },
    //               )}
    //               type="single"
    //               collapsible
    //               defaultValue="eth"
    //             >
    //               <AccordionItem value="eth">
    //                 <AccordionTrigger className="p-3 border-b-[0.5px] border-b-[#ececed14] gap-0">
    //                   <img
    //                     src={
    //                       wallets?.eth?.chain?.walletInfo?.icon
    //                         ? wallets?.eth?.chain?.walletInfo?.icon
    //                         : getImgFromNameWallet(wallets?.eth?.chain?.walletInfo?.name)
    //                     }
    //                     className="w-8 h-8"
    //                     alt=""
    //                   />
    //                   <p className="text-base leading-none text-[#ffffff] ml-3">
    //                     {wallets?.eth?.chain?.walletInfo?.name ?? 'Wallet'}
    //                   </p>
    //                   <p className="text-base leading-none text-[#ffffff] ml-auto pr-1.5">${totalETH}</p>
    //                 </AccordionTrigger>
    //                 <AccordionContent>
    //                   <RowWalletEth />
    //                   <div className="px-3 my-2">
    //                     <PopupConfirmDisconnected type="eth">
    //                       <Button variant="secondary" className="w-full bg-[#ececed14] text-[#ffffffcc]">
    //                         {t('wallet.disconnect')}
    //                       </Button>
    //                     </PopupConfirmDisconnected>
    //                   </div>
    //                 </AccordionContent>
    //               </AccordionItem>
    //             </Accordion>
    //           )}

    //           {wallets?.sol?.chain?.isConnected && (
    //             <Accordion
    //               className={cn(
    //                 'mt-3.5 bg-[url(/images/icons/img-bg-list-wallets.svg)] bg-cover bg-no-repeat rounded-2xl  mx-auto overflow-hidden',
    //                 {
    //                   'gradient-border': activeAccount === TYPE_ACCOUNT.CHAIN && activeChain === TYPE_CHAIN.SOLANA,
    //                 },
    //               )}
    //               type="single"
    //               collapsible
    //               defaultValue="sol"
    //             >
    //               <AccordionItem value="sol">
    //                 <AccordionTrigger className="p-3 border-b-[0.5px] border-b-[#ececed14] gap-0">
    //                   <img
    //                     src={
    //                       wallets?.sol?.chain?.walletInfo?.icon
    //                         ? wallets?.sol?.chain?.walletInfo?.icon
    //                         : getImgFromNameWallet(wallets?.sol?.chain?.walletInfo?.name)
    //                     }
    //                     className="w-9 h-9"
    //                     alt=""
    //                   />
    //                   <p className="text-base leading-none text-[#ffffff] ml-3">
    //                     {wallets?.sol?.chain?.walletInfo?.name ?? 'Wallet'}
    //                   </p>
    //                   <p className="text-base leading-none text-[#ffffff] ml-auto pr-1.5">${totalSol}</p>
    //                 </AccordionTrigger>
    //                 <AccordionContent>
    //                   <div>
    //                     <RowWalletSol />
    //                   </div>
    //                   <div className="px-3 my-2">
    //                     <PopupConfirmDisconnected type="sol">
    //                       <Button variant="secondary" className="w-full bg-[#ececed14] text-[#ffffffcc]">
    //                         {t('wallet.disconnect')}
    //                       </Button>
    //                     </PopupConfirmDisconnected>
    //                   </div>
    //                 </AccordionContent>
    //               </AccordionItem>
    //             </Accordion>
    //           )}
    //         </>
    //       )}
    //       <div className="flex items-center gap-2 mx-auto py-4 ">
    //         <Button
    //           className={cn('flex-1 max-w-full rounded-[50px]', {
    //             'cursor-not-allowed': listWalletTeleGram?.length > 0,
    //             'purple-btn-gradient': listWalletTeleGram?.length > 0,
    //             'text-[#141414]': listWalletTeleGram?.length > 0,
    //             'text-[#fff]': listWalletTeleGram?.length === 0,
    //             'bg-[#ECECED1F]': listWalletTeleGram?.length === 0,
    //             'hover-scale': listWalletTeleGram?.length === 0,
    //           })}
    //           disabled={listWalletTeleGram?.length > 0}
    //           onClick={onClickLoginByTG}
    //         >
    //           {t('wallet.connectGuide')} Telegram
    //           {listWalletTeleGram?.length > 0 && <TooltipTag variant="gradient">{t('wallet.linked')}</TooltipTag>}
    //         </Button>
    //         <Button
    //           className={cn('flex-1 rounded-[50px]', {
    //             'cursor-not-allowed': !enableBtnWallet,
    //             'purple-btn-gradient': !enableBtnWallet,
    //             'text-[#141414]': !enableBtnWallet,
    //             'text-[#fff]': enableBtnWallet,
    //             'bg-[#ECECED1F]': enableBtnWallet,
    //             'hover-scale': enableBtnWallet,
    //           })}
    //           disabled={!enableBtnWallet}
    //           onClick={onClickConnectWallet}
    //         >
    //           {t('wallet.connectGuide')} {t('wallet.applications')}
    //           {!enableBtnWallet && <TooltipTag variant="gradient">{t('wallet.linked')}</TooltipTag>}
    //         </Button>
    //       </div>
    //     </div>
    //   </DrawerContent>
    // </Drawer>
  )
}

export default ListWallets

// const PopupConfirmDisconnected = ({ type, children }: { type: string; children: React.ReactNode }) => {
//   const [open, setOpen] = useState(false)
//   const { disconnectWalletTelegram, disconnectWallet } = useMultiChainWallet({})
//   const { t } = useTranslation()
//   const dispatch = useAppDispatch()

//   const onClickDisConnected = async () => {
//     switch (type) {
//       case 'telegram':
//         disconnectWalletTelegram()
//         break
//       case 'sol':
//         disconnectWallet(TYPE_CHAIN.SOLANA)
//         break
//       case 'arb':
//         disconnectWallet(TYPE_CHAIN.ARB)
//         setTimeout(() => {
//           disconnectWallet(TYPE_CHAIN.ARB)
//         }, 500)
//         break
//       case 'eth':
//         disconnectWallet(TYPE_CHAIN.ETH)
//         setTimeout(() => {
//           disconnectWallet(TYPE_CHAIN.ETH)
//         }, 500)
//         break
//       default:
//         console.warn(`[disconnected error]`)
//     }
//     setOpen(false)

//     await saveSymbolListSnapshot('favorite', {
//       list: [],
//       lastUpdated: Date.now(),
//       condition: 'favorite',
//     })

//     dispatch(setFavorites([]))
//   }

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>{children}</DialogTrigger>
//       <DialogContent className="w-[335px] bg-[#232329] rounded-2xl p-5">
//         <DialogTitle></DialogTitle>
//         <DialogHeader>
//           <p className="text-center text-lg leading-none font-medium py-3">{t('wallet.confirmDisconnect')}</p>
//           <div className="flex justify-center items-center flex-row gap-2.5 mt-4">
//             <Button variant="close" className="flex-1" onClick={() => setOpen(false)}>
//               {t('login.cancel')}
//             </Button>
//             <Button
//               variant="gradient"
//               className="text-[#261236] flex-1 rounded-[50px]"
//               onClick={() => onClickDisConnected()}
//             >
//               {t('toast.confirm')}
//             </Button>
//           </div>
//         </DialogHeader>
//         <DialogDescription />
//       </DialogContent>
//     </Dialog>
//   )
// }

// const PopupConfirmDisconnectedAll = () => {
//   const [open, setOpen] = useState(false)
//   const { wallets } = useMultiChainWallet({})
//   const { t } = useTranslation()

//   return (
//     <Drawer open={open} onOpenChange={setOpen}>
//       <DrawerTrigger asChild>
//         <Button variant="secondary" className="w-full bg-[#ececed14] text-[#ffffffcc]">
//           <p>{t('wallet.disconnect')}</p>
//           <ChevronDown
//             className={cn('w-8 h-8 opacity-50', {
//               'rotate-180': open,
//             })}
//           />
//         </Button>
//       </DrawerTrigger>
//       <DrawerContent className="w-full bg-[#232329] rounded-t-2xl max-w-[768px] mx-auto">
//         <DrawerTitle></DrawerTitle>
//         <DrawerHeader className="pb-6 pt-2 px-3">
//           <div className="flex items-center justify-between py-5">
//             <p className="text-lg leading-none font-medium text-[#ffffffcc]">{t('wallet.disconnect')}</p>
//             <X className="w-6 h-6 cursor-pointer opacity-50" onClick={() => setOpen(false)} />
//           </div>
//           <div className="flex items-center flex-col gap-0">
//             {wallets?.eth?.chain?.isConnected && (
//               <div className="flex items-center gap-1.5 w-full py-3.5 border-b-[0.5px] border-b-[#ececed14]">
//                 <img src="/images/icons/ic-ethereum.png" className="w-6 h-6" alt="" />
//                 <p className="text-base font-medium text-white leading-none">
//                   {formatAddressWallet(wallets?.eth?.chain?.walletId)}
//                 </p>
//                 <CopyButton text={wallets?.eth?.chain?.walletId} />
//                 <div className="ml-auto">
//                   <PopupConfirmDisconnected type="eth">
//                     <p className="text-[#00FFF6] text-sm leading-none cursor-pointer">{t('wallet.disconnect')}</p>
//                   </PopupConfirmDisconnected>
//                 </div>
//               </div>
//             )}
//             {wallets?.sol?.chain?.isConnected && (
//               <div className="flex items-center gap-1.5 w-full py-3.5 border-b-[0.5px] border-b-[#ececed14]">
//                 <img src="/images/icons/ic-solana.png" className="w-6 h-6" alt="" />
//                 <p className="text-base font-medium text-white leading-none">
//                   {formatAddressWallet(wallets?.sol?.chain?.walletId)}
//                 </p>
//                 <CopyButton text={wallets?.sol?.chain?.walletId} />
//                 <div className="ml-auto">
//                   <PopupConfirmDisconnected type="sol">
//                     <p className="text-[#00FFF6] text-sm leading-none cursor-pointer">{t('wallet.disconnect')}</p>
//                   </PopupConfirmDisconnected>
//                 </div>
//               </div>
//             )}
//           </div>
//         </DrawerHeader>
//       </DrawerContent>
//     </Drawer>
//   )
// }

// const RowWalletEth = () => {
//   const dispatch = useAppDispatch()
//   const { t } = useTranslation()
//   const { wallets, activeWallet, activeAccount, activeChain, switchEvmChain } = useMultiChainWallet({})

//   const changeActiveWallet = (chain: TYPE_CHAIN) => {
//     dispatch(walletActions.setActiveChain(chain))
//     dispatch(walletActions.setActiveAccount(TYPE_ACCOUNT.CHAIN))
//     switchEvmChain(ChainIds.Ethereum)
//   }

//   if (!wallets?.eth?.chain?.isConnected || !wallets?.arb?.chain?.isConnected) return <></>

//   const priceETH = useAppSelector(priceChain('ETH'))
//   const balanceETH = wallets?.eth?.chain?.balance?.formatted
//   const totalETH =
//     +balanceETH > 0
//       ? f(priceETH * wallets?.eth?.chain?.balance?.formatted, {
//           decimal: 2,
//           round: 'down',
//         })
//       : 0

//   const balanceARB = wallets?.arb?.chain?.balance?.formatted
//   const totalARB =
//     +balanceARB > 0
//       ? f(priceETH * wallets?.arb?.chain?.balance?.formatted, {
//           decimal: 2,
//           round: 'down',
//         })
//       : 0

//   return (
//     <div>
//       <div
//         className="flex items-center gap-2.5 py-2.5 px-3 cursor-pointer rounded-xl hover:bg-[#232329]"
//         onClick={() => changeActiveWallet(TYPE_CHAIN.ETH)}
//       >
//         <img src="/images/icons/ic-ethereum.png" className="w-8 h-8" alt="" />
//         <div>
//           <div className="flex items-center gap-1.5">
//             <p className="text-base font-bold text-[#ffffff] leading-none">Ethereum</p>
//             {activeChain === TYPE_CHAIN.ETH && activeWallet.isConnected && activeAccount === TYPE_ACCOUNT.CHAIN && (
//               <div className="flex items-center gap-1">
//                 <div className="w-1.5 h-1.5 bg-[#ab57ff] rounded-full"></div>
//                 <p className="text-xs text-[#ffffff]">{t('wallet.current')}</p>
//               </div>
//             )}
//           </div>
//           <p className="text-xs leading-none text-[#ffffff99] mt-1">
//             {formatBalanceWallet({ balance: +wallets?.eth?.chain?.balance?.formatted })}{' '}
//             {wallets?.eth?.chain?.balance?.symbol}≈${totalETH}
//           </p>
//         </div>
//         <div className="flex items-center ml-auto gap-1.5">
//           <p className="text-xs leading-none text-[#ffffff99]">{formatAddressWallet(wallets?.eth?.chain?.walletId)}</p>
//           <CopyButton text={wallets?.eth?.chain?.walletId} />
//         </div>
//       </div>
//       <div
//         className="flex items-center gap-2.5 py-2.5 px-3 cursor-pointer rounded-xl hover:bg-[#232329]"
//         onClick={() => changeActiveWallet(TYPE_CHAIN.ARB)}
//       >
//         <img src="/images/icons/ic-arbitrum.png" className="w-8 h-8" alt="" />
//         <div>
//           <div className="flex items-center gap-1.5">
//             <p className="text-base font-bold text-[#ffffff] leading-none">Arbitrum</p>
//             {activeChain === TYPE_CHAIN.ARB && activeWallet.isConnected && activeAccount === TYPE_ACCOUNT.CHAIN && (
//               <div className="flex items-center gap-1">
//                 <div className="w-1.5 h-1.5 bg-[#ab57ff] rounded-full"></div>
//                 <p className="text-xs text-[#ffffff]">{t('wallet.current')}</p>
//               </div>
//             )}
//           </div>
//           <p className="text-xs leading-none text-[#ffffff99] mt-1">
//             {formatBalanceWallet({ balance: +wallets?.arb?.chain?.balance?.formatted })}{' '}
//             {wallets?.arb?.chain?.balance?.symbol}≈${totalARB}
//           </p>
//         </div>
//         <div className="flex items-center ml-auto gap-1.5">
//           <p className="text-xs leading-none text-[#ffffff99]">{formatAddressWallet(wallets?.arb?.chain?.walletId)}</p>
//           <CopyButton text={wallets?.arb?.chain?.walletId} />
//         </div>
//       </div>
//     </div>
//   )
// }

// const RowWalletSol = () => {
//   const dispatch = useAppDispatch()
//   const { t } = useTranslation()
//   const { wallets, activeWallet, activeAccount, activeChain } = useMultiChainWallet({})

//   const changeActiveWallet = (chain: TYPE_CHAIN) => {
//     dispatch(walletActions.setActiveChain(chain))
//     dispatch(walletActions.setActiveAccount(TYPE_ACCOUNT.CHAIN))
//   }

//   if (!wallets?.sol?.chain?.isConnected) return <></>
//   const priceSol = useAppSelector(priceChain('SOL'))
//   const balanceSol = wallets?.sol?.chain?.balance?.formatted
//   const total =
//     +balanceSol > 0
//       ? f(priceSol * wallets?.sol?.chain?.balance?.formatted, {
//           decimal: 2,
//           round: 'down',
//         })
//       : 0
//   return (
//     <div
//       className="flex items-center gap-2.5 py-2.5 px-3 cursor-pointer rounded-xl hover:bg-[#232329]"
//       onClick={() => changeActiveWallet(TYPE_CHAIN.SOLANA)}
//     >
//       <img src="/images/icons/ic-solana.png" className="w-8 h-8" alt="" />
//       <div>
//         <div className="flex items-center gap-1.5">
//           <p className="text-base font-bold leading-none text-white">SOLANA</p>
//           {activeChain === TYPE_CHAIN.SOLANA && activeWallet.isConnected && activeAccount === TYPE_ACCOUNT.CHAIN && (
//             <div className="flex items-center gap-1">
//               <div className="w-1.5 h-1.5 bg-[#ab57ff] rounded-full"></div>
//               <p className="text-xs text-white">{t('wallet.current')}</p>
//             </div>
//           )}
//         </div>
//         <p className="text-xs leading-none text-[#ffffff99] mt-1">
//           {formatBalanceWallet({ balance: +wallets?.sol?.chain?.balance?.formatted })}{' '}
//           {wallets?.sol?.chain?.balance?.symbol}≈${total}
//         </p>
//       </div>
//       <div className="flex items-center ml-auto gap-1.5">
//         <p className="text-xs leading-none text-[#ffffff99]">{formatAddressWallet(wallets?.sol?.chain?.walletId)}</p>
//         <CopyButton text={wallets?.sol?.chain?.walletId} />
//       </div>
//     </div>
//   )
// }
