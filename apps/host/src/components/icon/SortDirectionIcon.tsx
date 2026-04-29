import React from 'react'
import { cn } from '@/lib/utils'

export type SortDirection = 'asc' | 'desc' | 'none'

interface SortDirectionIconProps {
  direction: SortDirection
  activeColor?: string
  inactiveColor?: string
  width?: number
  height?: number
  className?: string
}

/**
 * Icon component to display sorting direction (ascending/descending/none)
 * @param {SortDirection} direction - The current sort direction
 * @param {string} activeColor - Color for the active arrow
 * @param {string} inactiveColor - Color for the inactive arrow
 * @param {number} width - Icon width
 * @param {number} height - Icon height
 * @param {string} className - Additional CSS classes
 */
export const SortDirectionIcon: React.FC<SortDirectionIconProps> = ({
  direction = 'none',
  activeColor = '#AB57FF',
  inactiveColor = 'rgba(255, 255, 255, 0.5)',
  width = 14,
  height = 14,
  className,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block', className)}
    >
      {/* Up arrow (asc) */}
      <path
        d="M7.49561 2.71541C7.25607 2.36941 6.74459 2.36941 6.50504 2.71541L4.64271 5.40544C4.36611 5.80497 4.65207 6.35073 5.138 6.35073H8.86266C9.34859 6.35073 9.63454 5.80497 9.35794 5.40544L7.49561 2.71541Z"
        fill={direction === 'asc' ? activeColor : inactiveColor}
      />
      {/* Down arrow (desc) */}
      <path
        d="M7.49561 11.2845C7.25607 11.6305 6.74459 11.6305 6.50504 11.2845L4.64271 8.59446C4.36611 8.19493 4.65207 7.64917 5.138 7.64917H8.86266C9.34859 7.64917 9.63454 8.19493 9.35794 8.59446L7.49561 11.2845Z"
        fill={direction === 'desc' ? activeColor : inactiveColor}
      />
    </svg>
  )
}

export const SortDirectionIconV2: React.FC<SortDirectionIconProps> = ({
  direction = 'none',
  activeColor = '#AB57FF',
  inactiveColor = 'rgba(255, 255, 255, 0.5)',
  width = 7,
  height = 12,
  className,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 7 12"
      fill="none"
      className={cn('inline-block', className)}
    >
      <path
        d="M3.9935 10.795C3.75369 11.1376 3.24631 11.1376 3.0065 10.795L0.663496 7.44785C0.384017 7.0486 0.669645 6.5 1.157 6.5H5.843C6.33035 6.5 6.61598 7.04859 6.3365 7.44785L3.9935 10.795Z"
        fill={direction === 'desc' ? activeColor : inactiveColor}
      />
      <path
        d="M3.9935 1.20501C3.75369 0.862412 3.24631 0.862411 3.0065 1.20501L0.663496 4.55215C0.384017 4.9514 0.669645 5.5 1.157 5.5H5.843C6.33035 5.5 6.61598 4.95141 6.3365 4.55215L3.9935 1.20501Z"
        fill={direction === 'asc' ? activeColor : inactiveColor}
      />
    </svg>
  )
}

export default SortDirectionIcon
