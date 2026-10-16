import { createContext, useContext, useState, useEffect } from 'react'
import { getCurrentUser } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  
  // Khởi tạo loading dựa trên sự tồn tại của token/id để không cần gọi setState đồng bộ trong effect
  const [loading, setLoading] = useState(() => {
    return Boolean(localStorage.getItem('currentUserId'))
  })

  useEffect(() => {
    const savedUserId = localStorage.getItem('currentUserId')
    if (!savedUserId) return

    let isMounted = true

    getCurrentUser(savedUserId)
      .then((user) => {
        if (isMounted && user) {
          setCurrentUser(user)
        }
      })
      .catch((err) => {
        console.warn('AuthContext: Phiên đăng nhập hết hạn hoặc không tìm thấy user:', err)
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
    localStorage.setItem('currentUserId', user.id)
    setCurrentUser(user)
  }

  const logoutUser = () => {
    localStorage.removeItem('currentUserId')
    setCurrentUser(null)
  }

  const value = {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    loading,
    loginUser,
    logoutUser,
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