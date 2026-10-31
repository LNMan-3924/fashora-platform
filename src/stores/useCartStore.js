import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],

      // Thêm sản phẩm vào giỏ (cho phép khách vãng lai và người dùng đã đăng nhập)
      addToCart: (product, selectedSize = 'One Size', selectedColor = 'Standard', quantity = 1) => {
        // Hỗ trợ trường hợp truyền vào Axios response object { data: product }
        const raw = product?.data && (product.data.id || product.data.name) ? product.data : product;
        if (!raw) return { success: false, message: 'Invalid product data' };

        const { cartItems } = get();

        // Kiểm tra tồn kho (nếu không có trường stock thì mặc định 99)
        const availableStock = typeof raw?.stock === 'number' ? raw.stock : 99;
        const targetQty = Number(quantity) || 1;
        if (targetQty > availableStock) {
          return {
            success: false,
            message: 'Insufficient stock for this product!',
          };
        }

        const safeId = String(raw.id || 'item_' + Date.now());
        const safeName = raw.name || raw.title || 'ATELIER PIECE';
        const safePrice = Number(raw.price) || 0;
        const safeImages = Array.isArray(raw.images) && raw.images.length > 0
          ? raw.images
          : (raw.image ? [raw.image] : ['/assets/fallback.png']);
        const safeImage = safeImages[0] || raw.image || '/assets/fallback.png';
        const safeCategory = raw.category || 'SET';
        const safeShopName = raw.shopName || raw.shop?.name || 'FASHORA ATELIER';
        const safeShopId = raw.shopId || raw.shop?.id || 'shop_fashora';
        const safeShopSlug = raw.shopSlug || raw.shop?.slug || (safeShopId.replace(/^shop_/, '')) || 'fashora';

        const existingIndex = cartItems.findIndex(
          (item) =>
            item.id === safeId &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
        );

        if (existingIndex > -1) {
          const currentQuantity = cartItems[existingIndex].quantity;

          // Tổng số lượng sau khi thêm không được vượt tồn kho
          if (currentQuantity + targetQty > availableStock) {
            return {
              success: false,
              message: `Only ${availableStock} items remaining in stock!`,
            };
          }

          const updated = cartItems.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: item.quantity + targetQty }
              : item
          );
          set({ cartItems: updated });
          return { success: true };
        } else {
          set({
            cartItems: [
              ...cartItems,
              {
                id: safeId,
                name: safeName,
                price: safePrice,
                image: safeImage,
                images: safeImages,
                category: safeCategory,
                shopId: safeShopId,
                shopName: safeShopName,
                shopSlug: safeShopSlug,
                selectedSize,
                selectedColor,
                quantity: targetQty,
                stock: availableStock,
              },
            ],
          });
          return { success: true };
        }
      },

      // Alias addItem: Tương thích cả 2 kiểu truyền tham số (đơn lẻ hoặc object options)
      addItem: (product, selectedSize, selectedColor, quantity) => {
        if (typeof selectedSize === 'object' && selectedSize !== null) {
          const opts = selectedSize;
          return get().addToCart(
            product,
            opts.selectedSize || opts.size || 'One Size',
            opts.selectedColor || opts.color || 'Standard',
            Number(opts.quantity) || 1
          );
        }
        return get().addToCart(
          product,
          selectedSize || 'One Size',
          selectedColor || 'Standard',
          Number(quantity) || 1
        );
      },

      // Cập nhật số lượng
      updateQuantity: (id, selectedSize, selectedColor, quantity) => {
        const targetQty = Number(quantity);

        // 1. Nếu số lượng <= 0 hoặc không phải là số hợp lệ -> Xóa khỏi giỏ
        if (isNaN(targetQty) || targetQty <= 0) {
          get().removeFromCart(id, selectedSize, selectedColor);
          return;
        }

        // 2. Cập nhật state an toàn qua callback của set
        set((state) => ({
          cartItems: state.cartItems.map((item) => {
            const isTarget =
              item.id === id &&
              item.selectedSize === selectedSize &&
              item.selectedColor === selectedColor;

            if (!isTarget) return item;

            // Đảm bảo có tồn kho dự phòng nếu database thiếu trường stock
            const availableStock = typeof item.stock === 'number' ? item.stock : 99;

            // Kẹp số lượng: tối thiểu là 1, tối đa không vượt quá availableStock
            const validQty = Math.min(targetQty, availableStock);

            return {
              ...item,
              quantity: validQty,
            };
          }),
        }));
      },

      // Xóa sản phẩm khỏi giỏ
      removeFromCart: (id, selectedSize, selectedColor) => {
        set({
          cartItems: get().cartItems.filter((item) => {
            if (!item.id || !id) {
              return !(
                item.selectedSize === selectedSize &&
                item.selectedColor === selectedColor
              );
            }
            return !(
              item.id === id &&
              item.selectedSize === selectedSize &&
              item.selectedColor === selectedColor
            );
          }),
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
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.cartItems)) {
          const validItems = state.cartItems.filter(
            (item) => item && typeof item.name === 'string' && item.name.trim() !== ''
          );

          // Chỉ cập nhật lại nếu phát hiện có item rác bị loại bỏ
          if (validItems.length !== state.cartItems.length) {
            state.cartItems = validItems;
          }
        }
      },
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