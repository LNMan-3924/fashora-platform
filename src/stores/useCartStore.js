import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],

      // Thêm sản phẩm vào giỏ (phân biệt rõ ràng theo size và color)
      addToCart: (product, selectedSize, selectedColor, quantity = 1) => {
        const { cartItems } = get();
        const existingIndex = cartItems.findIndex(
          (item) =>
            item.id === product.id &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
        );

        if (existingIndex > -1) {
          const updated = [...cartItems];
          updated[existingIndex].quantity += quantity;
          set({ cartItems: updated });
        } else {
          set({
            cartItems: [
              ...cartItems,
              {
                id: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                image: product.images[0],
                category: product.category,
                shopId: product.shopId,
                shopName: product.shopName,
                selectedSize,
                selectedColor,
                quantity,
                stock: product.stock,
              },
            ],
          });
        }
      },

      // Cập nhật số lượng
      updateQuantity: (id, selectedSize, selectedColor, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id, selectedSize, selectedColor);
          return;
        }
        set({
          cartItems: get().cartItems.map((item) =>
            item.id === id &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
              ? { ...item, quantity }
              : item
          ),
        });
      },

      // Xóa sản phẩm khỏi giỏ
      removeFromCart: (id, selectedSize, selectedColor) => {
        set({
          cartItems: get().cartItems.filter(
            (item) =>
              !(
                item.id === id &&
                item.selectedSize === selectedSize &&
                item.selectedColor === selectedColor
              )
          ),
        });
      },

      // Làm trống giỏ hàng
      clearCart: () => set({ cartItems: [] }),

      // Lấy tổng số lượng món đồ trong giỏ
      getTotalItems: () =>
        get().cartItems.reduce((total, item) => total + item.quantity, 0),

      // Tính tổng tiền đơn hàng (VND)
      getTotalPrice: () =>
        get().cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
    }),
    {
      name: 'fashora-cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);