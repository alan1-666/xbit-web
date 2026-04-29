import { cn } from '@/lib/utils.ts'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { TeamModel } from '@/modules/prediction/models/TeamModel.ts'
import { useMemo } from 'react'
import { usePredictionMatchCard } from '../../hooks/usePredictionMatchCard'

import { REGEXES } from '@/modules/prediction/constants.ts'

interface LiveScoreProps {
  homeTeam?: TeamModel
  awayTeam?: TeamModel
}

const statusLabelClass = (live: boolean) => (live ? 'text-red-500 animate-pulse' : 'text-gray-400')

const BoLiveScore = ({ score, live }: { score: string; live: boolean }) => {
  const match = useMemo(() => score.match(REGEXES.esports), [score])
  if (!match) return null
  const homeScore = match[3]
  const awayScore = match[4]
  const bestOf = match[5]

  return (
    <div className="flex flex-col justify-center items-center gap-1">
      <div className={cn('text-xs uppercase font-bold', statusLabelClass(live))}>{live ? 'Live' : 'Final'}</div>
      <div className="text-2xl font-bold flex items-center gap-2">
        <span className={cn(Number(homeScore) > Number(awayScore) ? 'text-white' : 'text-muted-foreground')}>
          {homeScore}
        </span>
        <span className="text-muted-foreground">-</span>
        <span className={cn(Number(homeScore) < Number(awayScore) ? 'text-white' : 'text-muted-foreground')}>
          {awayScore}
        </span>
      </div>
      <div className="text-xs text-muted-foreground font-medium">Best of {bestOf}</div>
    </div>
  )
}

const SetsLiveScore = ({ score, live }: { score: string; live: boolean }) => {
  const sets = useMemo(() => {
    const matches = score.match(REGEXES.tennis)
    if (!matches) return []
    return matches.map((setScore) => {
      const [home, away] = setScore.split('-')
      return { home: parseInt(home, 10), away: parseInt(away, 10) }
    })
  }, [score])

  if (sets.length === 0) return null

  return (
    <div className="flex flex-col justify-center items-center gap-1">
      <div className={cn('text-xs uppercase font-bold', statusLabelClass(live))}>{live ? 'Live' : 'Final'}</div>
      <div className="flex items-center gap-2">
        {sets.map((set, index) => (
          <div key={index} className="flex flex-col items-center gap-0.5 px-1.5 border-r last:border-0 border-white/10">
            <span
              className={cn(
                'text-xs font-bold leading-none',
                set.home > set.away ? 'text-white' : 'text-muted-foreground',
              )}
            >
              {set.home}
            </span>
            <span
              className={cn(
                'text-xs font-bold leading-none',
                set.home < set.away ? 'text-white' : 'text-muted-foreground',
              )}
            >
              {set.away}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const RegularLiveScore = ({ score, live }: { score: string; live: boolean }) => {
  const [homeScore, awayScore] = score.split('-')
  return (
    <div className="flex flex-col justify-center items-center gap-1">
      <div className={cn('text-xs uppercase font-bold', statusLabelClass(live))}>{live ? 'Live' : 'Final'}</div>
      <div className="text-3xl font-bold flex items-center gap-3">
        <span className={cn(Number(homeScore) > Number(awayScore) ? 'text-white' : 'text-muted-foreground')}>
          {homeScore}
        </span>
        <span className="text-muted-foreground">-</span>
        <span className={cn(Number(homeScore) < Number(awayScore) ? 'text-white' : 'text-muted-foreground')}>
          {awayScore}
        </span>
      </div>
    </div>
  )
}

export const LiveScore = ({ homeTeam, awayTeam }: LiveScoreProps) => {
  const { event, isLive } = useEventDetailsPageContext()
  const { matchCardProps } = usePredictionMatchCard({ event: event || ({} as any) })
  const { odds } = matchCardProps

  // Probability Logic
  const team1Prob = odds.team1.value
  const team2Prob = odds.team2.value
  const drawProb = odds.draw?.value || 0
  const totalProb = team1Prob + team2Prob + drawProb
  // Normalize to 100%
  const scale = totalProb > 0 ? 100 / totalProb : 1
  const width1 = team1Prob * scale
  const widthDraw = drawProb * scale

  // Use event.score if available, otherwise fallback to probability bar
  const score = (event as any)?.score // || '3-16' // Uncomment for testing regular score
  // const score = '1-6, 6-3, 1-3' // Uncomment for testing tennis
  // const score = '000-000|1-0|Bo3' // Uncomment for testing esports

  if (score) {
    if (REGEXES.esports.test(score)) return <BoLiveScore score={score} live={isLive} />
    if (REGEXES.tennis.test(score)) return <SetsLiveScore score={score} live={isLive} />
    if (REGEXES.other.test(score)) return <RegularLiveScore score={score} live={isLive} />
  }

  // Fallback: Probability Bar
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Progress Bar */}
      <div className="flex w-full h-2.5 rounded-full overflow-hidden relative gap-[2px]">
        {/* Team 1 Segment */}
        <div
          style={{ width: `${width1}%`, backgroundColor: homeTeam?.color || '#04B24F' }}
          className="h-full rounded-l-sm transition-all duration-300"
        />
        {/* Draw Segment */}
        {drawProb > 0 && (
          <div style={{ width: `${widthDraw}%` }} className="h-full bg-neutral-600 transition-all duration-300" />
        )}
        {/* Team 2 Segment */}
        <div
          className="flex-1 h-full rounded-r-sm transition-all duration-300"
          style={{ backgroundColor: awayTeam?.color || '#A60043' }}
        />
      </div>

      {/* Percentages */}
      <div className="flex justify-between w-full text-sm font-bold px-1">
        <span style={{ color: homeTeam?.color || '#04B24F' }}>{team1Prob}%</span>
        <span style={{ color: awayTeam?.color || '#A60043' }}>{team2Prob}%</span>
      </div>

      {/* Volume */}
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {event?.volume ? `$${Number(event.volume).toLocaleString()} Vol.` : 'Vol. N/A'}
      </p>
    </div>
  )
}
