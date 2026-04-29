import { create } from "zustand";

type WalletManagerState = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

export const useWalletManager = create<WalletManagerState>((set) => ({
  open: false,
  setOpen: (v) => set({ open: v }),
}));
