import {useGetTotalFollowings} from "@hooks/useGetTotalFollowings.ts";
import {useTranslation} from "react-i18next";
import {useEffect} from "react";
import eventBus from "@/lib/eventBus.ts";
import {REFETCH_WALLETS_FOLLOWING} from "@const/smartMoney.ts";

const TextFollowedWallet = () => {
  const {t} = useTranslation();
  const { data, refetch } = useGetTotalFollowings()

  useEffect(() => {
    eventBus.on(REFETCH_WALLETS_FOLLOWING, () => {
      refetch().catch(console.error)
    })
    return () => {
      eventBus.remove(REFETCH_WALLETS_FOLLOWING);
    }
  }, []);

  return (
    <div className="flex items-baseline gap-2">
      <span className={'text-[14px] leading-[1] font-light'}>
        {`${t("detail.filters.followed")}: ${data?.length ?? 0}`}
      </span>
      <span className="text-[12px] leading-[1] font-light text-[#FFFFFF80]">
        ({t('followingWallet.maxFollowed', { maximum: 100})})
      </span>
    </div>
  );
};

export default TextFollowedWallet;
