import { PageType } from '@/types/chart'

export type TvChartRef = {
  tvIndictor: () => void
  tvSetting: () => void
}

class ChartRefRegistry {
  private refs: Map<PageType, TvChartRef | null> = new Map()

  setRef(pageType: PageType, ref: TvChartRef | null) {
    this.refs.set(pageType, ref)
  }

  getRef(pageType: PageType): TvChartRef | null {
    return this.refs.get(pageType) || null
  }

  removeRef(pageType: PageType) {
    this.refs.delete(pageType)
  }

  clear() {
    this.refs.clear()
  }
}

export const chartRefRegistry = new ChartRefRegistry()

