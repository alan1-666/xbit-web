import { SearchWalletData } from '@/@generated/gql/graphql-meme2'
import { CopyButton } from '@/components/common/copy-button'
import Text from '@/components/common/Text'
import useHandleLogic from '@/components/futuresDetails/tokenSearchDrawer/hooks/useHandleLogic'
import { useNativeTokenSymbol } from '@/hooks/useActiveChain'
import { formatBalance } from '@/lib/format'
import { formatAddressWallet } from '@/lib/string'
// import { getAvatarFromAddress } from '@/utils/list-coin-helper'
import { SetStateAction, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { generateAvatar } from '@/utils/xbitAvatar/XbitAvatarGenerator.ts'

const AddressCard = ({
  data,
  debounceValue,
  setOpen,
}: {
  data: SearchWalletData
  debounceValue: string
  setOpen: (value: SetStateAction<boolean>) => void
}) => {
  const { t } = useTranslation()
  const { handleRowAddressClick } = useHandleLogic()
  const nativeTokenSymbol = useNativeTokenSymbol()

  const [src, setSrc] = useState('')
  useEffect(() => {
    generateAvatar(data.address).then(setSrc)
  }, [data.address])

  return (
    <div
      className="grid grid-cols-5 flex-1 cursor-pointer"
      onClick={() => {
        handleRowAddressClick({
          address: data.address,
          chainId: data.chainId,
        })

        setOpen(false)
      }}
    >
      <div className="flex gap-1 items-center col-span-2">
        <img data-avatar-type="wallet" src={src} alt="logo" className="size-[36px] block rounded-full mr-2" />
        <div className="flex flex-col h-[32px] justify-center">
          <div className="flex items-center">
            <Text
              text={data.alias === data.address ? formatAddressWallet(data.address) : data.alias}
              className="!text-[14px] !font-[380]"
              highLightText={debounceValue}
              highLightColor="#AB57FF"
            />
            <CopyButton icon="/images/icons/ic-copy2.svg" className="self-center pl-0.5 ml-1" text={data.address} />
          </div>
        </div>
      </div>
      <div className="col-span-3 flex justify-between items-center pr-5">
        <div className="gap-1 flex justify-center items-center">
          <span className="font-[305] text-[11px] text-[#FFFFFF80]">{t('assets.futures.balance')}</span>
          <span className="font-[380] text-[12px] text-[#FFFFFFCC]">
            {formatBalance(Number(data.balance))} {nativeTokenSymbol}
          </span>
        </div>
        <div className="gap-1 flex justify-center items-center">
          <span className="font-[305] text-[11px] text-[#FFFFFF80]">{t('tokenSearchDrawer.Tracked')}</span>
          <span className="font-[380] text-[12px] text-[#FFFFFFCC]">{data?.numTracked ?? '--'}</span>
        </div>
        <div className="gap-1 flex justify-center items-center">
          <span className="font-[305] text-[11px] text-[#FFFFFF80]">{t('tokenSearchDrawer.Renamed')}</span>
          <span className="font-[380] text-[12px] text-[#FFFFFFCC]">{data?.numAlias ?? '--'}</span>
        </div>
      </div>
      {/* <div className="grid grid-cols-4  col-span-3 "></div> */}
    </div>
  )
}

export default AddressCard
