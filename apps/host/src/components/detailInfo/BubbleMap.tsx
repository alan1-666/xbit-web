import { useTranslation } from 'react-i18next'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useParams } from 'react-router-dom'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@components/ui/dialog.tsx'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import LoadingSpinner from '@components/ui/loading-spinner.tsx'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { useMemo } from 'react'
import { ChainIds } from '@/types/enums.ts'

// const bubbleMapChain: Record<number, string> = {
//   [ChainIds.Solana]: 'sol',
//   [ChainIds.Ethereum]: 'eth',
//   [ChainIds.Arbitrum]: 'arbi',
//   [ChainIds.Bsc]: 'bsc',
//   [ChainIds.Avalanche]: 'avax',
//   [ChainIds.FantomOpera]: 'ftm',
//   [ChainIds.Polygon]: 'poly',
//   [ChainIds.Base]: 'base',
// }

const BubbleMap = () => {
  const { t } = useTranslation()
  const { address } = useParams()
  const activeChainId = useActiveChainId()
  const chain = useMemo(() => {
    if (activeChainId === ChainIds.Bsc) return '56'
    if (activeChainId === ChainIds.Ethereum) return 'eth'
    return 'solana'
  }, [activeChainId])

  return (
    <Dialog>
      <DialogTrigger>
        <div role="button" aria-label="Bubble map" className="flex items-center cursor-pointer"  >
          <TooltipProvider>
            <SimpleTooltip content={t('detail.tags.chipAnalysis')}>
              <img
                aria-label="Bubble map icon"
                src="/images/tokenDetail/icon-bubbles.svg"
                className="w-[16px] min-w-[16px] hover:scale-[1.1] cursor-pointer transition-transform duration-200"
                alt="bubble map"
              />
            </SimpleTooltip>
          </TooltipProvider>
        </div>
      </DialogTrigger>
      <DialogContent className="w-[50vw] h-[80vh] max-w-4xl max-h-[700px] p-0 flex flex-col">
        <DialogTitle className="p-4 pb-0">{t('detail.tags.chipAnalysis')}</DialogTitle>
        <div className="flex-1 relative">
          <div className="absolute inset-0 flex items-center justify-center z-[-1]">
            <LoadingSpinner size={16} />
          </div>
          <iframe
            src={`https://app.insightx.network/bubblemaps/${chain}/${address}?link=0&tooltip=true&theme=xbit&embed_id=${import.meta.env.VITE_APPLE_OAUTH_CLIENT_ID}`}
            allow="clipboard-write"
            className="z-10"
            width="100%"
            height="100%"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BubbleMap
