import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ================= SHOP & BANNERS =================
export const getShopInfo = () => api.get('/shop');
export const getShops = () => api.get('/shops');

/**
 * Lấy thông tin chi tiết một Shop theo shopId
 * Ưu tiên tìm trong collection /shops, nếu không có thì fallback về /shop
 */
export const getShopById = async (shopId) => {
  if (!shopId) return api.get('/shop');
  try {
    const res = await api.get(`/shops/${shopId}`);
    if (res?.data && (res.data.id || res.data._id)) return res;
  } catch {
    // continue
  }
  try {
    const resQuery = await api.get(`/shops?id=${shopId}`);
    if (Array.isArray(resQuery?.data) && resQuery.data.length > 0) {
      return { data: resQuery.data[0] };
    }
  } catch {
    // continue
  }
  // Tìm kiếm mở rộng trong danh sách /shops theo slug hoặc ownerId
  try {
    const allShopsRes = await api.get('/shops');
    if (Array.isArray(allShopsRes?.data)) {
      const found = allShopsRes.data.find(
        (s) => s.id === shopId || s.slug === shopId || s.ownerId === shopId
      );
      if (found) return { data: found };
    }
  } catch {
    // continue
  }
  // Chỉ fallback về /shop nếu yêu cầu rõ ràng shop_m_studio
  if (shopId === 'shop_m_studio' || shopId === 'm-studio') {
    return api.get('/shop');
  }
  return { data: null };
};

export const createOrUpdateShop = async (shopData) => {
  try {
    return await api.post('/shops', shopData);
  } catch {
    try {
      return await api.put(`/shops/${shopData.id}`, shopData);
    } catch {
      return await api.patch('/shops/' + shopData.id, shopData);
    }
  }
};

export const updateShop = (shopId, patchData) => api.patch(`/shops/${shopId}`, patchData);

export const updateShopStatus = async (shopId, status) => {
  try {
    return await api.patch(`/shops/${shopId}`, { status });
  } catch (err) {
    console.warn('API updateShopStatus patch error:', err);
    throw err;
  }
};

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
export const patchProduct = (id, data) => api.patch(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

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

/**
 * Lấy thông tin tài khoản người dùng theo ID từ db.json (JSON-Server port 5000)
 */
export const getCurrentUser = async (userId) => {
  try {
    const res = await getUserById(userId);
    return res.data || null;
  } catch {
    try {
      const allRes = await getUsers();
      const users = allRes.data || [];
      return users.find((u) => u.id === userId) || null;
    } catch (error) {
      console.warn('api.js getCurrentUser error:', error);
      return null;
    }
  }
};
