import { useState } from 'react'

import Text from '../common/Text'
import { TokenSearchDrawerType } from '../futuresDetails/tokenSearchDrawer'
import { useNavigate } from 'react-router-dom'
import SearchView from './futuresSearch'
import { AppSettingsPortal } from '../settings/AppSettingsPortal'
import { useFuturesHotSearchText } from '@/hooks/useFuturesHotSearchText'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const SearchBar = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  // const { activeWallet, wallets } = useMultiChainWallet({})
  // const activeWallet = useSelector(_activeWallet)

  // const [openLoginEvmEvm, setOpenLoginEvm] = useState(false)
  // const [openSwitchWallet, setOpenSwitchWallet] = useState<boolean>(false)

  const [openTokenSearch, setOpenTokenSearch] = useState(false)

  const { hotSearchText, hotSymbol, isLoading } = useFuturesHotSearchText()

  // const urlParams = new URLSearchParams(window.location.search)
  // const isLoginV2 = urlParams.get('login') === 'v2'
  // const isLoginV2 = true

  const onOpenTokenSearch = () => {
    setOpenTokenSearch(true)
    // navigate(APP_PATH.FUTURES_DISCOVER_SEARCH)
  }

  const onClickHotSearchIcon = (isLoading: boolean) => {
    if (!hotSymbol || isLoading) {
      setOpenTokenSearch(true)
      return
    }

    navigate(`/futures/${hotSymbol}`)
  }

  return (
    <>
      <div className="mb-[12px] mt-[8px] flex items-center">
        <div className="relative w-full" onClick={onOpenTokenSearch}>
          <div
            className="w-full flex items-center bg-[#FFFFFF1A]
              pl-[14px] pr-[10px] h-[32px]
              rounded-[200px] cursor-pointer"
          >
            {isLoading ? (
              <div className="flex-1 h-full"></div>
            ) : (
              <div className="flex items-center justify-between w-full gap-2">
                <Text
                  text={hotSearchText ?? t('search.placeholder3')}
                  fontSize={13}
                  fontWeight="regular"
                  color="#605e68"
                  className="leading-[1.2]"
                />
              </div>
            )}

            <button
              type="button"
              className="size-[16px] flex items-center justify-center shrink-0"
              onClick={(event) => {
                event.stopPropagation()
                onClickHotSearchIcon(isLoading)
              }}
            >
              <img alt="search" className="size-[16px]" src="/images/icons/search-icon.svg" />
            </button>
          </div>
        </div>

        <AppSettingsPortal isOpen={openTokenSearch} onClose={() => setOpenTokenSearch(false)} direction="right">
          <SearchView
            open={openTokenSearch}
            setOpen={setOpenTokenSearch}
            type={TokenSearchDrawerType.CRYPTO}
            allowSwitchChain={true}
          />
        </AppSettingsPortal>
        {/* <TokenSearchDrawer
          open={openTokenSearch}
          setOpen={setOpenTokenSearch}
          type={TokenSearchDrawerType.CRYPTO}
          allowShowList={false}
        /> */}
      </div>
    </>
  )
}

export default SearchBar
