import { useAppSelector, useAppDispatch } from '@/redux/store'
import { baseCoinSelector, quoteCoinSelector } from '@/redux/modules/futuresCurrentSymbol.slice'
import { useActiveAssetCtx } from '@/hooks/hyperliquid/useActiveAssetCtx'
import { setSymbolInfo } from '@/redux/modules/futuresCurrentSymbol.slice'
import { cn, showRate } from '@/lib/utils'
import { useEffect, useState, useRef } from 'react'
import Container from '@components/common/Container.tsx'
import { TokenSearchDrawer, TokenSearchDrawerType } from './tokenSearchDrawer'
import { useTranslation } from 'react-i18next'
import MovingBgFilterTags, { MovingBgFilterTagsHandle } from '@components/common/MovingBgFilterTags.tsx'
import { IconTriangleDown } from '@/components/icon/index'

type DetailSymbolProps = {
  pageTab: PageTabStates
  onPageTabChange: (tab: PageTabStates) => void
}

export enum PageTabStates {
  Trend = 'trend',
  Trade = 'trade',
}

const tabStates: PageTabStates[] = [PageTabStates.Trend, PageTabStates.Trade]

const DetailSymbol = ({ pageTab, onPageTabChange }: DetailSymbolProps) => {
  const { t } = useTranslation()

  const dispatch = useAppDispatch()
  const baseCoin = useAppSelector(baseCoinSelector)
  const quoteCoin = useAppSelector(quoteCoinSelector)
  const { price, markPrice, change, funding } = useActiveAssetCtx(baseCoin)
  const [openTokenSearch, setOpenTokenSearch] = useState(false)

  const tabRef = useRef<MovingBgFilterTagsHandle>(null)

  const handleTabChange = (tab: string) => {
    onPageTabChange(tab as PageTabStates)
  }

  const handleFormatTabLabel = (tab: string, activeTab: string) => {
    if (tab === PageTabStates.Trend && activeTab !== PageTabStates.Trend) {
      return <img src="/images/futuresDetail/details-trend-icon.svg" />
    }

    if (tab === PageTabStates.Trend && activeTab == PageTabStates.Trend) {
      return <img src="/images/futuresDetail/details-trend-active-icon.svg" />
    }

    if (tab === PageTabStates.Trade && activeTab !== PageTabStates.Trade) {
      return <img src="/images/futuresDetail/details-trade-icon.svg" />
    }

    if (tab === PageTabStates.Trade && activeTab == PageTabStates.Trade) {
      return <img src="/images/futuresDetail/details-trade-active-icon.svg" />
    }
  }

  useEffect(() => {
    dispatch(setSymbolInfo({ price, markPrice, change, funding }))
  }, [price, markPrice, change, dispatch])

  return (
    // <Container className=" pb-2.5 bg-black">
    <Container className={cn('mx-0 p-0')}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center cursor-pointer" onClick={() => setOpenTokenSearch(true)}>
          {/* <img src="/images/futuresDetail/symbol-down-arrow.svg" alt="" /> */}
          <div className="flex items-center text-[calc(16rem/16)] leading-[calc(16rem/16)] mr-1 font-bold">
            <span>{baseCoin}</span>
            {/* <span className="text-[calc(12rem/16)] mx-1">/</span> */}
            <span>{quoteCoin}</span>
          </div>
          <IconTriangleDown className="w-4 h-4" />

          {pageTab === PageTabStates.Trade && (
            <div
              className={cn(
                'text-[calc(12rem/16)] py-0.5 px-1.5  text-white font-bold rounded-[4px] leading-[calc(12rem/16)]',
                // parseFloat(change) >= 0 ? 'bg-[var(--bg-positive)]' : 'bg-[var(--bg-negative)]',
              )}
              // style={{
              //   background: parseFloat(change) >= 0 ? 'var(--bg-positive)' : 'var(--bg-negative)',
              // }}
            >
              <span className={cn(parseFloat(change) >= 0 ? 'text-rise' : 'text-fall')}>
                {showRate(change) === '≈0%' ? '--' : showRate(change)}
              </span>
            </div>
          )}
        </div>

        {/*   {
          <MovingBgFilterTags
          ref={tabRef}
          tabs={tabStates}
          defaultTab={pageTab}
          activeTab={pageTab}
          onTabChange={handleTabChange}
          formatTabLabel={handleFormatTabLabel}
          containerId="meme-new-pairs"
          containerClassName="h-[28px]  border border-[#302E38] rounded-[6px]"
          tabsListClassName="w-[88px] bg-[#79778C29] h-[28px] p-[2px] flex items-center"
          tabsTriggerClassName="flex-1 h-[24px]"
          tabsTriggerInactiveClassName=""
          tabsTriggerActiveClassName="!bg-[#0A0A0A] "
          tabBgClassName="bg-transparent"
        />
        }
 */}
      </div>
      <TokenSearchDrawer
        open={openTokenSearch}
        setOpen={setOpenTokenSearch}
        type={TokenSearchDrawerType.CRYPTO}
        allowShowList
        hideFavoriteTokens
      />
    </Container>
  )
}

export default DetailSymbol
