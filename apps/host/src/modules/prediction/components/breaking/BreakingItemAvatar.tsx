import { Avatar, AvatarImage } from '@components/ui/avatar.tsx'

export interface BreakingItemAvatarProps {
  image: string | null | undefined
}

export const BreakingItemAvatar = (props: BreakingItemAvatarProps) => {
  const { image } = props
  return (
    <Avatar className="rounded-[10px] mr-2.5 size-9 xl:size-12">
      <AvatarImage src={image || undefined} className="object-cover" />
    </Avatar>
  )
}
