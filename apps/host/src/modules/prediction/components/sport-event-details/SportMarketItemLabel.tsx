import { formatVolume } from '@/lib/format.ts'
import { SportMarketItemRegistration } from '@/modules/prediction/components/sport-event-details/SportMarketItemRegistration.tsx'

export interface SportMarketItemLabelProps {
  type: string
  volume: number
  title?: string
}

const labelsMap: Record<string, string> = {
  moneyline: 'Moneyline',
  spreads: 'Spreads',
  totals: 'Totals',
  first_half_moneyline: '1H Moneyline',
  first_half_spreads: '1H Spreads',
  first_half_totals: '1H Totals',
  both_teams_to_score: 'Both Teams to Score?',
  map_handicap: 'Map Handicap',
  round_handicap_match: 'Round Handicap',
  kill_handicap_match: 'Kill Handicap',
  tower_handicap_match: 'Tower Handicap',
  drake_handicap_match: 'Drake Handicap',
  inhibitor_handicap_match: 'Inhibitor Handicap',
  kill_most_2_way_match: 'Most Kills',
  tower_most_2_way_match: 'Most Towers',
  drake_most_2_way_match: 'Most Drakes',
  nashor_most_2_way_match: 'Most Nashors',
  inhibitor_most_2_way_match: 'Most Inhibitors',
  tennis_set_handicap: 'Set Handicap',
  tennis_set_totals: 'Total Sets',
  tennis_match_totals: 'Total Games',
  tennis_first_set_winner: '1st Set Winner',
  tennis_first_set_totals: '1st Set Total Games',
}

const SportMarketItemLabelImpl = (props: SportMarketItemLabelProps) => {
  const { type, volume, title } = props
  return (
    <div>
      <div className="text-[calc(18rem/16)] font-bold mb-1">{title || labelsMap[type]}</div>
      <div className="text-[calc(13rem/16)] text-white/70 font-normal">
        {formatVolume(volume, { showCurrency: true })} Vol.
      </div>
    </div>
  )
}

export const SportMarketItemLabel = (props: SportMarketItemLabelProps) => {
  return (
    <SportMarketItemRegistration slot="label">
      <SportMarketItemLabelImpl {...props} />
    </SportMarketItemRegistration>
  )
}
