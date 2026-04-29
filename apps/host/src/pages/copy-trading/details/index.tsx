import { ConfigStatus } from '@/@generated/gql/graphql-trading'
import { Skeleton } from '@/components/ui/skeleton'
import DeleteCopyButton from '@/components/walletCopyDetails/DeleteCopyButton'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { useActiveWallet } from '@/hooks/useActiveWallet'
import { APP_PATH } from '@/lib/constant'
import { tradingClient } from '@/lib/gql/apollo-client'
import { cn } from '@/lib/utils'
import { getCopyTradeConfigById } from '@/services/copytrade.service'
import { ChainIds } from '@/types/enums'
import { loadFirstPageFromStorage, saveFirstPageToStorage } from '@/utils/storage'
import { useQuery } from '@apollo/client'
import HeaderWithBack from '@components/header/HeaderWithBack.tsx'
import Information from '@components/walletCopyDetails/Information.tsx'
import OrderTrackingList from '@components/walletCopyDetails/OrderTrackingList.tsx'
import ResultDataStatistics from '@components/walletCopyDetails/ResultDataStatistics.tsx'
import { get } from 'lodash-es'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

export default function CopyTradingDetailsPage() {
  const isWalletConnected = useActiveWallet()?.isConnected
  const { isDesktop } = useResponsive()
  const { t } = useTranslation()
  const [listAddress, setlistAddress] = useState<string[]>([])
  const [isDisabledDelete, setIsDisabledDelete] = useState(false)
  const navigate = useNavigate()
  const { address } = useParams()
  const { data, loading } = useQuery(getCopyTradeConfigById, {
    variables: {
      input: {
        id: address,
      },
    },
    client: tradingClient,
  })
  const onBack = useCallback(() => {
    navigate(`${APP_PATH.MEME_SMART_MONEY}?tab=walletCopy`)
  }, [navigate])

  useEffect(() => {
    if (data) {
      const copyTradeConfig = get(data, 'getCopyTradeConfig', null)
      if (copyTradeConfig) {
        setlistAddress(
          copyTradeConfig.statistic.copyTradeTokenHoldingStatistics.map(
            (item: { baseAddress: string }) => item.baseAddress,
          ),
        )
        setIsDisabledDelete(copyTradeConfig.status === ConfigStatus.Canceled)
      }
    }
  }, [data])
  
  useEffect(() => {
    if (!isWalletConnected) {
      onBack()
    }
  }, [isWalletConnected, onBack])
  
  const getCopyTradeConfig = get(data, 'getCopyTradeConfig', {
    id: '',
    status: 'Active',
    userAddress: '',
    leaderAddress: '',
    leaderNickname: '',
    chainId: ChainIds.Solana,
    createdAt: '',
    leaderTags: [],
  })
  const { createdAt } = getCopyTradeConfig
  const handleOnSuccessDelete = () => {
    setIsDisabledDelete(true)
    //update status to store
    const _walletCopyTrade = loadFirstPageFromStorage('smartMoneyList.walletCopyTrade');
    const _walletCopyTradeUpdated = _walletCopyTrade.map((item: any) => {
      if (item.id === address) {
        return { ...item, status: ConfigStatus.Canceled }
      }
      return item
    });
    saveFirstPageToStorage('smartMoneyList.walletCopyTrade', _walletCopyTradeUpdated);
  }

  return (
    <div className={cn("flex flex-col no-scrollbar h-screen text-white", isDesktop ? 'h-[calc(100vh-40px)]' : '')}>
      <HeaderWithBack
        title={t('walletCopy.orderRecord')}
        right={isDisabledDelete ? null : <DeleteCopyButton id={address || ''} adr={getCopyTradeConfig.leaderAddress} onSuccess={handleOnSuccessDelete} />}
        onBack={onBack}
        className={cn("bg-transparent p-2.5 h-12", isDesktop ? 'hidden' : '')}
      />
      <div className={cn("overflow-x-hidden overflow-y-auto no-scrollbar px-2.5 pb-2.5 flex-1 flex flex-col", isDesktop ? 'pb-0' : '')}>
        {/* <Information address={address} status={status} tradeConfig={getCopyTradeConfig} tags={leaderTags ? leaderTags : []} token={{ chainId: ChainIds.Solana, token: userAddress }} walletName={listCoinHelper.formatWalletNameCustom(leaderNickname || leaderAddress)} /> */}
        {loading ? (
          <div className="pt-4 pb-3">
            <Skeleton className="h-16" />
          </div>
        ) : (
          <Information address={address} tradeConfig={getCopyTradeConfig} isDisabledDelete={isDisabledDelete} isPC={isDesktop} />
        )}
        {address && (
          <ResultDataStatistics
            createdAt={createdAt}
            listAddress={listAddress}
            loading={loading}
            data={get(getCopyTradeConfig, 'statistic.copyTradeTokenHoldingStatistics', [])}
            isPC={isDesktop}
          />
        )}
        {loading ? (
          <div className="flex-1 mt-[2px] overflow-hidden">
            <Skeleton className="h-8 mb-3" />
            <Skeleton className="h-full" />
          </div>
        ) : address ? (
          <OrderTrackingList id={address} />
        ) : null}
      </div>
    </div>
  )
}
