import { ChangeWalletButton } from '@components/discover/header/ChangeWalletButton.tsx'
import { ConnectButton } from '@components/discover/header/ConnectButton.tsx'
import { Dispatch, SetStateAction, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TokenSearchDrawer, TokenSearchDrawerType } from '../futuresDetails/tokenSearchDrawer'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'

const SearchDialogTrigger = ({ setOpenSearch }: { setOpenSearch: Dispatch<SetStateAction<boolean>> }) => {
  const { t } = useTranslation()
  return (
    <div
      className="w-full flex items-center justify-between pl-[calc(1rem*(15/16))] pr-[calc(1rem*(19/16))] py-[calc(1rem*(9/16))] bg-(--bg-secondary) border border-solid border-(--bg-secondary) rounded-[200px] cursor-text"
      onClick={() => setOpenSearch(true)}
    >
      <div className="w-full flex-1 outline-none text-[calc(1rem*(14/16))] text-[#FFFFFFB2] leading-[calc(1rem*(14/16))] line-clamp-1">
        {t('search.placeholder')}
      </div>
      <img alt="" className="size-[calc(1rem*(18/16))]" src="/images/icons/search-icon.svg" />
    </div>
  )
}

export const DiscoverHeader = () => {
  const activeWallet = useSelector(_activeWallet)
  const [openSearch, setOpenSearch] = useState(false)

  return (
    <div className="px-2.5 flex items-center gap-2 mb-4">
      <div className="flex-1">
        {/* <SearchDialogTrigger setOpenSearch={setOpenSearch} />

        <TokenSearchDrawer allowShowList open={openSearch} setOpen={setOpenSearch} type={TokenSearchDrawerType.MEME} /> */}
        <SearchDialogTrigger setOpenSearch={setOpenSearch} />

        <TokenSearchDrawer allowShowList open={openSearch} setOpen={setOpenSearch} type={TokenSearchDrawerType.MEME} />
      </div>
      <div className="border border-[#ECECED14] bg-[#ECECED14] h-[38px] rounded-full px-3 text-[calc(14rem/16)]">
        {activeWallet?.isConnected ? <ChangeWalletButton /> : <ConnectButton />}
      </div>
    </div>
  )
}
