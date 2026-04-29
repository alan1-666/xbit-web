import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import { useRef, useState } from 'react'

const SearchInput = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const handleBlur = () => {
    // Use a timeout to ensure we're checking after any focus changes have settled
    setTimeout(() => {
      if (inputRef.current !== document.activeElement) {
        setIsFocused(false)
      }
    }, 0)
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  return (
    <div className="group">
      <div
        className={cn(
          'flex items-center bg-[#ECECED14] rounded-full backdrop-blur-sm border border-[#ECECED14] transition-all duration-300 p-[5px]',
          isFocused && 'gradient-border',
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <Search className="size-3.5 text-gray-500 mr-1" />
        <input
          onFocus={handleFocus}
          onBlur={handleBlur}
          type="text"
          placeholder="搜索金库名称"
          className="bg-transparent w-full outline-none text-[calc(1rem*(12/16))] text-white placeholder-[#FFFFFF80]
           focus:placeholder-gray-400 transition-colors duration-300 placeholder:text-[calc(1rem*(12/16))] leading-[1.1]"
        />
      </div>
    </div>
  )
}

export default SearchInput
