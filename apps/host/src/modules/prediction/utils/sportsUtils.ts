export function normalizeLeague(league: string): string {
  switch (league) {
    case 'cs2':
      return 'csgo'
    case 'cricnt20c':
      return 'cricpakt20cup'
    default:
      return league
  }
}

export function extractLeagueAndTeams(eventSlug: string) {
  const parts = eventSlug.split('-')
  const league = normalizeLeague(parts[0] || '')
  const home = parts[1] || ''
  const away = parts[2] || ''
  return { league, home, away }
}
