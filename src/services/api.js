import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ================= SHOP & BANNERS =================
export const getShopInfo = () => api.get('/shop');
export const getHeroBanner = () => api.get('/heroBanner');
export const getCarouselItems = () => api.get('/carouselItems');

// ================= PRODUCTS =================
export const getProducts = () => api.get('/products');
export const getProductById = (id) => api.get(`/products/${id}`);
export const getProductsByCategory = (category) => {
  if (!category || category === 'ALL') {
    return api.get('/products');
  }
  return api.get(`/products?category=${category}`);
};
export const getProductsByShop = (shopId) => api.get(`/products?shopId=${shopId}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const createOrUpdateShop = (shopData) => api.patch('/shop', shopData);

// ================= USERS & AUTH =================
export const getUsers = () => api.get('/users');
export const getUserById = (id) => api.get(`/users/${id}`);
export const registerUser = (userData) => api.post('/users', userData);
export const updateUser = (userId, data) => api.patch(`/users/${userId}`, data);
export const updateUserRoleToSeller = (userId, shopId) =>
  api.patch(`/users/${userId}`, {
    role: 'seller',
    roles: ['customer', 'seller'],
    shopId,
  });

// ================= CART =================
export const getCart = () => api.get('/cart');
export const addToCart = (item) => api.post('/cart', item);
export const updateCartItem = (id, data) => api.put(`/cart/${id}`, data);
export const removeCartItem = (id) => api.delete(`/cart/${id}`);

// ================= ORDERS =================
export const getOrders = () => api.get('/orders');
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const createOrder = (orderData) => api.post('/orders', orderData);
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}`, { status });

export default api;

/* ==========================================================================
   ADDED FOR FEATURE: SHOP & PRODUCT LISTING
   - Added: getProducts API helper for fetching all catalog products
   ========================================================================== */

/**
 * Lấy thông tin tài khoản người dùng theo ID từ db.json (JSON-Server port 5000)
 */
export const getCurrentUser = async (userId) => {
  try {
    const res = await getUserById(userId)
    return res.data || null
  } catch {
    try {
      const allRes = await getUsers()
      const users = allRes.data || []
      return users.find((u) => u.id === userId) || null
    } catch (error) {
      console.warn('api.js getCurrentUser error:', error)
      return null
    }
  }
}