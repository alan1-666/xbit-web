import {useTranslation} from "react-i18next";
import ImportExportFollowingWalletPopup from "@components/monitoring/pc/ImportExportFollowingWalletPopup.tsx";
import {useMemo, useState} from "react";
import {useGetTotalFollowings} from "@hooks/useGetTotalFollowings.ts";
import AddWalletPopup from "@components/monitoring/pc/AddWalletPopup.tsx";

const ButtonsWallets = () => {
  const {t} = useTranslation()
  const { data } = useGetTotalFollowings()
  const listFollowings = useMemo(() => (data?.map(item => item)), [data])
  const [openImportExport, setOpenImportExport] = useState<boolean>(false)
  const [openAddNewFollowing, setOpenAddNewFollowing] = useState<boolean>(false)
  return (
    <>
      <div className="items-center gap-2 flex mr-4">
        <button
          className="h-7 px-3 font-normal text-[13px] text-white/80 bg-[#ECECED14] rounded-md"
          onClick={() => setOpenImportExport(true)}
        >
          {t('followingWallet.import')} / {t('followingWallet.export')}
        </button>
        <button
          className="h-7 px-3 font-normal text-[13px] text-[#C8A7FD] bg-[#3E2761] rounded-md"
          onClick={() => setOpenAddNewFollowing(true)}
        >
          + {t('followingWallet.addWallet')}
        </button>
      </div>
      <ImportExportFollowingWalletPopup open={openImportExport} setOpen={setOpenImportExport} listFollowing={listFollowings} />
      <AddWalletPopup open={openAddNewFollowing} setOpen={setOpenAddNewFollowing} />
    </>

  );
};

export default ButtonsWallets;
