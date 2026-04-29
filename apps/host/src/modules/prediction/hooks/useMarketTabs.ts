import { useMemo, useState, useEffect } from 'react'
import { Event } from '@/@generated/gql/graphql-prediction'

export const PLAYER_PROPS_TYPES = ['points', 'assists', 'rebounds', 'threes', 'double_doubles', 'blocks', 'steals']

const MARKET_GROUPS = [
  {
    id: 'game_lines',
    label: 'Game Lines',
    types: [
      'moneyline',
      'spreads',
      'totals',
      'both_teams_to_score',
      'map_winner',
      'map_handicap',
      'round_handicap_match',
      'round_over_under_match',
    ],
  },
  {
    id: '1st_half',
    label: '1st Half',
    types: ['first_half_moneyline', 'first_half_spreads', 'first_half_totals'],
  },
  {
    id: 'points',
    label: 'Points',
    types: ['points', 'player_points_over_under'],
  },
  {
    id: 'assists',
    label: 'Assists',
    types: ['assists', 'player_assists_over_under'],
  },
  {
    id: 'rebounds',
    label: 'Rebounds',
    types: ['rebounds', 'player_rebounds_over_under'],
  },
  {
    id: 'series_handicap',
    label: 'Series Hcp', // For esports
    types: [
      'round_handicap_match',
      'kill_handicap_match',
      'tower_handicap_match',
      'drake_handicap_match',
      'inhibitor_handicap_match',
    ],
  },
  {
    id: 'series_objectives',
    label: 'Objectives', // For esports
    types: [
      'kill_most_2_way_match',
      'tower_most_2_way_match',
      'drake_most_2_way_match',
      'nashor_most_2_way_match',
      'inhibitor_most_2_way_match',
    ],
  },
  {
    id: '1st_set',
    label: '1st Set',
    types: ['tennis_first_set_winner', 'tennis_first_set_totals'],
  },
  {
    id: 'sets',
    label: 'Sets',
    types: ['tennis_set_handicap', 'tennis_set_totals'],
  },
  {
    id: 'match_totals',
    label: 'Match Totals',
    types: ['tennis_match_totals'],
  },
]

export const useMarketTabs = (event: Event | undefined) => {
  const [activeTab, setActiveTab] = useState('game_lines')

  const tabs = useMemo(() => {
    if (!event?.markets) return []

    const availableTypes = new Set(event.markets.map((m) => m.sportsMarketType))

    const visibleGroups = MARKET_GROUPS.filter((group) => group.types.some((type) => availableTypes.has(type))).map(
      (group) => ({
        label: group.label,
        value: group.id,
        marketTypes: group.types,
      }),
    )

    return visibleGroups
  }, [event])

  useEffect(() => {
    if (tabs.length > 0) {
      if (!tabs.find((t) => t.value === activeTab)) {
        setActiveTab(tabs[0].value)
      }
    }
  }, [tabs, activeTab])

  return { tabs, activeTab, setActiveTab }
}
