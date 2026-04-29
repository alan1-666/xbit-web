import {
  Dialog, DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@components/ui/dialog.tsx";
import {Loader2, X} from "lucide-react";
import InputBorderGradient from "@components/orderForm/InputBorderGradient.tsx";
import {Button} from "@components/ui/button.tsx";
import {useEffect, useState} from "react";
import eventBus from "@/lib/eventBus.ts";
import {
  EDITING_ALIAS_HOLDER,
  EDITING_ALIAS_LATEST,
  EDITING_ALIAS_POOL,
  EDITING_ALIAS_TRADES,
  REFETCH_ALIAS_HOLDER,
  REFETCH_ALIAS_LATEST,
  REFETCH_ALIAS_POOL,
  REFETCH_ALIAS_TRADES
} from "@const/tokenDetail.ts";
import {useTranslation} from "react-i18next";
import {futureClient} from "@/lib/gql/apollo-client.ts";
import {addFollowingWallet} from "@services/wallet.service.ts";
// import {ChainType} from "@/@generated/gql/graphql-meme2.ts";
import {toast} from "sonner";
import {useQueryClient} from "@tanstack/react-query";
import {useActiveChain} from "@hooks/useActiveChain.ts";
import {convertToChainType} from "@/utils/chain.ts";
import {ActionAliasType, EditAliasFrom} from "@/types/enums.ts";

type DialogChangeAliasPoolProps = {
  type: EditAliasFrom
}

const handleDialogType = (type: EditAliasFrom, action: ActionAliasType = ActionAliasType.Edit) => {
  switch (type) {
    case EditAliasFrom.POOL:
      return action === ActionAliasType.Edit ? EDITING_ALIAS_POOL : REFETCH_ALIAS_POOL
    case EditAliasFrom.HOLDER:
      return action === ActionAliasType.Edit ? EDITING_ALIAS_HOLDER : REFETCH_ALIAS_HOLDER
    case EditAliasFrom.TRADES:
      return action === ActionAliasType.Edit ? EDITING_ALIAS_TRADES : REFETCH_ALIAS_TRADES
    case EditAliasFrom.LATEST:
      return action === ActionAliasType.Edit ? EDITING_ALIAS_LATEST : REFETCH_ALIAS_LATEST
    default:
      return action === ActionAliasType.Edit ? EDITING_ALIAS_POOL : REFETCH_ALIAS_POOL
  }
}

const DialogChangeAliasPool = ({type = EditAliasFrom.POOL}: DialogChangeAliasPoolProps) => {
  const {t} = useTranslation()
  const typeAction = handleDialogType(type, ActionAliasType.Edit)
  const typeActionRefetch = handleDialogType(type, ActionAliasType.Refetch)
  const queryClient = useQueryClient()
  const activeChain = useActiveChain()
  const chainName = convertToChainType(activeChain)

  const [open, setOpen] = useState(false)
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState<boolean>(false)
  const [alias, setAlias] = useState<string>("")

  const handleResetClick = () => {
    setLoading(false)
    setAlias('')
  }

  const handleConfirmClick = () => {
    setLoading(true)
    console.log({alias})
    futureClient
      .mutate({
        mutation: addFollowingWallet,
        variables: {
          input: {
            chain: chainName,
            follows: [
              {
                address,
                name: alias ? alias.trim() : '',
              },
            ],
          },
        },
      })
      .then(() => {
        queryClient.setQueryData(['totalFollowings', chainName, address], (oldData: any) => {
          if (!oldData) return oldData
          const newData = [...oldData]
          const idx = newData.findIndex((e) => e.address === address)
          if (idx !== -1) {
            newData[idx] = {
              address,
              alias,
            }
          } else {
            newData.push({
              address,
              alias,
            })
          }
          return newData
        })
        toast.success(t('detail.tokenDetail.changeAliasToast'))
        eventBus.dispatch(typeActionRefetch, {data: {address, alias}})
      }).catch(() => {
      toast.error(t('detail.tokenDetail.changeAliasFail'))
      })
      .finally(() => {
        setLoading(false)
        setOpen(false)
      })
  }

  useEffect(() => {
    eventBus.on(typeAction, (data: {data: {address?: string, alias?: string}}) => {
      if (data?.data?.address) {
        setOpen(true)
        setAddress(data?.data?.address)
        if (data?.data?.alias && data?.data?.alias !== '') {
          setAlias(data?.data?.alias)
        } else {
          setAlias(address)
        }
      }
    })
    return () => {
      eventBus.remove(typeAction)
    }
  }, []);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogContent className="w-full bg-[#232329] max-w-[768px] p-4" showDialogPrimitiveClose={false}>
        <DialogHeader>
          <DialogTitle className="mt-1.5">
            <div className="text-[cal c(1rem*(22/16))] leading-[1] app-font-regular text-left">
              {t('detail.tokenDetail.changeAlias')}
            </div>
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="size-5" />
          </DialogClose>
        </DialogHeader>

        <DialogDescription className="flex flex-col gap-3 ">
          <div className="relative flex items-center">
            <div className="flex flex-col flex-1 gap-3">
              <div className="text-[cal c(1rem*(22/16))] leading-[1] app-font-regular text-left">
                {t('detail.tokenDetail.changeAliasDes', { address })}
              </div>
              <InputBorderGradient
                unit=""
                placeHolder={t('detail.tokenDetail.changeAlias')}
                containerClassName="h-[48px] px-[14px] py-[12px] rounded-[8px] flex-1"
                innerBgClassName="rounded-[8px] bg-[#141414]"
                inputClassName="placeholder:text-[#FFFFFF5C] placeholder:text-[calc(1rem*(14/16))] text-[calc(1rem*(14/16))] max-w-[100%] flex-1"
                unitClassName="min-w-[auto] text-[calc(1rem*(14/16))] text-[#FFFFFF99] leading-[1]"
                value={alias}
                onChange={(value) => setAlias(value)}
              />
            </div>

            {alias && (
              <button
                type="button"
                className="absolute right-2 top-1/2  p-1 text-[#fff] hover:text-[#ff4d4f]"
                onClick={() => {setAlias('')}}
                aria-label="Clear"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </DialogDescription>

        <DialogFooter className="pt-0 border-t-[0.5px] border-t-[#ECECED0A]">
          <div className="flex justify-center items-center flex-row gap-2.5 pt-4 flex-1">
            <Button
              size="lg"
              disabled={loading}
              variant="borderGradient"
              className="flex-1 rounded-full h-11"
              onClick={handleResetClick}
            >
              {t('orderForm.buySettings.reset')}
            </Button>

            <Button
              size="lg"
              disabled={loading}
              variant="gradient"
              className="text-[#261236] flex-1 rounded-[50px] h-11"
              onClick={handleConfirmClick}
            >
              {loading && <Loader2 className="animate-spin w-4 h-4 mr-1" />}
              {t('chart.buttons.confirm')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogChangeAliasPool;
