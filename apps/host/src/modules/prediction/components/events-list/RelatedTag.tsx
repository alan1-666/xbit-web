import { Button } from '@components/ui/button.tsx'
import { cn } from '@/lib/utils.ts'

export interface RelatedTagProps {
  label: string
  slug: string
  isActive: boolean
  onClick: (slug: string) => void
}

export const RelatedTag = ({ label, slug, isActive, onClick }: RelatedTagProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        'h-6 lg:h-7.5 px-2.5 lg:px-3 py-2.5 rounded-md text-[11px] lg:text-xs font-medium leading-tight whitespace-nowrap shrink-0 transition-all duration-200',
        isActive
          ? 'bg-[#332546] text-[#ab70ff] hover:bg-[#332546] hover:text-[#ab70ff]'
          : 'bg-[#212127] text-[#777777] hover:bg-[#332546]/50 hover:text-[#ab70ff]/70',
      )}
      onClick={() => onClick(slug)}
    >
      {label}
    </Button>
  )
}
