import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getUsers, registerUser } from '../../services/api'
import { nanoid } from 'nanoid'

export default function Register() {
  const navigate = useNavigate()
  const { loginUser } = useAuth()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  // Chọn loại định danh: Email hoặc Phone
  const [contactType, setContactType] = useState('email')

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    dob: '',
    gender: 'Male',
    password: '',
    confirmPassword: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    // 1. Kiểm tra validation cơ bản
    if (!formData.fullName.trim()) {
      setError('Full name is required.')
      return
    }

    if (contactType === 'email') {
      if (!formData.email.trim()) {
        setError('Email address is required.')
        return
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        setError('Invalid email address format.')
        return
      }
    } else {
      if (!formData.phoneNumber.trim()) {
        setError('Phone number is required.')
        return
      }
      const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/
      if (!phoneRegex.test(formData.phoneNumber.trim().replace(/\s+/g, ''))) {
        setError('Invalid Vietnamese phone number format (e.g. 0901234567).')
        return
      }
    }

    if (!formData.dob.trim()) {
      setError('Date of birth is required.')
      return
    }

    if (!formData.password) {
      setError('Password is required.')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)

    try {
      // 2. Kiểm tra trùng lặp trong db.json
      const checkRes = await getUsers()
      const existingUsers = checkRes.data || []

      const isDuplicate = existingUsers.some((u) => {
        if (contactType === 'email' && u.email) {
          return u.email.toLowerCase() === formData.email.trim().toLowerCase()
        }
        if (contactType === 'phone' && u.phoneNumber) {
          return u.phoneNumber === formData.phoneNumber.trim()
        }
        return false
      })

      if (isDuplicate) {
        setError(`This ${contactType === 'email' ? 'email' : 'phone number'} is already registered.`)
        setIsLoading(false)
        return
      }

      // 3. Khởi tạo tài khoản chuẩn Fashora
      const newUserPayload = {
        id: nanoid(),
        fullName: formData.fullName.trim(),
        email: contactType === 'email' ? formData.email.trim().toLowerCase() : '',
        phoneNumber: contactType === 'phone' ? formData.phoneNumber.trim() : '',
        password: formData.password,
        dob: formData.dob.trim(),
        gender: formData.gender,
        role: 'customer',
        shopId: null,
        address: {
          fullName: formData.fullName.trim(),
          phone: contactType === 'phone' ? formData.phoneNumber.trim() : '',
          address: '',
          ward: '',
          city: '',
        },
        shippingAddresses: [],
        createdAt: new Date().toISOString(),
      }

      const createRes = await registerUser(newUserPayload)
      const createdUser = createRes.data

      loginUser(createdUser)
      navigate('/shop')
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Khung Card chính của Form */}
      <div className="w-full max-w-[480px] bg-white border border-neutral-200/90 p-8 sm:p-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        {/* Header trong thẻ */}
        <div className="text-center mb-7">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111] uppercase">
            CREATE AN ACCOUNT
          </h1>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-500 text-red-600 text-xs font-mono uppercase tracking-wider">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} noValidate className="space-y-4">
          {/* 1. FULL NAME */}
          <div>
            <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-700 font-semibold mb-1.5">
              FULL NAME *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="w-full border border-neutral-300 px-3.5 py-2.5 text-xs text-[#111111] outline-none focus:border-black placeholder:text-neutral-300 font-normal transition-colors"
            />
          </div>

          {/* 2. PRIMARY CONTACT: PHONE OR EMAIL SELECTOR */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-mono tracking-widest uppercase text-neutral-700 font-semibold">
                {contactType === 'email' ? 'EMAIL ADDRESS *' : 'PHONE NUMBER *'}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setContactType('email')}
                  className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 border cursor-pointer ${contactType === 'email' ? 'bg-black text-white border-black' : 'text-neutral-400 border-neutral-200'
                    }`}
                >
                  USE EMAIL
                </button>
                <button
                  type="button"
                  onClick={() => setContactType('phone')}
                  className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 border cursor-pointer ${contactType === 'phone' ? 'bg-black text-white border-black' : 'text-neutral-400 border-neutral-200'
                    }`}
                >
                  USE PHONE
                </button>
              </div>
            </div>

            {contactType === 'email' ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full border border-neutral-300 px-3.5 py-2.5 text-xs text-[#111111] outline-none focus:border-black placeholder:text-neutral-300 font-normal transition-colors"
              />
            ) : (
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter your phone number (e.g. 0901234567)"
                className="w-full border border-neutral-300 px-3.5 py-2.5 text-xs text-[#111111] outline-none focus:border-black placeholder:text-neutral-300 font-normal transition-colors"
              />
            )}
          </div>

          {/* 3. DATE OF BIRTH & GENDER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-700 font-semibold mb-1.5">
                DATE OF BIRTH *
              </label>
              <input
                type="text"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                placeholder="DD / MM / YYYY"
                className="w-full border border-neutral-300 px-3.5 py-2.5 text-xs text-[#111111] outline-none focus:border-black placeholder:text-neutral-300 font-normal transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-700 font-semibold mb-1.5">
                GENDER *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full border border-neutral-300 px-3 py-2.5 text-xs text-[#111111] outline-none focus:border-black bg-white cursor-pointer font-normal"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* 4. PASSWORD */}
          <div>
            <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-700 font-semibold mb-1.5">
              PASSWORD *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a password"
                className="w-full border border-neutral-300 px-3.5 py-2.5 text-xs text-[#111111] outline-none focus:border-black placeholder:text-neutral-300 font-normal transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-black cursor-pointer"
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

          {/* 5. CONFIRM PASSWORD */}
          <div>
            <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-700 font-semibold mb-1.5">
              CONFIRM PASSWORD *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className="w-full border border-neutral-300 px-3.5 py-2.5 text-xs text-[#111111] outline-none focus:border-black placeholder:text-neutral-300 font-normal transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-black cursor-pointer"
              >
                {showConfirmPassword ? (
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

          {/* Terms & Conditions Notice */}
          <p className="text-[11px] text-neutral-400 font-mono leading-relaxed pt-1">
            By creating an account, you agree to Fashora's{' '}
            <span className="underline hover:text-black cursor-pointer">Terms & Conditions</span> and{' '}
            <span className="underline hover:text-black cursor-pointer">Privacy Notice</span>.
          </p>

          {/* Nút CREATE ACCOUNT */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 bg-[#111111] text-white text-xs font-mono uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        {/* Chuyển hướng sang Login */}
        <div className="mt-8 text-center text-xs font-mono text-neutral-500">
          Already have an account?{' '}
          <Link to="/login" className="text-black font-bold uppercase underline hover:text-neutral-700 ml-1">
            LOGIN
          </Link>
        </div>
      </div>

      {/* Dòng bảo mật con dấu dưới thẻ */}
      <div className="mt-6 text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 select-none">
        AUTONOMOUS ATELIER SECURITY • 256-BIT ENCRYPTED
      </div>
    </div>
  )
}