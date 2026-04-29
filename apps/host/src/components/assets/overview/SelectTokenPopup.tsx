import { DialogTitle } from '@/components/ui/dialog'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTrigger } from '@components/ui/drawer.tsx'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export type SelectTokenType = {
  symbol: string
  name: string
  image: string
}

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  tokens: SelectTokenType[]
  tokenSelected: string
  onTokenSelected: (token: string) => void
}

const SelectTokenPopup = ({ open, setOpen, tokens, tokenSelected, onTokenSelected }: Props) => {
  const { t } = useTranslation()
  const [searchValue, setSearchValue] = useState<string>('')

  const filteredTokens = useMemo(() => {
    if (!searchValue.trim()) {
      return tokens
    }
    const searchLower = searchValue.toLowerCase().trim()
    return tokens.filter(
      (token: SelectTokenType) =>
        token.symbol?.toLowerCase().includes(searchLower) || token.name?.toLowerCase().includes(searchLower),
    )
  }, [tokens, searchValue])

  useEffect(() => {
    if (!open) {
      setSearchValue('')
    }
  }, [open])
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild className="cursor-pointer">
        <div className="bg-[#18181D] p-[17.5px] rounded-[10px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoWithChain
              logo={tokens.find((token) => token.symbol === tokenSelected)?.image || ''}
              name={tokenSelected}
              logoClassName="size-6 min-w-6"
            />
            <div className="font-medium text-[14px] leading-3.5 text-white">{tokenSelected}</div>
          </div>
          <img className="size-5" src="/images/assets/arrow-down.svg" alt="" />
        </div>
      </DrawerTrigger>
      <DrawerContent className="w-full max-w-3xl mx-auto bg-[#2B2B33]">
        <DrawerHeader className="flex justify-between p-3.75">
          <DialogTitle className="font-medium text-[18px] text-white">{t('exchange.selectToken')}</DialogTitle>
          <DrawerClose asChild>
            <img src="/images/icons/icon-x.svg" className="w-6 h-6 cursor-pointer" alt="icon-x.svg" />
          </DrawerClose>
        </DrawerHeader>
        <div className="px-3.75">
          {/* <div className="relative w-full mb-3">
            <input
              ref={inputRef}
              value={searchValue}
              onChange={(e) => {
                const value = e.target.value.replace(/\s+/g, '')
                setSearchValue(value)
              }}
              placeholder={t('exchange.searchTokenPlaceholder')}
              type="text"
              className="w-full py-3 px-[38px] bg-[#ECECED0A] border border-solid border-[#ECECED14] rounded-[200px] text-[14px] leading-[14px] placeholder:font-[350] placeholder:text-[#908E98] text-white outline-none"
            />
            <img alt="" className="size-[16px] absolute top-[15px] left-[16px]" src="/images/icons/search-icon-2.svg" />
            {searchValue.length !== 0 && (
              <img
                className="size-[16px] absolute top-[15px] right-[16px] cursor-pointer"
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
          </div> */}
          {/* Token List */}
          <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
            {filteredTokens.length > 0 ? (
              filteredTokens.map((token) => (
                <div
                  key={token.symbol}
                  onClick={() => {
                    onTokenSelected(token.symbol)
                    setOpen(false)
                  }}
                  className="cursor-pointer border-b border-[#3A3A45] py-3.75 flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5">
                    <LogoWithChain logo={token.image} name={token.symbol} logoClassName="size-9" />
                    <div>
                      <div className="font-semibold text-[16px] leading-4 text-white">{token.symbol}</div>
                      <div className="mt-1.5 text-[11px] leading-none text-[#908E98]">{token.name}</div>
                    </div>
                  </div>
                  {tokenSelected === token.symbol && (
                    <img
                      src="/images/icons/icon-tick-rounded-2.svg?v=2"
                      className="w-6 h-6"
                      alt="icon-tick-rounded-2.svg"
                    />
                  )}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-[#908E98] text-sm">{t('exchange.tokenNotFound')}</div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default SelectTokenPopup
