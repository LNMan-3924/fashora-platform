import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getUsers } from '../../services/api'
import { Toast } from '../../components/common'
import { getUserByEmail, getUserByPhone, getUsers } from '../../services/api'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginUser } = useAuth()

  // Khởi tạo state với giá trị ghi nhớ trước đó nếu có (Lazy initialization)
  const [identifier, setIdentifier] = useState(() => {
    try {
      return localStorage.getItem('fashora_remember_identifier') || ''
    } catch {
      return ''
    }
  })
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return Boolean(localStorage.getItem('fashora_remember_identifier'))
    } catch {
      return false
    }
  })
  const [toastMessage, setToastMessage] = useState('')

  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Cuộn lên đầu trang khi vào form
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  // Xóa lỗi từng ô khi người dùng bắt đầu chỉnh sửa lại
  const handleIdentifierChange = (e) => {
    setIdentifier(e.target.value)
    if (errors.identifier) {
      setErrors((prev) => ({ ...prev, identifier: '' }))
    }
    if (serverError) setServerError('')
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: '' }))
    }
    if (serverError) setServerError('')
  }

  // Xử lý nút Quên mật khẩu (Forgot Password)
  const handleForgotPassword = () => {
    const raw = identifier.trim()
    if (!raw) {
      setErrors((prev) => ({
        ...prev,
        identifier: 'Please enter your email or phone number first to recover password.',
      }))
      return
    }
    setToastMessage(`A password recovery instruction has been dispatched to ${raw}.`)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setServerError('')
    const newErrors = {}

    const rawInput = identifier.trim()
    if (!rawInput) {
      newErrors.identifier = 'Email address or phone number is required.'
    }

    if (!password) {
      newErrors.password = 'Password is required.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)

    try {
      const res = await getUsers()
      const users = res.data || []

      const cleanInput = rawInput.toLowerCase()
      const cleanDigits = rawInput.replace(/[\s.-]/g, '')

      // Nhận diện linh hoạt: Khớp theo Email HOẶC Số điện thoại (hỗ trợ cả chuẩn 09xx và +84xx)
      const foundUser = users.find((u) => {
        const emailMatch = u.email && u.email.toLowerCase() === cleanInput
        const userPhone = (u.phoneNumber || u.phone || '').replace(/[\s.-]/g, '')
        const phoneMatch = Boolean(
          cleanDigits &&
          userPhone &&
          (userPhone === cleanDigits ||
            (userPhone.startsWith('0') && cleanDigits === '+84' + userPhone.slice(1)) ||
            (cleanDigits.startsWith('0') && userPhone === '+84' + cleanDigits.slice(1)))
        )
        return emailMatch || phoneMatch
      })

      if (!foundUser) {
        setErrors({
          identifier: 'No account found with this email or phone number.',
        })
        setIsLoading(false)
        return
      }

      // Kiểm tra mật khẩu (nếu user có đặt password)
      if (foundUser.password && foundUser.password !== password) {
        setErrors({
          password: 'Incorrect password. Please verify and try again.',
        })
        setIsLoading(false)
        return
      }

      // Ghi nhớ tài khoản nếu người dùng chọn Remember me
      try {
        if (rememberMe) {
          localStorage.setItem('fashora_remember_identifier', rawInput)
        } else {
          localStorage.removeItem('fashora_remember_identifier')
        }
      } catch {
        // ignore
      }

      // Lưu user vào Auth Context & localStorage
      loginUser(foundUser)

      // Điều hướng thông minh dựa theo quyền thực tế của tài khoản:
      const userRole = String(foundUser.role || '').toLowerCase()
      const isSeller =
        userRole === 'seller' ||
        Boolean(foundUser.shopId) ||
        (Array.isArray(foundUser.roles) &&
          foundUser.roles.map((r) => String(r).toLowerCase()).includes('seller'))

      const previousPath =
        location.state?.from?.pathname ||
        (typeof location.state?.from === 'string' ? location.state.from : null)
      const previousState = location.state?.selectedItems
        ? { selectedItems: location.state.selectedItems }
        : location.state?.from?.state

      if (previousPath) {
        navigate(previousPath, { replace: true, state: previousState })
      } else if (isSeller) {
        // Tài khoản đã đăng ký seller -> Chuyển vào Dashboard
        navigate('/seller/dashboard', { replace: true })
      } else {
        // Tài khoản customer thông thường -> Chuyển về trang Shop
        navigate('/shop', { replace: true })
      }
    } catch (err) {
      setServerError(err.message || 'An error occurred during authentication.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Khung Card chính của Form */}
      <div className="w-full max-w-[480px] bg-white border border-neutral-200/90 p-8 sm:p-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        {/* Header trong thẻ */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111] uppercase">
            SIGN IN
          </h1>
        </div>

        {/* Thông báo lỗi từ server nếu có */}
        {serverError && (
          <div className="mb-5 p-3 bg-red-50 border border-red-500 text-red-600 text-xs font-mono uppercase tracking-wider">
            {serverError}
          </div>
        )}

        <form onSubmit={handleLogin} noValidate className="space-y-4">
          {/* Email Address / Phone Number */}
          <div>
            <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-700 font-semibold mb-1.5">
              EMAIL ADDRESS / PHONE NUMBER *
            </label>
            <input
              type="text"
              value={identifier}
              onChange={handleIdentifierChange}
              placeholder="Enter email or phone number"
              autoComplete="username"
              className={`w-full border px-3.5 py-2.5 text-xs text-[#111111] outline-none transition-colors placeholder:text-neutral-300 font-normal ${errors.identifier
                  ? 'border-red-500 focus:border-red-600 bg-red-50/10'
                  : 'border-neutral-300 focus:border-black'
                }`}
            />
            {errors.identifier && (
              <p className="text-[10px] text-red-500 font-mono mt-1 font-medium">
                {errors.identifier}
              </p>
            )}
          </div>

          {/* Password có nút xem mật khẩu & Forgot Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-mono tracking-widest uppercase text-neutral-700 font-semibold">
                PASSWORD *
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[10px] font-mono tracking-wider uppercase text-neutral-400 hover:text-black transition-colors cursor-pointer"
              >
                FORGOT PASSWORD?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                className={`w-full border px-3.5 py-2.5 text-xs text-[#111111] outline-none transition-colors placeholder:text-neutral-300 font-normal pr-10 ${errors.password
                    ? 'border-red-500 focus:border-red-600 bg-red-50/10'
                    : 'border-neutral-300 focus:border-black'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-black cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-4 h-4 stroke-[1.6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 stroke-[1.6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-[10px] text-red-500 font-mono mt-1 font-medium">
                {errors.password}
              </p>
            )}
          </div>

          {/* Checkbox Remember me */}
          <div className="flex items-center justify-between pt-1 pb-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 border-neutral-300 rounded-none text-black focus:ring-0 cursor-pointer accent-black"
              />
              <span className="text-xs text-neutral-600 font-mono">Remember me</span>
            </label>
          </div>

          {/* Nút LOGIN */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#111111] text-white text-xs font-mono uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'VERIFYING...' : 'LOGIN'}
          </button>
        </form>

        <Toast
          isVisible={Boolean(toastMessage)}
          message={toastMessage}
          onClose={() => setToastMessage('')}
        />

        {/* Chuyển hướng sang Register */}
        <div className="mt-8 text-center text-xs font-mono text-neutral-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-black font-bold uppercase underline hover:text-neutral-700 ml-1">
            CREATE AN ACCOUNT
          </Link>
        </div>
      </div>

      {/* Dòng bảo mật dưới thẻ */}
      <div className="mt-6 text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 select-none">
        AUTONOMOUS ATELIER SECURITY • 256-BIT ENCRYPTED
      </div>
    </div>
  )
}
