import { HeaderContext } from "@tanstack/react-table";
import { IconSortDown, IconSortUp, IconTimer } from "@components/icon";
import { useTranslation } from "react-i18next";

export default function RecentFollowUpTableHead(props: HeaderContext<any, any>) {
  const { column } = props
  const { t } = useTranslation()
  const currentSort = column.getIsSorted()

  const toggleSort = () => {
    if (!currentSort) {
      column.toggleSorting(true);
    } else if (currentSort === 'desc') {
      column.toggleSorting(false);
    } else if (currentSort === 'asc') {
      column.clearSorting()
    }
  }

  return (
    <div className="text-[calc(11rem/16)] flex items-center text-[#FFFFFF80]">
      <div
        className="flex items-center cursor-pointer"
        onClick={toggleSort}
      >
        <span className="w-max">
          {t('walletCopy.recentFollow')}
        </span>
        <div className="flex flex-col ml-1">
          <IconSortUp currentColor={currentSort === 'asc' ? '#FFFFFF' : '#FFFFFF80'} />
          <IconSortDown currentColor={currentSort === 'desc' ? '#FFFFFF' : '#FFFFFF80'} />
        </div>
      </div>
      {/* <IconTimer className="text-[#B9B9B9] ml-1" /> */}
    </div>
  )
}