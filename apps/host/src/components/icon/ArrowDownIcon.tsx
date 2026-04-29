import { HTMLAttributes } from 'react'

export interface ArrowDownIconProps extends HTMLAttributes<SVGElement> {
  fill?: string
  size?: number
}

export const ArrowDownIcon = ({ fill = '#EFEFEF', size = 15, ...props }: ArrowDownIconProps) => {
  return (
    <svg 
      width={size} 
      height={Math.round(size * 14/15)} 
      viewBox="0 0 15 14" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      {...props}
    >
      <path 
        d="M7.68391 9.66438C7.57307 9.66438 7.46224 9.62354 7.37474 9.53604L3.83391 5.99521C3.66474 5.82604 3.66474 5.54604 3.83391 5.37688C4.00307 5.20771 4.28307 5.20771 4.45224 5.37688L7.68391 8.60854L10.9156 5.37688C11.0847 5.20771 11.3647 5.20771 11.5339 5.37688C11.7031 5.54604 11.7031 5.82604 11.5339 5.99521L7.99307 9.53604C7.90557 9.62354 7.79474 9.66438 7.68391 9.66438Z" 
        fill={fill}
      />
    </svg>
  )
}

export const ArrowDownIcon1 = ({ fill = '#EFEFEF', size = 15, ...props }: ArrowDownIconProps) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M9.53636 6H6.86648H4.46231C4.0509 6 3.8452 6.75891 4.13661 7.20379L6.35651 10.5927C6.7122 11.1358 7.29075 11.1358 7.64645 10.5927L8.49069 9.30389L9.86634 7.20379C10.1535 6.75891 9.94777 6 9.53636 6Z" fill="#B9B9B9"></path>
    </svg>
  )
}