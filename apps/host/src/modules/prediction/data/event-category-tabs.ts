/**
 * Event category tabs - value for URL, tagSlug for API
 * Sorted by display order. Events sorted by startDate.
 */
export interface EventCategoryTab {
  value: string
  label: string
  tagSlug: string
  iconSrc?: string
  /** i18n key for section title when this tab is selected (e.g. "Promises & policies") */
  titleKey?: string
}

export const eventCategoryTabs: EventCategoryTab[] = [
  { value: 'elections', label: 'Elections', tagSlug: 'world-elections', iconSrc: '/images/prediction/icon-election.svg' },
  // { value: 'primaries', label: 'Primaries', tagSlug: 'house-primary' },
  { value: 'macro', label: 'Macro', tagSlug: 'macro-graph', iconSrc: '/images/prediction/icon-macro.svg' },
  // { value: 'sports', label: 'Sports', tagSlug: 'sports', iconSrc: '/images/prediction/icon-sports.svg' },
  {
    value: 'trump',
    label: 'Trump',
    tagSlug: 'trump-presidency',
    iconSrc: '/images/prediction/icon-trump.svg',
    titleKey: 'prediction.electionsPage.promisesAndPolicies',
  },
  // { value: 'fed-rates', label: 'Fed Rates', tagSlug: 'fed-rates', iconSrc: '/images/prediction/icon-fed.svg' },
]

export const getTagSlugByCategoryValue = (value: string): string => {
  const tab = eventCategoryTabs.find((t) => t.value.toLowerCase() === value.toLowerCase())
  return tab?.tagSlug ?? value
}
