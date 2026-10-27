import { getAllProvince, getWardsByProvinceId } from 'new-vn-provinces/provinces'

/**
 * Service quản lý danh mục địa giới hành chính Việt Nam (chuẩn 34 đơn vị hành chính cấp tỉnh mới).
 * - Sử dụng thư viện new-vn-provinces (theo Quyết định 19/2025/QĐ-TTg & Nghị quyết 202/2025/QH15).
 * - Tối ưu lazy-loading, cache trong bộ nhớ để giao diện chuyển đổi mượt mà, không giật lag.
 */

// Cache bộ nhớ tạm cho danh sách tỉnh/thành và danh sách phường/xã theo tỉnh
let cachedProvinces = null
const cachedWardsMap = new Map()

/**
 * Chuẩn hóa chuỗi tiếng Việt để so khớp (bỏ dấu, chuyển chữ thường, bỏ tiền tố hành chính)
 */
export const normalizeLocationName = (str = '') => {
  if (!str) return ''
  return String(str)
    .normalize('NFD')                     // 1. Tách dấu thanh ra khỏi chữ cái gốc
    .replace(/[\u0300-\u036f]/g, '')     // 2. Xóa sạch các dấu huyền, sắc, hỏi, ngã, nặng
    .toLowerCase()                        // 3. Đưa về chữ thường
    .replace(/^(thanh pho|tinh|tp\.|tp)\s+/i, '')     // 4. Cắt bỏ tiền tố "thành phố", "tỉnh", "tp"
    .replace(/^(phuong|xa|thi tran|p\.|x\.)\s+/i, '') // 5. Cắt bỏ "phường", "xã"
    .replace(/^(quan|huyen|thi xa|q\.|h\.)\s+/i, '')  // 6. Cắt bỏ "quận", "huyện"
    .trim()
}

/**
 * Lấy danh sách 34 tỉnh / thành phố trực thuộc Trung ương
 * @returns {Promise<Array<{ idProvince: string, name: string }>>}
 */
export const getProvinces = async () => {
  if (cachedProvinces && cachedProvinces.length > 0) {
    return cachedProvinces
  }
  try {
    const list = await getAllProvince()
    // Sắp xếp theo tên tiếng Việt
    const sorted = [...(list || [])].sort((a, b) =>
      a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
    )
    cachedProvinces = sorted
    return sorted
  } catch (err) {
    console.error('Error loading province list:', err)
    return cachedProvinces || []
  }
}

/**
 * Lấy danh sách phường / xã trực thuộc của một tỉnh/thành theo idProvince
 * @param {string} provinceId - Mã tỉnh (VD: '01', '79')
 * @returns {Promise<Array<{ idWard: string, idProvince: string, name: string }>>}
 */
export const getWardsByProvince = async (provinceId) => {
  if (!provinceId) return []
  if (cachedWardsMap.has(provinceId)) {
    return cachedWardsMap.get(provinceId)
  }
  try {
    const list = await getWardsByProvinceId(provinceId)
    const sorted = [...(list || [])].sort((a, b) =>
      a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
    )
    cachedWardsMap.set(provinceId, sorted)
    return sorted
  } catch (err) {
    console.error(`Error loading ward list for province ${provinceId}:`, err)
    return []
  }
}

/**
 * Tìm tỉnh/thành phù hợp dựa vào tên hoặc ID đã lưu trước đó
 * @param {string} textOrId - Giá trị tên tỉnh hoặc mã tỉnh
 * @param {Array} provincesList - Danh sách các tỉnh hiện có
 * @returns {object|null}
 */
export const matchProvince = (textOrId, provincesList = []) => {
  if (!textOrId || !provincesList.length) return null
  const cleanId = String(textOrId).trim()

  // 1. Tìm chính xác theo idProvince
  const byId = provincesList.find((p) => p.idProvince === cleanId)
  if (byId) return byId

  // 2. Tìm chính xác theo tên đầy đủ
  const byExactName = provincesList.find(
    (p) => p.name.toLowerCase() === cleanId.toLowerCase()
  )
  if (byExactName) return byExactName

  // 3. Tìm tương đối qua tên đã chuẩn hóa
  const normalizedSearch = normalizeLocationName(cleanId)
  if (!normalizedSearch) return null

  return (
    provincesList.find((p) => {
      const pNorm = normalizeLocationName(p.name)
      return pNorm === normalizedSearch || pNorm.includes(normalizedSearch) || normalizedSearch.includes(pNorm)
    }) || null
  )
}

/**
 * Tìm phường/xã phù hợp dựa vào tên hoặc ID đã lưu
 * @param {string} textOrId - Giá trị tên hoặc ID phường/xã
 * @param {Array} wardsList - Danh sách phường/xã của tỉnh đó
 * @returns {object|null}
 */
export const matchWard = (textOrId, wardsList = []) => {
  if (!textOrId || !wardsList.length) return null
  const clean = String(textOrId).trim()

  // 1. Tìm chính xác theo idWard
  const byId = wardsList.find((w) => w.idWard === clean)
  if (byId) return byId

  // 2. Tìm chính xác theo tên
  const byExactName = wardsList.find(
    (w) => w.name.toLowerCase() === clean.toLowerCase()
  )
  if (byExactName) return byExactName

  // 3. Tìm tương đối qua tên đã chuẩn hóa
  const normalizedSearch = normalizeLocationName(clean)
  if (!normalizedSearch) return null

  return (
    wardsList.find((w) => {
      const wNorm = normalizeLocationName(w.name)
      return wNorm === normalizedSearch || wNorm.includes(normalizedSearch) || normalizedSearch.includes(wNorm)
    }) || null
  )
}

