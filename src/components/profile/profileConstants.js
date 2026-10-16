/**
 * profileConstants.js
 * Quản lý dữ liệu lưu trữ, các khóa LocalStorage và các hàm tiện ích
 * cho toàn bộ module Profile và đồng bộ thông tin giao hàng sang Checkout.
 */

import { COMMERCE_STORAGE_KEYS } from '../../constants/commerce'

export const PROFILE_STORAGE_KEY = COMMERCE_STORAGE_KEYS.PROFILE_DATA
export const SAVED_ADDRESSES_STORAGE_KEY = COMMERCE_STORAGE_KEYS.SAVED_ADDRESSES
export const DEFAULT_ADDRESS_STORAGE_KEY = COMMERCE_STORAGE_KEYS.DEFAULT_ADDRESS

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
 * Tải thông tin Profile cá nhân từ LocalStorage
 */
export function getProfileData() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (raw) {
      return { ...DEFAULT_PROFILE_DATA, ...JSON.parse(raw) }
    }
  } catch (err) {
    console.warn('Lỗi đọc dữ liệu profile từ localStorage:', err)
  }
  return { ...DEFAULT_PROFILE_DATA }
}

/**
 * Lưu thông tin Profile cá nhân vào LocalStorage
 */
export function saveProfileData(data) {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.warn('Lỗi lưu dữ liệu profile vào localStorage:', err)
  }
}

/**
 * Lấy danh sách địa chỉ giao hàng đã lưu từ LocalStorage
 */
export function getSavedAddresses() {
  try {
    const raw = localStorage.getItem(SAVED_ADDRESSES_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (err) {
    console.warn('Lỗi đọc danh sách địa chỉ từ localStorage:', err)
  }
  return DEFAULT_SAVED_ADDRESSES
}

/**
 * Lưu danh sách địa chỉ vào LocalStorage và cập nhật địa chỉ mặc định
 */
export function saveSavedAddresses(addresses) {
  try {
    localStorage.setItem(SAVED_ADDRESSES_STORAGE_KEY, JSON.stringify(addresses))
    const def = addresses.find((a) => a.isDefault) || addresses[0]
    if (def) {
      localStorage.setItem(DEFAULT_ADDRESS_STORAGE_KEY, JSON.stringify(def))
    } else {
      localStorage.removeItem(DEFAULT_ADDRESS_STORAGE_KEY)
    }
  } catch (err) {
    console.warn('Lỗi lưu danh sách địa chỉ vào localStorage:', err)
  }
}

/**
 * Lấy địa chỉ giao hàng mặc định dùng cho trang Checkout
 */
export function getDefaultShippingAddress() {
  try {
    const raw = localStorage.getItem(DEFAULT_ADDRESS_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
    const list = getSavedAddresses()
    if (Array.isArray(list) && list.length > 0) {
      const def = list.find((a) => a.isDefault) || list[0]
      if (def) return def
    }
  } catch (err) {
    console.warn('Lỗi lấy địa chỉ mặc định:', err)
  }
  return null
}
