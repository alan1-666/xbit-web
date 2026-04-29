import dayjs from 'dayjs'
import React from 'react'
import { getUserTimezoneOffset } from './utils'

interface SerieTooltipContentProps {
  endDate: string
  status: 'live' | 'ended' | 'upcoming'
}
const SeriesTooltipContent: React.FC<SerieTooltipContentProps> = ({ endDate, status }) => {
  return (
    <div className="px-2 py-1.5 w-60">
      <div className="text-white text-sm">
        {status === 'ended' ? (
          'Event has ended'
        ) : status === 'live' ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#EA3B4F] text-xs">
              <div className="relative">
                <div className="w-1.5 h-1.5 bg-[#EA3B4F] rounded-full"></div>
                <div
                  className="absolute -inset-0.5 w-2.5 h-2.5 bg-[#EA3B4F] rounded-full opacity-75"
                  style={{ animation: '1.5s cubic-bezier(0, 0, 0.2, 1) 0s infinite normal none running ping' }}
                ></div>
              </div>
              LIVE
            </div>
            <TimeLeft endDate={endDate} />
          </div>
        ) : (
          <TimeLeft endDate={endDate} />
        )}
      </div>
      <div className="text-gray-400 mt-2 text-xs mb-2">Resolution time</div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="text-xs bg-[#272727] text-white p-1 rounded-sm w-fit">{getUserTimezoneOffset()}</div>
          <div>{dayjs(endDate).format('MMM DD, YYYY')}</div>
        </div>
        <div>{dayjs(endDate).format('hh:mm A')}</div>
      </div>
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1">
          <div className="text-xs bg-[#272727] text-white p-1 rounded-sm w-fit">UTC</div>
          <div>{dayjs(endDate).utc().format('MMM DD, YYYY')}</div>
        </div>
        <div>{dayjs(endDate).utc().format('hh:mm A')}</div>
      </div>
    </div>
  )
}

export default SeriesTooltipContent

const TimeLeft = ({ endDate }: { endDate: string }) => {
  const timeLeft = dayjs(endDate).diff(dayjs(), 'second')
  const hoursLeft = Math.floor(timeLeft / 3600)
  const minutesLeft = Math.floor((timeLeft % 3600) / 60)

  if (dayjs().isAfter(dayjs(endDate))) {
    return <div className="text-white text-sm">Event has ended</div>
  }
  return (
    <div className="flex items-center gap-1 text-xs">
      {hoursLeft > 0 ? `${hoursLeft} Hrs ${minutesLeft} Mins` : `${minutesLeft} Mins`}
      <span className="text-gray-400">left</span>
    </div>
  )
}
