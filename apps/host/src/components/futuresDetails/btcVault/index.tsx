import FilterForm from './filter-form'
import VaultItem from './vault-item'

const BtcVault = () => {
  return (
    <div className="px-2 overflow-x-hidden">
      <FilterForm />
      <div className="my-3">
        <div className="flex flex-col gap-2 overflow-y-auto overflow-x-hidden">
          <VaultItem />
          <VaultItem isSpecial />
          <VaultItem />
          <VaultItem />
          <VaultItem />
          <VaultItem />
        </div>
      </div>
    </div>
  )
}

export default BtcVault
