import { ChangeEvent } from 'react'

type SearchInputProps = {
  value: string
  placeholder?: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onFocus: () => void
  onBlur: () => void
}

const SearchInput = (props: SearchInputProps) => {
  return (
    <div className="flex items-center bg-[#ECECED0A] rounded-full border border-[#ECECED14] px-[15px] py-[10px]">
      <img src="/images/cryptoDeposit/search.svg" alt="" className="w-[14px] h-[14px]" />
      <input
        type="text"
        value={props.value}
        onChange={props.onChange}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        placeholder={props.placeholder ? props.placeholder : 'Search...'}
        className="w-full px-[5px] text-[14px]"
      />
    </div>
  )
}

export default SearchInput
