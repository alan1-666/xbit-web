import {ReactNode} from "react";
import {useTranslation} from "react-i18next";

export interface TranslationHeadProps {
  tKey: string,
  children?: ReactNode,
  onClick?: () => void,
}

export default function TranslationHead(props: TranslationHeadProps) {
  const {tKey, children, onClick} = props
  const {t} = useTranslation()
  return (
    <div
      className="text-[calc(11rem/16)] flex items-center text-[#FFFFFF80] cursor-pointer w-max capitalize"
      onClick={onClick}
    >
      {
        children ?? t('walletCopy.' + tKey)
      }
    </div>
  )
}