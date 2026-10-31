import { createContext, useContext, useState, useEffect } from 'react'
import { getCurrentUser } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  
  // Khởi tạo loading: Nếu có currentUserId trong localStorage thì cần tải dữ liệu trước khi xác thực hoàn tất
  const [loading, setLoading] = useState(() => {
    return Boolean(localStorage.getItem('currentUserId'))
  })

  useEffect(() => {
    const savedUserId = localStorage.getItem('currentUserId')
    if (!savedUserId) return

    let isMounted = true

    getCurrentUser(savedUserId)
      .then((user) => {
        if (isMounted) {
          if (user) {
            setCurrentUser(user)
          } else {
            // Trường hợp ID trong localStorage không còn tồn tại trong database
            localStorage.removeItem('currentUserId')
            setCurrentUser(null)
          }
        }
      })
      .catch((err) => {
        console.warn('AuthContext: Session expired or user not found:', err)
        localStorage.removeItem('currentUserId')
        if (isMounted) {
          setCurrentUser(null)
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const loginUser = (user) => {
    if (user?.id) {
      localStorage.setItem('currentUserId', user.id)
      setCurrentUser(user)
    }
  }

  const logoutUser = () => {
    localStorage.removeItem('currentUserId')
    localStorage.removeItem('fashora_current_shop')
    try {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('fashora_seller_onboarding_draft')) {
          sessionStorage.removeItem(key)
        }
      })
    } catch {
      // ignore
    }
    setCurrentUser(null)
  }

  const updateCurrentUser = (updatedUserOrFn) => {
    setCurrentUser((prev) => {
      if (typeof updatedUserOrFn === 'function') {
        return updatedUserOrFn(prev)
      }
      return prev ? { ...prev, ...updatedUserOrFn } : updatedUserOrFn
    })
  }

  const refreshUser = async () => {
    const savedUserId = localStorage.getItem('currentUserId')
    if (!savedUserId) return null
    try {
      const user = await getCurrentUser(savedUserId)
      if (user) {
        setCurrentUser(user)
      } else {
        localStorage.removeItem('currentUserId')
        setCurrentUser(null)
      }
      return user
    } catch {
      localStorage.removeItem('currentUserId')
      setCurrentUser(null)
      return null
    }
  }

  const value = {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    loading,
    loginUser,
    logoutUser,
    updateCurrentUser,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
