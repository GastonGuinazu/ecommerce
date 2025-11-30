import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. Definimos cómo se ve un ítem en el carrito
interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  price: number;
  size: string;
  color: string;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
}

// 2. Creamos el "Store" (La caja fuerte)
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.variantId === newItem.variantId);

        if (existingItem) {
          // Ya estaba en el carrito -> Aumentamos cantidad
          set({
            items: currentItems.map((i) =>
              i.variantId === newItem.variantId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          // Es nuevo -> Lo agregamos a la lista
          set({ items: [...currentItems, { ...newItem, quantity: 1 }] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.variantId !== id) });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'shopping-cart', // Nombre de la llave en LocalStorage
    }
  )
);