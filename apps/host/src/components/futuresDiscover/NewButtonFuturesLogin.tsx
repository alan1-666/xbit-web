import { useEffect, useMemo, useState } from 'react'
import { getClearinghouseState } from '@/api/hyperliquid'
import { fixNumber } from '@/lib/utils'
import { NewIconTriangleDown } from '@/components/icon/index'
import NewLoginDrawer from '@/components/auth/NewLoginDrawer.tsx'
import { useTranslation } from 'react-i18next'
import { _activeWallet, mappedTypeChain, selectListWallets } from '@/redux/modules/newWallet.slice'
import NewSwitchWalletBottomSheet from '@/components/auth/ManagementWallets/NewSwitchWalletBottomSheet'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { useDispatch, useSelector } from 'react-redux'
import { useAppSelector } from '@/redux/store'
import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import { IconTriangleDown } from '../icon/IconTriangleDown'
import { IconWallet } from '@components/icon/stroke/IconWallet.tsx'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'

const NewButtonFuturesLogin = () => {
  const dispatch = useDispatch()
  const { availableFund, accountValue } = useWebData2()
  const activeWallet = useSelector(_activeWallet)

  const [openSwitchWalletBottomSheet, setOpenSwitchWalletBottomSheet] = useState(false)

  const [funding, setFunding] = useState(0)

  const [open, setOpen] = useState<boolean>(false)
  const { t } = useTranslation()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)

  const isConnectedArb = activeWallet?.isConnected && activeChain === TYPE_CHAIN.ARB

  const numberOfWallets = 1

  const getUserFunding = async () => {
    try {
      const data = await getClearinghouseState(activeWallet?.walletAddress)
      const balance = fixNumber(data?.crossMarginSummary?.accountValue, 2)
      setFunding(Number(balance))
    } catch (err: any) {}
  }

  useEffect(() => {
    if (isConnectedArb) {
      getUserFunding()
    }
  }, [activeWallet?.isConnected, activeWallet?.walletAddress, activeChain])

  return (
    <div className="rounded-full px-[12px] text-[calc(12rem/16)] leading-[calc(12rem/16)] bg-[#17171B] h-[32px] ">
      {activeWallet?.isConnected && (
        <>
          <div
            className="h-full flex items-center gap-2.5"
            onClick={() => {
              setOpenSwitchWalletBottomSheet(true)
            }}
          >
            <div className="flex gap-1 items-center">
              <IconWallet />
              <span className="leading-[calc(14rem/16)]">{numberOfWallets}</span>
            </div>
            <div className="flex gap-1.5 items-center">
              <img src="/images/futuresDiscover/usdc.png" className="size-[12px]" alt="" />
              <span className='leading-[calc(14rem/16)]'>{Number(accountValue) > 0 ? accountValue : funding}</span>
            </div>
            <IconTriangleDown />
          </div>

          <NewSwitchWalletBottomSheet
            open={openSwitchWalletBottomSheet}
            setOpen={setOpenSwitchWalletBottomSheet}
            tab="crypto"
          />
        </>
      )}

      {!activeWallet?.isConnected && (
        <>
          <button className="flex items-center h-full gap-2" onClick={() => setOpen(true)}>
            <span className="text-[12px] leading-none text-[#908E98] app-font-light">{t('wallet.connectGuide')}</span>
            <NewIconTriangleDown className="mt-[1px]" />
          </button>
          <NewLoginDrawer open={open} setOpen={setOpen} />
        </>
      )}
    </div>
  )
}
export default NewButtonFuturesLogin
