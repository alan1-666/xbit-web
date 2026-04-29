import React, { useState } from 'react'

const CategoryFilterBar = () => {
  const categories = ['全部', '新币', 'AI币', '总统币', 'SOL生态', 'TON生态', 'VOL生态']
  const [activeTab, setActiveTab] = useState('全部')

  return (
    <div className="flex justify-between items-center">
      <div className="flex overflow-x-auto w-[92%] _hidescrollbar">
        {categories.map((label) => (
          <button
            key={label}
            onClick={() => setActiveTab(label)}
            className={`text-sm whitespace-nowrap mr-6 transition-all text-[calc(1rem*(12/16))] ${
              activeTab === label ? 'text-[#EFEFEF]' : 'text-[#FFFFFFB2]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="">
        <img
          src="/images/listCoinCrypto/table-of-contents.svg"
          className="cursor-pointer size-5 hover:scale-110 transition-all duration-300"
          alt="icon table contents"
        />
      </div>
    </div>
  )
}

export default CategoryFilterBar
