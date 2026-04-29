import { useState } from 'react'
import { Bolt, ChevronRight } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { useTheme } from '../theme-provider'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useTranslation } from 'react-i18next'
import { authActions } from '@/redux/modules/auth.slice'
import { useAppDispatch } from '@/redux/store'
import { setActiveAccount, walletActions } from '@/redux/modules/wallet.slice'

const LIST_LANG = [
  { label: 'English', value: 'en' },
  { label: '中国人', value: 'zh' },
]

const Setting = () => {
  const [open, setOpen] = useState<boolean>(false)
  const [openLang, setOpenLang] = useState<boolean>(false)
  const { theme, setTheme } = useTheme()
  const dispatch = useAppDispatch()
  const { t, i18n } = useTranslation()
  const onChangeValue = (value: string) => {
    i18n.changeLanguage(value)
  }

  const onClickLoginTG = () => {
    dispatch(
      authActions.loginByTG({
        userId: '01954bfb-ca45-7f96-aa88-e0134810eb60',
        code: '345735ca-923b-4a77-b509-c92f86370f08',
      }),
    ).then((res) => {
      if (res) {
        console.log("res", res)
        dispatch(walletActions.getAccountInfo({}))
      }
    })
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger>
          {/* <Button variant="secondary" className="px-1 py-1 cursor-pointer">
            </Button> */}
          <Bolt className="w-5 h-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[196px]" align="end">
          <DropdownMenuItem>
            <div className="w-full flex justify-between items-center">
              <p className="text-xs">Alert Settings</p>
              <ChevronRight className="w-4 h-4" />
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onClickLoginTG()}>
            <div className="w-full flex justify-between items-center">
              <p className="text-xs">Login TG</p>
              <ChevronRight className="w-4 h-4" />
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
            <div className="w-full flex justify-between items-center">
              <p className="text-xs">Language</p>
              <Select open={openLang} onOpenChange={setOpenLang} value={i18n.language} onValueChange={onChangeValue}>
                <SelectTrigger className="w-[6rem] text-xs h-7" aria-expanded={openLang}>
                  <SelectValue placeholder="Select lang..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {LIST_LANG.map((item, index) => (
                      <SelectItem value={item.value} key={index} className="text-xs">
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
            <div className="w-full flex justify-between items-center">
              <p className="text-xs">Dark mode</p>
              <Switch
                value={theme}
                checked={theme === 'dark'}
                onCheckedChange={(value) => {
                  if (value) {
                    setTheme('dark')
                  } else {
                    setTheme('light')
                  }
                }}
              />
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export default Setting
