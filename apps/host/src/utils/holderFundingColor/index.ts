import { HolderDto } from '@/@generated/gql/graphql-meme2.ts'

/**
 * mmTop = top repeated funding sources (likely MM)
 * cluster = other repeated funding sources
 */
export type FundingColorGroup = 'mmTop' | 'cluster'

/**
 * Color info for one funding source.
 */
export type FundingColorMeta = {
  source: string
  count: number
  rank: number
  color: string
  group: FundingColorGroup
}

/**
 * Options for building the color map.
 */
export type BuildFundingColorMapOptions = {
  minRepeat?: number // min occurrences to be treated as "repeated"
  topMMCount?: number // how many top sources are tagged as mmTop
  mmColors?: string[] // colors for mmTop
  clusterColors?: string[] // colors for cluster
}

/**
 * Build map: sourceOfFunding -> FundingColorMeta.
 * - Reuses existing colors/groups from existingMap if provided.
 * - Only assigns mmTop/cluster for new sources not in existingMap.
 */
export function buildFundingColorMap(
  holders: Pick<HolderDto, 'sourceOfFunding'>[],
  options: BuildFundingColorMapOptions = {},
  existingMap: Record<string, FundingColorMeta> = {},
): Record<string, FundingColorMeta> {
  const {
    minRepeat = 2, // highlight only if a source appears in >= 2 holders
    topMMCount = 1,
    mmColors = ['#ff003c'],
    clusterColors = [
      '#FF7A00', // Neon Orange
      '#FF9F1A', // Neon Amber Orange
      '#00F0FF', // Neon Cyan
      '#00A8FF', // Bright Electric Blue
      '#7F00FF', // Neon Purple
      '#BC13FE', // Electric Violet
      '#FF00F7', // Hot Neon Pink
      '#FF66FF', // Neon Magenta
      '#F5FF00', // Neon Yellow
      '#00FFD1', // Neon Turquoise
    ],
  } = options

  const effectiveMinRepeat = Math.max(minRepeat, 2)
  const maxClusterGroups = Math.min(9, clusterColors.length)

  const counts: Record<string, number> = {}

  for (const h of holders) {
    const src = (h.sourceOfFunding || '').trim()
    if (!src || src === '--') continue
    counts[src] = (counts[src] || 0) + 1
  }

  const repeatedSources = Object.entries(counts)
    .filter(([, count]) => count >= effectiveMinRepeat)
    .sort((a, b) => b[1] - a[1])

  if (!repeatedSources.length && !Object.keys(existingMap).length) return {}

  // Start from existing map so colors/groups are stable
  const result: Record<string, FundingColorMeta> = { ...existingMap }

  const existingValues = Object.values(existingMap)
  const hasExistingMMTop = existingValues.some((m) => m.group === 'mmTop')
  const existingMMCount = existingValues.filter((m) => m.group === 'mmTop').length
  const existingClusterCount = existingValues.filter((m) => m.group === 'cluster').length

  let mmAssignedThisRun = false
  let clusterAssignedThisRun = 0

  const mmBaseIndex = existingMMCount
  let nextClusterIndex = existingClusterCount

  repeatedSources.forEach(([source, count], index) => {
    const existing = result[source]

    // If this source already has a color/group, just update count/rank and keep color/group
    if (existing) {
      result[source] = {
        ...existing,
        count,
        rank: index + 1,
      }
      return
    }

    // No existing entry -> this is a new repeated source
    // 1) Try to assign mmTop if there is no mmTop yet
    if (!hasExistingMMTop && !mmAssignedThisRun && index < topMMCount) {
      const color = mmColors[mmBaseIndex % mmColors.length]
      result[source] = {
        source,
        count,
        rank: index + 1,
        color,
        group: 'mmTop',
      }
      mmAssignedThisRun = true
      return
    }

    // 2) Otherwise, assign as cluster if we still have cluster slots
    const totalClusterSlotsLeft = maxClusterGroups - existingClusterCount - clusterAssignedThisRun
    if (totalClusterSlotsLeft > 0) {
      const color = clusterColors[nextClusterIndex % clusterColors.length]
      result[source] = {
        source,
        count,
        rank: index + 1,
        color,
        group: 'cluster',
      }
      nextClusterIndex++
      clusterAssignedThisRun++
      return
    }

    // 3) If no slots left, do not highlight this new source
    //    (it will fall back to default color when looked up)
  })

  return result
}

/**
 * Get color for a holder based on its sourceOfFunding.
 */
export function getHolderFundingColor(
  holder: Pick<HolderDto, 'sourceOfFunding'>,
  colorMap: Record<string, FundingColorMeta>,
  fallbackColor: string = '#FBFBFB',
): string {
  const src = (holder.sourceOfFunding || '').trim()
  if (!src || src === '--') return fallbackColor
  return colorMap[src]?.color ?? fallbackColor
}

/**
 * Get a repeat count for a holder's funding source.
 */
export function getHolderFundingCountRepeat(
  holder: Pick<HolderDto, 'sourceOfFunding'>,
  colorMap: Record<string, FundingColorMeta>,
  defaultCount: number = 0,
): number {
  const src = (holder.sourceOfFunding || '').trim()
  if (!src || src === '--') return defaultCount
  return colorMap[src]?.count ?? defaultCount
}
