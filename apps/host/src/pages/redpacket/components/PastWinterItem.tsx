import { Item } from '@radix-ui/react-select';
import React from 'react'


export const AvatarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M4.5 6.75H3.375C2.87772 6.75 2.40081 6.55246 2.04917 6.20083C1.69754 5.84919 1.5 5.37228 1.5 4.875C1.5 4.37772 1.69754 3.90081 2.04917 3.54917C2.40081 3.19754 2.87772 3 3.375 3H4.5" stroke="#FFD209" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M13.5 6.75H14.625C15.1223 6.75 15.5992 6.55246 15.9508 6.20083C16.3025 5.84919 16.5 5.37228 16.5 4.875C16.5 4.37772 16.3025 3.90081 15.9508 3.54917C15.5992 3.19754 15.1223 3 14.625 3H13.5" stroke="#FFD209" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M3 16.5H15" stroke="#FFD209" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.5 10.995V12.75C7.5 13.1625 7.1475 13.485 6.7725 13.6575C5.8875 14.0625 5.25 15.18 5.25 16.5" stroke="#FFD209" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10.5 10.995V12.75C10.5 13.1625 10.8525 13.485 11.2275 13.6575C12.1125 14.0625 12.75 15.18 12.75 16.5" stroke="#FFD209" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M13.5 1.5H4.5V6.75C4.5 7.94347 4.97411 9.08807 5.81802 9.93198C6.66193 10.7759 7.80653 11.25 9 11.25C10.1935 11.25 11.3381 10.7759 12.182 9.93198C13.0259 9.08807 13.5 7.94347 13.5 6.75V1.5Z" stroke="#FFD209" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
)

export const PastWinterItem = ({ address, date, userId, rank, transactionHash, randomNumber }: 
  { address: string; date: string; userId: string; rank: string; transactionHash: string; randomNumber: string;}) => {

  const handleVerify = () => {
    if (transactionHash) {
      const url = `https://app.hyperliquid.xyz/explorer/tx/${transactionHash}`
      window.open(url, '_blank')
    }
  }

  return (
    <div className="self-stretch px-1.5 py-2 border-b border-white/20 inline-flex justify-between items-center z-0">
    <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
      <div className="inline-flex justify-start items-center gap-1">
        <AvatarIcon />
        <div className="opacity-60 justify-start text-white text-sm font-medium  leading-4">{userId}</div>
      </div> 
      <div className="inline-flex justify-start items-start gap-2">
        <div className="opacity-40 justify-start text-white text-xs font-normal leading-4">{date}</div>
        <div className="justify-start text-yellow-400 text-xs font-normal  leading-4">{String(randomNumber).padStart(2, '0') || '--'}</div>
      </div>
    </div>
    <div className="inline-flex flex-col justify-center items-end gap-1">
      <div className="justify-start text-yellow-400 text-sm font-medium  leading-4">Rank #{rank}</div>
      <div className="inline-flex justify-start items-center gap-1 cursor-pointer" onClick={handleVerify}>
        <div className="opacity-40 justify-start text-white text-xs font-medium ">View TX</div>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M6.18398 7.90074C6.10654 7.90119 6.02977 7.88635 5.95807 7.85709C5.88638 7.82782 5.82117 7.78469 5.76618 7.73019C4.44216 6.40694 4.44216 4.89549 5.76618 3.57224L7.0137 2.32545C7.56862 1.7898 8.31185 1.49341 9.0833 1.50011C9.85475 1.50681 10.5927 1.81607 11.1382 2.36127C11.6837 2.90647 11.9932 3.644 11.9999 4.415C12.0066 5.18601 11.71 5.9288 11.1741 6.48339L10.7563 6.90095C10.6455 7.01092 10.4955 7.07238 10.3393 7.07183C10.1832 7.07128 10.0336 7.00876 9.92361 6.89801C9.81358 6.78727 9.75208 6.63738 9.75263 6.48131C9.75318 6.32525 9.81574 6.1758 9.92655 6.06583L10.3444 5.65416C10.6671 5.32106 10.8459 4.87441 10.8419 4.41072C10.8379 3.94703 10.6515 3.50352 10.3231 3.17601C9.99459 2.8485 9.55038 2.6633 9.08641 2.66041C8.62244 2.65752 8.17595 2.83718 7.84342 3.16057L6.5959 4.40736C5.73088 5.27188 5.73088 6.04231 6.5959 6.90095C6.67654 6.98315 6.73128 7.0872 6.75331 7.20019C6.77534 7.31319 6.76371 7.43016 6.71985 7.53661C6.67599 7.64306 6.60184 7.7343 6.50658 7.79903C6.41133 7.86376 6.29916 7.89912 6.18398 7.90074ZM4.93646 11.5C4.35963 11.4988 3.79586 11.3283 3.31525 11.0095C2.83464 10.6907 2.45839 10.2377 2.23329 9.70696C2.00818 9.17618 1.94416 8.59097 2.04917 8.02411C2.15418 7.45725 2.42359 6.93374 2.82392 6.51868L2.85922 6.48339C2.97003 6.37265 3.12032 6.31043 3.27702 6.31043C3.43373 6.31043 3.58402 6.37265 3.69483 6.48339C3.80563 6.59414 3.86789 6.74434 3.86789 6.90095C3.86789 7.05757 3.80563 7.20777 3.69483 7.31851C3.38299 7.65297 3.21323 8.09534 3.2213 8.55242C3.22937 9.0095 3.41464 9.44561 3.73809 9.76887C4.06153 10.0921 4.49789 10.2773 4.95524 10.2854C5.41259 10.2934 5.85522 10.1238 6.18987 9.8121L7.43739 8.56531C7.76798 8.23449 7.95368 7.78606 7.95368 7.31851C7.95368 6.85096 7.76798 6.40253 7.43739 6.07171C7.34099 5.95921 7.29061 5.81449 7.29633 5.66648C7.30205 5.51846 7.36345 5.37806 7.46825 5.27332C7.57305 5.16858 7.71353 5.10722 7.86163 5.1015C8.00973 5.09578 8.15454 5.14613 8.26711 5.24248C8.8187 5.79391 9.12857 6.54172 9.12857 7.32145C9.12857 8.10118 8.8187 8.84899 8.26711 9.40042L7.01959 10.6472C6.46577 11.1962 5.71649 11.5029 4.93646 11.5Z" fill="white"/>
        </svg>
      </div>
    </div>
  </div>
  )
}

export default PastWinterItem
