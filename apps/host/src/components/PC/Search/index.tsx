import Text from '@/components/common/Text'
import useItemTokenOHLC from '@/components/futuresDetails/tokenSearchDrawer/hooks/useItemTokenOHLC'
import { cn } from '@/lib/utils'
import { formatLongValue, formatMoney } from '@/utils/helpers'
import { memo, useEffect, useRef, useState } from 'react'
import { TokenSearchDialog } from '../TokenSelect'

interface PriceChangeProps {
  value: string
  isPositive: boolean
  className?: string
}

export const PriceChangePC = memo<PriceChangeProps>(({ value, isPositive, className }) => {
  const color = isPositive ? 'var(--rise)' : 'var(--fall)'

  return (
    <Text
      text={`${isPositive ? '+' : ''}${formatLongValue(Number(value), false, 2)}%`}
      fontSize={12}
      className={cn('lining-nums !font-[380]', className)}
      color={color}
    />
  )
})

export const MarketCapCell = memo(({ info, type }: { info: any; type: 'marketCap' | 'volume' }) => {
  const { token, volume24h, marketcap } = info.row.original

  const { price } = useItemTokenOHLC({
    address: token,
    initMarketcap: marketcap,
    initVolume24h: volume24h,
  })

  return (
    <div className="flex items-end gap-1 flex-col relative">
      {type === 'marketCap' && (
        <Text text={formatMoney(price.marketcap)} fontSize={14} className="lining-nums !font-[450]" />
      )}
      {type === 'volume' && (
        <Text text={formatMoney(Number(price.volume24h))} fontSize={14} className="lining-nums !font-[450]" />
      )}
    </div>
  )
})

export const PriceChangeCell = memo(({ info }: { info: any }) => {
  const { token, price24hChange } = info.row.original
  const { price } = useItemTokenOHLC({
    address: token,
    initChangePercent: price24hChange,
  })

  const changePercent = price?.price24hChange
  return <PriceChangePC isPositive={Number(changePercent) > 0} value={`${changePercent}`} />
})
PriceChangeCell.displayName = 'PriceChangeCell'

const Search = () => {
  const isClosingRef = useRef(false)
  const [openSearchDialog, setOpenSearchDialog] = useState(false)
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    const platform = navigator.platform.toLowerCase()
    const userAgent = navigator.userAgent.toLowerCase()

    const isMacOS = platform.includes('mac') || userAgent.includes('mac') || platform.includes('darwin')

    setIsMac(isMacOS)
  }, [])

  const handleSearchClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpenSearchDialog(true)
  }

  const renderShortcut = () => {
    if (isMac) {
      return (
        <div className="hidden lg:flex items-center">
          <span className="text-xs text-[#FFFFFF60] font-medium">⌘</span>
          <span className="text-xs text-[#FFFFFF60] font-medium">K</span>
        </div>
      )
    } else {
      return (
        <div className="hidden lg:flex items-center">
          <span className="text-xs text-[#FFFFFF60] font-medium">Ctrl</span>
          <span className="text-xs text-[#FFFFFF60] font-medium">K</span>
        </div>
      )
    }
  }

  const handleClose = () => {
    isClosingRef.current = true
    setOpenSearchDialog(false)
  }
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'k' && event.key !== 'K') {
        return
      }
      const isMac = /Mac/.test(navigator.userAgent)
      const isTriggered = isMac ? event.metaKey : event.ctrlKey
      if (isTriggered) {
        event.preventDefault()
        setOpenSearchDialog(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
  return (
    <>
      <div
        onClick={handleSearchClick}
        className="border-[0.5px] border-[#79778C29] h-[34px] bg-[#212127] rounded-[200px] flex justify-center items-center cursor-pointer gap-2 px-2"
      >
        <img alt="search-icon" className="size-4" src="/images/icons/search-icon.svg" />
        {renderShortcut()}
      </div>
      {openSearchDialog && <TokenSearchDialog open={openSearchDialog} setOpen={handleClose} />}
    </>
  )
}

export default Search
