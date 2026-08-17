import { create } from 'zustand';

export type PendingActionType = 'ADD_TO_CART' | 'TOGGLE_WISHLIST' | 'WRITE_REVIEW' | 'CUSTOM';

export interface PendingAction {
  type: PendingActionType;
  payload?: any;
  returnUrl: string;
  timestamp: number;
}

interface PendingActionState {
  pendingAction: PendingAction | null;
  setPendingAction: (action: Omit<PendingAction, 'timestamp'>) => void;
  clearPendingAction: () => void;
  getAndClearPendingAction: () => PendingAction | null;
}

const STORAGE_KEY = 'shopsmart_pending_action';

export const usePendingActionStore = create<PendingActionState>((set, get) => ({
  pendingAction: null,
  setPendingAction: (action) => {
    const fullAction: PendingAction = {
      ...action,
      timestamp: Date.now(),
    };
    set({ pendingAction: fullAction });
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fullAction));
      } catch {
        // Ignore session storage errors
      }
    }
  },
  clearPendingAction: () => {
    set({ pendingAction: null });
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
  },
  getAndClearPendingAction: () => {
    let action = get().pendingAction;
    if (!action && typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as PendingAction;
          // Valid within 15 minutes
          if (Date.now() - parsed.timestamp < 15 * 60 * 1000) {
            action = parsed;
          }
        }
      } catch {
        // Ignore
      }
    }
    get().clearPendingAction();
    return action;
  },
}));
