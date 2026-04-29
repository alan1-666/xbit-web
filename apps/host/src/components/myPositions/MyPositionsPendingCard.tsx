import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { getPath } from '@/lib/utils.ts'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant.ts'
import { getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers.ts'
import chainSymbolToId from '@components/myPositions/ChainSymbolToId.ts'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import SellAllButton from '@components/myPositions/SellAllButton.tsx'
import TrailingCommandButton from '@components/myPositions/TrailingCommandButton.tsx'
import ButtonShare from '@components/myPositions/ButtonShare.tsx'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { getManyTokenSimple } from '@services/tokens.service.ts'
import { UnCompletedOrder } from '@/types/token.ts'
import { ChainIds } from '@/types/enums.ts'

type MyPositionsPendingCard = {
  item?: UnCompletedOrder
}

type ColumnDetailProps = {
  title: string | React.ReactNode
}

type FallBackDataHolding = {
  symbol: string
  logoUrl: string
}

const ColumnDetail = ({ title }: ColumnDetailProps) => {
  return (
    <div>
      <div className="app-font-regular text-[calc(1rem*(11/16))] text-[#FFFFFFB2] leading-[calc(1rem*(12/16))] mb-[6px]">
        {title}
      </div>
      <div className="animate-pulse w-16 h-2 bg-gray-700 rounded-full"></div>
    </div>
  )
}

const MyPositionsPendingCard = ({ item }: MyPositionsPendingCard) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [fallbackData, setFallbackData] = useState<FallBackDataHolding>({ symbol: '', logoUrl: '' })

  const chainUrl = getBlockchainLogo2(item?.chainId ?? chainSymbolToId['sol'])
  const symbol = !item?.baseSymbol && item?.baseSymbol == '' ? fallbackData.symbol : (item?.baseSymbol ?? '--')
  const logoUrl = fallbackData?.logoUrl ?? getBlockChainLogo(item?.chainId ?? ChainIds.Solana, item?.baseAddress ?? '')

  const handleClickLogo = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
    if (!item) return
    navigate(
      getPath(APP_PATH.MEME_TOKEN_DETAIL, {
        address: item?.baseAddress ?? '',
        chain: CHAIN_SYMBOLS[item?.chainId ?? ChainIds.Solana],
      }),
      {
        state: { symbol: symbol },
      },
    )
  }

  useEffect(() => {
    const handleGetTokenInfo = async () => {
      const response = await gqlClient.query({
        query: getManyTokenSimple,
        fetchPolicy: 'cache-first',
        variables: {
          input: {
            tokens: item?.baseAddress ? [item.baseAddress] : [],
            chainId: Number(item?.chainId ?? ChainIds.Solana),
          },
        },
      })
      if (!response?.data?.getManyToken) return
      setFallbackData({
        symbol: response?.data?.getManyToken?.[0]?.symbol,
        logoUrl: response?.data?.getManyToken?.[0]?.info?.logoUrl || '',
      })
    }

    handleGetTokenInfo().catch(console.error)
  }, [item])

  return (
    <>
      <div className="relative rounded-[8px] border-[1px] border-[#242227A8] bg-[url(/images/tokenDetail/card-bg.webp)] bg-[#161617B0] bg-no-repeat bg-cover overflow-hidden">
        <div className="p-3">
          <div className="flex items-center justify-between gap-[10px]">
            <div className="flex items-center gap-[5px] cursor-pointer" onClick={handleClickLogo}>
              <LogoWithChain logo={logoUrl} chainLogo={chainUrl} name={symbol} logoClassName={'w-[26px] h-[26px]'} />
              <div className="flex items-center gap-[4px]">
                <div className="app-font-medium text-[calc(1rem*(14/16))] text-[#FFFFFF]">{symbol}</div>
                <img src="/images/tokenDetail/icon-chevron-right.svg" className="w-[6px] min-w-[6px]" alt="" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 app-font-medium text-[calc(1rem*(13/16))] leading-[1]">
              <div className="text-[#FFFFFF80]">{t('detail.myPositions.profitAndLoss')}</div>
              <div className="animate-pulse w-16 h-2 bg-gray-700 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="border-t-[0.5px] border-t-[#ECECED0A]">
          <div className="grid grid-cols-3 gap-x-3 gap-y-4 p-3 border-b-1 border-b-[#ECECED14]">
            <ColumnDetail title={t('detail.myPositions.numberOfPosition')} />
            <ColumnDetail title={t('detail.myPositions.positionValue')} />
            <ColumnDetail title={t('detail.myPositions.costPrice')} />
            <ColumnDetail title={t('detail.myPositions.avgBuyInMarketValue')} />
          </div>
        </div>

        <div className="flex justify-between items-center px-3 py-2 bg-[#23232999]">
          <div className="flex items-center gap-2 app-font-regular">
            <SellAllButton disabled symbol={''} baseAddress={''} holdingQuantity={0} portfolio={undefined} />
            <TrailingCommandButton
              disabled
              symbol={symbol ?? ''}
              baseAddress={item?.baseAddress ?? ''}
              holdingQuantity={0}
            />
          </div>
          <ButtonShare
            disabled
            costPrice={''}
            returnRate={''}
            tokenName={symbol ?? ''}
            tokenAvatar={logoUrl ?? ''}
            tokenLatestPrice={''}
            avgMC={''}
            holdingValue={''}
            holdingQuantity={''}
            PnL={''}
            chainId={0}
            tokenAddress={''}
            realized={0}
            unrealized={0}
            totalBuy={''}
          />
        </div>
      </div>
    </>
  )
}

export default MyPositionsPendingCard
