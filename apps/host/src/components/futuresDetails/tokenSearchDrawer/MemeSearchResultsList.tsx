import { TokenSearchLiteDto } from '@/@generated/gql/graphql-core'
import ChainCurrencyIcon from '@/components/common/ChainCurrencyIcon'
import { CopyButton } from '@/components/common/copy-button'
import Text from '@/components/common/Text'
import { PriceChange } from '@/components/futuresDiscover/table/crypto-table'
import { TableVirtual } from '@/components/futuresDiscover/table/table-virtual'
import { formatAddressWallet } from '@/lib/string'
import { searchTokensV2 } from '@/services/tokens.service'
import { TokenTrending } from '@/types/token'
import { formatMoney, formatPercentage, getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers'
import { useQuery } from '@apollo/client'
import { createColumnHelper } from '@tanstack/react-table'
import { Dispatch, memo, SetStateAction, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ConfirmCollectTokenMeme from './ConfirmCollectTokenMeme'
import useHandleLogic from './hooks/useHandleLogic'

interface MemeSearchResultsListProps {
  debounceValue: string
  favoriteTokens: TokenTrending[]
  setFavoriteTokens: Dispatch<SetStateAction<TokenTrending[]>>
}

const SymbolCell = memo(
  ({
    info,
    debounceValue,
    setFavoriteTokens,
  }: {
    info: any
    debounceValue: string
    setFavoriteTokens: Dispatch<SetStateAction<TokenTrending[]>>
  }) => {
    const { chainId, token, image, symbol, isFavorite } = info.row.original
    const chainLogo = getBlockchainLogo2(chainId)
    const tokenLogo = image ?? getBlockChainLogo(chainId, token)

    return (
      <div className="flex items-center gap-2 flex-3">
        <ConfirmCollectTokenMeme
          token={token}
          defaultCollect={isFavorite}
          tokenSymbol={symbol}
          triggerClassName="p-0"
          onAdded={() => {
            setFavoriteTokens((prev) => [...prev, info.row.original])
          }}
          onRemove={() => {
            setFavoriteTokens((prev) => prev.filter((e) => e.token !== token))
          }}
        />
        <ChainCurrencyIcon
          chainIcon={chainLogo}
          currencyIcon={tokenLogo}
          name={symbol}
          fallbackClassName="bg-secondary"
        />
        <div className="">
          <div className="mb-1 flex items-center gap-1 text-title align-baseline font-bold text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))]">
            <Text
              text={symbol}
              highLightText={debounceValue.split(' ').join('').toUpperCase()}
              fontSize={13}
              fontWeight="medium"
              className="leading-[calc(1rem*(13/16))]"
            />
            <img src="/images/icons/icon-pump.webp" alt="" className="w-2.5 h-2.5" />
          </div>
          <div className="flex items-center">
            <div className="text-[calc(1rem*(10/16))] text-[#FFFFFF99] leading-[calc(1rem*(10/16))] mr-1">
              {formatAddressWallet(token, 5, 4)}
            </div>
            <div className="cursor-copy mr-2">
              <CopyButton
                icon="/images/tokenDetail/icon-copy.webp"
                className="w-[10px] min-w-[10px] h-[10px]"
                text={token}
                type="tokenAddress"
              />
            </div>
          </div>
        </div>
      </div>
    )
  },
)

SymbolCell.displayName = 'SymbolCell'

const MarketCapCell = memo(({ info }: { info: any }) => {
  const currentPrice = info.getValue()
  const price = info.row.original.price

  return (
    <div className="flex items-end gap-1 flex-col relative">
      <Text text={formatMoney(Number(price))} fontSize={15} fontWeight="medium" className="lining-nums" />
      <Text
        text={formatMoney(Number(currentPrice))}
        fontSize={11}
        fontWeight="regular"
        color="#FFFFFFB2"
        className="lining-nums"
      />
    </div>
  )
})

MarketCapCell.displayName = 'MarketCapCell'

const PriceChangeCell = memo(({ info }: { info: any }) => {
  const changePercent = info.getValue()
  return <PriceChange value={formatPercentage(Number(changePercent))} isPositive={Number(changePercent) > 0} />
})

PriceChangeCell.displayName = 'PriceChangeCell'

const MemeSearchResultsList = ({ debounceValue, favoriteTokens, setFavoriteTokens }: MemeSearchResultsListProps) => {
  const [listTokenMeme, setListTokenMeme] = useState<TokenTrending[]>([])
  const { handleRowClick } = useHandleLogic()

  const queryVariables = useMemo(
    () => ({
      input: debounceValue,
    }),
    [debounceValue],
  )

  const { loading, data } = useQuery(searchTokensV2, {
    variables: queryVariables,
    skip: !debounceValue,
  })

  const tokens = useMemo(() => {
    return data?.searchTokenLite || []
  }, [data])

  const favoriteTokensMap = useMemo(() => {
    return new Map(favoriteTokens.map((token) => [token.token, true]))
  }, [favoriteTokens])

  const columnHelper = useMemo(() => createColumnHelper<TokenTrending>(), [])

  const columns = useMemo(
    () => [
      columnHelper.accessor('symbol', {
        header: 'Symbol',
        cell: (info: any) => (
          <SymbolCell info={info} debounceValue={debounceValue} setFavoriteTokens={setFavoriteTokens} />
        ),
      }),

      columnHelper.accessor('marketcap', {
        header: 'Market Cap',
        cell: (info: any) => <MarketCapCell info={info} />,
      }),

      columnHelper.accessor('price24hChange', {
        header: 'Change 24h',
        cell: (info: any) => <PriceChangeCell info={info} />,
      }),
    ],
    [columnHelper, debounceValue],
  )

  useEffect(() => {
    const tokensWithFavorites = tokens.map((token: TokenSearchLiteDto) => ({
      ...token,
      isFavorite: favoriteTokensMap.has(token.token),
    }))

    setListTokenMeme(tokensWithFavorites)
  }, [tokens, favoriteTokensMap])

  const { t } = useTranslation()

  console.log(listTokenMeme, 'listTokenMeme')

  const tableProps = useMemo(
    () => ({
      isLoading: loading,
      columns,
      data: listTokenMeme,
      onRowClick: handleRowClick,
      isStickyHeader: true,
      isShowHeader: false,
      containerClassName: '!border-none _hidescrollbar h-full',
      tableHeaderClassName: 'text-[#FFFFFF80] text-[calc(1rem*(12/16))] font-[400] bg-[#232329] px-2',
      tableHeaderRowClassName: '!border-none',
      tableCellClassName: 'group-hover:!bg-[#ECECED14] cursor-pointer !border-none !py-2.5 justify-end px-2-custom',
      emptyText: t('wallet.noData'),
      tableRowClassName: '!border-none',
      tableHeadClassName: 'px-last-child px-0 h-[30px]',
      isSearchList: true,
      isMemeSearchList: true,
    }),
    [loading, columns, listTokenMeme, handleRowClick],
  )

  return (
    <div className="relative">
      <TableVirtual {...tableProps} />
    </div>
  )
}

export default memo(MemeSearchResultsList)
