interface MarketSectionProps {
  title?: string
  children: React.ReactNode
}

export const MarketSection = ({ title, children }: MarketSectionProps) => {
  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
      {children}
    </div>
  )
}
