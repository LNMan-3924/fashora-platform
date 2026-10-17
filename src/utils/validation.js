/**
 * ============================================================================
 * INPUT VALIDATION UTILITIES (Single Source of Truth)
 * Tập hợp các hàm kiểm tra tính hợp lệ dữ liệu đầu vào (Form Validation) dùng chung
 * cho cả phân hệ Checkout (Đặt hàng) và Profile (Hồ sơ & Sổ địa chỉ).
 * ============================================================================
 */

// Regex kiểm tra số điện thoại chuẩn Việt Nam: 10 chữ số, bắt đầu bằng 0 hoặc +84 kết hợp đầu số nhà mạng (3, 5, 7, 8, 9)
export const VIETNAM_PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/

// Regex kiểm tra địa chỉ email tiêu chuẩn
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Loại bỏ khoảng trắng, dấu gạch ngang, dấu chấm trong chuỗi số điện thoại
 */
export const cleanPhoneNumber = (phone) => {
  return String(phone || '').replace(/[\s.-]/g, '')
}

/**
 * Kiểm tra Họ và Tên (Họ tên tài khoản hoặc Tên người nhận hàng)
 */
export const validateFullName = (value, label = 'Full name') => {
  const trimmed = String(value || '').trim()
  if (!trimmed) {
    return `${label} is required.`
  }
  if (trimmed.length < 2) {
    return `${label} must be at least 2 characters.`
  }
  return ''
}

/**
 * Kiểm tra Số điện thoại (Bắt buộc + Định dạng SĐT Việt Nam 10 chữ số)
 */
export const validatePhone = (value, label = 'Phone number') => {
  const trimmed = String(value || '').trim()
  if (!trimmed) {
    return `${label} is required.`
  }
  const clean = cleanPhoneNumber(trimmed)
  if (!VIETNAM_PHONE_REGEX.test(clean)) {
    return 'Please enter a valid Vietnamese phone number (10 digits).'
  }
  return ''
}

/**
 * Kiểm tra Địa chỉ Email (Bắt buộc + Đúng định dạng a@b.c)
 */
export const validateEmail = (value, label = 'Email address') => {
  const trimmed = String(value || '').trim()
  if (!trimmed) {
    return `${label} is required.`
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Please enter a valid email address.'
  }
  return ''
}

/**
 * Kiểm tra Số nhà / Tên đường
 */
export const validateStreet = (value, label = 'Street address') => {
  const trimmed = String(value || '').trim()
  if (!trimmed) {
    return `${label} is required.`
  }
  return ''
}

/**
 * Kiểm tra Phường / Xã
 */
export const validateWard = (value, label = 'Ward') => {
  const trimmed = String(value || '').trim()
  if (!trimmed) {
    return `${label} is required.`
  }
  return ''
}

/**
 * Kiểm tra Quận / Huyện (Tùy chọn theo chuẩn 34 đơn vị hành chính cấp tỉnh mới)
 */
export const validateDistrict = () => {
  // Theo mô hình 2 cấp sau sắp xếp (34 tỉnh thành), cấp Quận/Huyện là tùy chọn
  return ''
}

/**
 * Kiểm tra Tỉnh / Thành phố
 */
export const validateCity = (value, label = 'City / Province') => {
  const trimmed = String(value || '').trim()
  if (!trimmed) {
    return `${label} is required.`
  }
  return ''
}

/**
 * Hàm điều phối kiểm tra tính hợp lệ của từng trường riêng lẻ khi onBlur hoặc onChange
 * Hỗ trợ đồng thời các tên trường của Checkout (fullName, address) và Profile (name, street)
 *
 * @param {string} field - Tên trường cần kiểm tra ('name', 'fullName', 'phone', 'email', 'street', 'address', 'ward', 'district', 'city')
 * @param {any} value - Giá trị người dùng nhập vào ô input
 * @returns {string} Chuỗi thông báo lỗi (nếu có) hoặc chuỗi rỗng '' nếu hợp lệ
 */
export const validateField = (field, value) => {
  switch (field) {
    case 'fullName':
      return validateFullName(value, 'Full name')
    case 'name':
      return validateFullName(value, 'Full name')
    case 'recipientName':
      return validateFullName(value, 'Recipient name')
    case 'phone':
      return validatePhone(value, 'Phone number')
    case 'email':
      return validateEmail(value, 'Email address')
    case 'address':
      return validateStreet(value, 'Street address')
    case 'street':
      return validateStreet(value, 'Street address')
    case 'ward':
      return validateWard(value, 'Ward')
    case 'district':
      return validateDistrict(value, 'District')
    case 'city':
      return validateCity(value, 'City / Province')
    default:
      return ''
  }
}

/**
 * Kiểm tra toàn bộ form Thông tin giao hàng (Shipping Address)
 * Dùng chung cho:
 * 1. Checkout.jsx (trường: fullName, phone, address, ward, district, city)
 * 2. AddressModal.jsx (trường: name, phone, street, ward, district, city)
 *
 * @param {object} formData - Dữ liệu form nhập vào
 * @returns {{ isValid: boolean, errors: object }} Kết quả kiểm tra
 */
export const validateShippingAddress = (formData = {}) => {
  const errors = {}

  // 1. Kiểm tra Tên người nhận (fullName hoặc name)
  const nameField = 'fullName' in formData ? 'fullName' : 'name'
  const nameErr = validateFullName(
    formData[nameField],
    nameField === 'fullName' ? 'Full name' : 'Recipient name'
  )
  if (nameErr) errors[nameField] = nameErr

  // 2. Kiểm tra Số điện thoại
  const phoneErr = validatePhone(formData.phone, 'Phone number')
  if (phoneErr) errors.phone = phoneErr

  // 3. Kiểm tra Địa chỉ đường/số nhà (address hoặc street)
  const streetField = 'address' in formData ? 'address' : 'street'
  const streetErr = validateStreet(formData[streetField], 'Street address')
  if (streetErr) errors[streetField] = streetErr

  // 4. Kiểm tra Phường/Xã
  const wardErr = validateWard(formData.ward, 'Ward')
  if (wardErr) errors.ward = wardErr

  // 5. Kiểm tra Quận/Huyện
  const districtErr = validateDistrict(formData.district, 'District')
  if (districtErr) errors.district = districtErr

  // 6. Kiểm tra Tỉnh/Thành phố
  const cityErr = validateCity(formData.city, 'City / Province')
  if (cityErr) errors.city = cityErr

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Kiểm tra các trường địa chỉ (Street, Ward, District, City)
 * Dùng cho AddressModal (chỉ yêu cầu nhập địa chỉ, không cần tên/sđt)
 *
 * @param {object} formData - { street/address, ward, district, city }
 * @returns {{ isValid: boolean, errors: object }}
 */
export const validateAddressOnly = (formData = {}) => {
  const errors = {}

  // 1. Kiểm tra Địa chỉ đường/số nhà (address hoặc street)
  const streetField = 'address' in formData ? 'address' : 'street'
  const streetErr = validateStreet(formData[streetField], 'Street address')
  if (streetErr) errors[streetField] = streetErr

  // 2. Kiểm tra Phường/Xã
  const wardErr = validateWard(formData.ward, 'Ward')
  if (wardErr) errors.ward = wardErr

  // 3. Kiểm tra Quận/Huyện
  const districtErr = validateDistrict(formData.district, 'District')
  if (districtErr) errors.district = districtErr

  // 4. Kiểm tra Tỉnh/Thành phố
  const cityErr = validateCity(formData.city, 'City / Province')
  if (cityErr) errors.city = cityErr

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Kiểm tra toàn bộ form Thông tin cá nhân Profile (ProfileInlineForm)
 * Kiểm tra 3 trường bắt buộc: Họ tên, Số điện thoại và Email
 *
 * @param {object} formData - { name, phone, email, dob, gender }
 * @returns {{ isValid: boolean, errors: object }} Kết quả kiểm tra
 */
export const validateProfileInfo = (formData = {}) => {
  const errors = {}

  // 1. Họ và tên
  const nameErr = validateFullName(formData.name, 'Full name')
  if (nameErr) errors.name = nameErr

  // 2. Số điện thoại (kèm kiểm tra định dạng chuẩn VN)
  const phoneErr = validatePhone(formData.phone, 'Phone number')
  if (phoneErr) errors.phone = phoneErr

  // 3. Email (kèm kiểm tra cú pháp chuẩn)
  const emailErr = validateEmail(formData.email, 'Email address')
  if (emailErr) errors.email = emailErr

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

