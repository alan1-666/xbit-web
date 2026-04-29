import { cn } from '@/lib/utils.ts'
import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'
import { CHAIN_EXPLORER_IMAGES_PC, CHAIN_EXPLORER_TX_URLS } from '@/lib/constant.ts'
import { ChainIds } from '@/types/enums.ts'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'

type TwoValuesColumnProps = {
  upperValue?: string
  upperValueClassName?: string
  lowerValue?: string
  lowerValueClassName?: string
  txHash?: string
  isSeparate?: boolean
  upperTextColor?: string
  lowerTextColor?: string
  isHaveTooltip?: boolean
  tooltipText?: string
}

type ButtonLinkTxHashProps = {
  txHash: string
  className?: string
  imgClassName?: string
}

const ButtonLinkTxHash = (props: ButtonLinkTxHashProps) => {
  const { txHash, className, imgClassName } = props
  const chainId = useActiveChainId() ?? ChainIds.Solana
  return (
    <a
      href={`${CHAIN_EXPLORER_TX_URLS[chainId]}/${txHash}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('border-none outline-none', className)}
      onClick={(e) => e.stopPropagation()}
    >
      <img
        src={CHAIN_EXPLORER_IMAGES_PC[chainId]}
        alt="icon solana"
        className={cn('min-w-[14px] h-[14px]', imgClassName)}
      />
    </a>
  )
}

const TwoValuesColumn = ({
  upperValue,
  upperValueClassName,
  lowerValue,
  lowerValueClassName,
  txHash,
  isSeparate = false,
  upperTextColor,
  isHaveTooltip = false,
  tooltipText,
}: TwoValuesColumnProps) => {
  const { isDesktop } = useResponsive()
  const handleRenderColumn = () => {
    if (!isSeparate && (!upperValue || !lowerValue || upperValue === '--' || lowerValue === '--')) {
      return <div className="text-[#CACACA] text-[13px] leading-[1]">--</div>
    }
    if (upperValue === '0' || lowerValue === '0') {
      return <div className="text-[#CACACA] text-[13px] leading-[1] w-full text-left">0</div>
    }
    return (
      <>
        <div className="flex items-center gap-1">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={cn('whitespace-nowrap', upperValueClassName)} style={{ color: upperTextColor }}>
                  {upperValue}
                </span>
              </TooltipTrigger>
              {isHaveTooltip && (
                <TooltipContent>
                  <div className="bg-[#111] px-1 py-0.5 rounded text-[11px] leading-[1] app-font-regular text-white/80">
                    {tooltipText}
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          {txHash && <ButtonLinkTxHash txHash={txHash ?? ''} />}
        </div>
        <div className={cn('whitespace-nowrap', lowerValueClassName)}>{lowerValue}</div>
      </>
    )
  }

  return (
    <div className={cn('flex flex-col items-start justify-center', isDesktop ? 'gap-1.5' : 'gap-1')}>
      {handleRenderColumn()}
    </div>
  )
}

export default TwoValuesColumn
