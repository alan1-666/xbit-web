import { Order, OrderType, TransactionType } from '@/@generated/gql/graphql-trading'
import { useTokenInfo } from '@/hooks/useTokenInfo'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant'
import { formatAmount, formatPercent, formatPrice, formatVolume } from '@/lib/format'
import { tradingClient } from '@/lib/gql/apollo-client.ts'
import { cn, getPath } from '@/lib/utils'
import { ChainIds } from '@/types/enums'
import { getBlockchainLogo2 } from '@/utils/helpers'
import AppConfirm from '@components/common/AppConfirm.tsx'
import CheckboxWithLabel from '@components/common/CheckboxWithLabel'
import LogoWithChain from '@components/common/LogoWithChain'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { cancelOrderMutation } from '@services/order.service.ts'
import dayjs from 'dayjs'
import { MouseEventHandler, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import AppDrawer from '../common/AppDrawer'
import RestrictRegiongDialog from '../RestrictRegiongDialog'
import ModifyOrder from './ModifyOrder'

/**
 * ActionButton component renders a button with icon and label
 * @param {string} icon - URL for the button icon
 * @param {string} [iconClassName] - Optional CSS class for the icon
 * @param {string} label - Text label for the button
 * @param {string} [labelClassName] - Optional CSS class for the label
 * @param {string} [containerClassName] - Optional CSS class for the container
 * @param {MouseEventHandler<HTMLDivElement>} [onClick] - Callback when button is clicked
 */
interface ActionButtonProps {
  icon: string
  iconClassName?: string
  label: string
  labelClassName?: string
  containerClassName?: string
  onClick?: MouseEventHandler<HTMLDivElement>
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  iconClassName,
  label,
  labelClassName,
  containerClassName,
  onClick,
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-3 cursor-pointer select-none px-1.5 py-2.5 bg-[#2B2B33] rounded-lg',
        containerClassName,
      )}
      onClick={onClick}
    >
      <img src={icon} className={cn('', iconClassName)} alt="icon" />
      <div className={cn('font-[330] text-[14px] text-[#CCCADB] leading-none', labelClassName)}>{label}</div>
    </div>
  )
}

/**
 * ColumnInfo component displays a title-value pair in a vertical layout
 * @param {string | React.ReactNode} title - The title/label to display
 * @param {string | React.ReactNode} value - The value/content to display
 */
interface ColumnInfoProps {
  title: string | React.ReactNode
  value: string | React.ReactNode
  className?: string
}

const ColumnInfo = ({ title, value, className }: ColumnInfoProps) => {
  return (
    <div className={className}>
      <div className="text-[11px] text-[#605E68] font-[330] leading-[1] mb-[6px]">{title}</div>
      <div className=" text-[13px] text-white leading-[1]">{value}</div>
    </div>
  )
}

/**
 * CurrentOrderCard component displays an order card with order details and action buttons
 * @param {Order} order - The order object to display
 * @param {function} [refetch] - Optional callback to refetch orders after an action
 */
interface CurrentOrderCardProps {
  order: Order & {
    totalSupply?: string | number
  }
  refetch?: () => void
}

// const env = import.meta.env.VITE_STAGE
// const exceptEnv = ['staging', 'prod']

const getType = (order: Order) => {
  const transactionType = order?.transactionType
  const orderType = order?.type

  if (orderType === OrderType.TrailingTpsl) {
    return 'TrailingTpsl'
  }
  if (orderType === OrderType.Tpsl) {
    return 'Tpsl'
  }
  if (transactionType === TransactionType.Buy) {
    return 'Buy'
  }
  if (transactionType === TransactionType.Sell) {
    return 'Sell'
  }
}

const CurrentOrderCard: React.FC<CurrentOrderCardProps> = ({ order, refetch }) => {
  const enabled = useFeatureIsOn('trading_block_zone')
  const [openRestrictRegiongDialog, setOpenRestrictRegiongDialog] = useState(false)

  const { t } = useTranslation()
  const navigate = useNavigate()
  const [openModifyDrawer, setOpenModifyDrawer] = useState(false)
  const chain: ChainIds = order?.chainId as unknown as ChainIds
  const openQuoteUsdRate = order?.openQuoteUsdRate
  const callbackRate = order?.callbackRate ? formatPercent(order?.callbackRate * 100) : '--'
  const address = order?.baseAddress
  const { logo: logoUrl } = useTokenInfo(address, chain)
  const chainLogo = getBlockchainLogo2(chain)
  const createdDay = dayjs(order?.createdAt ?? '').format('MM/DD')
  const createdTime = dayjs(order?.createdAt ?? '').format('HH:mm')
  const limitPrice = order?.limitPrice ?? 0
  const limitMarketCap = order?.limitMarketCap ?? 0
  const triggerPrice = order?.triggerPrice ?? 0
  const openPrice = order?.type === OrderType.Tpsl ? order?.tp2 : (order?.openPrice ?? 0)
  const baseAmount = order?.baseAmount ?? 0
  const quoteAmount = order?.quoteAmount ?? 0

  // Buy
  // Order quantity limit buy = ( Quote amount * currency rate SOL/U ) / Limit price
  const totalSupply = order?.totalSupply !== undefined ? Number(order.totalSupply) : 1
  const quantityLimitBuy =
    limitPrice != 0
      ? (quoteAmount * openQuoteUsdRate) / limitPrice // Limit BuyPrice
      : (quoteAmount * openQuoteUsdRate) / (limitMarketCap / totalSupply) // Limit Buy MarketCap
  const orderAmountLimitBuy = +quoteAmount

  // Sell
  const quantityLimitSell = baseAmount
  const orderAmountLimitSell =
    limitPrice != 0
      ? (quantityLimitSell * limitPrice) / openQuoteUsdRate // Limit SellPrice
      : (quantityLimitSell * (limitMarketCap / totalSupply)) / openQuoteUsdRate // Limit Sell MarketCap

  // TrailingTPSL
  const quantityTrailingTPSL = baseAmount

  // TPSL
  const quantityTPSL = baseAmount
  // const tp2 = order?.tp2 ?? 0
  const orderAmountTPSL = quoteAmount

  const triggerMC =
    order?.limitMarketCap != 0
      ? formatVolume(order?.limitMarketCap, {
          showCurrency: true,
        })
      : '--'
  const mc =
    order?.marketCap != 0
      ? formatVolume(order?.marketCap, {
          showCurrency: true,
        })
      : '--'
  const doublePrincipalAfterPurchase = order?.doublePrincipalAfterPurchase
  const symbol = order?.baseSymbol
  const type = getType(order)
  const trailingOrderTriggered = order?.trailingOrderTriggered

  const getQuantity = () => {
    switch (type) {
      case 'Buy':
        return quantityLimitBuy
      case 'Sell':
        return quantityLimitSell
      case 'Tpsl':
        return quantityTPSL
      case 'TrailingTpsl':
        return quantityTrailingTPSL
      default:
        return '--'
    }
  }

  const handleModifyOrder = () => {
    // if (exceptEnv.includes(env)) return

    if (enabled) {
      setOpenRestrictRegiongDialog(true)
    } else {
      setOpenModifyDrawer(true)
    }
  }

  const handleCancelOrder = useCallback(async () => {
    try {
      const id = order?.id
      const res = await tradingClient.mutate({
        mutation: cancelOrderMutation,
        variables: {
          id,
        },
      })
      if (res?.data?.cancelOrder?.id) {
        toast.success(t('toast.cancelOrderSuccess'))
        if (refetch) {
          refetch()
        }
      }
      return res
    } catch (error) {
      console.log(error)
      throw error
    }
  }, [order])

  const getCardTagType = () => {
    if (type === 'Buy') {
      return 'limitBuy'
    }
    if (type === 'Sell' || type === 'Tpsl') {
      return 'limitSell'
    }
    if (type === 'TrailingTpsl') {
      return 'movingStopLossSell'
    }
  }

  const [headerModifyorder, setHeaderModifyorder] = useState<JSX.Element | null>(null)
  return (
    <>
      <div className="relative rounded-lg bg-[#18181D] px-2 py-3 border-[0.5px] border-[#25242B] hover:bg-[#ECECED14] transition-colors duration-200">
        <div>
          {/* first row */}
          <div className="flex items-center justify-between gap-[10px] mb-[10px]">
            <div className="flex items-center gap-[5px]">
              <LogoWithChain logo={logoUrl} chainLogo={chainLogo} name={symbol} logoClassName="size-7" />
              <div>
                <div
                  className="flex items-center gap-[4px] cursor-pointer"
                  onClick={() => {
                    window.scrollTo({
                      top: 0,
                      behavior: 'smooth',
                    })
                    navigate(
                      getPath(APP_PATH.MEME_TOKEN_DETAIL, {
                        address,
                        chain: CHAIN_SYMBOLS[+order.chainId],
                      }),
                      { state: { symbol } },
                    )
                  }}
                >
                  <div className="app-font-medium text-[calc(1rem*(14/16))] text-[#FFFFFF]">
                    {symbol?.toUpperCase()}
                  </div>
                  <img
                    src="/images/tokenDetail/icon-chevron-right.svg"
                    className="w-[6px] min-w-[6px]"
                    alt="chevron-right"
                  />
                </div>
                <div className="mt-1 font-[330] text-[11px] text-[#605E68] leading-none">
                  {createdDay} {createdTime}
                </div>
              </div>
            </div>
            {trailingOrderTriggered && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger className="mr-auto ml-[-5px] !cursor-help">
                    <img src="/images/icons/icon-check.svg?v=2" className="w-[14px] h-[14px] " alt="check" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[360px] bg-[#191919]">
                    <p className="text-[11px] tracking-wide">{t('currentOrdersList.orderTriggered')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <span
              className={cn(
                getCardTagType() === 'limitBuy' && 'text-rise',
                getCardTagType() === 'limitSell' && 'text-fall',
                getCardTagType() === 'movingStopLossSell' && 'text-fall',
              )}
            >
              {t(`cardTag.${getCardTagType()}`)}
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-[330] text-[11px] text-[#908E98] leading-none">
              {t('currentOrdersList.triggerMarketCapPrice')}
            </div>
            <div className="font-[380] text-[13px] leading-none">
              {type === 'Buy' || type === 'Sell' ? (
                <>
                  {triggerMC !== '--' ? triggerMC + ' / ' : <span className="text-[#908E98]">-- / </span>}
                  {limitPrice != 0 ? (
                    formatPrice(limitPrice, { showCurrency: true })
                  ) : (
                    <span className="text-[#908E98]">--</span>
                  )}
                </>
              ) : type === 'TrailingTpsl' ? (
                <>
                  {mc !== '--' ? mc + ' / ' : <span className="text-[#908E98]">-- / </span>}
                  {openPrice.toString() === '0' ? (
                    <span className="text-[#908E98]">--</span>
                  ) : (
                    formatPrice(openPrice, { showCurrency: true })
                  )}
                </>
              ) : (
                <>
                  {triggerMC}
                  {' / '}
                  {formatPrice(openPrice, { showCurrency: true })}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="font-[330] text-[11px] text-[#908E98] leading-none">
              {`${t('currentOrdersList.orderQuantity')}(${symbol})`}
            </div>
            <div className="font-[380] text-[13px] leading-none">
              {formatAmount(getQuantity(), {
                roundMode: 'floor',
              })}
            </div>
          </div>
          {type !== 'TrailingTpsl' && (
            <div className="flex items-center justify-between">
              <div className="font-[330] text-[11px] text-[#908E98] leading-none">
                {t('currentOrdersList.orderAmount')}
              </div>
              <div className="font-[380] text-[13px] leading-none">
                {formatAmount(
                  type === 'Buy' ? orderAmountLimitBuy : type === 'Sell' ? orderAmountLimitSell : orderAmountTPSL,
                  {
                    roundMode: 'floor',
                    unit: order?.quoteSymbol,
                  },
                )}
              </div>
            </div>
          )}
          {type === 'TrailingTpsl' && (
            <>
              <div className="flex items-center justify-between">
                <div className="font-[330] text-[11px] text-[#908E98] leading-none">
                  {t('currentOrdersList.callbackRate')}
                </div>
                <div className="font-[380] text-[13px] leading-none">{callbackRate}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="font-[330] text-[11px] text-[#908E98] leading-none">
                  {t('currentOrdersList.activationPrice')}
                </div>
                <div className="font-[380] text-[13px] leading-none">
                  {!triggerPrice || triggerPrice.toString() === '0' ? (
                    <span className="text-[#908E98]">--</span>
                  ) : (
                    formatPrice(triggerPrice, { showCurrency: true })
                  )}
                </div>
              </div>
            </>
          )}
          <div className="grid grid-cols-2 gap-2">
            <ActionButton
              icon="/images/tokenDetail/icon-edit.svg"
              iconClassName="w-[16px] min-w-[16px]"
              label={t('currentOrdersList.modify')}
              onClick={handleModifyOrder}
            />
            <AppConfirm
              title={t('currentOrdersList.cancelOrderConfirm')}
              triggerContent={
                <ActionButton
                  icon="/images/tokenDetail/icon-delete.svg"
                  iconClassName="w-[16px] min-w-[16px]"
                  label={t('currentOrdersList.cancelOrder')}
                />
              }
              onAccept={handleCancelOrder}
            />
          </div>
          {/* checkbox area */}
          {doublePrincipalAfterPurchase && (
            <div className="border-t-[1px] border-t-[#ECECED14] pt-[11px] mt-[11px]">
              <CheckboxWithLabel
                label={t('orderForm.form.doublePrincipalAfterPurchase')}
                defaultChecked={doublePrincipalAfterPurchase as boolean}
                containerClassName="pointer-events-none"
              />
            </div>
          )}
        </div>
      </div>
      <AppDrawer
        open={openModifyDrawer}
        setOpen={setOpenModifyDrawer}
        customTitle={headerModifyorder}
        drawerHeaderClassName=""
        drawerContent={
          <ModifyOrder
            order={order}
            refetch={refetch}
            setOpen={setOpenModifyDrawer}
            quantityLimitBuy={quantityLimitBuy.toString()}
            quantityLimitSell={quantityLimitSell}
            quantityTPSL={quantityTPSL}
            orderAmountTPSL={orderAmountTPSL}
            quantityTrailingTPSL={quantityTrailingTPSL}
            orderAmountLimitSell={orderAmountLimitSell.toString()}
            orderAmountLimitBuy={orderAmountLimitBuy.toString()}
            setHeaderModifyorder={setHeaderModifyorder}
          />
        }
      />

      <RestrictRegiongDialog open={openRestrictRegiongDialog} setOpen={setOpenRestrictRegiongDialog} />
    </>
  )
}

export default CurrentOrderCard
