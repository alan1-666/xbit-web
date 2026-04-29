import React, { memo } from 'react'
import WheelPicker from 'react-simple-wheel-picker'

import './style.css'

interface WheelItem {
  id: string
  value: string
}

interface WheelPickerProps {
  selected: {
    hour: string
    minute: string
  }
  setSelected: (selected: {
    hour: string
    minute: string
  }) => void
}

// Helper function to generate data arrays for hours and minutes
const generateHourData = (): WheelItem[] => {
  const hours: WheelItem[] = []
  for (let i = 0; i <= 24; i++) {
    hours.push({
      id: `hour-${i}`,
      value: `${i}小时`,
    })
  }
  return hours
}

const generateMinuteData = (): WheelItem[] => {
  const minutes: WheelItem[] = []
  for (let i = 0; i < 60; i++) {
    minutes.push({
      id: `minute-${i}`,
      value: `${i.toString().padStart(2, '0')}分钟`,
    })
  }
  return minutes
}

const TimerWithWheelPicker: React.FC<WheelPickerProps> = ({
  selected,
  setSelected
}) => {
  // Generate data for pickers
  const hourData = generateHourData()
  const minuteData = generateMinuteData()

  // Handle vibration with strong throttling
  // const lastVibrationTime = React.useRef<number>(0)
  // const vibrationThreshold = 100

  // const vibrate = (): void => {
  //   const now = Date.now()
  //   if (now - lastVibrationTime.current > vibrationThreshold) {
  //     lastVibrationTime.current = now
  //     if (navigator.vibrate) {
  //       navigator.vibrate(30) // Reduced duration from 50ms to 30ms for gentler vibration
  //     }
  //   }
  // }

  // Handle hour change
  const handleHourChange = (item: WheelItem): void => {
    setSelected({
      ...selected,
      hour: item.id,
    })
    // vibrate()
  }

  // Handle minute change
  const handleMinuteChange = (item: WheelItem): void => {
    setSelected({
      ...selected,
      minute: item.id,
    })
    // vibrate()
  }

  return (
    <div className="flex w-full h-full relative">
      <div className="w-full flex justify-center items-center">
        <div className="flex ">
          {/* Hour picker */}
          <div className="hidden-icon _hidescrollbar relative">
            <WheelPicker
              data={hourData}
              selectedID={selected.hour}
              onChange={(data) => handleHourChange(data as WheelItem)}
              height={300}
              itemHeight={50}
              backgroundColor="transparent"
              color="#6a6a8a"
              activeColor="#ffffff"
              fontSize={16}
              shadowColor="transparent"
              focusColor="transparent"
            />
          </div>

          {/* Minute picker */}
          <div className="ml-2 hidden-icon _hidescrollbar">
            <WheelPicker
              data={minuteData}
              selectedID={selected.minute}
              onChange={(data) => handleMinuteChange(data as WheelItem)}
              // onChange={(data) => {}}
              height={300}
              itemHeight={50}
              backgroundColor="transparent"
              color="#FFFFFFB2"
              activeColor="#ffffff"
              fontSize={16}
              shadowColor="transparent"
              focusColor="transparent"
            />
          </div>

          <div className="absolute top-[128px] left-0 w-full background-item h-[44px]" />
        </div>
      </div>
    </div>
  )
}

export default memo(TimerWithWheelPicker)