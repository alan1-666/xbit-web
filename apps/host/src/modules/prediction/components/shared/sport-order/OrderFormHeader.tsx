import { Event } from '@/@generated/gql/graphql-prediction'
import { TeamModel } from '@/modules/prediction/models/TeamModel.ts'
import { Avatar, AvatarImage } from '@components/ui/avatar.tsx'
import { isDarkColor } from '@/modules/prediction/utils/colorUtils'

interface OrderFormHeaderProps {
  event?: Event | null
  teams?: TeamModel[]
  selectedOutcome: string
  outcomes: string[]
}

export const OrderFormHeader = ({ event, teams, selectedOutcome, outcomes }: OrderFormHeaderProps) => {
  const homeTeam = teams?.[0]
  const awayTeam = teams?.[1]

  const isHomeDark = isDarkColor(homeTeam?.color)
  const isAwayDark = isDarkColor(awayTeam?.color)

  return (
    <div className="flex items-center gap-3 mb-1">
      <div className="flex -space-x-2 shrink-0">
        {homeTeam?.logo && (
          <div className="relative flex items-center justify-center size-8">
            {isHomeDark && (
              <div
                className="absolute -inset-2 rounded-full opacity-60 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 70%)',
                  filter: 'blur(8px)',
                }}
              />
            )}
            <Avatar className="size-8 bg-transparent relative z-10">
              <AvatarImage src={homeTeam.logo} className="object-contain p-0.5" />
            </Avatar>
          </div>
        )}
        {awayTeam?.logo && (
          <div className="relative flex items-center justify-center size-8">
            {isAwayDark && (
              <div
                className="absolute -inset-2 rounded-full opacity-60 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 70%)',
                  filter: 'blur(8px)',
                }}
              />
            )}
            <Avatar className="size-8 bg-transparent relative z-10">
              <AvatarImage src={awayTeam.logo} className="object-contain p-0.5" />
            </Avatar>
          </div>
        )}
      </div>

      <div className="flex flex-col overflow-hidden">
        <h3 className="text-base font-bold leading-tight text-foreground truncate">
          {event?.title || 'Event Prediction'}
        </h3>
        <div className="flex items-center gap-2">
          <span
            className="bg-[#00338D]/20 text-[#60a5fa] px-1.5 py-0.5 rounded text-[11px] font-bold uppercase"
            style={{
              color: selectedOutcome === outcomes[0] ? homeTeam?.color || '#0055D4' : awayTeam?.color || '#0055D4',
              backgroundColor:
                (selectedOutcome === outcomes[0] ? homeTeam?.color || '#00338D' : awayTeam?.color || '#00338D') + '20',
            }}
          >
            {selectedOutcome}
          </span>
        </div>
      </div>
    </div>
  )
}
