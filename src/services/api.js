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
    if (res?.data) return res;
  } catch {
    try {
      const resQuery = await api.get(`/shops?id=${shopId}`);
      if (Array.isArray(resQuery?.data) && resQuery.data.length > 0) {
        return { data: resQuery.data[0] };
      }
    } catch {
      // fallback
    }
  }
  return api.get('/shop');
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
export const getUserByEmail = (email) => api.get('/users', { params: { email } });
export const getUserByPhone = (phoneNumber) => api.get('/users', { params: { phoneNumber } });
export const updateUserRoleToSeller = (userId, shopId) =>
  api.patch(`/users/${userId}`, {
    role: 'seller',
    roles: ['customer', 'seller'],
    shopId,
  });

// ================= ORDERS =================
export const getOrders = (params) => api.get('/orders', { params });
export const getOrdersByUserId = (userId) => api.get('/orders', { params: { userId } });
export const getOrdersByShop = (shopId) => api.get('/orders', { params: { shopId } });
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const createOrder = (orderData) => api.post('/orders', orderData);
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}`, { status });

/**
 * Tra cứu đơn hàng theo ID kỹ thuật hoặc OrderNumber (VD: 'ord_9041_1' hoặc '#SPXVN881002530')
 */
export const fetchOrderByIdOrNumber = async (id) => {
  if (!id) return null;
  try {
    const res = await getOrderById(id);
    if (res?.data) return res.data;
    if (res && res.id) return res;
  } catch {
    // ID kỹ thuật không khớp, tiếp tục thử tra cứu qua orderNumber
  }

  // Ưu tiên truy vấn trực tiếp server-side theo orderNumber thay vì tải toàn bộ orders
  try {
    const rawNumber = String(id).trim();
    const cleanId = rawNumber.replace('#', '').trim();
    const queries = [rawNumber, `#${cleanId}`, cleanId];

    for (const q of queries) {
      const qRes = await api.get('/orders', { params: { orderNumber: q } });
      const foundList = qRes?.data || [];
      if (Array.isArray(foundList) && foundList.length > 0) {
        return foundList[0];
      }
    }
  } catch {
    // Dự phòng tìm kiếm qua danh sách orders nếu query param thất bại
  }

  try {
    const allRes = await getOrders();
    const allOrders = allRes?.data || allRes || [];
    const cleanId = String(id).replace('#', '').trim();
    return (
      allOrders.find(
        (o) =>
          String(o.id) === String(id) ||
          String(o.orderNumber || '').replace('#', '').trim() === cleanId
      ) || null
    );
  } catch (err) {
    console.warn('api.js fetchOrderByIdOrNumber error:', err);
    return null;
  }
};

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
      const qRes = await api.get('/users', { params: { id: userId } });
      const users = qRes?.data || [];
      if (Array.isArray(users) && users.length > 0) {
        return users[0];
      }
      const allRes = await getUsers();
      const allUsers = allRes.data || [];
      return allUsers.find((u) => u.id === userId) || null;
    } catch (error) {
      console.warn('api.js getCurrentUser error:', error);
      return null;
    }
  }
};
