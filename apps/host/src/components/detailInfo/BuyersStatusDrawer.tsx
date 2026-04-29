import React, { useMemo, useState } from 'react'
import AppDrawer from '@components/common/AppDrawer.tsx'
import { useTranslation } from 'react-i18next'
import { BuyerStatus, getStatusIcon } from './statusIcons'
import { TokenDetail, TokenSniper } from '@/@generated/gql/graphql-meme2.ts'
import { ChainIds } from '@/types/enums.ts'
import FormatedValue from '@components/common/FormatedValue.tsx'
import useGetTokenSniper from '@hooks/useGetTokenSniper.ts'
import { Configs } from '@const/configs.ts'

interface BuyerStatusData {
  hold: number
  increase: number
  partialSell: number
  fullSell: number
  targetedBuyer: number
}

export interface BuyersStatusDrawerProps {
  tokenData: TokenDetail | undefined
}

const mappingStatus: Record<TokenSniper, BuyerStatus> = {
  Hold: 'hold',
  BuyMore: 'increase',
  SellPart: 'partialSell',
  SellAll: 'fullSell',
  Sniper: 'targetedBuyer',
}

type ItemChunk = {
  isSniper: boolean
  status: string
}

const BuyersStatusDrawer = (props: BuyersStatusDrawerProps) => {
  const { t } = useTranslation()
  const [openDrawer, setOpenDrawer] = useState(false)
  const { tokenData } = props

  const { data } = useGetTokenSniper({
    address: tokenData?.address as string,
    chainId: tokenData?.chainId as ChainIds,
  })

  //newList from API
  const sniperList =
    data && data?.getTokenSniper?.traders && data?.getTokenSniper?.traders?.length > 0
      ? data?.getTokenSniper?.traders
      : []

  const statusData: BuyerStatusData = useMemo(() => {
    if (!data) {
      return {
        hold: 0,
        increase: 0,
        partialSell: 0,
        fullSell: 0,
        targetedBuyer: 0,
      }
    }
    let hold = 0
    let increase = 0
    let partialSell = 0
    let fullSell = 0
    let targetedBuyer = 0

    sniperList?.map((holder) => {
      switch (holder?.status) {
        case TokenSniper.Hold: {
          hold += 1
          break
        }
        case TokenSniper.BuyMore: {
          increase += 1
          break
        }
        case TokenSniper.SellPart: {
          partialSell += 1
          break
        }
        case TokenSniper.SellAll: {
          fullSell += 1
          break
        }
        case TokenSniper.Sniper: {
          targetedBuyer += 1
          break
        }
      }
    })

    return {
      hold,
      increase,
      partialSell,
      fullSell,
      targetedBuyer,
    }
  }, [data])

  const totalHoldOrIncrease = useMemo(
    () => statusData.hold + statusData.increase,
    [statusData.hold, statusData.increase],
  )

  const totalBuyers = sniperList?.length ?? 100
  const currentProgress = `${totalHoldOrIncrease}/${totalBuyers}`

  const { top100HoldPercentage, top10HoldPercentage } = useMemo(() => {
    if (!data)
      return {
        top100HoldPercentage: 0,
        top10HoldPercentage: 0,
      }
    return {
      top100HoldPercentage: Number(data?.getTokenSniper?.top100Holders) * 100,
      top10HoldPercentage: Number(data?.getTokenSniper?.top10Holders) * 100,
    }
  }, [data])

  const chunkedStatuses = useMemo(() => {
    const chunkSize = 10
    const chunks = []
    const snipers = sniperList.filter((x) => x.isSniper === true)
    const nonSnipers = sniperList.filter((x) => x.isSniper !== true)

    const sortSnipersTop = [...snipers, ...nonSnipers]
    for (let i = 0; i < sortSnipersTop.length; i += chunkSize) {
      const chunk = sortSnipersTop.slice(i, i + chunkSize)
      const chunkWithStatus: ItemChunk[] = chunk.map((item) => ({
        isSniper: Boolean(item?.isSniper),
        status: mappingStatus[item.status!],
      }))
      if (chunkWithStatus.length < chunkSize) {
        const remaining = chunkSize - chunkWithStatus.length
        for (let j = 0; j < remaining; j++) {
          chunkWithStatus.push({ isSniper: false, status: 'none' })
        }
      }
      chunks.push(chunkWithStatus)
    }
    return chunks
  }, [sniperList])

  return (
    <>
      <div className="flex items-center flex-col gap-1.5 cursor-pointer" onClick={() => setOpenDrawer(true)}>
        <img src="/images/tokenDetail/icon-buy-traders.svg" className="w-4.5 h-4.5" alt="" />
        <div className="text-[calc(1rem*(11/16))] text-[#ea963a] leading-[1] relative top-[-0.5px]">
          {currentProgress}
        </div>
      </div>

      <AppDrawer
        title={t('detail.buyersStatusDrawer.title', {
          token: tokenData?.symbol,
          total: totalBuyers,
          holding: totalHoldOrIncrease,
        })}
        open={openDrawer}
        setOpen={setOpenDrawer}
        drawerClassName=""
        drawerHeaderClassName="py-[14px]"
        isShowBgImg={false}
        drawerContent={
          <div className="pb-4">
            <div className="mb-5 text-[#FFFFFFCC] text-sm leading-none">
              {t('detail.buyersStatusDrawer.holdingOrIncrease', { count: totalHoldOrIncrease })}
            </div>
            <div className="space-y-3 justify-between border-b-[0.5px] border-[#343339] pb-4">
              {chunkedStatuses.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-between w-full">
                  {row.map((item, colIndex) => (
                    <React.Fragment key={colIndex}>
                      {getStatusIcon(item?.status as BuyerStatus, 'normal', false, item?.isSniper)}
                    </React.Fragment>
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-5 pb-5 border-b-[0.5px] border-[#343339]">
              <div className="text-white text-base">{t('detail.buyersStatusDrawer.iconExplanation')}</div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 font-[350] mt-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon('hold', 'small')}
                  <div className="text-[14px] leading-none">
                    {t('detail.buyersStatusDrawer.holdingUnchanged')}: {statusData.hold}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon('increase', 'small')}
                  <div className="text-[14px] leading-none">
                    {t('detail.buyersStatusDrawer.increased')}: {statusData.increase}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon('partialSell', 'small')}
                  <div className="text-[14px] leading-none">
                    {t('detail.buyersStatusDrawer.partialSold')}: {statusData.partialSell}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon('fullSell', 'small')}
                  <div className="text-[14px] leading-none">
                    {t('detail.buyersStatusDrawer.allSold')}: {statusData.fullSell}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusIcon('targetedBuyer', 'small', false, true)}
                  <div className="text-[14px] leading-none">
                    {t('detail.buyersStatusDrawer.targetedBuyer')}:{' '}
                    {sniperList?.filter((x) => x.isSniper === true)?.length ?? 0}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-white text-[14px] leading-none mt-5">
              <div className="text-base font-[330]">{t('detail.buyersStatusDrawer.proportion')}</div>
              <div className="flex justify-between mt-2 gap-4 text-sm">
                <div className="flex items-center gap-0.5">
                  <span>{t('detail.buyersStatusDrawer.latest100Holding')}:</span>
                  {!top100HoldPercentage || isNaN(top100HoldPercentage) ? (
                    '--'
                  ) : (
                    <FormatedValue
                      value={top100HoldPercentage}
                      maxMeaningfulDigits={2}
                      unit={'%'}
                      className="text-[14px]"
                    />
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  <span>{t('detail.buyersStatusDrawer.latest10Holding')}:</span>
                  {!top10HoldPercentage || isNaN(top10HoldPercentage) ? (
                    '--'
                  ) : (
                    <FormatedValue
                      value={top10HoldPercentage}
                      maxMeaningfulDigits={2}
                      unit={'%'}
                      className="text-[14px]"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        }
      />
    </>
  )
}

export default BuyersStatusDrawer
