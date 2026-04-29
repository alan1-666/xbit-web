import { Dispatch, SetStateAction } from 'react'
import NewLoginDrawer from '../auth/NewLoginDrawer'
interface LoginDrawerProps {
  setOpen: Dispatch<SetStateAction<boolean>>
  open: boolean
  tab?: 'crypto' | 'meme'
}

const DialogLoginNewLoginDrawer = (props: LoginDrawerProps) => {
  const { open, setOpen } = props
  return <NewLoginDrawer setOpen={setOpen} open={open} />
}

export default DialogLoginNewLoginDrawer
