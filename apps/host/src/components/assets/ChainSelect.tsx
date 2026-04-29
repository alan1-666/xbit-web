import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@components/ui/drawer.tsx'
import { ReactNode, useEffect, useState } from 'react'
import { ChainType } from '@/@generated/gql/graphql-trading.ts'
import { BLOCKCHAIN_NAMES, getBlockchainLogo2 } from '@/utils/helpers.ts'
import { ChainIds } from '@/types/enums.ts'
import { useTranslation } from 'react-i18next'
import { IconCheckedCircle } from '@components/icon/IconCheckedCircle.tsx'
import ChainCurrencyIcon from '@components/common/ChainCurrencyIcon.tsx'
import { motion } from 'framer-motion'

type ChainSelect = {
  chainName: string
  chainId: ChainIds
  icon: string
}

const chainOptions: ChainSelect[] = [
  { chainName: ChainType.Solana, chainId: ChainIds.Solana, icon: getBlockchainLogo2(ChainIds.Solana) },
  {
    chainName: ChainType.Evm,
    chainId: ChainIds.Ethereum,
    icon: getBlockchainLogo2(ChainIds.Ethereum),
  },
]

const getChainIcon = (option: ChainSelect | 'all') => {
  if (option === 'all') return undefined
  return option.icon
}

const ChainSelectItem = (props: {
  icon: ReactNode
  name: string
  chain?: string
  selected: boolean
  onClick: () => void
}) => {
  const { icon, name, chain, selected, onClick } = props
  return (
    <div
      className="flex items-center py-3.5 border-b border-[#ECECED14] last:border-b-0 cursor-pointer gap-3"
      onClick={onClick}
    >
      <div>{icon}</div>
      <div className="flex-1">
        <div className="text-[1rem] font-medium">{name}</div>
        <div className="text-[calc(12rem/16)] text-[#FFFFFF80]">{chain}</div>
      </div>
      {selected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <IconCheckedCircle className="size-5" />
        </motion.div>
      )}
    </div>
  )
}

const ChainIcon = (props: { option: ChainSelect }) => {
  const { option } = props
  const icon = getChainIcon(option)
  const chainLogo = getBlockchainLogo2(option.chainId)
  return <ChainCurrencyIcon currencyIcon={icon!} chainIcon="" />
}

type ChainSelectProps = {
  chain: string | undefined
  onChange: (chain: ChainSelect | undefined) => void
}

const ChainSelect = ({ chain, onChange }: ChainSelectProps) => {
  const [open, setOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<'all' | ChainSelect>('all')
  const { t } = useTranslation()
  const icon = getChainIcon(selectedOption)
  const optionText = selectedOption === 'all' ? t('assets.spot.allNetworks') : selectedOption.chainName

  useEffect(() => {
    if (chain) {
      const selected = chainOptions.find((option) => option.chainName === chain)
      if (selected) {
        setSelectedOption(selected)
      } else {
        setSelectedOption('all')
      }
    } else {
      setSelectedOption('all')
    }
  }, [chain])

  const handleSelect = (option: 'all' | ChainSelect) => {
    setSelectedOption(option)
    setOpen(false)
    if (option === 'all') {
      onChange(undefined)
    } else {
      onChange(option)
    }
  }
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div className="flex items-center px-3 gap-1.5 bg-[#ECECED14] rounded-full cursor-pointer text-[calc(13rem/16)] leading-[calc(13rem/16)] h-[26px]">
          {!!icon && <img src={getChainIcon(selectedOption)} alt="" className="size-4 rounded-full" />}
          {optionText}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8.2115 11.045C8.08484 11.045 7.95817 10.9983 7.85817 10.8983L3.8115 6.85167C3.61817 6.65833 3.61817 6.33833 3.8115 6.145C4.00484 5.95167 4.32484 5.95167 4.51817 6.145L8.2115 9.83833L11.9048 6.145C12.0982 5.95167 12.4182 5.95167 12.6115 6.145C12.8048 6.33833 12.8048 6.65833 12.6115 6.85167L8.56484 10.8983C8.46484 10.9983 8.33817 11.045 8.2115 11.045Z"
              fill="white"
              fillOpacity={1}
            />
          </svg>
        </div>
      </DrawerTrigger>
      <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto pb-6 bg-[url('/images/popup-bg.png')] bg-size-[100%_100%] bg-no-repeat">
        <DrawerTitle></DrawerTitle>
        <DrawerHeader className="flex justify-end">
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt=""
          />
        </DrawerHeader>
        <div className="px-3">
          <ChainSelectItem
            icon={
              <div className="size-[30px] bg-[#ECECED1F] rounded-full border-[#ECECED14] border flex justify-center items-center">
                <img src="/images/icons/global.svg" className="size-5" alt="" />
              </div>
            }
            name={t('assets.spot.allNetworks')}
            selected={selectedOption === 'all'}
            onClick={() => handleSelect('all')}
          />
          {chainOptions.map((option) => (
            <ChainSelectItem
              icon={<ChainIcon option={option} />}
              name={option.chainName}
              chain={BLOCKCHAIN_NAMES[option.chainId]}
              selected={selectedOption === option}
              onClick={() => handleSelect(option)}
            />
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default ChainSelect
