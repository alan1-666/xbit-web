import { getBlockChainLogo } from '@/utils/helpers.ts'
import BottomSheet from '@/components/common/BottomSheet'
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { TransactionToken } from '@/@generated/gql/graphql-trading.ts'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { getTokenData } from '@/services/tokens.service'
import { tokenActions, selectAllTokens } from '@/redux/modules/tokens.slice.ts'
import { TransactionTokenInput } from '@/@generated/gql/graphql-trading.ts'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { tradingClient } from '@/lib/gql/apollo-client'
import { getTransactionTokens } from '@/services/order.service'
import { Loading } from '@components/common/Loading.tsx'

type FilterByTokenProps = {
  open: boolean
  setOpen: (open: boolean) => void
  tokenFilter: string | undefined
  onFilterByTokenChange: (value: string | undefined) => void
  userAddress?: string
}

const FilterByToken = ({ open, setOpen, tokenFilter, onFilterByTokenChange, userAddress }: FilterByTokenProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const activeWallet = useSelector(_activeWallet)
  const walletAddress = activeWallet?.walletAddress
  const [searchValue, setSearchValue] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [filteredTokens, setFilteredTokens] = useState<TransactionToken[]>([])
  const [transactionTokens, setTransactionTokens] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const tokensState = useAppSelector(selectAllTokens)

  const fetchTransactionTokens = async () => {
    try {
      setLoading(true)
      const queryInput: TransactionTokenInput = {
        userAddress: userAddress ? userAddress : walletAddress,
      }
      const response = await tradingClient.query({
        query: getTransactionTokens,
        variables: {
          input: queryInput,
        },
      })
      setTransactionTokens(response?.data?.transactionTokens)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error('Error fetching transaction tokens:', error)
    }
  }

  const fetchTokenData = async (token: string) => {
    try {
      const response = await gqlClient.query({
        query: getTokenData,
        variables: {
          input: { address: token },
        },
      })
      const tokenData = response?.data?.getTokenDetail
      dispatch(
        tokenActions.setTokenData({
          address: tokenData?.address,
          chainId: tokenData?.chainId,
          name: tokenData?.name,
          symbol: tokenData?.symbol,
          logo: tokenData?.info?.logoUrl,
          isBlacklisted: tokenData?.isBlacklisted || false,
          totalSupply: tokenData?.totalSupply || '0',
        }),
      )
      return {
        logo: tokenData?.logo,
        symbol: tokenData?.symbol,
        name: tokenData?.name,
      }
    } catch (error) {
      console.error('Error fetching token detail:', error)
      return null
    }
  }

  useEffect(() => {
    setFilteredTokens(transactionTokens)
  }, [transactionTokens])

  useEffect(() => {
    if (searchValue.length === 0) {
      setFilteredTokens(transactionTokens)
      return
    }
    const filtered = transactionTokens.filter((token) => token.symbol.toLowerCase().includes(searchValue.toLowerCase()))
    setFilteredTokens(filtered)
  }, [searchValue])

  useEffect(() => {
    setSearchValue('')
    if (!open) return
    fetchTransactionTokens()
  }, [open])

  useEffect(() => {
    onFilterByTokenChange(undefined)
  }, [userAddress])

  return (
    <BottomSheet open={open} setOpen={setOpen} title={t('history.filterByToken')} hiddenBgImg>
      <div className="relative w-full]">
        <input
          ref={inputRef}
          value={searchValue}
          onChange={(e) => {
            const value = e.target.value.replace(/\s+/g, '')
            setSearchValue(value)
          }}
          placeholder={t('history.searchToken')}
          type="text"
          className="w-full py-3 pl-[36px] bg-(--bg-secondary) border border-solid border-(--bg-secondary) rounded-[200px] text-[14px] leading-[14px]"
        />
        <img alt="" className="size-[16px] absolute top-[15px] left-[16px]" src="/images/icons/search-icon-2.svg" />
        {searchValue.length !== 0 && (
          <img
            className="size-[16px] absolute top-[15px] right-[16px]"
            src="/images/icons/icon-x.svg"
            alt=""
            onClick={() => {
              setSearchValue('')
              if (inputRef.current) {
                inputRef.current.focus()
              }
            }}
          />
        )}
      </div>
      <div className="overflow-y-auto no-scrollbar min-h-[155px] max-h-[70vh] flex flex-col gap-2">
        {loading ? (
          <div className="flex items-center justify-center h-[170px]">
            <Loading />
          </div>
        ) : (
          <>
            <div
              className="flex mt-2 justify-between items-center py-[18px] cursor-pointer rounded-[10px] px-4 bg-[#2B2B33]"
              onClick={() => {
                if (tokenFilter) {
                  onFilterByTokenChange(undefined)
                  setOpen(false)
                  setSearchValue('')
                }
              }}
            >
              <div className="text-[16px] font-[500] text-white flex items-center">
                <LogoWithChain
                  logo="/images/icons/ic-wallet-circle.svg?v=2"
                  logoClassName="w-[30px] h-[30px] mr-2"
                  name="All Tokens"
                />
                {t('history.all')}
              </div>
              {!tokenFilter ? (
                <img src="/images/icons/icon-tick-rounded.svg?v=2" alt="ic tick" className="size-[25px]" />
              ) : (
                <div className="border border-[#37363D] rounded-full size-[25px]" />
              )}
            </div>

            {filteredTokens.length === 0 ? (
              // <div className="mt-4 flex flex-col items-center justify-center h-full">
              //   <IconEmpty />
              //   <span className="text-[#FFFFFF80] text-[0.75rem]">{t('history.nodata')}</span>
              // </div>
              <></>
            ) : (
              filteredTokens.map((token, index) => {
                const tokenData = tokensState[token.address] || fetchTokenData(token.address)

                return (
                  <div
                    key={index}
                    className="flex justify-between items-center py-[18px] cursor-pointer rounded-[10px] px-4 bg-[#2B2B33]"
                    onClick={() => {
                      tokenFilter === token.address
                        ? onFilterByTokenChange(undefined)
                        : onFilterByTokenChange(token.address)
                      setOpen(false)
                    }}
                  >
                    <div className="text-[16px] font-[500] text-white flex items-center">
                      <LogoWithChain
                        logo={tokenData?.logo || getBlockChainLogo(Number(token.chainId), token.address)}
                        logoClassName="w-[30px] h-[30px] mr-2"
                        name={tokenData?.name || token.symbol}
                      />
                      {token.symbol}
                    </div>
                    {/* {tokenFilter === token.address && (
                      <img src="/images/icons/icon-check.svg?v=2" className="w-[18px] h-[18px]" alt="" />
                    )} */}

                    {tokenFilter === token.address ? (
                      <img src="/images/icons/icon-tick-rounded.svg?v=2" alt="ic tick" className="size-[25px]" />
                    ) : (
                      <div className="border border-[#37363D] rounded-full size-[25px]" />
                    )}
                  </div>
                )
              })
            )}
          </>
        )}
      </div>
    </BottomSheet>
  )
}

export default FilterByToken
