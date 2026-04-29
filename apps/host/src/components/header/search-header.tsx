import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Search } from 'lucide-react'

const SearchHeader = () => {
  const [open, setOpen] = useState<boolean>(false)
  const [value, setValue] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const onChangeValue = (e: any) => {
    const value = e.target.value
    setValue(value)
  }

  // Keep input focused when popover opens
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <>
      <div className="hidden md:block min-w-[296px]">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="flex items-center px-3 rounded-md shadow border">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                ref={inputRef}
                value={value}
                onChange={onChangeValue}
                placeholder="Search token/contract/wallet"
                type="input"
                className="focus-visible:shadow-[none] border-none shadow-none w-full px-2 rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground placeholder:text-xs"
              />
              <div className="bg-[#E4E4E4] rounded-md text-xs py-0.5 px-1 font-light text-[#9CA1AE]">⌘K</div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="min-w-[296px]">
            <div>
              <p className="text-sm">Trending 24h</p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="block md:hidden">
        <Search className="mr-2 h-5 w-5 shrink-0" />
      </div>
    </>
  )
}

export default SearchHeader
