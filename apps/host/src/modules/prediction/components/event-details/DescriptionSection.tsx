import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import dayjs from 'dayjs'
import { ResolutionSource } from '@/modules/prediction/components/event-details/ResolutionSource.tsx'
import { useTranslation } from 'react-i18next'

export const DescriptionSection = () => {
  const { event } = useEventDetailsPageContext()
  const { t } = useTranslation()
  const description = event?.description || ''
  const firstMarket = event?.markets?.[0]

  return (
    <div className="max-w-full">
      <div
        className="text-[calc(14rem/16)] text-white/80 wrap-break-word whitespace-pre-line"
        style={{ overflowWrap: 'anywhere' }}
      >
        {description}
      </div>
      <div className="text-sm mt-4">
        <span className="font-semibold">{t('prediction.eventDetails.createdAt')}</span> {dayjs(event?.creationDate).format('MM-DD-YYYY HH:mm:ss')}
      </div>
      <ResolutionSource market={firstMarket} />
    </div>
  )
}
