import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'

interface FavoriteStarProps {
  isFavorite?: boolean
  onClick?: () => void
  className?: string
}

const FavoriteStar: React.FC<FavoriteStarProps> = ({ isFavorite = true, onClick, className = '' }) => {
  return (
    <>
      <div
        className={cn('absolute left-0 -top-10 inline-block z-10 cursor-pointer w-14', className)}
        onClick={() =>  onClick?.()}
      >
        <div className="relative bg-[#1e1e1e] border border-[#2e2e2e] p-3 rounded-lg flex items-center justify-center shadow-sm">
          <Star
            className="size-3.5 transition-all duration-200"
            fill={isFavorite ? '#00FFB4' : 'none'}
            stroke={isFavorite ? '#00FFB4' : '#FFFFFF80'}
          />

          <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[#2e2e2e] absolute top-[1px] left-0" />
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[#1e1e1e] relative z-10" />
          </div>
        </div>
      </div>
    </>
  )
}

export default FavoriteStar
