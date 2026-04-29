
const PriceOverviewPanel = () => {
  const data = [
    {
      title: '最新价格',
      value: '82,239.12',
    },
    {
      title: '指数价格',
      value: '83,309.12',
    },
    {
      title: '标记价格',
      value: '83,024.34',
    },
  ]

  return (
    <div className="bg-[#ECECED14] m-3 rounded-[6px] p-[10px] flex justify-between items-center">
      {data.map((item) => {
        return (
          <div key={item.title} className="flex flex-col items-center">
            <div className="text-[#FFFFFF80] app-font-medium text-[calc(1rem*(11/16))] underline">{item.title}</div>
            <div className="app-font-medium text-[calc(1rem*(11/16))]">{item.value}</div>
          </div>
        )
      })}
    </div>
  )
}

export default PriceOverviewPanel
