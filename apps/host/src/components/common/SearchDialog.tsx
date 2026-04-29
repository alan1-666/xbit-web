import { Dialog, DialogContent, DialogTitle } from '@components/ui/dialog.tsx'
import { useEffect, useState } from 'react'
import useDebounceValue from '@hooks/useDebounceValue.ts'
import { SearchDialogTrigger } from '@components/common/search/SearchDialogTrigger.tsx'
import { SearchDialogHeader } from '@components/common/search/SearchDialogHeader.tsx'
import { PopularSearches } from '@components/common/search/PopularSearches.tsx'
import { SearchHistory } from '@components/common/search/SearchHistory.tsx'
import { SearchResultsList } from '@components/common/search/SearchResultsList.tsx'
import { TrendingList } from '@components/common/search/TrendingList.tsx'
import { cn } from '@/lib/utils.ts'

export const SearchDialog = () => {
  const [value, setValue] = useState<string>('')
  const [open, setOpen] = useState(false)

  const debounceValue = useDebounceValue(value, 500)

  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>(
    JSON.parse(localStorage.getItem('searchHistory') || '[]') as SearchHistory[],
  )

  useEffect(() => {
    setSearchHistory(JSON.parse(localStorage.getItem('searchHistory') || '[]'))
  }, [open])

  const handleClearHistory = () => {
    localStorage.removeItem('searchHistory')
    setSearchHistory([])
  }

  const saveToHistory = (item: SearchHistory) => {
    const newHistory = searchHistory.filter((history) => history.address !== item.address)
    newHistory.unshift(item)
    if (newHistory.length > 40) {
      newHistory.pop()
    }
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))
  }

  const closeDialog = () => {
    setOpen(false)
    setValue('')
  }

  const showTrending = !debounceValue || !value

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <SearchDialogTrigger />
      <DialogContent
        className="max-w-[768px] px-2.5 h-dvh sm:rounded-none border-none flex flex-col"
        showDialogPrimitiveClose={false}
      >
        <img src="/images/home-bg.webp" alt="" className="absolute inset-0 z-[-1] opacity-20" />
        <DialogTitle className="hidden" />
        <SearchDialogHeader value={value} setValue={setValue} closeDialog={closeDialog} open={open} />
        <div id="search-container" className="flex-1 overflow-y-auto no-scrollbar overflow-x-hidden">
          <div className={cn('space-y-6', showTrending ? 'block' : 'hidden')}>
            <PopularSearches saveToHistory={saveToHistory} />
            <SearchHistory
              searchHistory={searchHistory}
              handleClearHistory={handleClearHistory}
              saveToHistory={saveToHistory}
            />
            <TrendingList />
          </div>

          <div className={cn(showTrending ? 'hidden' : 'block')}>
            <SearchResultsList debounceValue={debounceValue} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
