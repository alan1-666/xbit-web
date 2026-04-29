import { TeamModel } from '@/modules/prediction/models/TeamModel.ts'
import { GetTeamInput } from '@/modules/prediction/types'
import { predictionClient } from '@/lib/gql/apollo-client.ts'
import { getTeams, getSportFutureEvents, getSoccerEvents, getSportLiveEvents } from '@/modules/prediction/gql/sports.gql.ts'
import { EventModel } from '@/modules/prediction/models/EventModel.ts'

interface ISportService {
  getTeams(input: GetTeamInput): Promise<TeamModel[]>
  getSportFutureEvents(tagSlug?: string): Promise<EventModel[]>
  getSoccerEvents(tagSlug?: string, tagId?: string): Promise<EventModel[]>
  getSportLiveEvents(offset: number, limit: number): Promise<EventModel[]>
}

class SportsService implements ISportService {
  async getTeams(input: GetTeamInput): Promise<TeamModel[]> {
    const res = await predictionClient.query({
      query: getTeams,
      variables: input,
    })
    return res.data.getTeams.items || []
  }

  async getSportFutureEvents(tagSlug?: string): Promise<EventModel[]> {
    const res = await predictionClient.query({
      query: getSportFutureEvents,
      variables: { tagSlug },
    })
    return res.data.getSportFutureEvents[0].events || []
  }

  async getSoccerEvents(tagSlug?: string, tagId?: string): Promise<EventModel[]> {
    const res = await predictionClient.query({
      query: getSoccerEvents,
      variables: { tagSlug, tagId },
    })
    return res.data.getSoccerEvents || []
  }

  async getSportLiveEvents(offset: number, limit: number): Promise<EventModel[]> {
    const res = await predictionClient.query({
      query: getSportLiveEvents,
      variables: {
        pagination: {
          offset,
          limit,
        },
      },
    })
    return res.data.getSportLiveEvents.items || []
  }
}

export const sportsService: ISportService = new SportsService()
