import createFastContext from '@/hooks/createFastContext';

export type TCopyTradeContext = {
  pcMode: boolean;
};

export const initialState: TCopyTradeContext = {
  pcMode: false,
}

export const { FastContextProvider: CopyTradeContextProvider, useFastContextFields: useCopyTradeContextFields } = createFastContext<TCopyTradeContext>(initialState)

