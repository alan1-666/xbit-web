import Text from '@/components/common/Text'
import { formatMoney } from '@/utils/helpers'
import { createColumnHelper } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import { exchangeActions } from '@/redux/modules/exchange.slice'

export interface IBalance {
  coin: string
  accountValue: number
  availableFund: number
  USDprice: number
  id: string
}

const DesktopBalanceColumns = ({ balanceData: _balanceData }: { balanceData: IBalance[] }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  // Wallet management
  // @ts-ignore
  const listWalletsByChain =
    useAppSelector((state) => state.newWallet.listWalletsByChain as UserEmbeddedWalletDto[]) || []

  const handleBtnClick = (key: string) => {
    dispatch(
      exchangeActions.openExchangeDialog({
        defaultTab: key as 'deposit' | 'withdraw' | 'transfer',
      }),
    )
  }
  const useTableColumns = () => {
    const columnHelper = createColumnHelper<IBalance>()

    return useMemo(
      () => [
        columnHelper.accessor('coin', {
          header: () => (
            <div className="flex items-center">
              <div className="flex items-center">
                <Text
                  text={t('history.token')}
                  fontSize={12}
                  fontWeight="light"
                  color="#FFFFFF80"
                  className="!font-[330]"
                />
              </div>
            </div>
          ),
          cell: (info) => {
            const symbol = info.getValue()
            return (
              <div className="flex gap-1 flex-col">
                <Text text={symbol} fontSize={14} className={'!font-[380]'} />
              </div>
            )
          },
        }),
        columnHelper.accessor('accountValue', {
          header: () => (
            <div className="flex items-center gap-0.5">
              <Text
                text={t('wallet.TotalBalance')}
                fontSize={12}
                fontWeight="light"
                color="#FFFFFF80"
                className="!font-[330]"
              />
            </div>
          ),
          cell: (info) => {
            const accountValue = info.getValue()
            const { coin } = info.row.original

            return (
              <div className="">
                <Text text={`${accountValue} ${coin}`} fontSize={14} className="!font-[380]" />
              </div>
            )
          },
        }),
        columnHelper.accessor('availableFund', {
          header: () => (
            <div className="flex items-center">
              <div className="flex items-center gap-0.5">
                <Text
                  text={t('assers.transfers.availableBalance')}
                  fontSize={12}
                  fontWeight="light"
                  color="#FFFFFF80"
                  className="!font-[330]"
                />
              </div>
            </div>
          ),
          cell: (info) => {
            const origSz = info.getValue()
            const { coin } = info.row.original
            return (
              <div className="flex gap-1 flex-col relative  w-full">
                <Text text={`${origSz} ${coin}`} fontSize={14} className="!font-[380]" />
              </div>
            )
          },
        }),
        columnHelper.accessor('USDprice', {
          header: () => (
            <div className="flex items-center">
              <Text text={`USDC`} fontSize={12} fontWeight="light" color="#FFFFFF80" className="!font-[330]" />
              <Text
                text={`${t('settings.value')}`}
                fontSize={12}
                fontWeight="light"
                color="#FFFFFF80"
                className="!font-[330] capitalize"
              />
            </div>
          ),
          cell: (info) => {
            const USDprice = info.getValue()
            return (
              <div className="flex gap-1 flex-col relative  w-full">
                <Text text={formatMoney(Number(USDprice))} fontSize={14} className="!font-[380]" />
              </div>
            )
          },
        }),
        columnHelper.accessor('id', {
          header: () => (
            <div className="flex gap-2">
              <div className="flex items-center">
                <Text
                  text={`${t('walletDetail.activityTable.actions')}`}
                  fontSize={12}
                  fontWeight="light"
                  color="#FFFFFF80"
                  className="!font-[330]"
                />
              </div>
            </div>
          ),
          cell: () => {
            return (
              <div className="flex gap-[16px]">
                <button
                  onClick={() => handleBtnClick('deposit')}
                  className="!h-[26px] bg-[#6A2AE0] text-white text-[calc(1rem*(13/16))] leading-[1.9] font-[450] tracking-[calc(1rem*(0.5/16))] rounded-[50px] px-3 cursor-pointer hover:bg-[#5A1FB0] transition-colors"
                >
                  {t('assets.deposit.title')}
                </button>
                <button
                  onClick={() => handleBtnClick('withdraw')}
                  className="!h-[26px] bg-[#6A2AE0] text-white text-[calc(1rem*(13/16))] leading-[1.9] font-[450] tracking-[calc(1rem*(0.5/16))] rounded-[50px] px-3 cursor-pointer hover:bg-[#5A1FB0] transition-colors"
                >
                  {t('assets.withdraw.withdrawLabel')}
                </button>
              </div>
            )
          },
          maxSize: 160,
          size: 160,
        }),
      ],
      [columnHelper, t, handleBtnClick],
    )
  }

  return {
    useTableColumns,
    dialogs: <></>,
  }
}

export default DesktopBalanceColumns
