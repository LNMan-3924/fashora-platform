import { useState, useEffect, useMemo } from 'react'
import { getProvinces, getWardsByProvince, matchProvince } from '../services/vnLocations'

/**
 * =============================================================================
 * CUSTOM HOOK: useVietnamLocations (Quản lý Dropdown Tỉnh/Thành & Phường/Xã)
 * =============================================================================
 *
 * 1. MỤC ĐÍCH & KIẾN TRÚC:
 * - Áp dụng mô hình "Cascade Dropdown" (Dropdown phụ thuộc): Khi người dùng chọn
 *   Tỉnh/Thành phố, danh sách Phường/Xã sẽ tự động lọc theo đúng tỉnh/thành đó.
 * - Đóng gói toàn bộ logic tải dữ liệu, cache bộ nhớ và khớp tự động để tái sử dụng
 *   ở tất cả các màn hình:
 *   + `Checkout.jsx` (Chọn địa chỉ nhận hàng khi thanh toán)
 *   + `Profile.jsx` (Sổ địa chỉ giao hàng của người dùng)
 *   + `BecomeSellerInfo.jsx` (Địa chỉ đăng ký mở shop của người bán)
 *
 * 2. CÁC TÍNH NĂNG VƯỢT TRỘI:
 * - Tự động so khớp thông minh: Nhận diện tỉnh từ tên hoặc ID đã lưu sẵn từ DB.
 * - Lazy-loading: Chỉ tải phường/xã của tỉnh được chọn, không tải ồ ạt cả nước.
 * - Fallback thông minh: Giữ lại giá trị phường/xã cũ (Saved) nếu dữ liệu trước đó
 *   chưa nằm trong danh mục chuẩn hóa mới, tránh mất mát thông tin của khách hàng.
 *
 * @param {string} selectedCity - Tên hoặc ID tỉnh/thành phố hiện tại đang chọn
 * @param {string} selectedWard - Tên hoặc ID phường/xã hiện tại đang chọn
 * @returns {object} {
 *   provinces,          // Danh sách 34 đối tượng tỉnh thành
 *   wards,              // Danh sách các đối tượng phường xã trực thuộc
 *   isLoadingWards,     // Trạng thái đang tải danh mục phường xã
 *   selectedProvince,   // Đối tượng tỉnh thành đã so khớp thành công
 *   selectedProvinceId, // ID mã tỉnh thành (VD: '01', '79')
 *   provinceOptions,    // Mảng options { value, label } dùng cho thẻ <Select />
 *   wardOptions         // Mảng options { value, label } dùng cho thẻ <Select />
 * }
 */
export function useVietnamLocations(selectedCity = '', selectedWard = '') {
  // Danh sách các tỉnh/thành phố (34 đơn vị hành chính)
  const [provinces, setProvinces] = useState([])

  // Danh sách các phường/xã trực thuộc của tỉnh đang chọn
  const [wards, setWards] = useState([])

  // Trạng thái đang tải danh sách phường/xã từ thư viện
  const [isLoadingWards, setIsLoadingWards] = useState(false)

  // ---------------------------------------------------------------------------
  // BƯỚC 1: Tải danh mục 34 tỉnh/thành khi component được khởi tạo (Mount)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true

    getProvinces()
      .then((list) => {
        // Chỉ cập nhật state nếu component vẫn đang hiển thị trên giao diện
        if (isMounted) setProvinces(list || [])
      })
      .catch((err) => {
        console.error('Error loading province list in useVietnamLocations:', err)
      })

    // Dọn dẹp cờ hiệu khi component unmount
    return () => {
      isMounted = false
    }
  }, [])

  // ---------------------------------------------------------------------------
  // BƯỚC 2: Tự động so khớp Tỉnh/Thành hiện tại từ giá trị `selectedCity` truyền vào
  // Sử dụng thuật toán so khớp 3 cấp độ (ID -> Tên chính xác -> Tên không dấu)
  // ---------------------------------------------------------------------------
  const selectedProvince = matchProvince(selectedCity, provinces)
  const selectedProvinceId = selectedProvince?.idProvince || ''

  // ---------------------------------------------------------------------------
  // BƯỚC 3: Tải danh sách Phường/Xã mỗi khi `selectedProvinceId` thay đổi
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true

    // Nếu người dùng chưa chọn Tỉnh/Thành nào thì không tải gì cả
    if (!selectedProvinceId) {
      return
    }

    getWardsByProvince(selectedProvinceId)
      .then((wList) => {
        if (isMounted) {
          setWards(wList || [])
          setIsLoadingWards(false)
        }
      })
      .catch((err) => {
        console.error('Error loading ward list in useVietnamLocations:', err)
        if (isMounted) {
          setWards([])
          setIsLoadingWards(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [selectedProvinceId])

  // ---------------------------------------------------------------------------
  // BƯỚC 4: Định dạng danh sách Options cho Dropdown Tỉnh/Thành
  // Mỗi option có dạng { value: 'Tên tỉnh', label: 'Tên tỉnh' }
  // ---------------------------------------------------------------------------
  const provinceOptions = provinces.map((p) => ({
    value: p.name,
    label: p.name,
  }))

  // ---------------------------------------------------------------------------
  // BƯỚC 5: Định dạng danh sách Options cho Dropdown Phường/Xã
  // Có cơ chế Fallback thông minh: nếu phường/xã cũ đã lưu từ trước chưa có trong
  // danh mục mới thì tự động chèn thêm vào đầu danh sách với hậu tố "(Saved)".
  // ---------------------------------------------------------------------------
  const wardOptions = useMemo(() => {
    const list = (wards || []).map((w) => ({
      value: w.name,
      label: w.name,
    }))

    const trimmedSelected = selectedWard?.trim().toLowerCase()

    // Nếu giá trị đã chọn không rỗng và chưa nằm trong danh sách mới tải về
    if (trimmedSelected && !list.some((opt) => opt.value.trim().toLowerCase() === trimmedSelected)) {
      list.unshift({
        value: selectedWard,
        label: `${selectedWard} (Saved)`,
      })
    }

    return list
  }, [wards, selectedWard])

  // Trả về toàn bộ dữ liệu và trạng thái cần thiết cho giao diện sử dụng
  return {
    provinces,
    wards,
    isLoadingWards,
    selectedProvince,
    selectedProvinceId,
    provinceOptions,
    wardOptions,
  }
}

export default useVietnamLocations
//AN