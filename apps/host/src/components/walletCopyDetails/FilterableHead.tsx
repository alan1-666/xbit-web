import {IconFilter} from "@components/icon";
import {useTranslation} from "react-i18next";
import {Drawer, DrawerContent, DrawerTrigger} from "@components/ui/drawer.tsx";
import {ReactNode} from "react";

export interface FilterableHeadProps {
  tKey: string,
  children?: ReactNode,
  open: boolean,
  toggle: () => void,
}

export default function FilterableHead(props: FilterableHeadProps) {
  const {tKey, children, open, toggle} = props
  const {t} = useTranslation()
  return (
    <Drawer open={open} onOpenChange={toggle}>
      <DrawerTrigger asChild>
        <div className="flex items-center gap-1">
          <span className="leading-[0.75rem]">
            {t('walletCopy.' + tKey)}
          </span>
          <IconFilter/>
        </div>
      </DrawerTrigger>
      <DrawerContent className="w-full bg-[url('/images/popup-bg.svg')] bg-no-repeat bg-cover max-w-[768px] mx-auto">
        {children}
      </DrawerContent>
    </Drawer>
  )
}