import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { getUrlParam, removeUrlParam } from '@/utils/helpers'
import { TokenSearchDrawerType } from '@components/futuresDetails/tokenSearchDrawer'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import NewLoginDrawer from '../auth/NewLoginDrawer'
import Text from '../common/Text'
import SearchView from '../futuresDiscover/futuresSearch'
import { NewIconTriangleDown } from '../icon'
import { Sheet, SheetContent } from '../ui/sheet'
import { NewChangeWalletButton } from './header/NewChangeWalletButton'
import { AppSettingsPortal } from '../settings/AppSettingsPortal'
import MobileAdBanner from '../mobile/MobileAdBanner'
import { HotSearchToken, useFuturesHotSearchText } from '@/hooks/useFuturesHotSearchText'
import { cn, getPath } from '@/lib/utils'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant'
import { AppSettingsDrawer } from '@components/settings/AppSettingsDrawer.tsx'
import { Button } from '@components/ui/button.tsx'
import { HeaderNotifications } from '@components/header/HeaderNotifications.tsx'

const SearchDialogTrigger = ({
  setOpenSearch,
  isXStocksPage,
  isPredictionPage,
}: {
  setOpenSearch: Dispatch<SetStateAction<boolean>>
  isXStocksPage: boolean
  isPredictionPage?: boolean
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { hotSearchText, token, isLoading } = useFuturesHotSearchText({ board: isXStocksPage ? 'USTOCK' : 'MEME' })

  const navigateToTokenDetail = (token: HotSearchToken, isLoading: boolean) => {
    if (isLoading) {
      return
    }
    if (!token || !token.tokenContract || isLoading) {
      setOpenSearch(true)
      return
    }
    const basePath = getPath(isXStocksPage ? APP_PATH.X_STOCK_DETAIL : APP_PATH.MEME_TOKEN_DETAIL, {
      address: token.tokenContract,
      chain: CHAIN_SYMBOLS[Number(token.chainId)],
    })
    navigate(basePath)
  }

  if (isPredictionPage) {
    return (
      <div
        className={cn(
          'flex h-[32px] w-full cursor-pointer items-center justify-between rounded-[200px] bg-[#FFFFFF1A] pr-[10px] pl-[14px]',
        )}
        onClick={() => setOpenSearch(true)}
      >
        <Text text={t('Search event')} fontSize={13} fontWeight="regular" color="#605e68" className="" />

        <button
          type="button"
          className="flex size-[16px] items-center justify-center"
          // onClick={(event) => {
          //   event.stopPropagation()
          //   navigateToTokenDetail(token as HotSearchToken, isLoading)
          // }}
        >
          <img alt="" className="size-[16px]" src="/images/icons/search-icon.svg" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-full" onClick={() => setOpenSearch(true)}>
      <div
        className={cn(
          'flex h-[32px] w-full cursor-text items-center justify-between rounded-[200px] pr-[10px] pl-[14px]',
          isLoading ? 'skeleton-input' : 'bg-[#FFFFFF1A]',
        )}
      >
        {isLoading ? (
          <div className="h-full flex-1"></div>
        ) : (
          <Text
            text={hotSearchText ?? t('search.placeholder3')}
            fontSize={13}
            fontWeight="regular"
            color="#605e68"
            className=""
          />
        )}
        <button
          type="button"
          className="flex size-[16px] items-center justify-center"
          onClick={(event) => {
            event.stopPropagation()
            navigateToTokenDetail(token as HotSearchToken, isLoading)
          }}
        >
          <img alt="" className="size-[16px]" src="/images/icons/search-icon.svg" />
        </button>
      </div>
    </div>
  )
}

export const NewDiscoverHeader = () => {
  const [searchParams] = useSearchParams()
  const activeWallet = useSelector(_activeWallet)
  const [open, setOpen] = useState<boolean>(false)
  const { t } = useTranslation()
  const [openTokenSearch, setOpenTokenSearch] = useState(false)

  useEffect(() => {
    const { value } = getUrlParam('search')
    if (value) {
      setOpenTokenSearch(true)
    }
  }, [])

  useEffect(() => {
    if (!openTokenSearch) {
      searchParams.delete('search')
      setTimeout(() => {
        removeUrlParam('search')
      }, 1000)
    }
  }, [openTokenSearch])

  useEffect(() => {
    if (activeWallet?.isConnected) {
      setOpen(false)
    }
  }, [activeWallet])

  const location = useLocation()
  const pathname = location.pathname
  const isXStocksPage = pathname.includes('/xstocks')
  const isPredictionPage = pathname.includes('/prediction')

  return (
    <>
      <div className="mb-3 flex items-center gap-2 bg-transparent px-2.5">
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <AppSettingsDrawer />
            <SearchDialogTrigger
              setOpenSearch={setOpenTokenSearch}
              isXStocksPage={isXStocksPage}
              isPredictionPage={isPredictionPage}
            />
            {!activeWallet.isConnected && (
              <Button variant="glassLiquid" className="h-8" onClick={() => setOpen(true)}>
                Connect
              </Button>
            )}
            <HeaderNotifications />
          </div>
          <Sheet open={openTokenSearch} onOpenChange={setOpenTokenSearch}>
            <SheetContent className="max-w-[768px] min-w-full bg-[#0A0A0A] p-0">
              <SearchView
                open={openTokenSearch}
                setOpen={setOpenTokenSearch}
                type={
                  isXStocksPage
                    ? TokenSearchDrawerType.XSTOCKS
                    : isPredictionPage
                      ? TokenSearchDrawerType.PREDICTION
                      : TokenSearchDrawerType.CRYPTO
                }
                allowSwitchChain={false}
                board={isXStocksPage ? 'USTOCK' : 'CONTRACT'}
              />
            </SheetContent>
          </Sheet>
        </div>
        <NewLoginDrawer open={open} setOpen={setOpen} />
        {/* {!isXStocksPage && (
          <div className="rounded-full px-[12px] text-[calc(12rem/16)] leading-[calc(12rem/16)] bg-[#17171B] h-[32px] ">
            {activeWallet?.isConnected ? (
              <NewChangeWalletButton />
            ) : (
              <>
                <button className="flex items-center h-full gap-2" onClick={() => setOpen(true)}>
                  <span className="text-[12px] leading-none text-[#908E98] app-font-light">
                    {t('wallet.connectGuide')}
                  </span>
                  <NewIconTriangleDown className="mt-[1px]" />
                </button>
                <NewLoginDrawer open={open} setOpen={setOpen} />
              </>
            )}
          </div>
        )} */}
      </div>
      <MobileAdBanner size="large" className="px-2.5" />
    </>
  )
}
