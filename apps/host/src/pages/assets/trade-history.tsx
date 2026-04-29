import { APP_PATH } from '@/lib/constant.ts'
import { UITab } from '@/types/uiTabs.ts'
import Orders from '@components/assets/history/meme/Orders.tsx'
import MemeTrades from '@components/assets/history/meme/Trades.tsx'
import Trades from '@components/assets/history/perps/Trades.tsx'
import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import SelectHistory from '@/components/assets/history/SelectHistory'

const perpsTabs: UITab[] = [
  {
    label: 'assets.history.trades',
    value: 'trades',
  },
]

const memeTabs: UITab[] = [
  {
    label: 'assets.history.trades',
    value: 'trades',
  },
  {
    label: 'assets.history.orders',
    value: 'orders',
  },
]

const TradeHistory = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const { chainId, wallet } = location.state || {}
  const navigate = useNavigate()

  const side = location.search?.includes('page=perps')
    ? 'perps'
    : location.search?.includes('page=meme')
      ? 'meme'
      : 'perps'

  const [selectedTab, setSelectedTab] = useState<string>(
    side === 'perps' ? 'trades' : side === 'meme' ? 'trades' : 'trades',
  )

  const tabs = useMemo(() => {
    if (side === 'perps') return perpsTabs
    if (side === 'meme') return memeTabs
    return []
  }, [side])

  useEffect(() => {
    if (side === 'perps' && selectedTab !== 'trades') {
      setSelectedTab('trades')
    }
    if (side === 'meme' && selectedTab !== 'trades' && selectedTab !== 'orders') {
      setSelectedTab('trades')
    }
  }, [side, selectedTab])

  const [openSelectHistory, setOpenSelectHistory] = useState(false)

  return (
    <div className="flex max-h-screen h-screen pt-23 flex-col overflow-hidden bg-[#0A0A0A] text-white">
      <div className="fixed top-0 left-0 w-full z-10 bg-[#0A0A0A]">
        <div className="flex items-center justify-between">
          <div className="max-w-3xl mx-auto flex items-center justify-between w-full p-4">
            <div className="w-24">
              <img
                src="/images/icons/arrow-left.svg"
                className="w-6 h-6 cursor-pointer"
                alt="arrow-left"
                onClick={() => {
                  const page = new URLSearchParams(location?.search).get('page')
                  const path = page ? APP_PATH.ASSETS + `/${page}` : APP_PATH.ASSETS
                  navigate(path, {
                    state: { chainId, wallet },
                  })
                }}
              />
            </div>
            <div className="flex gap-1 items-center cursor-pointer" onClick={() => setOpenSelectHistory(true)}>
              <div className="text-[calc(18rem/16)] leading-6 font-medium flex items-center gap-2">
                <span className="whitespace-nowrap">{t('assets.history.tradeHistory')}</span>
                {side && <img src="/images/icons/arrow-down3.svg" className="w-3" alt="arrow-down" />}
              </div>
            </div>
            <div className="w-24 flex items-center justify-end"></div>
          </div>
        </div>
        <MovingLineTabs
          tabs={tabs.map((tab) => ({
            label: t(tab.label),
            value: tab.value,
          }))}
          defaultTab={selectedTab}
          onTabChange={(tab) => setSelectedTab(tab)}
          containerClassName="max-w-3xl mx-auto justify-start bg-transparent"
          showContainerBottomLine={false}
          tabLineClassName="before:h-[5px] before:rounded-t-[5px] before:bg-[#843BEA]"
        />
      </div>
      {side === 'perps' && selectedTab === 'trades' && <Trades />}
      {side === 'meme' && selectedTab === 'trades' && <MemeTrades />}
      {side === 'meme' && selectedTab === 'orders' && <Orders />}
      <SelectHistory
        open={openSelectHistory}
        setOpen={setOpenSelectHistory}
        onSelected={(type: string) => {
          if (type === 'assetHistory') {
            navigate(APP_PATH.ASSET_HISTORY + (side ? `?page=${side}` : ''), {
              state: { wallet, chainId },
            })
          } else if (type === 'tradeHistory') {
            navigate(APP_PATH.TRADE_HISTORY + (side ? `?page=${side}` : ''), {
              state: { wallet, chainId },
            })
          }
        }}
      />
    </div>
  )
}

export default TradeHistory
