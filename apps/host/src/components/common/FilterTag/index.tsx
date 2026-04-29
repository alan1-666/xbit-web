import ButtonTag from '@components/common/buttons/ButtonTag.tsx'
import { useState } from 'react'
import { cn } from '@/lib/utils.ts'

type FilterTagProps = {
  tags: string[],
  defaultSelected?: string,
  onTagClick?: (tag: string) => any,
  className?: string,
}

const FilterTag = ({tags, defaultSelected = tags[0], onTagClick, className}: FilterTagProps) => {
  const [selectedTag, setSelectedTag] = useState(defaultSelected)

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag)
    if (onTagClick) {
      onTagClick(tag)
    }
  }

  return (
    <div className={cn('flex align-middle gap-[6px]', className)}>
      {tags.map(tag => (
        <ButtonTag isActive={selectedTag === tag} key={tag} onClick={() => handleTagClick(tag)}>{tag}</ButtonTag>
      ))}
    </div>
  )
}

export default FilterTag