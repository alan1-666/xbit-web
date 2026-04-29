import { HeaderContext } from '@tanstack/react-table'
import { DrawerHeader } from '@components/ui/drawer.tsx'
import { DialogTitle } from '@components/ui/dialog.tsx'
import { IconCheckCircleSolid } from '@components/icon'
import FilterableHead from '@components/walletCopyDetails/FilterableHead.tsx'
import { useTranslation } from 'react-i18next'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@apollo/client'
import { getCopyTradeOrdersFilters } from '@/services/copytrade.service'
import { tradingClient } from '@/lib/gql/apollo-client'
import { ChainIds } from '@/types/enums'
import { get } from 'lodash-es'

type TItem = { label: string; value: string };
export default function AssetFilterHead(props: HeaderContext<any, any> & { id: string }) {
  const { id } = props
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(props.column.getFilterValue() || 'all')
  const { data, loading } = useQuery(getCopyTradeOrdersFilters, {
    variables: {
      input: {
        chainId: ChainIds.Solana,
        copyTradeConfigId: id
      }
    },
    client: tradingClient,
  })
  const [search, setSearch] = useState()
  const [items, setItems] = useState<TItem[]>([
    {
      label: t('walletCopy.filter.all'),
      value: 'all',
    },
  ]);
  useEffect(() => {
    const _items: TItem[] = [
      {
        label: t('walletCopy.filter.all'),
        value: 'all',
      },
    ];
    (get(data, 'getCopyTradeOrdersFilters.uniqueBaseSymbols', []) as { baseSymbol: string }[]).forEach((item) => {
      if (item.baseSymbol) {
        _items.push({
          label: item.baseSymbol,
          value: item.baseSymbol,
        })
      }
    });
    setItems(_items);
  }, [data, search, loading])
  const filteredItems = useMemo(() => {
    if (!search) return items
    return items.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()))
  }, [search, items, data, loading])

  const onSelect = (value: string) => {
    setSelectedItem(value)
    setOpen(false)
    props.column.setFilterValue(value)
  }
  return (
    <FilterableHead tKey="asset" open={open} toggle={() => setOpen(!open)} {...props}>
      <div className="max-h-[80vh] overflow-y-auto no-scrollbar">
        <DrawerHeader className="py-3 px-3.5 flex w-full items-center justify-between">
          <DialogTitle className="text-[calc(18rem/16)] leading-[calc(18rem/16)] app-font-medium mb-0.5 text-[#FFFFFF] flex items-center justify-between w-full">
            {t('walletCopy.filter.asset')}
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setOpen(false)}
              alt=""
            />
          </DialogTitle>
        </DrawerHeader>
        <div className="px-3">
          <div className="mt-[6px] w-full flex items-center justify-between py-[calc(1rem*(13/16))] px-[calc(1rem*(15/16))] bg-[#ECECED14] border-[0.5px] border-solid border-[#ECECED14] rounded-[calc(1rem*(18/16))] text-[calc(1rem*(14/16))]">
            <input
              className="w-full h-full text-[#FFFFFFB2]"
              placeholder={t('walletCopy.searchToken')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img alt="" className="size-[calc(1rem*(18/16))]" src="/images/icons/search-icon.svg" />
          </div>
          <div className="py-3">
            {filteredItems.map((item) => (
              <div
                key={item.value}
                className="py-4 border-b text-[1rem] app-font-medium flex items-center justify-between cursor-pointer"
                onClick={() => onSelect(item.value)}
              >
                <span className="text-[1rem] leading-[1rem]">{item.label}</span>
                {selectedItem === item.value && <IconCheckCircleSolid />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </FilterableHead>
  )
}
