import { InputGroup, InputGroupAddon, InputGroupInput } from '@components/ui/input-group.tsx'
import { IconSearch } from '@components/icon/stroke/IconSearch.tsx'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations.ts'

interface FormData {
  search: string
}

export const SearchBox = () => {
  const navigate = useNavigate()
  const { handleSubmit, register } = useForm<FormData>({
    defaultValues: {
      search: '',
    },
  })
  const handleSearch = (data: FormData) => {
    const search = data.search.trim()
    if (!search) return
    navigate(NAVIGATIONS.prediction.search(search))
  }

  return (
    <form onSubmit={handleSubmit(handleSearch)}>
      <InputGroup>
        <InputGroupInput placeholder="Search events..." {...register('search')} />
        <InputGroupAddon>
          <IconSearch />
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}
