import { TeamModel } from '@/modules/prediction/models/TeamModel.ts'
import { isDarkColor } from '@/modules/prediction/utils/colorUtils'

export interface TeamProps {
  team: TeamModel | undefined
}

export const Team = (props: TeamProps) => {
  const { team } = props
  const isDark = isDarkColor(team?.color)

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative size-[60px] flex items-center justify-center"
        style={{ '--team-color': team?.color || 'rgba(255,255,255,0.5)' } as React.CSSProperties}
      >
        {isDark && (
          <div
            className="absolute -inset-6 rounded-full opacity-90 transition-all duration-300 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 70%)',
              filter: 'blur(8px)',
            }}
          />
        )}
        {team?.logo ? (
          <img
            src={team.logo}
            alt={team.name}
            className="relative z-10 w-full h-full object-contain transition-all duration-300"
          />
        ) : (
          <div className="w-full h-full bg-muted rounded-full flex items-center justify-center text-xs font-bold select-none relative z-10">
            {team?.abbreviation?.slice(0, 2) || (team?.name ? team.name.slice(0, 2) : 'NA')}
          </div>
        )}
      </div>
      <div className="flex flex-col items-center text-center">
        <p className="text-sm font-semibold line-clamp-2">{team?.name || 'Unknown Team'}</p>
        <p className="text-xs text-muted-foreground font-medium">{team?.record || ''}</p>
      </div>
    </div>
  )
}
