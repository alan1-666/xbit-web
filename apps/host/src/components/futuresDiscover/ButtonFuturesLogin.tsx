import { useEffect, useState } from 'react'
import { getClearinghouseState } from '@/api/hyperliquid'
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet'
import { fixNumber } from '@/lib/utils'
import { LoginEvmDrawer } from '../common/LoginEvmDrawer'
import Text from '../common/Text'



const ButtonFuturesLogin = () => {

  const { activeWallet, wallets } = useMultiChainWallet({})

  const [funding, setFunding] = useState(0)
  const [openLoginEvmEvm, setOpenLoginEvm] = useState(false)
  const [openSwitchWallet, setOpenSwitchWallet] = useState<boolean>(false)

   const handleConnect = () => {
    setOpenLoginEvm(true)
  }

  const numberOfWallets = () =>
    ['chain', 'telegram'].reduce((sum, key) => sum + Number(wallets?.arb?.[key]?.isConnected), 0)

  const getUserFunding = async () => {
    if (!activeWallet?.isConnected || numberOfWallets() === 0) return 0
    try {
      const data = await getClearinghouseState(activeWallet?.walletAddress)
      const balance = fixNumber(data?.crossMarginSummary?.accountValue, 2)
      setFunding(Number(balance))
    } catch (err: any) {}
  }


  useEffect(() => {
    getUserFunding()
  }, [activeWallet.isConnected, activeWallet?.walletAddress])

  return <>
   {activeWallet?.isConnected ? (
      <div
        className="h-[36px] flex gap-2.5 items-center border-[0.5px] border-[#ECECED14] bg-[#ECECED14] rounded-full p-2.5 text-[calc(1rem*(14/16))] leading-[calc(1rem*(14/16))] text-[#FFFFFF] app-font-medium z-10 cursor-pointer"
        onClick={() => setOpenSwitchWallet(true)}
      >
        <div className="flex gap-1 items-center">
          <img src="/images/futuresDiscover/wallets.png" className="w-[14px] h-[14px]" alt="" />
          <span>{numberOfWallets()}</span>
        </div>
        <div className="flex gap-1.5 items-center">
          <img src="/images/futuresDiscover/usdc.png" className="w-[14px] h-[14px]" alt="" />
          <span>{funding}</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.8185 6.00098H7.85197H5.18067C4.72355 6.00098 4.49499 6.7093 4.81878 7.12452L7.28533 10.2875C7.68055 10.7943 8.32338 10.7943 8.7186 10.2875L9.65665 9.08461L11.1852 7.12452C11.5042 6.7093 11.2756 6.00098 10.8185 6.00098Z"
            fill="white"
          />
        </svg>
      </div>
    ) : (
      <button
        className="bg-[#ECECED14] px-3 py-[5px] rounded-full border-[0.5px] border-[#ECECED14] h-[36px] flex justify-center items-center align-middle z-10"
        onClick={handleConnect}
      >
        <Text text="Connect" fontSize={13} fontWeight="medium" className="mb-1" />
        <img src="/images/futuresDetail/select-down-icon.svg" className="" alt="icon arrow down" />
      </button>
    )}

    {openLoginEvmEvm && <LoginEvmDrawer open={openLoginEvmEvm} setOpen={setOpenLoginEvm} />}
  </>

}
export default ButtonFuturesLogin
