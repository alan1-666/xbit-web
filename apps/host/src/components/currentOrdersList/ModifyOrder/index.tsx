import { Order, OrderType, TransactionType } from '@/@generated/gql/graphql-trading'
import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user.ts'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { formatAmount, formatBalance } from '@/lib/format'
import { formatAddressWallet } from '@/lib/string'
import { _activeWallet, mappedTypeChain } from '@/redux/modules/newWallet.slice.ts'
import { priceChain } from '@/redux/modules/price.slice'
import { useAppSelector } from '@/redux/store'
import { getHoldingQuantityQuery } from '@/services/order.service'
import { useQuery } from '@apollo/client'
import { Loader } from '@components/common/MoneyFormatted.tsx'
import ModifyTrailingTPSL from '@components/currentOrdersList/ModifyOrder/ModifyTrailingTPSL'
import useWatchWalletTokenBalance from '@hooks/useWatchWalletTokenBalance.ts'
import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import ModifyBuyForm from './ModifyBuyForm'
import ModifySellForm from './ModifySellForm'

interface ModifyOrderProps {
  order: Order
  setOpen?: Dispatch<SetStateAction<boolean>>
  refetch?: () => void
  quantityLimitBuy: string
  quantityLimitSell: string
  quantityTPSL: string
  orderAmountTPSL: string
  quantityTrailingTPSL: string
  orderAmountLimitSell: string
  orderAmountLimitBuy: string
  setHeaderModifyorder?: Dispatch<SetStateAction<JSX.Element | null>>
}

const ModifyOrder: React.FC<ModifyOrderProps> = ({
  order,
  setOpen,
  refetch,
  quantityLimitBuy,
  quantityLimitSell,
  quantityTPSL,
  orderAmountTPSL,
  quantityTrailingTPSL,
  orderAmountLimitSell,
  orderAmountLimitBuy,
  setHeaderModifyorder,
}) => {
  const { t } = useTranslation()
  const activeWallet = useSelector(_activeWallet)
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const priceNativeToken = useAppSelector(priceChain(activeChain))
  const [totalToken, setTotalToken] = useState<number>(0)
  const { isDesktop } = useResponsive()
  const transactionType = order?.transactionType
  const orderType = order?.type
  const baseAddress = order?.baseAddress
  // const baseAmount = order?.baseAmount
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)

  const { data: dataPortfolio, loading } = useQuery(getHoldingQuantityQuery, {
    variables: {
      input: { userAddress: activeWallet?.walletAddress, token: baseAddress, chainId: activeWallet.chainId },
    },
    skip: !activeWallet?.isConnected || transactionType === TransactionType.Buy,
    pollInterval: 2000,
  })

  const _walletTokenBalanceMessageData = useWatchWalletTokenBalance({
    address: activeWallet?.walletAddress,
    token: baseAddress,
    chainId: activeWallet?.chainId,
  })

  useEffect(() => {
    const initTotalToken = dataPortfolio?.getPortfolio?.data?.[0]?.totalBaseAmount
      ? +dataPortfolio?.getPortfolio?.data?.[0]?.totalBaseAmount
      : 0
    setTotalToken(initTotalToken)
  }, [dataPortfolio])

  useEffect(() => {
    const balance = _walletTokenBalanceMessageData?.balance
    if (!!balance) {
      setTotalToken(+balance)
    }
  }, [_walletTokenBalanceMessageData])

  const calculatePrice = () => {
    return formatBalance(activeWallet?.balance?.formatted * priceNativeToken, {
      showCurrency: true,
      roundMode: 'floor',
    })
  }

  const renderTotalToken = () => {
    if (loading) return <Loader />

    switch (transactionType) {
      case TransactionType.Buy: {
        return (
          <>
            {formatAmount(activeWallet?.balance?.formatted, {
              roundMode: 'floor',
              unit: activeWallet?.chainType?.toUpperCase(),
            })}
          </>
        )
      }

      case TransactionType.Sell: {
        return (
          <>
            {formatAmount(totalToken, {
              roundMode: 'floor',
            })}
          </>
        )
      }

      default:
        return null
    }
  }

  const listWalletsByActiveChain: Array<UserEmbeddedWalletDto> = useMemo(() => {
    if (listWalletsByChain) {
      return listWalletsByChain?.filter((w: UserEmbeddedWalletDto) => w?.chain === mappedTypeChain(activeChain))
    }
    return []
  }, [listWalletsByChain])

  const wallet = listWalletsByActiveChain.find(
    (item: UserEmbeddedWalletDto) => item.walletAddress.toLowerCase() === order?.userAddress.toLowerCase(),
  )

  const headerModifyorder: any = () => {
    return (
      <>
        {orderType === OrderType.Limit &&
          (transactionType === TransactionType.Buy || transactionType === TransactionType.Sell) && (
            <div className="flex items-start flex-col gap-1 flex-1">
              <div className="flex items-center  gap-[6px]">
                <div className="text-[calc(1rem*(14/16))] font-[380] leading-none text-white">
                  {wallet?.name ? wallet?.name : t('detail.tokenDetail.wallet')}{' '}
                  <span className="text-[#8c8c94]">({formatAddressWallet(order?.userAddress)})</span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-[calc(1rem*(14/16))] font-[380] leading-none text-white">{renderTotalToken()}</div>{' '}
                <span className="text-[calc(1rem*(14/16))] font-[380] leading-none text-[#908e98]">
                  {transactionType === TransactionType.Buy ? (
                    <>≈{calculatePrice()}</>
                  ) : transactionType === TransactionType.Sell ? (
                    <span className="capitalize inline-block ml-[6px]">{order?.baseSymbol?.toLowerCase()}</span>
                  ) : null}
                </span>
              </div>
            </div>
          )}
      </>
    )
  }

  useEffect(() => {
    if (headerModifyorder && setHeaderModifyorder) setHeaderModifyorder(headerModifyorder())
  }, [orderType, transactionType, calculatePrice(), order])

  return (
    <>
      {isDesktop && <div className="mb-4">{headerModifyorder()}</div>}
      <div>
        {orderType === OrderType.Limit && transactionType === TransactionType.Buy && (
          <ModifyBuyForm
            order={order}
            setOpen={setOpen}
            refetch={refetch}
            quantityLimitBuy={quantityLimitBuy}
            orderAmountLimitBuy={orderAmountLimitBuy}
          />
        )}
        {orderType === OrderType.Limit && transactionType === TransactionType.Sell && (
          <ModifySellForm
            order={order}
            setOpen={setOpen}
            refetch={refetch}
            totalToken={totalToken}
            quantityLimitSell={quantityLimitSell}
            orderAmountLimitSell={orderAmountLimitSell}
          />
        )}
        {orderType === OrderType.Tpsl && (
          <ModifySellForm
            order={order}
            setOpen={setOpen}
            refetch={refetch}
            totalToken={totalToken}
            quantityLimitSell={quantityTPSL}
            orderAmountLimitSell={orderAmountTPSL}
          />
        )}
        {orderType === OrderType.TrailingTpsl && (
          <ModifyTrailingTPSL
            order={order}
            setOpen={setOpen}
            refetch={refetch}
            totalToken={totalToken}
            quantityTrailingTPSL={quantityTrailingTPSL}
          />
        )}
      </div>
    </>
  )
}

export default ModifyOrder
