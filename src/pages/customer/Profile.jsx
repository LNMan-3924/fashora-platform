import { useState, useEffect } from 'react'
import { Toast } from '../../components/common'
import {
  ProfileHeader,
  ProfilePhoto,
  ProfileInfoList,
  ProfileInlineForm,
  ShippingAddresses,
  AddressModal,
  BecomeSellerBanner,
  getProfileData,
  saveProfileData,
  getSavedAddresses,
  saveSavedAddresses,
} from '../../components/profile'

/**
 * Trang Quản lý Hồ sơ Khách hàng (Customer Profile Page)
 *
 * Tính năng chính:
 * - Được chia nhỏ thành các component con độc lập trong src/components/profile/:
 *   + ProfileHeader: Breadcrumbs và tiêu đề trang.
 *   + ProfilePhoto: Quản lý xem trước, tải lên và xóa ảnh đại diện trực tiếp trên giao diện.
 *   + ProfileInfoList: Danh sách 5 thẻ thông số cá nhân ở chế độ xem.
 *   + ProfileInlineForm: Biểu mẫu chỉnh sửa thông tin cá nhân TRỰC TIẾP TRÊN TRANG (Không chỉnh sửa primary address tại đây).
 *   + ShippingAddresses: Quản lý toàn bộ danh sách địa chỉ giao hàng và đặt địa chỉ mặc định (Primary).
 *   + AddressModal: Cửa sổ thêm mới / chỉnh sửa địa chỉ giao hàng (Giữ nguyên modal).
 *   + BecomeSellerBanner: Khung quảng bá chương trình mở shop bán hàng.
 * - Tự động đồng bộ với LocalStorage và cung cấp địa chỉ mặc định cho trang Checkout.
 * - Bố cục responsive hoàn hảo: Mobile (1 cột xếp dọc), Tablet & PC (Lưới 4/8 cột chuẩn Atelier).
 */
export default function Profile() {
  // 1. State thông tin cá nhân
  const [profile, setProfile] = useState(() => getProfileData())

  // 2. State danh sách địa chỉ giao nhận (Shipping Addresses)
  const [addresses, setAddresses] = useState(() => getSavedAddresses())

  // 3. State quản lý chế độ chỉnh sửa thông tin cá nhân trực tiếp trên giao diện (Inline, không dùng modal)
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  // 4. State quản lý Modal thêm / sửa địa chỉ giao hàng (Vẫn giữ nguyên Modal cho Shipping Addresses)
  const [addressModalState, setAddressModalState] = useState({
    isOpen: false,
    data: null, // null = Thêm mới, có object = Sửa
  })

  // 5. State quản lý thông báo Toast nổi
  const [toast, setToast] = useState({ visible: false, message: '' })

  // Cuộn lên đầu trang khi vào trang
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  // =========================================================================
  // BƯỚC 1: XỬ LÝ LƯU & CẬP NHẬT THÔNG TIN HỒ SƠ (TRỰC TIẾP KHÔNG DÙNG MODAL)
  // =========================================================================
  const showToast = (message) => {
    setToast({ visible: true, message })
  }

  // Lưu thông tin cá nhân sau khi sửa trực tiếp trên giao diện
  const handleSaveProfile = (newProfile) => {
    saveProfileData(newProfile)
    setProfile(newProfile)
    setIsEditingProfile(false)
    showToast('Information updated')
  }

  // Tải lên ảnh đại diện mới
  const handlePhotoChange = (avatarUrl) => {
    const updated = { ...profile, avatarUrl }
    saveProfileData(updated)
    setProfile(updated)
    showToast('Profile photo updated')
  }

  // Xóa ảnh đại diện
  const handlePhotoRemove = () => {
    const updated = { ...profile, avatarUrl: null }
    saveProfileData(updated)
    setProfile(updated)
    showToast('Profile photo removed')
  }

  // =========================================================================
  // BƯỚC 2: XỬ LÝ QUẢN LÝ ĐỊA CHỈ GIAO HÀNG (SHIPPING ADDRESSES - GIỮ NGUYÊN)
  // =========================================================================
  // Lưu địa chỉ (Thêm mới hoặc Cập nhật)
  const handleSaveAddress = (addr) => {
    let updatedList
    const isEdit = addresses.some((a) => a.id === addr.id)

    if (isEdit) {
      updatedList = addresses.map((item) => {
        if (item.id === addr.id) {
          return { ...addr }
        }
        // Nếu địa chỉ này được chọn làm mặc định, bỏ mặc định ở các địa chỉ khác
        return addr.isDefault ? { ...item, isDefault: false } : item
      })
      showToast('Address updated')
    } else {
      const willBeDefault = addr.isDefault || addresses.length === 0
      const formattedList = willBeDefault
        ? addresses.map((a) => ({ ...a, isDefault: false }))
        : [...addresses]

      updatedList = [...formattedList, { ...addr, isDefault: willBeDefault }]
      showToast('New address added')
    }

    saveSavedAddresses(updatedList)
    setAddresses(updatedList)
  }

  // Đặt một địa chỉ làm mặc định (Primary)
  const handleSetDefaultAddress = (targetId) => {
    const updatedList = addresses.map((a) => ({
      ...a,
      isDefault: a.id === targetId,
    }))
    saveSavedAddresses(updatedList)
    setAddresses(updatedList)
    showToast('Default shipping address updated')
  }

  // Xóa địa chỉ
  const handleDeleteAddress = (targetId) => {
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

    saveSavedAddresses(remaining)
    setAddresses(remaining)
    showToast('Address removed')
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