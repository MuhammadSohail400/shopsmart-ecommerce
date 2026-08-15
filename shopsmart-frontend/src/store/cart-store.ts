import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartState {
  guestCartId: string | null;
  initializeGuestCart: () => string;
  clearGuestCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      guestCartId: null,
      initializeGuestCart: () => {
        const { guestCartId } = get();
        if (guestCartId) return guestCartId;
        
        const newId = crypto.randomUUID();
        set({ guestCartId: newId });
        return newId;
      },
      clearGuestCart: () => set({ guestCartId: null }),
    }),
    {
      name: 'shopsmart-cart-storage',
    }
  )
);
