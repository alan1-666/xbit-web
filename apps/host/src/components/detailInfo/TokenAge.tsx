import { TokenDetail } from '@/@generated/gql/graphql-core'
import dayjs from 'dayjs'
import { useState, useEffect } from 'react'
import { DurationDisplay } from '../common/FormattingDisplay'
import { cn } from '@/lib/utils'

interface TokenAgeProps {
  createdTime: TokenDetail['createdTime']
  className?: string
}

/**
 * TokenAge Component
 *
 * Displays the age of a token since its creation time with live updates every second.
 * The component calculates the difference between the current time and the token's creation time,
 * and formats it using the DurationDisplay component.
 *
 * @param {TokenAgeProps} props - Component props
 * @param {TokenDetail['createdTime']} props.createdTime - The timestamp when the token was created
 * @returns {JSX.Element} A formatted display of the token's age
 */
const TokenAge: React.FC<TokenAgeProps> = ({ createdTime, className }) => {
  const [age, setAge] = useState(dayjs().unix() - dayjs(createdTime).unix())

  useEffect(() => {
    const iv = setInterval(() => {
      const currentAge = dayjs().unix() - dayjs(createdTime).unix()
      setAge(currentAge)
    }, 1000)
    return () => {
      clearInterval(iv)
    }
  }, [createdTime])

  return (
    <DurationDisplay
      value={age}
      className={cn('text-[calc(1rem*(10/16))] text-[#00CE89] leading-[1]', className)}
      allowOverrideStyle={false}
    />
  )
}

export default TokenAge
