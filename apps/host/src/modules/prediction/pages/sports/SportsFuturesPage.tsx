import { SportsFuturesView } from '@/modules/prediction/components/sports/SportsFuturesView.tsx'
import { FuturesNavigationTabs } from '@/modules/prediction/components/sports/FuturesNavigationTabs.tsx'

export const SportsFuturesPage = () => {
  return (
    <div className="flex flex-col text-white">
      <div className="grow xl:pt-2 _hidescrollbar">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{'Futures'}</h1>
            </div>

            <FuturesNavigationTabs />
          </div>

          <div className="min-h-50">
            <SportsFuturesView />
          </div>
        </div>
      </div>
    </div>
  )
}
