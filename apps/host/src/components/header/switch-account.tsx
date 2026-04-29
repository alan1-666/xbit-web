// import { useState } from 'react'
// import { ArrowUpDown, ChevronDown, ChevronUp, LogOut } from 'lucide-react'
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
// import { formatAddressWallet } from '@/lib/string'
// import { CopyButton } from '../common/copy-button'
// import { useMultiChainWallet } from '@/hooks/useMultiChainWallet'
// import { IconTelegramLogin } from '../icon'
// import { useAppDispatch } from '@/redux/store'
// import { walletActions } from '@/redux/modules/wallet.slice'
// import { TYPE_ACCOUNT, TYPE_CHAIN } from '@/lib/blockchain'

// const SwitchAccount = () => {
//   const [open, setOpen] = useState<boolean>(false)
//   const dispatch = useAppDispatch()
//   const { inActiveWallet, activeAccount, activeWallet, disconnectActiveWallet, connectTelegramForChain } =
//     useMultiChainWallet({})
//   const onClickLoginByTG = () => {
//     connectTelegramForChain()
//   }

//   const onClickSwitchActiveWallet = () => {
//     dispatch(
//       walletActions.setActiveAccount(
//         activeAccount === TYPE_ACCOUNT.TELEGRAM ? TYPE_ACCOUNT.CHAIN : TYPE_ACCOUNT.TELEGRAM,
//       ),
//     )
//   }

//   return (
//     <>
//       <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
//         <DropdownMenuTrigger className="outline-none" asChild onClick={(e) => e.preventDefault()}>
//           <div className="bg-secondary rounded-lg cursor-pointer py-1 h-full px-3">
//             <div className="flex items-center gap-2">
//               {activeAccount !== TYPE_ACCOUNT.TELEGRAM ? (
//                 <img
//                   src={activeWallet?.avatar ? activeWallet?.avatar : '/images/kairox-logo-rounded.svg'}
//                   className="w-6 h-6 rounded-full"
//                   alt=""
//                 ></img>
//               ) : (
//                 <IconTelegramLogin />
//               )}
//               <div className="flex-1">
//                 <div className="flex items-center gap-1">
//                   <img
//                     src={activeWallet?.chainType === 'evm' ? '/images/ether.svg' : '/images/solana.webp'}
//                     className="w-3 h-3"
//                     alt=""
//                   ></img>
//                   <p className="text-xs">{activeWallet?.balance?.value}</p>
//                 </div>
//                 <div className="flex md:items-center md:gap-1">
//                   <p className="text-xs">{formatAddressWallet(activeWallet?.walletAddress)}</p>
//                   <CopyButton text={activeWallet?.walletAddress} />
//                 </div>
//               </div>
//               {open ? <ChevronUp className="h-4 w-4 opacity-50" /> : <ChevronDown className="h-4 w-4 opacity-50" />}
//             </div>
//           </div>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent className="min-w-[160px]" align="end">
//           {!inActiveWallet?.isConnected && activeAccount === TYPE_ACCOUNT.CHAIN && (
//             <DropdownMenuItem className="border rounded-md px-2 py-1 mb-1 cursor-pointer" onClick={onClickLoginByTG}>
//               <div className="w-full flex items-center gap-2">
//                 <IconTelegramLogin />
//                 <p className="text-xs">Switch TG login</p>
//                 <p className="text-xs ml-auto">Connect</p>
//               </div>
//             </DropdownMenuItem>
//           )}
//           {inActiveWallet?.isConnected && (
//             <DropdownMenuItem
//               className="border rounded-md px-2 py-1 mb-1 cursor-pointer"
//               onClick={onClickSwitchActiveWallet}
//             >
//               <div className="flex items-center gap-1 cursor-pointer w-full">
//                 {activeAccount === TYPE_ACCOUNT.TELEGRAM ? (
//                   <img src={inActiveWallet?.avatar} className="w-6 h-6 rounded-full" alt=""></img>
//                 ) : (
//                   <IconTelegramLogin />
//                 )}
//                 <div>
//                   <div className="flex items-center gap-1">
//                     <p className="text-xs">{activeAccount === TYPE_ACCOUNT.CHAIN ? 'TG Bot' : 'Linked'}</p>
//                   </div>
//                   <div className="md:flex md:items-center md:gap-1">
//                     <p className="text-xs">{formatAddressWallet(inActiveWallet?.walletId)}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-1 ml-auto">
//                   <img
//                     src={inActiveWallet?.chainType === TYPE_CHAIN.ETH ? '/images/ether.svg' : '/images/solana.webp'}
//                     className="w-4 h-4 rounded-full"
//                     alt=""
//                   ></img>
//                   <p className="text-sm">{inActiveWallet?.balance?.value}</p>
//                 </div>
//                 <ArrowUpDown className="h-4 w-4" />
//               </div>
//             </DropdownMenuItem>
//           )}
//           <DropdownMenuItem>
//             <div className="w-full flex items-center gap-1 cursor-pointer" onClick={() => disconnectActiveWallet()}>
//               <LogOut className="w-4 h-4" />
//               <p className="text-xs">Disconnect</p>
//             </div>
//           </DropdownMenuItem>
//         </DropdownMenuContent>
//       </DropdownMenu>
//     </>
//   )
// }

// export default SwitchAccount
