/**
 * profileConstants.js
 * Quản lý các hằng số dữ liệu và hàm tiện ích trích xuất thông tin
 * cho toàn bộ module Profile và đồng bộ sang Checkout.
 * HOÀN TOÀN KHÔNG SỬ DỤNG LOCALSTORAGE (Dữ liệu lấy từ API backend và AuthContext).
 */

// Dữ liệu hồ sơ khách hàng ban đầu (trống)
export const DEFAULT_PROFILE_DATA = {
  name: '',
  phone: '',
  email: '',
  dob: '',
  gender: 'Female',
  avatarUrl: null,
}

// Danh sách địa chỉ giao hàng ban đầu (trống)
export const DEFAULT_SAVED_ADDRESSES = []

/**
 * Trích xuất danh sách địa chỉ giao nhận từ đối tượng user (API backend)
 * @param {object} user - Đối tượng người dùng từ AuthContext / API
 * @returns {Array} Danh sách địa chỉ giao hàng
 */
export function getSavedAddresses(user) {
  if (user && Array.isArray(user.shippingAddresses)) {
    return user.shippingAddresses
  }
  return DEFAULT_SAVED_ADDRESSES
}

/**
 * Trích xuất địa chỉ giao hàng mặc định từ đối tượng user (API backend)
 * @param {object} user - Đối tượng người dùng từ AuthContext / API
 * @returns {object|null} Địa chỉ mặc định hoặc null
 */
export function getDefaultShippingAddress(user) {
  if (!user) return null

  // 1. Ưu tiên địa chỉ có cờ isDefault: true trong sổ địa chỉ shippingAddresses
  if (Array.isArray(user.shippingAddresses) && user.shippingAddresses.length > 0) {
    const def = user.shippingAddresses.find((a) => a.isDefault) || user.shippingAddresses[0]
    if (def) return def
  }

  // 2. Dự phòng lấy từ trường user.address (nếu có khi đăng ký tài khoản)
  if (user.address) {
    return {
      name: user.address.fullName || user.fullName || user.name || '',
      phone: user.address.phone || user.phoneNumber || user.phone || '',
      street: user.address.address || '',
      ward: user.address.ward || '',
      district: user.address.district || '',
      city: user.address.city || '',
      isDefault: true,
    }
  }

  return null
}
