import { EventModel } from '@/modules/prediction/models/EventModel.ts'
import { TeamModel } from '@/modules/prediction/models/TeamModel.ts'
import { cn } from '@/lib/utils.ts'
import { Link } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations.ts'
import { ArrowRightIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar.tsx'
import { useMemo, useState } from 'react'
import { formatVolume } from '@/lib/format.ts'
import { MarketItemContent } from '@/modules/prediction/components/event-details/MarketItemContent.tsx'

export interface MatchCardProps {
  event: EventModel
  teams: [TeamModel | undefined, TeamModel | undefined]
  live: boolean
}

export const MatchCardV2 = (props: MatchCardProps) => {
  const { event, teams, live } = props

  const [isExpanded, setIsExpanded] = useState(false)
  const [homeTeam, awayTeam] = teams

  const moneylineMarkets = useMemo(() => {
    if (!event.markets) return []
    return event.markets.filter((market) => market.sportsMarketType === 'moneyline')
  }, [event.markets])

  const odds = useMemo(() => {
    if (moneylineMarkets.length === 0) {
      return {
        homeTeam: { label: '', value: 0 },
        awayTeam: { label: '', value: 0 },
        draw: null,
      }
    }
    if (moneylineMarkets.length === 1) {
      const market = moneylineMarkets[0]
      return {
        homeTeam: { label: market.groupItemTitle || '', value: market.tokenYesBestAsk ? +market.tokenYesBestAsk * 100 : 0 },
        awayTeam: { label: market.groupItemTitle || '', value: market.tokenNoBestAsk ? +market.tokenNoBestAsk * 100 : 0 },
        draw: null,
      }
    }
    // If multiple moneyline markets, try to find draw market
    const drawMarket = moneylineMarkets.find((m) => m.groupItemThreshold === '1')
    const homeMarket = moneylineMarkets.find((m) => m.groupItemThreshold === '0')
    const awayMarket = moneylineMarkets.find((m) => m.groupItemThreshold === '2')

    return {
      homeTeam: { label: homeMarket?.groupItemTitle || '', value: homeMarket?.tokenYesBestAsk ? +homeMarket.tokenYesBestAsk * 100 : 0 },
      awayTeam: { label: awayMarket?.groupItemTitle || '', value: awayMarket?.tokenNoBestAsk ? +awayMarket.tokenNoBestAsk * 100 : 0 },
      draw: drawMarket ? { label: drawMarket.groupItemTitle || 'Draw', value: drawMarket.tokenYesBestAsk ? +drawMarket.tokenYesBestAsk * 100 : 0 } : null,
    }
  }, [moneylineMarkets])

  return (
    <div className="flex flex-col pb-2 w-full">
      <div
        className={cn(
          'w-full h-max relative bg-[#1C1F26] cursor-pointer rounded-xl border border-white/5 overflow-hidden transition-all',
          isExpanded && 'rounded-b-none',
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="z-1 group relative flex flex-col w-full h-max cursor-pointer bg-[#1C1F26] hover:bg-[#252830] p-3 transition-colors">
          <div className="relative flex flex-col w-full">
            {/* Header: Time / Vol / Game View */}
            <div className="w-full flex flex-col gap-3">
              <div className="flex flex-1 justify-between items-center h-8 min-h-8">
                <div className="flex flex-1 items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-5 flex justify-start items-center gap-2.5 whitespace-nowrap rounded-sm bg-[#2C3038] px-1.5">
                      <p className="text-xs text-white font-bold">
                        {live ? (
                          <span className="text-red-500">LIVE</span>
                        ) : (
                          new Date(event.startTime || event.startDate).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        )}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 font-medium whitespace-nowrap">
                      {formatVolume(event.volume)} Vol.
                    </p>
                  </div>
                </div>

                {/* Game View Button */}
                <div className="flex overflow-visible gap-1">
                  <Link
                    to={NAVIGATIONS.prediction.sports.event(event.slug || '')}
                    state={{ event, teams: teams }}
                    className="flex h-8 group gap-1 items-center justify-center rounded-lg pr-2.5 bg-[#2C3038] hover:bg-[#343842] cursor-pointer outline-none transition-colors pl-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="flex items-center">
                      <span className="text-white text-xs font-medium">Game View</span>
                    </span>
                    <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                  </Link>
                </div>
              </div>

              {/* Content: Teams and Buttons */}
              <div className="flex flex-col w-full gap-3">
                <div className="flex w-full gap-3 flex-row max-[490px]:flex-col">
                  {/* Teams Info (Logo + Name + Record) */}
                  <div className="flex justify-between lg:min-w-0 lg:flex-1 lg:shrink-0">
                    <div className="grid grid-cols-[min-content_auto] grid-rows-[24px_24px] gap-x-3 gap-y-3 items-center w-full">
                      {/* Team 1 */}
                      <div className="contents">
                        <div className="relative overflow-hidden size-6 flex items-center justify-center">
                          <Avatar className="w-full h-full rounded-[inherit]">
                            <AvatarImage
                              src={homeTeam?.logo || undefined}
                              alt={homeTeam?.name}
                              className="w-full h-full object-contain"
                            />
                            <AvatarFallback className="w-full h-full bg-[#2C3038] rounded-full flex items-center justify-center text-[10px] font-bold text-gray-300">
                              {homeTeam?.name.slice(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex flex-1 min-w-0 max-w-full gap-1.25 overflow-hidden items-center">
                          <span className="text-xs font-bold line-clamp-1 text-white w-fit whitespace-nowrap">
                            {/* <span className="uppercase mr-1">{odds.homeTeam.label.slice(0, 3)}</span> */}
                            <span className="capitalize text-gray-100">{homeTeam?.name}</span>
                          </span>
                          <span className="text-xs font-normal text-gray-400 whitespace-nowrap">
                            {homeTeam?.record || '0-0'}
                          </span>
                        </div>
                      </div>

                      {/* Team 2 */}
                      <div className="contents">
                        <div className="relative overflow-hidden size-6 flex items-center justify-center">
                          <Avatar className="w-full h-full rounded-[inherit]">
                            <AvatarImage
                              src={awayTeam?.logo || ''}
                              alt={awayTeam?.name}
                              className="w-full h-full object-contain"
                            />
                            <AvatarFallback className="w-full h-full bg-[#2C3038] rounded-full flex items-center justify-center text-[10px] font-bold text-gray-300">
                              {awayTeam?.name.slice(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex flex-1 min-w-0 max-w-full gap-1.25 overflow-hidden items-center">
                          <span className="text-xs font-bold line-clamp-1 text-white w-fit whitespace-nowrap">
                            {/* <span className="uppercase mr-1">{odds.awayTeam.label.slice(0, 3)}</span> */}
                            <span className="capitalize text-gray-100">{awayTeam?.name}</span>
                          </span>
                          <span className="text-xs font-normal text-gray-400 whitespace-nowrap">
                            {awayTeam?.record || '0-0'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Odds Buttons */}
                  <div className="flex flex-1 justify-end max-[490px]:w-full">
                    <div className="flex items-center min-w-0 w-max max-[490px]:w-full gap-2 justify-between">
                      {/* Button 1 */}
                      <span className="w-28.75 max-[490px]:w-full flex-1">
                        <button
                          className="relative w-full h-9.75 rounded shadow-[0px_-5px_0px_0px_rgba(0,0,0,0.2)_inset] hover:translate-y-[2px] active:translate-y-[2px] transition-all text-white font-semibold text-xs uppercase"
                          style={{ backgroundColor: homeTeam?.color || '#C85555' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="flex w-full justify-between px-4 items-center h-full">
                            <span className="opacity-80">{homeTeam?.abbreviation}</span>
                            <span className="text-sm">{odds.homeTeam.value}¢</span>
                          </span>
                        </button>
                      </span>

                      {/* Draw Button */}
                      {odds.draw && (
                        <span className="w-[115px] max-[490px]:w-full flex-1">
                          <button
                            className="relative w-full h-[39px] rounded bg-gray-600 hover:bg-gray-700 shadow-[0px_-5px_0px_0px_rgba(0,0,0,0.2)_inset] hover:translate-y-[2px] active:translate-y-[2px] transition-all text-gray-300 font-semibold text-xs uppercase"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="flex w-full justify-between px-4 items-center h-full">
                              <span className="opacity-80">Draw</span>
                              <span className="text-sm">{odds.draw.value}¢</span>
                            </span>
                          </button>
                        </span>
                      )}

                      {/* Button 2 */}
                      <span className="w-[115px] max-[490px]:w-full flex-1">
                        <button
                          className="relative w-full h-[39px] rounded shadow-[0px_-5px_0px_0px_rgba(0,0,0,0.2)_inset] hover:translate-y-[2px] active:translate-y-[2px] transition-all text-white font-semibold text-xs uppercase"
                          style={{ backgroundColor: awayTeam?.color || '#4A5A6A' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="flex w-full justify-between px-4 items-center h-full">
                            <span className="opacity-80">{odds.awayTeam.label.slice(0, 3)}</span>
                            <span className="text-sm">{odds.awayTeam.value}¢</span>
                          </span>
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="p-2 bg-[#1C1F26] rounded-b-xl border-x border-b border-white/5 -mt-2 pt-6">
            {isExpanded && <div>
              <MarketItemContent market={moneylineMarkets[0]} />
            </div>}
          </div>
        </div>
      </div>
    </div>
  )
}
