import { createContext, useContext, useState, useEffect } from 'react'
import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const OnboardingContext = createContext(null)

const DRAFT_STORAGE_KEY = 'fashora_seller_onboarding_draft'

// eslint-disable-next-line react-refresh/only-export-components
export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within BecomeSellerLayout')
  }
  return context
}

export default function BecomeSellerLayout() {
  const { currentUser, loading, updateCurrentUser } = useAuth()
  const location = useLocation()

  const getDraftKey = (uid) => (uid ? `${DRAFT_STORAGE_KEY}_${uid}` : DRAFT_STORAGE_KEY)

  // Khởi tạo formData từ sessionStorage nếu có bản nháp theo user hiện tại
  const [formData, setFormData] = useState(() => {
    try {
      const currentUid = localStorage.getItem('currentUserId')
      const key = getDraftKey(currentUid)
      const saved = sessionStorage.getItem(key)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // fallback
    }
    return {
      shopName: '',
      shopDescription: '',
      shopLogo: '',
      shopLogoName: '',
      shopLogoSize: '',
      shopCategory: 'ALL-IN-ONE FASHION',
      agreedToTerms: false,
    }
  })

  // Khi đổi tài khoản đăng nhập (currentUser?.id thay đổi): Tải đúng bản nháp của user đó hoặc reset
  const [prevUserId, setPrevUserId] = useState(currentUser?.id)
  if (currentUser?.id !== prevUserId) {
    setPrevUserId(currentUser?.id)
    const key = getDraftKey(currentUser?.id)
    let nextData = {
      shopName: '',
      shopDescription: '',
      shopLogo: '',
      shopLogoName: '',
      shopLogoSize: '',
      shopCategory: 'ALL-IN-ONE FASHION',
      agreedToTerms: false,
    }
    try {
      const saved = sessionStorage.getItem(key)
      if (saved) {
        nextData = JSON.parse(saved)
      }
    } catch {
      // ignore
    }
    setFormData(nextData)
  }

  // Lưu tự động bản nháp mỗi khi thay đổi
  useEffect(() => {
    if (!currentUser?.id) return
    const key = getDraftKey(currentUser.id)
    try {
      sessionStorage.setItem(key, JSON.stringify(formData))
    } catch {
      // ignore
    }
  }, [formData, currentUser?.id])

  const updateFormData = (fields) => {
    setFormData((prev) => ({
      ...prev,
      ...fields,
    }))
  }

  const clearDraft = () => {
    const key = getDraftKey(currentUser?.id)
    try {
      sessionStorage.removeItem(key)
      sessionStorage.removeItem(DRAFT_STORAGE_KEY)
    } catch {
      // ignore
    }
    setFormData({
      shopName: '',
      shopDescription: '',
      shopLogo: '',
      shopLogoName: '',
      shopLogoSize: '',
      shopCategory: 'ALL-IN-ONE FASHION',
      agreedToTerms: false,
    })
  }

  // 1. Trạng thái tải Auth
  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // 2. Kiểm tra đăng nhập (Guest Guard)
  const currentUserId = localStorage.getItem('currentUserId')
  if (!currentUser && !currentUserId) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 3. Ngăn chặn đăng ký trùng lặp: Nếu currentUser.shopId đã tồn tại
  // Ngoại trừ màn hình /become-seller/success vừa hoàn tất đăng ký xong
  const isSuccessPage = location.pathname.endsWith('/success')
  if (currentUser?.shopId && !isSuccessPage) {
    return <Navigate to="/seller/dashboard" replace />
  }

  return (
    <OnboardingContext.Provider
      value={{
        formData,
        updateFormData,
        clearDraft,
        currentUser,
        updateCurrentUser,
      }}
    >
      <div className="min-h-screen bg-white text-black py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </div>
    </OnboardingContext.Provider>
  )
}
