import { getAllProvince, getWardsByProvinceId } from 'new-vn-provinces/provinces'

/**
 * =============================================================================
 * SERVICE ĐỊA GIỚI HÀNH CHÍNH VIỆT NAM (vnLocations.js)
 * =============================================================================
 *
 * 1. BỐI CẢNH VÀ QUY CHUẨN ĐỊA LÝ:
 * - Module này quản lý danh mục địa giới hành chính Việt Nam theo chuẩn 34 đơn vị
 *   hành chính cấp tỉnh mới nhất (theo Quyết định 19/2025/QĐ-TTg & Nghị quyết 202/2025/QH15).
 * - Sử dụng thư viện chuyên dụng `new-vn-provinces`.
 * - Tích hợp cơ chế bộ nhớ đệm (In-memory Caching) và tìm kiếm so khớp thông minh (Fuzzy Matching).
 *
 * 2. CÁC TÍNH NĂNG CHÍNH:
 * - Lazy-loading: Chỉ tải danh sách phường/xã khi người dùng thực sự chọn tỉnh tương ứng.
 * - In-memory Cache: Lưu kết quả đã tải vào biến `cachedProvinces` và `cachedWardsMap`,
 *   giúp các lần mở dropdown tiếp theo hiển thị ngay lập tức (0ms delay), không gây giật lag.
 * - Chuẩn hóa tiếng Việt không dấu: Tự động so khớp địa chỉ cũ đã lưu trong database
 *   (ngay cả khi người dùng ghi "TP. Hồ Chí Minh", "Hồ Chí Minh" hay "tp ho chi minh").
 */

// -----------------------------------------------------------------------------
// BỘ NHỚ ĐỆM TRONG RAM (IN-MEMORY CACHE)
// -----------------------------------------------------------------------------
// Lưu danh sách 34 tỉnh/thành đã được sắp xếp bảng chữ cái
let cachedProvinces = null

// Map lưu danh sách phường/xã theo từng mã tỉnh (Key: provinceId, Value: danh sách xã/phường)
const cachedWardsMap = new Map()

/**
 * Chuẩn hóa chuỗi tiếng Việt phục vụ so khớp thông minh
 * 
 * Các bước chuẩn hóa:
 * 1. Tách dấu thanh bằng chuẩn Unicode NFD (ví dụ: 'ế' thành 'ê' + dấu sắc).
 * 2. Dùng biểu thức chính quy xóa toàn bộ dấu phụ (combining diacritical marks).
 * 3. Chuyển toàn bộ thành chữ in thường.
 * 4. Loại bỏ các tiền tố hành chính phổ biến: "thành phố", "tỉnh", "tp.", "phường", "xã", "quận", "huyện".
 * 
 * @param {string} str - Tên địa chỉ gốc (VD: "Thành phố Cần Thơ", "P. Tân Phong")
 * @returns {string} Chuỗi không dấu, không tiền tố hành chính (VD: "can tho", "tan phong")
 */
export const normalizeLocationName = (str = '') => {
  if (!str) return ''
  return String(str)
    .normalize('NFD')                                 // 1. Tách dấu thanh ra khỏi chữ cái gốc
    .replace(/[\u0300-\u036f]/g, '')                 // 2. Xóa sạch các dấu huyền, sắc, hỏi, ngã, nặng
    .toLowerCase()                                    // 3. Đưa toàn bộ về chữ thường
    .replace(/^(thanh pho|tinh|tp\.|tp)\s+/i, '')     // 4. Cắt bỏ tiền tố "thành phố", "tỉnh", "tp."
    .replace(/^(phuong|xa|thi tran|p\.|x\.)\s+/i, '') // 5. Cắt bỏ "phường", "xã", "thị trấn", "p.", "x."
    .replace(/^(quan|huyen|thi xa|q\.|h\.)\s+/i, '')  // 6. Cắt bỏ "quận", "huyện", "thị xã", "q.", "h."
    .trim()                                           // 7. Cắt bỏ khoảng trắng thừa ở hai đầu
}

/**
 * Lấy danh sách 34 tỉnh / thành phố trực thuộc Trung ương
 * 
 * Nguyên lý:
 * - Nếu đã có trong `cachedProvinces`: trả về ngay lập tức không cần đọc thư viện.
 * - Nếu chưa có: gọi `getAllProvince()`, sau đó dùng `localeCompare(..., 'vi')` để sắp xếp
 *   theo đúng thứ tự bảng chữ cái tiếng Việt (A -> Z chuẩn Tiếng Việt).
 * 
 * @returns {Promise<Array<{ idProvince: string, name: string }>>}
 */
export const getProvinces = async () => {
  // 1. Kiểm tra cache trong RAM
  if (cachedProvinces && cachedProvinces.length > 0) {
    return cachedProvinces
  }

  try {
    // 2. Tải từ thư viện new-vn-provinces
    const list = await getAllProvince()

    // 3. Sắp xếp danh sách theo quy chuẩn chữ cái tiếng Việt
    const sorted = [...(list || [])].sort((a, b) =>
      a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
    )

    // 4. Lưu vào bộ nhớ đệm
    cachedProvinces = sorted
    return sorted
  } catch (err) {
    console.error('Error loading province list from new-vn-provinces:', err)
    return cachedProvinces || []
  }
}

/**
 * Lấy danh sách phường / xã trực thuộc của một tỉnh/thành theo idProvince
 * 
 * @param {string} provinceId - Mã định danh tỉnh/thành (VD: '01' cho Hà Nội, '79' cho TP.HCM)
 * @returns {Promise<Array<{ idWard: string, idProvince: string, name: string }>>}
 */
export const getWardsByProvince = async (provinceId) => {
  if (!provinceId) return []

  // 1. Kiểm tra xem tỉnh này đã từng được tải phường/xã vào Map trước đó chưa
  if (cachedWardsMap.has(provinceId)) {
    return cachedWardsMap.get(provinceId)
  }

  try {
    // 2. Tải danh mục phường/xã của tỉnh đó
    const list = await getWardsByProvinceId(provinceId)

    // 3. Sắp xếp danh sách phường/xã theo bảng chữ cái tiếng Việt
    const sorted = [...(list || [])].sort((a, b) =>
      a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
    )

    // 4. Lưu vào Map cache theo key là provinceId
    cachedWardsMap.set(provinceId, sorted)
    return sorted
  } catch (err) {
    console.error(`Error loading ward list for province ${provinceId}:`, err)
    return []
  }
}

/**
 * Tìm tỉnh/thành phù hợp dựa vào tên hoặc ID đã lưu trước đó (So khớp 3 cấp độ)
 * 
 * Chiến lược so khớp:
 * - Cấp độ 1: So khớp chính xác 100% theo ID (VD: '79').
 * - Cấp độ 2: So khớp chính xác 100% theo Tên gốc (VD: 'Thành phố Hồ Chí Minh').
 * - Cấp độ 3: So khớp tương đối qua chuỗi đã chuẩn hóa bỏ dấu và tiền tố
 *   (VD: 'Ho Chi Minh' khớp với 'Thành phố Hồ Chí Minh', 'Ha Noi' khớp với 'Thành phố Hà Nội').
 * 
 * @param {string} textOrId - Giá trị cần tìm (có thể là mã ID hoặc chuỗi tên)
 * @param {Array} provincesList - Danh sách các tỉnh hiện có
 * @returns {object|null} Đối tượng tỉnh/thành tìm thấy hoặc null nếu không khớp
 */
export const matchProvince = (textOrId, provincesList = []) => {
  if (!textOrId || !provincesList.length) return null
  const cleanId = String(textOrId).trim()

  // 1. Tìm chính xác tuyệt đối theo idProvince
  const byId = provincesList.find((p) => p.idProvince === cleanId)
  if (byId) return byId

  // 2. Tìm chính xác theo tên đầy đủ (không phân biệt chữ hoa/thường)
  const byExactName = provincesList.find(
    (p) => p.name.toLowerCase() === cleanId.toLowerCase()
  )
  if (byExactName) return byExactName

  // 3. Tìm tương đối qua tên đã chuẩn hóa tiếng Việt không dấu
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
 * Tìm phường/xã phù hợp dựa vào tên hoặc ID đã lưu (So khớp 3 cấp độ)
 * 
 * @param {string} textOrId - Tên hoặc ID phường/xã cần tìm
 * @param {Array} wardsList - Danh sách phường/xã của tỉnh tương ứng
 * @returns {object|null} Đối tượng phường/xã tìm thấy hoặc null
 */
export const matchWard = (textOrId, wardsList = []) => {
  if (!textOrId || !wardsList.length) return null
  const clean = String(textOrId).trim()

  // 1. Tìm chính xác tuyệt đối theo idWard
  const byId = wardsList.find((w) => w.idWard === clean)
  if (byId) return byId

  // 2. Tìm chính xác theo tên đầy đủ
  const byExactName = wardsList.find(
    (w) => w.name.toLowerCase() === clean.toLowerCase()
  )
  if (byExactName) return byExactName

  // 3. Tìm tương đối qua chuỗi đã chuẩn hóa bỏ dấu
  const normalizedSearch = normalizeLocationName(clean)
  if (!normalizedSearch) return null

  return (
    wardsList.find((w) => {
      const wNorm = normalizeLocationName(w.name)
      return wNorm === normalizedSearch || wNorm.includes(normalizedSearch) || normalizedSearch.includes(wNorm)
    }) || null
  )
}
