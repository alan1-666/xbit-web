import { useTranslation } from 'react-i18next'
import MemePopularSearches from './MemePopularSearches'
import { TokenSearchDrawerType } from '.'

export const SearchSidebar = ({ type }: { type?: TokenSearchDrawerType }) => {
  const { t } = useTranslation()

  return (
    <>
      <div className="py-2.5">
        <div className="flex justify-between items-center">
          <div className="text-title align-baseline app-font-regular text-base leading-4">
            {t('tokenSearchDrawer.popularSearch')}
          </div>
        </div>
        {/* {currentTab === headerTabs[1].value && <CryptoPopularSearches isShowList={isShowList} />} */}
        <MemePopularSearches type={type} />
      </div>
      {/* <div className="py-3">
        <div className="flex justify-between items-center">
          <div className="text-title align-baseline app-font-medium text-base leading-4">最新</div>
        </div>
        <div className="mt-1.5 align-baseline text-sm text-[#FFFFFF80]">Meme</div>
        <div className="mt-1.5 flex items-center gap-1.5 overflow-auto no-scrollbar">
          {memeTokens.map((item) => (
            <div
              key={item.token}
              className="relative px-6 py-2 bg-[#ECECED14] hover:bg-[#FFFFFF30] border border-gradient rounded-[6px] flex flex-col justify-center items-center cursor-pointer"
              onClick={() => handlePopularSearchClick(item)}
            >
              <div className="flex items-center gap-1">
                <Avatar className="size-[14px] bg-[#111111]">
                  <AvatarFallback className="capitalize text-[calc(9rem/16)] bg-[#111111]">
                    {item.symbol.slice(0, 2).toLowerCase()}
                  </AvatarFallback>
                  <AvatarImage src={item.logoUrl} />
                </Avatar>
                <div className="text-[calc(14rem/16)] app-font-medium text-[#FFFFFF] truncate">{item.symbol}</div>
              </div>
              <div
                className={cn(
                  'mt-1 text-[calc(12rem/16)] text-[#FFFFFF80]',
                  item?.price24hChange === undefined || item?.price24hChange >= 0 ? 'text-[#00FFB4]' : 'text-[#AB57FF]',
                )}
              >
                <span>
                  {formattedPrice(item?.price24hChange).isPositive ? '+' : ''}
                  {formattedPrice(item?.price24hChange).value}
                </span>
              </div>
            </div>
          ))}
        </div>
        {currentTab === headerTabs[1].value && (
          <>
            <div className="mt-1.5 align-baseline text-sm text-[#FFFFFF80]">合约</div>
            <NewCryroToken isShowList={isShowList} />
          </>
        )}
      </div> */}
    </>
  )
}
