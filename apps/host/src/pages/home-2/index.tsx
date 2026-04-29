import { NewDiscoverHeader } from '@/components/discover/NewDiscoverHeader'
import PredictionDiscover from './PredictionDiscover'
import CryptoDiscover from './CryptoDiscover'
import { useFeatureIsOn } from '@growthbook/growthbook-react'

const HomePage = () => {
  const enablePrediction = useFeatureIsOn('enable_prediction')
  return (
    <div className="relative h-full">
      <div className="-z-10 bg-[url('/images/home-bg.png')] bg-cover h-[212px] w-full"></div>
      <div className="absolute top-0 left-0 right-0 min-h-dvh z-10 space-y-3 py-3 bg-transparent">
        <NewDiscoverHeader />
        {enablePrediction && <PredictionDiscover />}
        <CryptoDiscover />
      </div>
    </div>
  )
}

export default HomePage
