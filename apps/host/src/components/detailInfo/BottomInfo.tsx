import { TokenDetail } from '@/@generated/gql/graphql-core'
import { CopyButton } from '@/components/common/copy-button'
import { formatVolume } from '@/lib/format'
import { formatAddressWallet } from '@/lib/string.ts'
import { setPrice, TokenDetailState } from '@/redux/modules/tokenDetail.slice.ts'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { ChainIds } from '@/types/enums.ts'
import { getLinkExplorer2 } from '@/utils/helpers'
import TokenStatistic from '@components/detailToken/TokenStatisticPC.tsx'
import PairDetail from '@components/pairDetail/pc.tsx'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion.tsx'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface props {
  tokenData: TokenDetail
}

const BottomInfo = ({ tokenData }: props) => {
  const { t } = useTranslation()
  const bannerUrl = tokenData?.info?.bannerUrl
  const [isImgLoadedError, setIsImgLoadedError] = useState<boolean>(false)
  const { price } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)
  const lastestPrice = price ? price : tokenData?.price
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(setPrice(0))
  }, [tokenData?.address])

  return (
    <>
      <Accordion type="single" collapsible defaultValue="openTxData">
        <AccordionItem value="openTxData" className="mt-2.5 border-b-0">
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <AccordionTrigger className="[&[data-state=open]>svg]:rotate-0 [&[data-state=closed]>svg]:-rotate-90 py-0">
                <div className="text-[calc(14rem/16)] flex items-center gap-2 cursor-pointer">
                  <span>{t('detail.bottomInfo.txData')}</span>
                </div>
              </AccordionTrigger>
            </div>
            <AccordionContent>
              <PairDetail tokenData={tokenData} />
              <TokenStatistic tokenData={tokenData} />
            </AccordionContent>
          </div>
        </AccordionItem>
      </Accordion>

      {!!bannerUrl && !isImgLoadedError && (
        <Accordion type="single" collapsible defaultValue="openTxData">
          <AccordionItem value="openTxData" className="mt-2.5 border-b-0">
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <AccordionTrigger className="[&[data-state=open]>svg]:rotate-0 [&[data-state=closed]>svg]:-rotate-90 py-0">
                  <div className="text-[calc(14rem/16)] flex items-center gap-2 cursor-pointer">
                    <span>{t('detail.bottomInfo.tokenBanner')}</span>
                  </div>
                </AccordionTrigger>
              </div>
              <AccordionContent>
                <img
                  src={bannerUrl as string}
                  className="w-full h-full object-cover rounded-[8px] max-h-[300px] mb-4"
                  alt="banner"
                  onError={() => setIsImgLoadedError(true)}
                />
              </AccordionContent>
            </div>
          </AccordionItem>
        </Accordion>
      )}
      <Accordion type="single" collapsible defaultValue="openTokenInfo">
        <AccordionItem value="openTokenInfo" className="mt-2.5 border-b-0">
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <AccordionTrigger className="[&[data-state=open]>svg]:rotate-0 [&[data-state=closed]>svg]:-rotate-90 py-0">
                <div className="text-[calc(14rem/16)] flex items-center gap-2 cursor-pointer">
                  <span>{t('detail.bottomInfo.tokenInfo')}</span>
                </div>
              </AccordionTrigger>
            </div>
            <AccordionContent className="border-[0.5px] border-[#ECECED1F] rounded-[4px]">
              <div className="px-2.5 py-[17.5px] flex items-center justify-between font-[330] text-[13px] text-white leading-none">
                <span>{t('detail.bottomInfo.mcap')}</span>
                <span>
                  {formatVolume(lastestPrice * (tokenData?.totalSupply ? +tokenData?.totalSupply : 1), {
                    showCurrency: true,
                  })}
                </span>
              </div>
              <div className="px-2.5 py-[17.5px] flex items-center justify-between font-[330] text-[13px] text-white leading-none border-t-[0.5px] border-[#ECECED1F]">
                <span>{t('detail.bottomInfo.circulatingSupply')}</span>
                <span>{formatVolume(tokenData?.circulatingSupply)}</span>
              </div>
              <div className="px-2.5 py-[17.5px] flex items-center justify-between font-[330] text-[13px] text-white leading-none border-t-[0.5px] border-[#ECECED1F]">
                <span>{t('detail.bottomInfo.totalSupply')}</span>
                <span>{formatVolume(Number(tokenData?.totalSupply))}</span>
              </div>
              <div className="px-2.5 py-[17.5px] flex items-center justify-between font-[330] text-[13px] text-white leading-none border-t-[0.5px] border-[#ECECED1F]">
                <span>{t('detail.bottomInfo.tokenCreator')}</span>
                <div className=" flex items-center gap-1">
                  <span>
                    {tokenData?.creator ? (
                      <a
                        href={getLinkExplorer2(tokenData.chainId as ChainIds, tokenData?.creator)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#843BEA] hover:underline"
                      >
                        {formatAddressWallet(tokenData?.creator)}
                      </a>
                    ) : (
                      '--'
                    )}
                  </span>
                  {tokenData?.creator && <CopyButton text={tokenData?.creator} />}
                </div>
              </div>
              <div className="px-2.5 py-[17.5px] flex items-center justify-between font-[330] text-[13px] text-white leading-none border-t-[0.5px] border-[#ECECED1F]">
                <span>{t('detail.bottomInfo.tokenCreated')}</span>
                <span>{dayjs(tokenData?.createdTime).format('YYYY-MM-DD HH:mm:ss')}</span>
              </div>
            </AccordionContent>
          </div>
        </AccordionItem>
      </Accordion>
    </>
  )
}

export default BottomInfo
