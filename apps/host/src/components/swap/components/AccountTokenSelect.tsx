import { IconArrowDown2 } from '@/components/icon'
import { cn } from '@/lib/utils'
import { ACCOUNT_TYPE } from '../lib/constants'
import { SwapFormState, Token } from '../lib/types'
import { useEffect, useMemo, useState } from 'react'
import SelectAccount from '@/components/assets/overview/SelectAccount'
import { ChainIds } from '@/types/enums'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'
import { updateSwapForm } from '@/redux/modules/swap.slice'
import { useSwapForm } from '../hooks/useSwapForm'
import { formatAmount } from '@/lib/format'
import { useTranslation } from 'react-i18next'

interface AccountTokenSelectProps {
  isFrom: boolean
  lable: string
  tokenList: Token[]
}

const AccountTokenSelect = ({ isFrom, lable, tokenList }: AccountTokenSelectProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  
  const { withdrawable: available } = useWebData2()
  const swapInfo = useAppSelector<RootState, SwapFormState>((state) => state.swapInfo)
  const { handleUpToDown, bnbWallets, solWallets, monWallets, perpsAddress } = useSwapForm()
  
  const [selectedToken, setSelectedToken] = useState(isFrom ? swapInfo.fromToken : swapInfo.toToken)
  const [selectedAccountType, setSelectedAccountType] = useState(isFrom ? swapInfo.fromAccountType : swapInfo.toAccountType)
  const [selectAccountBalance, setSelectAccountBalance] = useState(isFrom ? swapInfo.fromAvailableBalance : swapInfo.toAvailableBalance)

  const [open, setOpen] = useState(false)

  const usdc = useMemo(() => {
    return tokenList.find((t) => t.symbol.toUpperCase() === 'USDC') || null
  }, [tokenList])

  const sol = useMemo(() => {
    return tokenList.find((t) => t.symbol.toUpperCase() === 'SOL') || null
  }, [tokenList])

  const bnb = useMemo(() => {
    return tokenList.find((t) => t.symbol.toUpperCase() === 'BNB') || null
  }, [tokenList])

  const mon = useMemo(() => {
    return tokenList.find((t) => t.symbol.toUpperCase() === 'MON') || null
  }, [tokenList])

  useEffect(() => {
    if(!swapInfo.fromAccountType || !swapInfo.toAccountType) return

    setSelectedAccountType(isFrom ? swapInfo.fromAccountType : swapInfo.toAccountType)
  }, [isFrom, swapInfo.fromAccountType, swapInfo.toAccountType])

  useEffect(() => {
    setSelectAccountBalance(isFrom ? swapInfo.fromAvailableBalance : swapInfo.toAvailableBalance)
  }, [isFrom, swapInfo.fromAvailableBalance, swapInfo.toAvailableBalance])


  useEffect(() => {
    if(!swapInfo.fromToken || !swapInfo.toToken) return

    setSelectedToken(isFrom ? swapInfo.fromToken : swapInfo.toToken)
  }, [isFrom, swapInfo.fromToken, swapInfo.toToken])

  const handleAccountSelect = (account: { chainId: ChainIds; wallet?: string; tokenAddress?: string }) => {
    setOpen(false)
    const { chainId, wallet } = account

    let originAccountType, originToken, originWallet;

    switch (chainId) {
      case ChainIds.Hyperliquid:
        if(isFrom) {
          originAccountType = swapInfo.toAccountType
          originToken = swapInfo.toToken
          originWallet = swapInfo.toWalletAddress
          
          if(originAccountType === ACCOUNT_TYPE.Perps && originToken?.symbol.toUpperCase() === usdc?.symbol.toUpperCase() && originWallet === perpsAddress) {
            handleUpToDown()
            return
          }

          dispatch(updateSwapForm({
            ...swapInfo,
            fromAccountType:ACCOUNT_TYPE.Perps,
            fromToken: usdc,
            fromAvailableBalance: available,
            fromDisplayedAvailableBalance: available,
            fromWalletAddress: perpsAddress,
            fromAmount: ''
          }))
        } else {
          originAccountType = swapInfo.fromAccountType
          originToken = swapInfo.fromToken
          originWallet = swapInfo.fromWalletAddress
          
          if(originAccountType === ACCOUNT_TYPE.Perps && originToken?.symbol.toUpperCase() === usdc?.symbol.toUpperCase() && originWallet === perpsAddress) {
            handleUpToDown()
            return
          }

          dispatch(updateSwapForm({
            ...swapInfo,
            toAccountType:ACCOUNT_TYPE.Perps,
            toToken: usdc,
            toAvailableBalance: available,
            toDisplayedAvailableBalance: available,
            toWalletAddress: perpsAddress,
            toAmount: ''
          }))
        }
        setSelectedToken(usdc)
        setSelectedAccountType(ACCOUNT_TYPE.Perps)
        setSelectAccountBalance(available)

        return
      case ChainIds.Bsc:
        if(isFrom) {
          originAccountType = swapInfo.toAccountType
          originToken = swapInfo.toToken
          originWallet = swapInfo.toWalletAddress

          if(originAccountType === ACCOUNT_TYPE.MEME && originToken?.symbol.toUpperCase() === bnb?.symbol.toUpperCase() && originWallet === bnbWallets[0].walletAddress) {
            handleUpToDown()
            return
          }

          dispatch(updateSwapForm({
            ...swapInfo,
            fromAccountType:ACCOUNT_TYPE.MEME,
            fromToken: bnb,
            fromAvailableBalance: `${bnbWallets[0].balance}`,
            fromDisplayedAvailableBalance: `${bnbWallets[0].balance}`,
            fromWalletAddress: bnbWallets[0].walletAddress,
            fromAmount: ''
          }))
        } else {
          originAccountType = swapInfo.fromAccountType
          originToken = swapInfo.fromToken
          originWallet = swapInfo.fromWalletAddress

          if(originAccountType === ACCOUNT_TYPE.MEME && originToken?.symbol.toUpperCase() === bnb?.symbol.toUpperCase() && originWallet === bnbWallets[0].walletAddress) {
            handleUpToDown()
            return
          }

          dispatch(updateSwapForm({
            ...swapInfo,
            toAccountType:ACCOUNT_TYPE.MEME,
            toToken: bnb,
            toAvailableBalance: `${bnbWallets[0].balance}`,
            toDisplayedAvailableBalance: `${bnbWallets[0].balance}`,
            toWalletAddress: bnbWallets[0].walletAddress,
            toAmount: ''
          }))
        }

        setSelectedToken(bnb)
        setSelectedAccountType(ACCOUNT_TYPE.MEME)
        setSelectAccountBalance(`${bnbWallets[0].balance}`)

        return
      
      case ChainIds.Mon:
        if(isFrom) {
          originAccountType = swapInfo.toAccountType
          originToken = swapInfo.toToken
          originWallet = swapInfo.toWalletAddress

          if(originAccountType === ACCOUNT_TYPE.MEME && originToken?.symbol.toUpperCase() === mon?.symbol.toUpperCase() && originWallet === monWallets[0].walletAddress) {
            handleUpToDown()
            return
          }

          dispatch(updateSwapForm({
            ...swapInfo,
            fromAccountType:ACCOUNT_TYPE.MEME,
            fromToken: mon,
            fromAvailableBalance: `${monWallets[0].balance}`,
            fromDisplayedAvailableBalance: `${monWallets[0].balance}`,
            fromWalletAddress: monWallets[0].walletAddress,
            fromAmount: ''
          }))
        } else {
          originAccountType = swapInfo.fromAccountType
          originToken = swapInfo.fromToken
          originWallet = swapInfo.fromWalletAddress

          if(originAccountType === ACCOUNT_TYPE.MEME && originToken?.symbol.toUpperCase() === mon?.symbol.toUpperCase() && originWallet === monWallets[0].walletAddress) {
            handleUpToDown()
            return
          }

          dispatch(updateSwapForm({
            ...swapInfo,
            toAccountType:ACCOUNT_TYPE.MEME,
            toToken: mon,
            toAvailableBalance: `${monWallets[0].balance}`,
            toDisplayedAvailableBalance: `${monWallets[0].balance}`,
            toWalletAddress: monWallets[0].walletAddress,
            toAmount: ''
          }))
        }

        setSelectedToken(mon)
        setSelectedAccountType(ACCOUNT_TYPE.MEME)
        setSelectAccountBalance(`${monWallets[0].balance}`)

        return

      case ChainIds.Solana:

        const selectedSolWallet = solWallets.filter(w => w.walletAddress === wallet)[0]

        if(isFrom) {

          originAccountType = swapInfo.toAccountType
          originToken = swapInfo.toToken
          originWallet = swapInfo.toWalletAddress

          if(originAccountType === ACCOUNT_TYPE.MEME && originToken?.symbol.toUpperCase() === sol?.symbol.toUpperCase() && originWallet === selectedSolWallet.walletAddress) {
            handleUpToDown()
            return
          }

          dispatch(updateSwapForm({
            ...swapInfo,
            fromAccountType:ACCOUNT_TYPE.MEME,
            fromToken: sol,
            fromAvailableBalance: `${selectedSolWallet.balance}`,
            fromDisplayedAvailableBalance: `${selectedSolWallet.balance}`,
            fromWalletAddress: selectedSolWallet.walletAddress,
            fromAmount: ''
          }))
        } else {
          originAccountType = swapInfo.fromAccountType
          originToken = swapInfo.fromToken
          originWallet = swapInfo.fromWalletAddress

          if(originAccountType === ACCOUNT_TYPE.MEME && originToken?.symbol.toUpperCase() === sol?.symbol.toUpperCase() && originWallet === selectedSolWallet.walletAddress) {
            handleUpToDown()
            return
          }

          dispatch(updateSwapForm({
            ...swapInfo,
            toAccountType:ACCOUNT_TYPE.MEME,
            toToken: sol,
            toAvailableBalance: `${selectedSolWallet.balance}`,
            toDisplayedAvailableBalance: `${selectedSolWallet.balance}`,
            toWalletAddress: selectedSolWallet.walletAddress,
            toAmount: ''
          }))
        }

        setSelectedToken(sol)
        setSelectedAccountType(ACCOUNT_TYPE.MEME)

        setSelectAccountBalance(`${selectedSolWallet.balance}`)

        return
    }
  }

  return (
    <div className="w-full px-2.5 py-5 left-0 top-0 bg-zinc-900 rounded-[10px] inline-flex flex-col justify-start items-start gap-2.5">
      <div className="w-full inline-flex justify-between items-center">
        <div className="flex justify-start items-start gap-4">
          <div className="text-left justify-start text-gray-300 text-sm font-normal font-['Geist'] leading-4 min-w-[35px]">
            {lable}
          </div>
          <div className="inline-flex flex-col justify-start items-start gap-1.5">
            <button
              className="inline-flex justify-start items-start gap-1 bg-transparent"
              onClick={() => {
                setOpen(!open)
              }}
            >
              <div className="justify-start text-white text-base font-semibold font-['Geist'] leading-4">
                {selectedAccountType === ACCOUNT_TYPE.MEME ? t('assets.funding.meme') : t('assets.futures.futures')}
              </div>
              <div className="w-4 h-4 relative">
                <IconArrowDown2 className={cn('size-4.5 text-#DBD8E5')} />
              </div>
            </button>
            <div className="mt-1.5 self-stretch justify-end text-[#908E98] text-xs font-light font-['Geist'] leading-3">
              {
                formatAmount(selectAccountBalance ??0, {
                  roundMode: 'floor',
                  unit: selectedToken?.symbol.toUpperCase(),
                })
              }
            </div>
          </div>
        </div>
        <div className="w-[80px] pl-[3px] pr-2.5 py-px bg-zinc-800 rounded-3xl flex justify-start items-center gap-1.5">
          <div className="flex justify-start items-end">
            <div data-name="Solana (SOL)" className="w-8 h-8 relative rounded-full overflow-hidden">
              <img src={selectedToken?.image} className="size-8 rounded-full" />
            </div>
          </div>
          <div className="flex justify-center items-center gap-1.5">
            <div className="text-right justify-start text-white text-xs font-semibold font-['Geist'] leading-3 tracking-tight">
              {selectedToken?.symbol.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      <SelectAccount showPerpsAccount={true} open={open} setOpen={setOpen} onAccountSelected={handleAccountSelect} />
    </div>
  )
}

export default AccountTokenSelect
