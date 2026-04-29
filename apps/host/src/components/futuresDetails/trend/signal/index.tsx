import { cn } from '@/lib/utils.ts'
import { useState } from 'react'
import Filter from './Filter'
import Card from './Card'



type SignalIndexProps = {
  containerClassName?: string
}
const SignalIndex = ({ containerClassName }: SignalIndexProps) => {


  return (
		<div className={cn('', containerClassName)}>
			<Filter/>
			<Card/>
			<Card/>
			<Card/>
			<Card/>
		</div>
	)
}
export default SignalIndex
