import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { useSportEventTeams } from '@/modules/prediction/hooks/useSportEventTeams.ts'
import dayjs from 'dayjs'
import calendar from 'dayjs/plugin/calendar'
import { Team } from './Team'
import { LiveScore } from './LiveScore'
import { useEffect, useRef, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { REGEXES } from '@/modules/prediction/constants.ts'

dayjs.extend(calendar)

export const Scoreboard = () => {
  const { event, teams, isEnded, isLive } = useEventDetailsPageContext()

  const slug = event?.slug || ''
  const { homeTeam: fetchedHome, awayTeam: fetchedAway, isPending: isLoadingTeams } = useSportEventTeams(slug)

  const homeTeam = fetchedHome || teams?.[0]
  const awayTeam = fetchedAway || teams?.[1]
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!containerRef.current) return

    // Initial measure
    const { width, height } = containerRef.current.getBoundingClientRect()
    setDimensions({ width, height })

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [isLoadingTeams])

  if (isLoadingTeams) {
    return (
      <div className="relative w-full overflow-hidden bg-background pt-1 rounded-3xl border border-white/10 p-6 min-h-[200px] flex items-center justify-center">
        <div className="flex w-full gap-8 items-center px-6">
          {/* Team 1 Skeleton */}
          <div className="flex-1 flex flex-col items-center gap-3">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Center Stats Skeleton */}
          <div className="flex-[1.5] flex flex-col items-center gap-4">
            <Skeleton className="h-8 w-32 rounded-lg" />
            <div className="w-full space-y-2">
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-2 w-2/3 mx-auto rounded-full" />
            </div>
          </div>

          {/* Team 2 Skeleton */}
          <div className="flex-1 flex flex-col items-center gap-3">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    )
  }

  const startTimeDisplay = event?.startDate
    ? dayjs(event.startDate).calendar(null, {
        sameDay: '[Today] h:mm A',
        nextDay: '[Tomorrow] h:mm A',
        nextWeek: 'dddd h:mm A',
        lastDay: '[Yesterday] h:mm A',
        sameElse: 'MMM D, YYYY h:mm A',
      })
    : 'Unknown'

  // Badge Logic
  const getBadgeContent = () => {
    // Prioritize Live status (use isLive so ended events don't show Live)
    if (isLive) {
      const score = event?.score || ''

      // Esports: 1-1|15-5|Bo3
      const esportsMatch = score.match(REGEXES.esports)
      if (esportsMatch) {
        const homeWin = parseInt(esportsMatch[1])
        const awayWin = parseInt(esportsMatch[2])
        const bestOf = esportsMatch[5]
        const currentGame = homeWin + awayWin + 1
        return (
          <span className="text-red-500 font-bold">
            LIVE <span className="text-text-primary/60 font-medium mx-1">•</span> Game {currentGame} • Best of {bestOf}
          </span>
        )
      }

      // Tennis: 6-4, 2-1 (Comma or space logic handled by SetsLiveScore info)
      // We infer current set by number of set scores provided.
      const tennisUnfinished = score.match(REGEXES.tennis)
      if (tennisUnfinished && tennisUnfinished.length > 0) {
        // Typically regex /g returns array. If 2 items, we are likely in Set 2 or finished Set 2.
        // For simple logic: "LIVE • S{count}"
        return (
          <span className="text-red-500 font-bold">
            LIVE <span className="text-text-primary/60 font-medium mx-1">•</span> S{tennisUnfinished.length}
          </span>
        )
      }

      // Default Live
      return <span className="text-red-500 font-bold animate-pulse">LIVE</span>
    }

    if (isEnded) {
      return <span className="text-gray-400 font-bold">Final</span>
    }

    return startTimeDisplay
  }

  // Generate dynamic border path
  const w = dimensions.width
  const h = dimensions.height
  const r = 20 // Corner radius
  const notchWidth = 260 // Width of the top notch area
  const notchDepth = 20 // Depth of the notch curve
  const cx = w / 2

  // prevent path generation errors if width is too small
  const path =
    w > 0
      ? `
    M 0 ${r}
    A ${r} ${r} 0 0 1 ${r} 0
    L ${cx - notchWidth / 2} 0
    C ${cx - notchWidth / 2 + 20} 0 ${cx - notchWidth / 2 + 10} ${notchDepth} ${cx - notchWidth / 2 + 40} ${notchDepth}
    L ${cx + notchWidth / 2 - 40} ${notchDepth}
    C ${cx + notchWidth / 2 - 10} ${notchDepth} ${cx + notchWidth / 2 - 20} 0 ${cx + notchWidth / 2} 0
    L ${w - r} 0
    A ${r} ${r} 0 0 1 ${w} ${r}
    L ${w} ${h - r}
    A ${r} ${r} 0 0 1 ${w - r} ${h}
    L ${r} ${h}
    A ${r} ${r} 0 0 1 0 ${h - r}
    Z
  `
      : ''

  return (
    <div className="relative w-full overflow-visible bg-background pt-1" ref={containerRef}>
      {/* Dynamic Border SVG */}
      <div className="absolute inset-0 pointer-events-none z-5 text-border/90">
        <svg width="100%" height="100%" className="overflow-visible">
          <path d={path} fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      {/* Status Badge */}
      <div className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1">
        <div className="flex justify-center items-center gap-2 w-fit bg-[#2C3038] rounded-sm px-3 py-1 border border-border/50 shadow-sm">
          <p className="text-xs text-text-primary font-medium leading-[15px] whitespace-nowrap">{getBadgeContent()}</p>
        </div>
      </div>

      <div className="relative flex flex-col w-full z-1 py-8">
        {/* Blurred Background Images */}
        <div className="absolute inset-0 top-6 pb-6 flex opacity-100 overflow-hidden pointer-events-none">
          {/* Left Team Blur */}
          <div className="flex-1 flex justify-center items-center">
            <div className="relative size-[80px] blur-[10px] opacity-40 transform -translate-x-1/2">
              {homeTeam?.logo && <img src={homeTeam.logo} alt="" className="w-full h-full object-cover" />}
            </div>
          </div>
          {/* Center Spacer */}
          <div className="flex-1 invisible"></div>
          {/* Right Team Blur */}
          <div className="flex-1 flex justify-center items-center">
            <div className="relative size-[80px] blur-[10px] opacity-40 transform translate-x-1/2">
              {awayTeam?.logo && <img src={awayTeam.logo} alt="" className="w-full h-full object-cover" />}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col w-full h-full gap-4 px-6 relative z-10">
          <div className="flex w-full gap-4 items-center">
            {/* Team 1 (Left) */}
            <div className="flex-1 flex justify-start lg:justify-center min-w-0">
              <Team team={homeTeam} />
            </div>

            {/* Middle Stats (Probability Bar & Graph) */}
            <div className="flex-[1.5] min-w-0">
              <LiveScore homeTeam={homeTeam} awayTeam={awayTeam} />
            </div>

            {/* Team 2 (Right) */}
            <div className="flex-1 flex justify-end lg:justify-center min-w-0">
              <Team team={awayTeam} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
