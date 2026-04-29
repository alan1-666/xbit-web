import { Dialog, DialogContent, DialogHeader } from '@components/ui/dialog.tsx'
import { IconX } from '@components/icon'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { Token } from '@/@generated/gql/graphql-future.ts'
import { getBlockchainLogo2 } from '@/utils/helpers.ts'
import { Trans } from 'react-i18next'
import TxListPC from '@components/monitoring/pc/TxListPC.tsx'
import { useActiveChainType } from '@hooks/useActiveChain.ts'
import { getChainIdFromName } from '@/utils/chain.ts'

type ListActions6HPcProps = {
  open: boolean
  setOpen: (open: boolean) => void
  token?: Token
  txCount?: number
}
const ListActions6HPc = (props: ListActions6HPcProps) => {
  const { open, setOpen, token, txCount } = props
  const activeChain = useActiveChainType()
  const chainId = getChainIdFromName(activeChain)
  const chainLogo = getBlockchainLogo2(chainId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="block w-[640px] !p-0 h-[520px] bg-[#232329] rounded-2xl [&_button.absolute.right-4.top-4]:hidden"
      >
        <DialogHeader className="flex flex-row items-start justify-between border-b border-b-[#ECECED0A] py-4 px-4">
          <div className="flex items-center gap-1.5 mb-0">
            <LogoWithChain
              logo={token?.logo ?? ''}
              chainLogo={chainLogo}
              name={token?.symbol ?? ''}
              logoContainerClassName="rounded-[4.8px]"
              logoClassName="!max-w-[24px] h-[24px] !mb-0 rounded-[4px]"
            />
            <span>{token?.symbol}</span>
          </div>
          <IconX onClick={() => setOpen(false)} className="w-4 h-4 cursor-pointer" />
        </DialogHeader>
        <div className="pr-4 pl-2 pt-4">
          <span className="text-[16px] font-light leading-[1] text-[#A9A9B3] pl-2">
            {/*{t("detail.tokenDetail.recentTrades", { hours: 6, count: txCount })}*/}
            <Trans
              i18nKey="detail.tokenDetail.recentTradesWithStyle"
              components={{ span: <span className="text-[#FBFBFB]" /> }}
              values={{
                hours: 6,
                count: txCount,
              }}
            />
          </span>
          <TxListPC chainId={chainId} open={true} token={token!} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ListActions6HPc
