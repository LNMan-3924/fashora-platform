import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginUser } = useAuth()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!identifier.trim()) {
      setError('Please enter your email or phone number.')
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('http://localhost:5000/users')
      if (!res.ok) throw new Error('Cannot connect to authentication service.')
      const users = await res.json()

      const cleanInput = identifier.trim().toLowerCase()

      // Khớp theo Email hoặc Số điện thoại
      const foundUser = users.find((u) => {
        const emailMatch = u.email && u.email.toLowerCase() === cleanInput
        const phoneMatch = u.phoneNumber && u.phoneNumber === identifier.trim()
        return emailMatch || phoneMatch
      })

      if (!foundUser) {
        setError('Account not found. Please register or verify your credentials.')
        setIsLoading(false)
        return
      }

      // Kiểm tra mật khẩu (nếu user có password)
      if (foundUser.password && foundUser.password !== password) {
        setError('Invalid credentials. Please re-enter your password.')
        setIsLoading(false)
        return
      }

      // Lưu user vào Auth Context & localStorage
      loginUser(foundUser)

      // Điều hướng thông minh dựa theo quyền thực tế của tài khoản:
      const isSeller = foundUser.role === 'seller' || (Array.isArray(foundUser.roles) && foundUser.roles.includes('seller'))
      
      const previousPath = location.state?.from?.pathname

      if (previousPath) {
        navigate(previousPath, { replace: true })
      } else if (isSeller) {
        // Tài khoản đã đăng ký seller -> Chuyển vào Dashboard
        navigate('/seller/dashboard', { replace: true })
      } else {
        // Tài khoản customer thông thường -> Chuyển về trang Shop
        navigate('/shop', { replace: true })
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.')
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

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-500 text-red-600 text-xs font-mono uppercase tracking-wider">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} noValidate className="space-y-4">
          {/* Email Address / Phone */}
          <div>
            <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-700 font-semibold mb-1.5">
              EMAIL ADDRESS / PHONE NUMBER *
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your email or phone"
              className="w-full border border-neutral-300 px-3.5 py-2.5 text-xs text-[#111111] outline-none focus:border-black placeholder:text-neutral-300 font-normal transition-colors"
            />
          </div>

          {/* Password có nút xem mật khẩu & Forgot Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-mono tracking-widest uppercase text-neutral-700 font-semibold">
                PASSWORD *
              </label>
              <button
                type="button"
                className="text-[10px] font-mono tracking-wider uppercase text-neutral-400 hover:text-black transition-colors"
              >
                FORGOT PASSWORD?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border border-neutral-300 px-3.5 py-2.5 text-xs text-[#111111] outline-none focus:border-black placeholder:text-neutral-300 font-normal transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-black cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-4 h-4 stroke-[1.6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 stroke-[1.6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Checkbox Remember me */}
          <div className="flex items-center justify-between pt-1 pb-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 border-neutral-300 rounded-none text-black focus:ring-0 cursor-pointer"
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