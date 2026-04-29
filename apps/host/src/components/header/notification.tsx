import { Dot } from 'lucide-react'

const Notification = () => {
  return (
    <div className="relative group cursor-pointer">
      <div className="absolute -top-2 -right-2.5">
        <Dot color="#FF353C" />
      </div>
      <img
        src="/images/icons/icon-bell.svg"
        className="size-5 transition-all duration-300 group-hover:scale-110"
        alt=""
      />
    </div>
  )
}

export default Notification
