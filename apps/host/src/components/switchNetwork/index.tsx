import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
} from '@components/ui/drawer.tsx'
import { DialogTitle } from '@components/ui/dialog.tsx'
import { X } from 'lucide-react'
import ItemNetwork from '@components/switchNetwork/ItemNetwork.tsx'

interface Network {
  logoUrl: string
  name: string
}

const SwitchNetwork = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useState<boolean>(false)

  const mock: Network[] = [
    {
      logoUrl: "/images/icons/icon-all-network.svg",
      name: t("assets.switchNetwork.allNetwork")
    },
    {
      logoUrl: "/images/icons/icon-sol.svg",
      name: "Solana"
    },
    {
      logoUrl: "/images/icons/icon-sol.svg",
      name: "Ethereum"
    },
    {
      logoUrl: "/images/icons/icon-sol.svg",
      name: "Base"
    },
    {
      logoUrl: "/images/icons/icon-sol.svg",
      name: "BSC"
    },
    {
      logoUrl: "/images/icons/icon-sol.svg",
      name: "TRON"
    }
  ]
  return (
    <>
      <div onClick={() => setOpen(true)}>
        <div className="p-4 bg-black text-white">Switch</div>
      </div>

      <Drawer
        open={open}
        onOpenChange={(openState) => setOpen(openState)}
      >
        <DrawerContent className="w-full bg-[#232329] max-w-[768px] max-h-[80vh] mx-auto">
          <DrawerHeader>
            <DialogTitle></DialogTitle>
            <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="size-5" onClick={() => setOpen(false)}/>
            </DrawerClose>
          </DrawerHeader>
          <DrawerDescription className="mt-2"></DrawerDescription>
          <DrawerFooter>
            <ul className="flex flex-col gap-2 pb-5">
              {
                mock.map((item, index) => (
                  <li key={index}>
                    <ItemNetwork iconUrl={item.logoUrl} network={item.name} isActive={index === 0} />
                  </li>
                ))
              }
            </ul>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default SwitchNetwork