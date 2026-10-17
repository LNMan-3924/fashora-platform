import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],

      // Thêm sản phẩm vào giỏ (cho phép khách vãng lai và người dùng đã đăng nhập)
      addToCart: (product, selectedSize, selectedColor, quantity = 1) => {

        const { cartItems } = get();

        // Kiểm tra tồn kho
        if (quantity > product.stock) {
          return {
            success: false,
            message: 'Insufficient stock for this product!',
          };
        }

        const existingIndex = cartItems.findIndex(
          (item) =>
            item.id === product.id &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
        );

        if (existingIndex > -1) {
          const currentQuantity = cartItems[existingIndex].quantity;

          // Tổng số lượng sau khi thêm không được vượt tồn kho
          if (currentQuantity + quantity > product.stock) {
            return {
              success: false,
              message: `Only ${product.stock} items remaining in stock!`,
            };
          }

          const updated = cartItems.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
          set({ cartItems: updated });
          return { success: true };
        } else {
          set({
            cartItems: [
              ...cartItems,
              {
                id: product.id,
                name: product.name,
                price: product.price,
                image:
                  (Array.isArray(product.images) && product.images.length > 0
                    ? product.images[0]
                    : null) ||
                  product.image ||
                  '/assets/fallback.png',
                images:
                  Array.isArray(product.images) && product.images.length > 0
                    ? product.images
                    : [product.image || '/assets/fallback.png'],
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
          return { success: true };
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
              item.selectedColor === selectedColor &&
              //(AN)
              quantity <= item.stock
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

      // Xóa danh sách các sản phẩm đã được thanh toán (chỉ xóa những món đã chọn)
      removeItemsFromCart: (itemsToRemove) => {
        // 1. Kiểm tra điều kiện đầu vào
        if (!Array.isArray(itemsToRemove) || itemsToRemove.length === 0) return;

        // 2. Tạo Set chứa các key duy nhất của những món cần xóa
        const removeKeySet = new Set(
          itemsToRemove.map(
            (item) => `${item.id}_${item.selectedSize || 'Standard'}_${item.selectedColor || 'Standard'}`
          )
        );

        // 3. Lọc lại giỏ hàng và cập nhật state
        set((state) => ({
          cartItems: state.cartItems.filter((cartItem) => {
            const key = `${cartItem.id}_${cartItem.selectedSize || 'Standard'}_${cartItem.selectedColor || 'Standard'}`;
            return !removeKeySet.has(key);
          }),
        }));
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


/* ==========================================================================
   ADDED FOR FEATURE: Cart Badge & Quick Add Synchronization Helpers
   Mục đích:
   - Cung cấp các selector và helper hàm lấy tổng số lượng cho Badge giỏ hàng
   - Đảm bảo tương thích với cả getTotalItems, getTotalCount, getItemCount
   - Không can thiệp hay sửa đổi phần code gốc phía trên
   ========================================================================== */

/**
 * Selector lấy trực tiếp mảng cartItems phục vụ reactivity
 */
export const selectCartItems = (state) => state.cartItems;

/**
 * Selector tính tổng số lượng món đồ hiển thị badge (cộng dồn số lượng của từng item)
 */
export const selectTotalCartCount = (state) =>
  (state.cartItems || []).reduce((total, item) => total + (item.quantity || 0), 0);

/**
 * Gán alias trực tiếp vào store prototype để tương thích các component cũ/mới:
 * useCartStore.getState().getTotalCount()
 * useCartStore.getState().getItemCount()
 */
if (typeof useCartStore !== 'undefined' && useCartStore.getState) {
  const currentState = useCartStore.getState();

  // Alias getTotalCount -> trỏ về getTotalItems
  if (!currentState.getTotalCount) {
    useCartStore.setState({
      getTotalCount: () => useCartStore.getState().getTotalItems(),
    });
  }

  // Alias getItemCount -> trỏ về getTotalItems
  if (!currentState.getItemCount) {
    useCartStore.setState({
      getItemCount: () => useCartStore.getState().getTotalItems(),
    });
  }
}