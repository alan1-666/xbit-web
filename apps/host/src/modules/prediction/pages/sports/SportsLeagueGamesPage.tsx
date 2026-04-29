import { SportsGamesView } from '@/modules/prediction/components/sports/SportsGamesView.tsx'

export const SportsLeagueGamesPage = () => {
  return (
    <div>
      <SportsGamesView events={[]} isLoading={true} />
    </div>
  )
}
