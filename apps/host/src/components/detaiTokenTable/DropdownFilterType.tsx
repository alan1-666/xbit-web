import { useAppDispatch, useAppSelector } from '@/redux/store'
import { selectFromTokenDetailState, setEventType } from '@/redux/modules/tokenDetail.slice.ts'
import { EventType } from '@/@generated/gql/graphql-meme2.ts'
import { TypeFilterDropdown } from '@components/detaiTokenTable/filters/TypeFilterDropdown.tsx'

const DropdownFilterType = () => {
  const dispatch = useAppDispatch()
  const eventType = useAppSelector(selectFromTokenDetailState('eventType'))

  const handleFilterType = (type: EventType | undefined) => {
    dispatch(setEventType(type))
  }
  return <TypeFilterDropdown value={eventType} onChange={handleFilterType} />
}

export default DropdownFilterType
