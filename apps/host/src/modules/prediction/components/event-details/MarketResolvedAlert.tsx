import { useMemo, useState } from 'react'
import { Dialog, DialogContent } from '@components/ui/dialog.tsx'
import { usePublicSubscriptionCallback } from '@hooks/mqtt/usePublicSubscriptionCallback.ts'
import { TOPICS } from '@/lib/topics.ts'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { MqttMarketResolvedPayload } from '@/modules/prediction/types/mqtt-payload.ts'
import { Button } from '@components/ui/button.tsx'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useResponsive } from '@/hooks/useResponsive'
import { CircleCheckIcon, CircleXIcon } from '../icons'

const Confetti = () => {
  const colors = [
    '#ff6b6b',
    '#4ecdc4',
    '#45b7d1',
    '#f9ca24',
    '#f0932b',
    '#eb4d4b',
    '#6c5ce7',
    '#a29bfe',
    '#fd79a8',
    '#e17055',
  ]

  return (
    <>
      <style>
        {`
          @keyframes confetti {
            0% {
              transform: translateY(-120vh) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
          .animate-confetti {
            animation: confetti linear infinite;
          }
        `}
      </style>
      <div className="fixed inset-0 -top-10 pointer-events-none z-100 overflow-hidden">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              backgroundColor: colors[Math.floor(Math.random() * colors.length)],
              width: `${4 + Math.random() * 6}px`,
              height: `${4 + Math.random() * 6}px`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>
    </>
  )
}

export const MarketResolvedAlert = () => {
  const [open, setOpen] = useState(false)
  const { selectedMarket } = useEventDetailsPageContext()
  const [winningOutcome, setWinningOutcome] = useState<string | null>(null)
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()

  const selectedMarketId = selectedMarket?.id || ''

  const winningOutcomeIndex = useMemo(() => {
    if (!winningOutcome || !selectedMarket?.outcomes) return null
    return selectedMarket.outcomes.findIndex((o) => o === winningOutcome)
  }, [winningOutcome, selectedMarket?.outcomes])

  usePublicSubscriptionCallback<MqttMarketResolvedPayload>(TOPICS.prediction.marketResolved(selectedMarketId), {
    shouldSkip: !selectedMarketId,
    debug: true,
    onMessage: (_, payload) => {
      setOpen(true)
      setWinningOutcome(payload.wo)
    },
  })

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={cn('p-0 rounded-lg', {
            'max-w-[90%]': !isDesktop,
          })}
        >
          <div className="p-4 rounded-lg">
            <h3 className="text-lg font-medium">{t('prediction.eventDetails.marketResolved')}</h3>
            <p className="mt-2 text-sm">{t('prediction.eventDetails.marketResolvedDesc')}</p>
            {winningOutcome && (
              <div className="mt-3 flex flex-col items-center gap-2">
                {winningOutcomeIndex === 0 ? (
                  <CircleCheckIcon className="w-8 h-8 text-rise" />
                ) : winningOutcomeIndex === 1 ? (
                  <CircleXIcon className="w-8 h-8 text-fall" />
                ) : (
                  <CircleCheckIcon className="w-8 h-8 text-rise" />
                )}
                <p
                  className={`text-sm ${winningOutcomeIndex === 0 ? 'text-rise' : winningOutcomeIndex === 1 ? 'text-fall' : 'text-rise'}`}
                >
                  {t('prediction.eventDetails.outcome')}: <span className="font-medium">{winningOutcome}</span>
                </p>
              </div>
            )}
            <Button variant="gradient" onClick={() => setOpen(false)} className="mt-4 w-full rounded-full">
              {t('prediction.common.ok')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {open && createPortal(<Confetti />, document.body)}
    </>
  )
}
