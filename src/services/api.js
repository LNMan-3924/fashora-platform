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
export const updateOrderStatus = (id, status, extraData = {}) =>
  api.patch(`/orders/${id}`, { status, ...extraData });

/**
 * Tra cứu đơn hàng theo ID kỹ thuật hoặc OrderNumber (VD: 'ord_9041_1' hoặc '#SPXVN881002530')
 */
export const fetchOrderByIdOrNumber = async (id) => {
  if (!id) return null;
  const rawId = String(id).trim();

  // 1. Thử tìm trực tiếp theo ID khóa chính
  try {
    const res = await getOrderById(rawId);
    const data = res?.data || res;
    if (data?.id) return data;
  } catch {
    // Không tìm thấy theo ID khóa chính, chuyển sang tìm theo orderNumber
  }

  // Chuẩn bị các biến thể không trùng lặp (chỉ tối đa 2 giá trị: có # và không có #)
  const cleanId = rawId.replace(/^#+/, '').trim();
  const searchCandidates = Array.from(new Set([rawId, `#${cleanId}`, cleanId]));

  // 2. Thử truy vấn qua query params theo orderNumber
  try {
    for (const q of searchCandidates) {
      const qRes = await api.get('/orders', { params: { orderNumber: q } });
      const foundList = qRes?.data || [];
      if (Array.isArray(foundList) && foundList.length > 0) {
        return foundList[0];
      }
    }
  } catch {
    // Query param lỗi hoặc timeout, chuyển sang phương án vét cạn
  }

  // 3. Phương án vét cạn cuối cùng: Tải danh sách và tìm trên client
  try {
    const allRes = await getOrders();
    const allOrders = allRes?.data || allRes || [];
    if (!Array.isArray(allOrders)) return null;

    return (
      allOrders.find((o) => {
        const orderIdStr = String(o?.id || '').trim();
        const orderNumClean = String(o?.orderNumber || '').replace(/^#+/, '').trim();
        return orderIdStr === rawId || orderNumClean === cleanId;
      }) || null
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
  // 1. Chặn ngay từ đầu nếu không truyền userId hợp lệ
  if (!userId) return null;

  try {
    // Ưu tiên 1: Lấy trực tiếp theo route chuẩn /users/:id
    const res = await getUserById(userId);
    return res?.data || res || null;
  } catch {
    try {
      // Ưu tiên 2: Fallback qua query params /users?id=...
      const qRes = await api.get('/users', { params: { id: userId } });
      const users = qRes?.data || [];
      if (Array.isArray(users) && users.length > 0) {
        return users[0];
      }

      // Ưu tiên 3: Vét cạn (ép kiểu String để tránh lỗi so sánh chuỗi/số)
      const allRes = await getUsers();
      const allUsers = allRes?.data || allRes || [];
      return (
        allUsers.find((u) => String(u?.id) === String(userId)) || null
      );
    } catch (error) {
      console.warn('api.js getCurrentUser fallback failed:', error);
      return null;
    }
  }
};
