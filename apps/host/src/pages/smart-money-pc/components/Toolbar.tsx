import { memo } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  address: string;
  onAddressChange: (v: string) => void;
  layout: 'card' | 'list';
  onLayoutChange: (v: 'card' | 'list') => void;
};

export const Toolbar = memo(function Toolbar({
  address, onAddressChange, layout, onLayoutChange,
}: Props) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-3 py-3 px-4 sticky top-0 z-10 bg-[var(--alpha-dark-18181B,#18181B)]/85 backdrop-blur">
      <input
        className="h-10 w-[360px] max-w-[60vw] rounded px-3 outline-none border border-white/10 bg-black/30 text-sm"
        placeholder={t('smartMoney.latestTrader.searchAddress')}
        value={address}
        onChange={(e) => onAddressChange(e.target.value.trim())}
      />
      <div className="ml-auto flex items-center gap-2">
        <button
          aria-label="Card layout"
          onClick={() => onLayoutChange('card')}
          className={`h-9 w-9 rounded grid place-items-center border ${layout==='card' ? 'border-[#C8A7FD] bg-white/5' : 'border-white/10 hover:bg-white/5'}`}
        >
          <div className="grid grid-cols-2 gap-0.5 p-1">
            <span className="h-2 w-2 bg-white/70" />
            <span className="h-2 w-2 bg-white/70" />
            <span className="h-2 w-2 bg-white/70" />
            <span className="h-2 w-2 bg-white/70" />
          </div>
        </button>
        <button
          aria-label="List layout"
          onClick={() => onLayoutChange('list')}
          className={`h-9 w-9 rounded grid place-items-center border ${layout==='list' ? 'border-[#C8A7FD] bg-white/5' : 'border-white/10 hover:bg-white/5'}`}
        >
          <div className="flex flex-col gap-[2px] p-1 w-full">
            <span className="h-[2px] bg-white/70" />
            <span className="h-[2px] bg-white/70" />
            <span className="h-[2px] bg-white/70" />
          </div>
        </button>
      </div>
    </div>
  );
});
