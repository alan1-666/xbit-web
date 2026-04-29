import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { ALL_SPORTS, POPULAR_ITEMS, NavigationItem } from '../components/sports/layout/SportsNavigationData'

// Helper to find sport by slug
const findSportBySlug = (slug: string): NavigationItem | undefined => {
  // Flatten all items to search
  const allItems: NavigationItem[] = []

  const extractItems = (items: NavigationItem[]) => {
    items.forEach((item) => {
      allItems.push(item)
      if (item.subItems) {
        extractItems(item.subItems)
      }
    })
  }

  extractItems(POPULAR_ITEMS)
  extractItems(ALL_SPORTS)

  return allItems.find((item) => item.link?.includes(`/prediction/sports/${slug}/`))
}

export const useCurrentSport = () => {
    const { slug, tab, eventId } = useParams()

    const isFuturesView = slug === 'futures'
    const actualSlug = isFuturesView ? tab : slug

    const currentSport = useMemo(() => {
        if (!actualSlug) return null
        return findSportBySlug(actualSlug)
    }, [actualSlug])

    // Default to "Live" view if no slug (root /sports) or if slug is explicit 'live'
    // AND ensuring we are NOT on an event details page (where eventId would be present)
    const isLiveView = (!actualSlug || actualSlug === 'live') && !eventId

    const sportName = currentSport?.label || (isFuturesView ? 'Futures' : isLiveView ? 'Live' : 'Sports')
    const SportIcon = currentSport?.icon

    return {
        slug: actualSlug,
        currentSport,
        sportName,
        SportIcon,
        isLiveView,
        isFuturesView
    }
}
