import { TransactionTokenInput } from '@/@generated/gql/graphql-trading.ts'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { tradingClient } from '@/lib/gql/apollo-client'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { cn } from '@/lib/utils.ts'
import { selectAllTokens, tokenActions } from '@/redux/modules/tokens.slice.ts'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { getTransactionTokens } from '@/services/order.service'
import { getTokenData } from '@/services/tokens.service'
import { getBlockChainLogo } from '@/utils/helpers.ts'
import { Loading } from '@components/common/Loading.tsx'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover.tsx'
import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const TokenFilter = (props: { userAddresses: string[]; value: string; onValueChange: (value: string) => void }) => {
  const { userAddresses, value, onValueChange } = props
  const { t } = useTranslation()
  const tokensState = useAppSelector(selectAllTokens)
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [tokens, setTokens] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)

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

  const fetchTransactionTokens = async () => {
    setLoading(true)
    try {
      const queryInput: TransactionTokenInput = {
        userAddresses: userAddresses,
      }
      const response = await tradingClient.query({
        query: getTransactionTokens,
        variables: {
          input: queryInput,
        },
        fetchPolicy: 'no-cache',
      })
      setLoading(false)
      setTokens(response?.data?.transactionTokens)
    } catch (error) {
      setLoading(false)
      console.error('Error fetching transaction tokens:', error)
    }
  }

  useEffect(() => {
    setInput('')
    if (!open) return
    fetchTransactionTokens()
  }, [open])

  const handleChange = (val: string) => {
    onValueChange(val)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <div className="flex items-center">
          <div>{t('history.token')}</div>
          <div className="flex items-center cursor-pointer justify-center w-[14px] h-[14px]">
            {value ? (
              <img src="/images/icons/icon-filter-solid.svg" className="w-[10px] h-[10px]" alt="" />
            ) : (
              <img src="/images/icons/icon-filter.svg" className="w-[10px] h-[10px]" alt="" />
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 bg-[#212127] w-[180px]" align="start">
        <Command
          className="bg-[#212127]"
          filter={(value, search) => {
            if (!value) return 0
            const token = tokens.find((item) => item?.address === value)
            if (!token) return 0
            if (
              token?.symbol.toLowerCase().includes(search.toLowerCase()) ||
              token?.address.toLowerCase().includes(search.toLowerCase())
            ) {
              return 1
            }
            return 0
          }}
          autoFocus={true}
        >
          <div className="p-1">
            <div className="rounded-full border border-[#79778C29] h-9">
              <CommandInput
                className="h-9 border-none text-[calc(14rem/16)]"
                wrapperClassName="border-none"
                placeholder={t('history.searchToken')}
                value={input}
                onValueChange={(text) => setInput(text)}
              />
            </div>
          </div>
          <CommandList>
            <CommandEmpty>{t('history.nodata')}</CommandEmpty>
            <CommandGroup className='pt-0'>
              <CommandItem
                className={cn(
                  'cursor-pointer h-9 relative',
                  !value ? 'text-[#FBFBFB] bg-[#2B2B33]' : 'bg-transparent text-[#79778C]',
                )}
                onSelect={() => handleChange('')}
              >
                <div className="flex items-center gap-2">
                  <LogoWithChain
                    logo="/images/icons/ic-wallet-circle.svg?v=2"
                    logoClassName="sie-6"
                    name="All Tokens"
                  />
                  {t('history.all')}
                </div>

                {!value && (
                  <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </CommandItem>
              {loading ? (
                <div className="flex items-center justify-center h-[100px]">
                  <Loading />
                </div>
              ) : (
                tokens.map((token) => {
                  const tokenData = tokensState[token.address] || fetchTokenData(token.address)
                  return (
                    <CommandItem
                      key={token.address}
                      className={cn(
                        'cursor-pointer h-9 relative',
                        value === token.address ? 'text-[#FBFBFB] bg-[#2B2B33]' : 'bg-transparent text-[#79778C]',
                      )}
                      value={token.address}
                      onSelect={() => handleChange(token.address)}
                    >
                      <div className="flex items-center gap-2">
                        <LogoWithChain
                          logo={tokenData?.logo || getBlockChainLogo(Number(token.chainId), token.address)}
                          logoClassName="size-6 min-w-none"
                          chainContainerClassName="size-2.5 min-w-none"
                          name={token.symbol}
                        />
                        {token.symbol}
                      </div>

                      {value === token.address && (
                        <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </CommandItem>
                  )
                })
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default TokenFilter
