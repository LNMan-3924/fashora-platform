import { useState, useEffect } from 'react'
import { Toast } from '../../components/common'
import { useAuth } from '../../contexts/AuthContext'
import { getUserById, updateUser } from '../../services/api'
import {
  ProfileHeader,
  ProfilePhoto,
  ProfileInfoList,
  ProfileInlineForm,
  ShippingAddresses,
  AddressModal,
  BecomeSellerBanner,
} from '../../components/profile'

/**
 * Trang Quản lý Hồ sơ Khách hàng (Customer Profile Page):
 * - Hoàn toàn không sử dụng LocalStorage độc lập để lưu trữ profile nữa.
 * - Tích hợp trực tiếp với API backend (JSON-Server /users/:id) và AuthContext (login/register).
 * - Tự động tải thông tin cá nhân và sổ địa chỉ giao hàng của tài khoản đang đăng nhập.
 * - Hỗ trợ chỉnh sửa thông tin trực tiếp (Inline Form), đổi/xóa avatar, thêm/sửa/xóa địa chỉ giao hàng qua API.
 * - Đồng bộ hóa tức thì với AuthContext để Header và toàn bộ hệ thống phản ánh thay đổi ngay lập tức.
 * - Bố cục responsive toàn diện trên Mobile, Tablet và Desktop.
 */
export default function Profile() {
  const { currentUser, loading: authLoading, updateCurrentUser } = useAuth()

  // 1. State trạng thái đang tải dữ liệu từ API
  const [isFetching, setIsFetching] = useState(() => Boolean(currentUser?.id))

  // 2. State thông tin cá nhân
  const [profile, setProfile] = useState(() => ({
    name: currentUser?.fullName || currentUser?.name || '',
    phone: currentUser?.phoneNumber || currentUser?.phone || '',
    email: currentUser?.email || '',
    dob: currentUser?.dob || '',
    gender: currentUser?.gender || 'Female',
    avatarUrl: currentUser?.avatarUrl || null,
  }))

  // 3. State danh sách địa chỉ giao nhận (Shipping Addresses từ API user)
  const [addresses, setAddresses] = useState(() =>
    Array.isArray(currentUser?.shippingAddresses) ? currentUser.shippingAddresses : []
  )

  // 4. State quản lý chế độ chỉnh sửa thông tin cá nhân trực tiếp trên giao diện (Inline)
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  // 5. State quản lý Modal thêm / sửa địa chỉ giao hàng
  const [addressModalState, setAddressModalState] = useState({
    isOpen: false,
    data: null, // null = Thêm mới, có object = Sửa
  })

  // 6. State quản lý thông báo Toast nổi
  const [toast, setToast] = useState({ visible: false, message: '' })

  // Cuộn lên đầu trang khi vào trang
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  // =========================================================================
  // BƯỚC 1: TẢI DỮ LIỆU NGƯỜI DÙNG THỰC TẾ TỪ API (/users/:id)
  // =========================================================================
  useEffect(() => {
    let isMounted = true

    if (!currentUser?.id) {
      return
    }

    getUserById(currentUser.id)
      .then((res) => {
        if (!isMounted) return
        const user = res?.data || res
        if (user) {
          setProfile({
            name: user.fullName || user.name || '',
            phone: user.phoneNumber || user.phone || '',
            email: user.email || '',
            dob: user.dob || '',
            gender: user.gender || 'Female',
            avatarUrl: user.avatarUrl || null,
          })
          const loadedAddresses = Array.isArray(user.shippingAddresses) ? user.shippingAddresses : []
          setAddresses(loadedAddresses)
          updateCurrentUser(user)
        }
      })
      .catch((err) => {
        console.warn('Profile: Không thể tải từ API, sử dụng dữ liệu phiên Auth:', err?.message)
        if (isMounted && currentUser) {
          setProfile({
            name: currentUser.fullName || currentUser.name || '',
            phone: currentUser.phoneNumber || currentUser.phone || '',
            email: currentUser.email || '',
            dob: currentUser.dob || '',
            gender: currentUser.gender || 'Female',
            avatarUrl: currentUser.avatarUrl || null,
          })
          setAddresses(
            Array.isArray(currentUser.shippingAddresses)
              ? currentUser.shippingAddresses
              : []
          )
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsFetching(false)
        }
      })

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id])

  const showToast = (message) => {
    setToast({ visible: true, message })
  }

  // =========================================================================
  // BƯỚC 2: XỬ LÝ LƯU & CẬP NHẬT THÔNG TIN HỒ SƠ QUA API (PATCH /users/:id)
  // =========================================================================
  const handleSaveProfile = async (newProfile) => {
    if (!currentUser?.id) return

    try {
      // 1. Tự động đồng bộ số điện thoại và họ tên mới xuống địa chỉ giao hàng mặc định ban đầu
      let updatedAddresses = addresses
      if (Array.isArray(addresses) && addresses.length > 0) {
        const hasDefault = addresses.some((a) => a.isDefault)
        updatedAddresses = addresses.map((addr, idx) => {
          const isTargetDefault = addr.isDefault || (!hasDefault && idx === 0)
          if (isTargetDefault) {
            return {
              ...addr,
              address: addr.address || addr.street || '',
              name: newProfile.name || addr.name,
              phone: newProfile.phone || addr.phone,
            }
          }
          return addr
        })
      }

      const payload = {
        fullName: newProfile.name,
        name: newProfile.name,
        phoneNumber: newProfile.phone,
        phone: newProfile.phone,
        email: newProfile.email,
        dob: newProfile.dob,
        gender: newProfile.gender,
        shippingAddresses: updatedAddresses,
      }

      const res = await updateUser(currentUser.id, payload)
      const updatedUser = res?.data || res

      setProfile(newProfile)
      setAddresses(updatedAddresses)
      setIsEditingProfile(false)
      updateCurrentUser(updatedUser)
      showToast('Information updated')
    } catch (err) {
      console.error('Lỗi cập nhật hồ sơ qua API:', err)
      showToast('Failed to update information. Please try again.')
    }
  }

  // Tải lên ảnh đại diện mới qua API
  const handlePhotoChange = async (avatarUrl) => {
    if (!currentUser?.id) return

    try {
      const res = await updateUser(currentUser.id, { avatarUrl })
      const updatedUser = res?.data || res

      setProfile((prev) => ({ ...prev, avatarUrl }))
      updateCurrentUser(updatedUser)
      showToast('Profile photo updated')
    } catch (err) {
      console.error('Lỗi cập nhật ảnh đại diện qua API:', err)
      showToast('Failed to update profile photo.')
    }
  }

  // Xóa ảnh đại diện qua API
  const handlePhotoRemove = async () => {
    if (!currentUser?.id) return

    try {
      const res = await updateUser(currentUser.id, { avatarUrl: null })
      const updatedUser = res?.data || res

      setProfile((prev) => ({ ...prev, avatarUrl: null }))
      updateCurrentUser(updatedUser)
      showToast('Profile photo removed')
    } catch (err) {
      console.error('Lỗi xóa ảnh đại diện qua API:', err)
      showToast('Failed to remove profile photo.')
    }
  }

  // =========================================================================
  // BƯỚC 3: XỬ LÝ QUẢN LÝ ĐỊA CHỈ GIAO HÀNG QUA API (PATCH /users/:id)
  // =========================================================================
  // Lưu địa chỉ (Thêm mới hoặc Cập nhật)
  const handleSaveAddress = async (addr) => {
    if (!currentUser?.id) return

    let updatedList
    const isEdit = addresses.some((a) => a.id === addr.id)

    const cleanAddr = { ...addr }
    cleanAddr.address = cleanAddr.address || cleanAddr.street || ''
    delete cleanAddr.street

    const resolvedAddr = {
      ...cleanAddr,
      name: (addr.name || '').trim() || profile.name || currentUser?.fullName || currentUser?.name || '',
      phone: (addr.phone || '').trim() || profile.phone || currentUser?.phoneNumber || currentUser?.phone || '',
    }

    if (isEdit) {
      updatedList = addresses.map((item) => {
        if (item.id === resolvedAddr.id) {
          return { ...resolvedAddr }
        }
        return resolvedAddr.isDefault ? { ...item, isDefault: false } : item
      })
    } else {
      const willBeDefault = resolvedAddr.isDefault || addresses.length === 0
      const formattedList = willBeDefault
        ? addresses.map((a) => ({ ...a, isDefault: false }))
        : [...addresses]

      updatedList = [...formattedList, { ...resolvedAddr, isDefault: willBeDefault }]
    }

    const payload = {
      shippingAddresses: updatedList,
    }

    try {
      const res = await updateUser(currentUser.id, payload)
      const updatedUser = res?.data || res

      setAddresses(updatedList)
      updateCurrentUser(updatedUser)
      showToast(isEdit ? 'Address updated' : 'New address added')
    } catch (err) {
      console.error('Lỗi lưu địa chỉ qua API:', err)
      showToast('Failed to save address. Please try again.')
    }
  }

  // Đặt một địa chỉ làm mặc định (Primary) qua API
  const handleSetDefaultAddress = async (targetId) => {
    if (!currentUser?.id) return

    const updatedList = addresses.map((a) => ({
      ...a,
      isDefault: a.id === targetId,
    }))

    const payload = {
      shippingAddresses: updatedList,
    }

    try {
      const res = await updateUser(currentUser.id, payload)
      const updatedUser = res?.data || res

      setAddresses(updatedList)
      updateCurrentUser(updatedUser)
      showToast('Default shipping address updated')
    } catch (err) {
      console.error('Lỗi đặt địa chỉ mặc định qua API:', err)
      showToast('Failed to set default address.')
    }
  }

  // Xóa địa chỉ qua API
  const handleDeleteAddress = async (targetId) => {
    if (!currentUser?.id) return

    const target = addresses.find((a) => a.id === targetId)
    if (!target) return

    const confirmDelete = window.confirm(
      `Are you sure you want to delete address for "${target.name}"?`
    )
    if (!confirmDelete) return

    const wasDefault = target.isDefault
    const remaining = addresses.filter((a) => a.id !== targetId)

    // Nếu xóa mất địa chỉ mặc định, tự động gán địa chỉ đầu tiên còn lại làm mặc định
    if (wasDefault && remaining.length > 0) {
      remaining[0].isDefault = true
    }

    const payload = {
      shippingAddresses: remaining,
    }

    try {
      const res = await updateUser(currentUser.id, payload)
      const updatedUser = res?.data || res

      setAddresses(remaining)
      updateCurrentUser(updatedUser)
      showToast('Address removed')
    } catch (err) {
      console.error('Lỗi xóa địa chỉ qua API:', err)
      showToast('Failed to remove address.')
    }
  }

  // Hiển thị trạng thái đang tải hồ sơ
  if (authLoading || isFetching) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs tracking-widest uppercase font-mono text-neutral-500">
          RETRIEVING ATELIER PROFILE...
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* 1. Header Trang & Breadcrumb */}
      <ProfileHeader />

      {/* 2. Phần thông tin tài khoản chính (Lưới 2 cột: Ảnh bên trái, Thông tin/Form bên phải) */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start mb-8 md:mb-10">
        {/* Cột trái (4 cột): Ảnh đại diện và thao tác upload/xóa ảnh trực tiếp */}
        <div className="md:col-span-4 lg:col-span-4">
          <ProfilePhoto
            avatarUrl={profile.avatarUrl}
            onPhotoChange={handlePhotoChange}
            onPhotoRemove={handlePhotoRemove}
          />
        </div>

        {/* Cột phải (8 cột): Chuyển đổi giữa chế độ Xem và Chỉnh sửa trực tiếp trên trang (Không dùng Modal) */}
        <div className="md:col-span-8 lg:col-span-8">
          {isEditingProfile ? (
            <ProfileInlineForm
              key={profile?.email || 'edit-profile'}
              profile={profile}
              onSave={handleSaveProfile}
              onCancel={() => setIsEditingProfile(false)}
            />
          ) : (
            <ProfileInfoList
              profile={profile}
              onStartEdit={() => setIsEditingProfile(true)}
            />
          )}
        </div>
      </section>

      {/* 3. Phần danh sách địa chỉ giao hàng (Shipping Addresses - Giữ nguyên có Modal riêng) */}
      <ShippingAddresses
        addresses={addresses}
        onAddNew={() => setAddressModalState({ isOpen: true, data: null })}
        onEdit={(addr) => setAddressModalState({ isOpen: true, data: addr })}
        onDelete={handleDeleteAddress}
        onSetDefault={handleSetDefaultAddress}
      />

      {/* 4. Khung quảng bá Become A Seller */}
      <BecomeSellerBanner />

      {/* 5. Modal thêm / sửa địa chỉ giao hàng (Giữ nguyên theo yêu cầu) */}
      <AddressModal
        isOpen={addressModalState.isOpen}
        onClose={() => setAddressModalState({ isOpen: false, data: null })}
        addressData={addressModalState.data}
        onSave={handleSaveAddress}
      />

      {/* 6. Thông báo Toast nổi dùng chung */}
      <Toast
        isVisible={toast.visible}
        message={toast.message}
        onClose={() => setToast({ visible: false, message: '' })}
      />
    </div>
  )
}