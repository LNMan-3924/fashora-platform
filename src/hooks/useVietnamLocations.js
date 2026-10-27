import { useState, useEffect, useMemo } from 'react'
import { getProvinces, getWardsByProvince, matchProvince } from '../services/vnLocations'

/**
 * Custom Hook: useVietnamLocations
 * Quản lý danh mục 34 tỉnh/thành phố và phường/xã trực thuộc của Việt Nam.
 * Tái sử dụng logic tải dữ liệu, cache bộ nhớ và khớp tự động cho cả Checkout và Profile.
 *
 * @param {string} selectedCity - Tên hoặc ID tỉnh/thành phố hiện tại
 * @param {string} selectedWard - Tên hoặc ID phường/xã hiện tại
 * @returns {object} { provinces, wards, isLoadingWards, selectedProvince, selectedProvinceId, provinceOptions, wardOptions }
 */
export function useVietnamLocations(selectedCity = '', selectedWard = '') {
  const [provinces, setProvinces] = useState([])
  const [wards, setWards] = useState([])
  const [isLoadingWards, setIsLoadingWards] = useState(false)

  // 1. Tải danh sách 34 tỉnh thành khi mount
  useEffect(() => {
    let isMounted = true
    getProvinces()
      .then((list) => {
        if (isMounted) setProvinces(list || [])
      })
      .catch((err) => {
        console.error('Lỗi khi tải danh sách tỉnh thành:', err)
      })
    return () => {
      isMounted = false
    }
  }, [])

  // 2. Tự động so khớp tỉnh/thành hiện tại từ tên đã chọn
  const selectedProvince = matchProvince(selectedCity, provinces)

  const selectedProvinceId = selectedProvince?.idProvince || ''

  // 3. Tải danh sách phường/xã khi selectedProvinceId thay đổi
  useEffect(() => {
    let isMounted = true
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
        console.error('Lỗi khi tải danh sách phường xã:', err)
        if (isMounted) {
          setWards([])
          setIsLoadingWards(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [selectedProvinceId])

  // 4. Danh sách options cho Select Tỉnh/Thành phố
  const provinceOptions = provinces.map((p) => ({
    value: p.name,
    label: p.name,
  }))

  // 5. Danh sách options cho Select Phường/Xã (kèm fallback giữ lại giá trị cũ nếu chưa có trong danh mục mới)
  const wardOptions = useMemo(() => {
    const list = (wards || []).map((w) => ({
      value: w.name,
      label: w.name,
    }))
    const trimmedSelected = selectedWard?.trim().toLowerCase()
    if (trimmedSelected && !list.some((opt) => opt.value.trim().toLowerCase() === trimmedSelected)) {
      list.unshift({
        value: selectedWard,
        label: `${selectedWard} (Đã lưu)`,
      })
    }
    return list
  }, [wards, selectedWard])

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

