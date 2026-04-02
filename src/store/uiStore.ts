import { create } from 'zustand';

export type ScreenId =
  | 'guild'
  | 'expedition'
  | 'adventurers'
  | 'facilities'
  | 'craft'
  | 'codex'
  | 'settings';

export interface ActiveModal {
  type: string;
  data?: unknown;
}

interface UIState {
  currentScreen: ScreenId;
  activeModal: ActiveModal | null;
  setScreen: (screen: ScreenId) => void;
  openModal: (type: string, data?: unknown) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentScreen: 'guild',
  activeModal: null,
  setScreen: (screen) => set({ currentScreen: screen }),
  openModal: (type, data) => set({ activeModal: { type, data } }),
  closeModal: () => set({ activeModal: null }),
}));
