import {cn} from "@/lib/utils.ts";
import React from "react";
import {useTranslation} from "react-i18next";
import FormatedValue from "@components/common/FormatedValue.tsx";
import {HolderDto} from "@/@generated/gql/graphql-meme2.ts";
import {getTimeAgo} from "@/utils/time.ts";
import dayjs from "dayjs";

type HolderWalletInfoProps = {
  holder: HolderDto;
}

type TitleProps = {
  title: string
  icon?: string
  tooltip?: React.ReactNode
  holder?: HolderDto
}

const Title = ({title, tooltip, icon}: TitleProps) => {
  return (
    <div className='flex items-center gap-1'>
      {icon && <img src={icon} alt={title} />}
      <span className='text-[12px] leading-[1] font-light text-[#908E98]'>
        {title}
      </span>
      {tooltip && tooltip}
    </div>
  )
}

const HolderWalletInfo = ({holder}: HolderWalletInfoProps) => {
  const { t } = useTranslation()

  const {
    address,
    totalBuyUsd,
    buys,
    totalSellUsd,
    sells,
    balance,
    totalSupply,
    createdAt,

  } = holder

  const holdingLength = createdAt ?? '--'
  const holdingLengthTimestamp = holdingLength === "--" ? "--" : (new Date(holdingLength))
  const holdingRatio = (Number(balance) === 0 || Number(totalSupply) === 0)
    ? 0
    : Math.min((Number(balance) * 100 / Number(totalSupply)), 100 )

  return (
    <div className={cn('bg-[#212127] rounded-[8px] max-w-[200px] p-2')}>
      <p className='text-[12px] leading-[1.2] font-light text-[#FBFBFB] break-words'>
        {address}
      </p>
      {/* Info */}
      <div className={'mt-2 border-b border-b-[#1F1E25]'}>
        {/*Total Buy*/}
        <div className='flex items-center justify-between py-2'>
          <Title title={t('walletDetail.holderTable.totalBuy')} />
          <div className='flex items-center gap-0.5'>
            <FormatedValue
              value={totalBuyUsd}
              unit={'$'}
              position={'front'}
              className={'text-[12px] leading-[1] font-light !text-[#21E09D]'}
            />
            <span className='text-[11px] leading-[1] font-light text-[#908E98]'>{'/'}</span>
            <FormatedValue
              value={Number(buys)}
              unit={'TXs'}
              className={'text-[12px] leading-[1] font-light !text-[#21E09D]'}
            />
          </div>
        </div>
        {/*Total Sell*/}
        <div className='flex items-center justify-between py-2'>
          <Title title={t('walletDetail.holderTable.totalSell')} />
          <div className='flex items-center gap-0.5'>
            <FormatedValue
              value={totalSellUsd}
              unit={'$'}
              position={'front'}
              className={'text-[12px] leading-[1] font-light !text-[#EA3B4F]'}
            />
            <span className='text-[11px] leading-[1] font-light text-[#908E98]'>{'/'}</span>
            <FormatedValue
              value={Number(sells)}
              unit={'TXs'}
              className={'text-[12px] leading-[1] font-light !text-[#EA3B4F]'}
            />
          </div>
        </div>
        {/*Total Fee*/}
        <div className='flex items-center justify-between py-2'>
          <Title title={t('detail.holdings.totalFees')} />
          <div className='flex items-center gap-0.5'>
            <FormatedValue
              value={0}
              unit={'$'}
              position={'front'}
              className={'text-[12px] leading-[1] font-light !text-[#21E09D]'}
            />
          </div>
        </div>
        {/*Balance*/}
        <div className='flex items-center justify-between py-2'>
          <Title title={t('walletDetail.holdings.balance')} />
          <div className='flex flex-col gap-1 items-end'>
            <FormatedValue
              value={balance}
              unit={'$'}
              position={'front'}
              className={'text-[12px] leading-[1] !font-light'}
            />
            <div className={'w-[60px] h-[2px] rounded-r-full bg-[#00FFB433]'}>
              <div className={'h-[2px] rounded-r-full bg-[#21E09D]'} style={{width: `${holdingRatio}%`}}></div>
            </div>
          </div>
        </div>
        {/*Holding length*/}
        <div className='flex items-center justify-between pt-2 pb-[7px]'>
          <Title title={t('walletDetail.holderTable.holdingLength')} />
          <div className='flex items-center gap-0.5'>
            <div className="text-[12px] leading-[1] font-light">
              {holdingLength === '--' ? holdingLength : getTimeAgo(holdingLength)}
            </div>
          </div>
        </div>
      </div>
      {/*PnL*/}
      <div>
        {/*time*/}
        <div className='flex items-center justify-between py-2'>
          <Title title={t('detail.tokenDetail.time')} />
          <div className='text-[12px] leading-[1] font-light'>
            {holdingLengthTimestamp === '--' ? '--' : dayjs(holdingLengthTimestamp.toString())?.format('MM/DD hh:mm:ss')}
          </div>
        </div>
        {/*Tracked*/}
        <div className='flex items-center justify-between py-2'>
          <Title title={t('detail.holder.tracked')} />
          <div className='flex items-center gap-0.5'>
            --
          </div>
        </div>
        {/*Noted*/}
        <div className='flex items-center justify-between py-2'>
          <Title title={t('detail.holder.noted')} />
          <div className='flex items-center gap-0.5'>
            --
          </div>
        </div>
        {/*7d winrate*/}
        <div className='flex items-center justify-between py-2'>
          <Title title={t('detail.holder.winrate7d')} />
          <div className='flex items-center gap-0.5'>
            <FormatedValue
              value={totalBuyUsd}
              unit={'%'}
              className={'text-[12px] leading-[1] font-light !text-[#21E09D]'}
              isMocked
            />
          </div>
        </div>
        {/*7d pnl*/}
        <div className='flex items-center justify-between py-2'>
          <Title title={t('detail.holder.profit7d')} />
          <div className='flex items-center gap-0.5'>
            <FormatedValue
              value={totalBuyUsd}
              unit={'$'}
              position={'front'}
              className={'text-[12px] leading-[1] font-light !text-[#21E09D]'}
              isMocked
            />
          </div>
        </div>
        {/*7d trades*/}
        <div className='flex items-center justify-between py-2'>
          <Title title={t('detail.holder.trades7d')} />
          <div className='flex items-center gap-0.5'>
            <FormatedValue
              value={totalBuyUsd}
              unit={'$'}
              position={'front'}
              className={'text-[12px] leading-[1] font-light !text-[#21E09D]'}
              isMocked
            />
          </div>
        </div>
        {/*7d token*/}
        <div className='flex items-center justify-between py-2'>
          <Title title={t('detail.holder.token7d')} />
          <div className='flex items-center gap-0.5'>
            <FormatedValue
              value={totalBuyUsd}
              unit={'$'}
              position={'front'}
              className={'text-[12px] leading-[1] font-light !text-[#21E09D]'}
              isMocked
            />
          </div>
        </div>
        {/*7d avg holding*/}
        <div className='flex items-center justify-between py-2'>
          <Title title={t('detail.holder.avgHold7d')} />
          <div className='flex items-center gap-0.5'>
            <FormatedValue
              value={totalBuyUsd}
              unit={'$'}
              position={'front'}
              className={'text-[12px] leading-[1] font-light !text-[#21E09D]'}
              isMocked
            />
          </div>
        </div>
        {/*Tx Amount*/}
        <div className='hidden items-center justify-between py-2'>
          <Title title={t('walletDetail.holderTable.totalBuy')} />
          <div className='flex items-center gap-0.5'>
            <FormatedValue
              value={totalBuyUsd}
              unit={'$'}
              position={'front'}
              className={'text-[12px] leading-[1] font-light !text-[#21E09D]'}
            />
            <span className='text-[11px] leading-[1] font-light text-[#908E98]'>{'/'}</span>
            <FormatedValue
              value={Number(buys)}
              unit={'TXs'}
              className={'text-[12px] leading-[1] font-light !text-[#21E09D]'}
            />
          </div>
        </div>
        {/*Total Buy*/}
        <div className='hidden items-center justify-between py-2'>
          <Title title={t('walletDetail.holderTable.totalBuy')} />
          <div className='flex items-center gap-0.5'>
            <FormatedValue
              value={totalBuyUsd}
              unit={'$'}
              position={'front'}
              className={'text-[12px] leading-[1] font-light !text-[#21E09D]'}
            />
            <span className='text-[11px] leading-[1] font-light text-[#908E98]'>{'/'}</span>
            <FormatedValue
              value={Number(buys)}
              unit={'TXs'}
              className={'text-[12px] leading-[1] font-light !text-[#21E09D]'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HolderWalletInfo;
