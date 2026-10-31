import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { getUserByEmail, getUserByPhone, registerUser } from '../../services/api'
import { nanoid } from 'nanoid'

export default function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { loginUser } = useAuth()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    dob: '',
    gender: 'Male',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Ngày hôm nay (dùng để chặn chọn ngày tương lai trên input date)
  const todayStr = new Date().toISOString().split('T')[0]

  // Tính toán độ mạnh mật khẩu (Password Strength)
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-neutral-200', textColor: 'text-neutral-400' }
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) score++

    if (score <= 1) return { score: 1, label: t('auth.weak', 'WEAK'), color: 'bg-red-500', textColor: 'text-red-500' }
    if (score === 2) return { score: 2, label: t('auth.fair', 'FAIR'), color: 'bg-amber-500', textColor: 'text-amber-500' }
    if (score === 3) return { score: 3, label: t('auth.good', 'GOOD'), color: 'bg-blue-500', textColor: 'text-blue-500' }
    return { score: 4, label: t('auth.strong', 'STRONG'), color: 'bg-emerald-500', textColor: 'text-emerald-500' }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Xóa lỗi tức thời khi người dùng chỉnh sửa ô đó
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    if (serverError) setServerError('')
  }

  const validateForm = () => {
    const newErrors = {}

    // 1. Full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = t('auth.fullNameRequired', 'Full name is required.')
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = t('auth.fullNameMinLength', 'Full name must be at least 2 characters.')
    }

    // 2. Email Address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = t('auth.emailRequired', 'Email address is required.')
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = t('auth.emailInvalid', 'Invalid email address format (e.g. name@domain.com).')
    }

    // 3. Phone Number (Vietnamese standard)
    const cleanPhone = formData.phoneNumber.trim().replace(/\s+/g, '')
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/
    if (!cleanPhone) {
      newErrors.phoneNumber = t('auth.phoneRequired', 'Phone number is required.')
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phoneNumber = t('auth.phoneInvalid', 'Invalid phone number (must be 10 digits, e.g. 0901234567).')
    }

    // 4. Date of Birth (DOB) - Bắt buộc, không chọn tương lai, đủ 16 tuổi trở lên
    if (!formData.dob) {
      newErrors.dob = t('auth.dobRequired', 'Date of birth is required.')
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const dobDate = new Date(formData.dob)
      dobDate.setHours(0, 0, 0, 0)

      if (isNaN(dobDate.getTime())) {
        newErrors.dob = t('auth.dobInvalid', 'Invalid date of birth.')
      } else if (dobDate > today) {
        newErrors.dob = t('auth.dobFuture', 'Date of birth cannot be in the future.')
      } else {
        // Kiểm tra đủ 16 tuổi trở lên
        const min16thBirthday = new Date(dobDate)
        min16thBirthday.setFullYear(min16thBirthday.getFullYear() + 16)
        if (min16thBirthday > today) {
          newErrors.dob = t('auth.dobMinAge', 'You must be at least 16 years old to register.')
        }
      }
    }

    // 5. Password - Bắt buộc, có chữ hoa, chữ thường, số, ký tự đặc biệt, tối thiểu 8 ký tự
    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired', 'Password is required.')
    } else if (formData.password.length < 8) {
      newErrors.password = t('auth.passwordMinLength', 'Password must be at least 8 characters.')
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = t('auth.passwordUppercase', 'Must contain at least one uppercase letter (A-Z).')
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = t('auth.passwordLowercase', 'Must contain at least one lowercase letter (a-z).')
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = t('auth.passwordNumber', 'Must contain at least one number (0-9).')
    } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password)) {
      newErrors.password = t('auth.passwordSpecial', 'Must contain at least one special character (!@#$%^&*...).')
    }

    // 6. Confirm Password - Phải khớp với password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.confirmPasswordRequired', 'Confirm password is required.')
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordMismatch', 'Passwords do not match.')
    }

    return newErrors
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setServerError('')

    // Kiểm tra tính hợp lệ toàn bộ form
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)

    try {
      // Tối ưu hiệu năng: Kiểm tra trùng lặp email và số điện thoại trực tiếp qua server query params
      const cleanPhone = formData.phoneNumber.trim().replace(/\s+/g, '')
      const cleanEmail = formData.email.trim().toLowerCase()

      const [emailRes, phoneRes] = await Promise.all([
        getUserByEmail(cleanEmail),
        getUserByPhone(cleanPhone),
      ])

      const emailExists = Array.isArray(emailRes?.data) && emailRes.data.length > 0
      const phoneExists = Array.isArray(phoneRes?.data) && phoneRes.data.length > 0

      if (emailExists || phoneExists) {
        const duplicateErrors = {}
        if (emailExists) duplicateErrors.email = t('auth.emailRegistered', 'This email address is already registered.')
        if (phoneExists) duplicateErrors.phoneNumber = t('auth.phoneRegistered', 'This phone number is already registered.')
        setErrors(duplicateErrors)
        setIsLoading(false)
        return
      }

      // Khởi tạo tài khoản người dùng chuẩn Fashora
      const newUserPayload = {
        id: nanoid(),
        fullName: formData.fullName.trim(),
        email: cleanEmail,
        phoneNumber: cleanPhone,
        password: formData.password,
        dob: formData.dob,
        gender: formData.gender,
        roles: ['customer'],
        shopId: null,
        shippingAddresses: [],
        followingShops: [],
        createdAt: new Date().toISOString(),
      }

      const createRes = await registerUser(newUserPayload)
      const createdUser = createRes.data

      loginUser(createdUser)
      navigate('/home')
    } catch (err) {
      setServerError(err?.message || t('auth.registerError', 'An unexpected error occurred while creating your account.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Khung Card chính của Form - đồng bộ kích thước 100% ngang bằng Login (480px x 469px) */}
      <div className="w-full max-w-[480px] sm:h-[469px] max-h-[85vh] flex flex-col bg-white/95 backdrop-blur-md border border-neutral-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden">
        {/* Header cố định trong thẻ */}
        <div className="text-center px-8 sm:px-10 pt-7 sm:pt-8 pb-3 shrink-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111] uppercase font-serif">
            {t('auth.registerTitle', 'CREATE AN ACCOUNT')}
          </h1>
          {/* Lỗi máy chủ / kết nối chung nếu có */}
          {serverError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-500 text-red-600 text-xs font-mono uppercase tracking-wider">
              {serverError}
            </div>
          )}
        </div>

        {/* Thân Form cuộn lên xuống mượt mà (Editorial Scrollbar) */}
        <form
          onSubmit={handleRegister}
          noValidate
          className="flex-1 overflow-y-auto px-8 sm:px-10 py-2 space-y-4 editorial-scrollbar"
        >
          {/* 1. FULL NAME */}
          <div>
            <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-700 font-semibold mb-1.5">
              {t('auth.fullName', 'FULL NAME *')}
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder={t('auth.fullNamePlaceholder', 'Enter your full name')}
              className={`w-full border px-3.5 py-2.5 text-xs text-[#111111] outline-none transition-colors ${errors.fullName
                  ? 'border-red-500 focus:border-red-600 bg-red-50/20'
                  : 'border-neutral-300 focus:border-black placeholder:text-neutral-400'
                }`}
            />
            {errors.fullName && (
              <p className="mt-1 text-[11px] font-mono text-red-500 tracking-wide flex items-center gap-1">
                <span>•</span>
                <span>{errors.fullName}</span>
              </p>
            )}
          </div>

          {/* 2. EMAIL ADDRESS */}
          <div>
            <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-700 font-semibold mb-1.5">
              {t('auth.email', 'EMAIL ADDRESS *')}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={t('auth.emailPlaceholder', 'name@example.com')}
              className={`w-full border px-3.5 py-2.5 text-xs text-[#111111] outline-none transition-colors ${errors.email
                  ? 'border-red-500 focus:border-red-600 bg-red-50/20'
                  : 'border-neutral-300 focus:border-black placeholder:text-neutral-400'
                }`}
            />
            {errors.email && (
              <p className="mt-1 text-[11px] font-mono text-red-500 tracking-wide flex items-center gap-1">
                <span>•</span>
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* 3. PHONE NUMBER */}
          <div>
            <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-700 font-semibold mb-1.5">
              {t('auth.phone', 'PHONE NUMBER *')}
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder={t('auth.phonePlaceholder', '0901234567')}
              className={`w-full border px-3.5 py-2.5 text-xs text-[#111111] outline-none transition-colors ${errors.phoneNumber
                  ? 'border-red-500 focus:border-red-600 bg-red-50/20'
                  : 'border-neutral-300 focus:border-black placeholder:text-neutral-400'
                }`}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-[11px] font-mono text-red-500 tracking-wide flex items-center gap-1">
                <span>•</span>
                <span>{errors.phoneNumber}</span>
              </p>
            )}
          </div>

          {/* 4. DATE OF BIRTH & GENDER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-700 font-semibold mb-1.5">
                {t('auth.dob', 'DATE OF BIRTH *')}
              </label>
              <input
                type="date"
                name="dob"
                max={todayStr}
                value={formData.dob}
                onChange={handleInputChange}
                className={`w-full border px-3 py-2 text-xs text-[#111111] outline-none transition-colors cursor-pointer bg-white ${errors.dob
                    ? 'border-red-500 focus:border-red-600 bg-red-50/20'
                    : 'border-neutral-300 focus:border-black'
                  }`}
              />
              {errors.dob && (
                <p className="mt-1 text-[11px] font-mono text-red-500 tracking-wide flex items-center gap-1">
                  <span>•</span>
                  <span>{errors.dob}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-700 font-semibold mb-1.5">
                {t('auth.gender', 'GENDER *')}
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full border border-neutral-300 px-3 py-2.5 text-xs text-[#111111] outline-none focus:border-black bg-white cursor-pointer font-normal"
              >
                <option value="Male">{t('profile.male', 'Male')}</option>
                <option value="Female">{t('profile.female', 'Female')}</option>
                <option value="Other">{t('profile.other', 'Other')}</option>
              </select>
            </div>
          </div>

          {/* 5. PASSWORD */}
          <div>
            <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-700 font-semibold mb-1.5">
              {t('auth.password', 'PASSWORD *')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={t('auth.createPasswordPlaceholder', 'Create a strong password')}
                className={`w-full border px-3.5 py-2.5 text-xs text-[#111111] outline-none transition-colors pr-10 ${errors.password
                    ? 'border-red-500 focus:border-red-600 bg-red-50/20'
                    : 'border-neutral-300 focus:border-black placeholder:text-neutral-400'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-black cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
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

            {/* Thanh đo độ mạnh mật khẩu nhỏ gọn */}
            {formData.password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1 h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full flex-1 transition-all duration-300 ${passwordStrength.score >= step ? passwordStrength.color : 'bg-neutral-200'
                        }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-neutral-400">{t('auth.securityStrength', 'Security strength')}</span>
                  <span className={`font-bold uppercase tracking-wider ${passwordStrength.textColor}`}>
                    {passwordStrength.label}
                  </span>
                </div>
              </div>
            )}

            {/* Dòng báo lỗi mật khẩu */}
            {errors.password ? (
              <p className="mt-1 text-[11px] font-mono text-red-500 tracking-wide flex items-center gap-1">
                <span>•</span>
                <span>{errors.password}</span>
              </p>
            ) : (
              <p className="mt-1 text-[10px] font-mono text-neutral-400 leading-normal">
                {t('auth.passwordRule', 'Min 8 characters with uppercase, lowercase, number & special symbol.')}
              </p>
            )}
          </div>

          {/* 6. CONFIRM PASSWORD */}
          <div>
            <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-700 font-semibold mb-1.5">
              {t('auth.confirmPassword', 'CONFIRM PASSWORD *')}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder={t('auth.confirmPasswordPlaceholder', 'Confirm your password')}
                className={`w-full border px-3.5 py-2.5 text-xs text-[#111111] outline-none transition-colors pr-10 ${errors.confirmPassword
                    ? 'border-red-500 focus:border-red-600 bg-red-50/20'
                    : 'border-neutral-300 focus:border-black placeholder:text-neutral-400'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-black cursor-pointer"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
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
            {errors.confirmPassword && (
              <p className="mt-1 text-[11px] font-mono text-red-500 tracking-wide flex items-center gap-1">
                <span>•</span>
                <span>{errors.confirmPassword}</span>
              </p>
            )}
          </div>

          {/* Terms & Privacy Notice đồng bộ với Footer */}
          <p className="text-[11px] text-neutral-400 font-mono leading-relaxed pt-1">
            {t('auth.agreeNotice', "By creating an account, you agree to Fashora's")}{' '}
            <Link
              to="/terms-of-use"
              state={{ from: '/register' }}
              className="underline text-neutral-600 hover:text-black cursor-pointer font-medium"
            >
              {t('auth.termsOfUse', 'Terms of Use')}
            </Link>{' '}
            {t('auth.and', 'and')}{' '}
            <Link
              to="/privacy-policy"
              state={{ from: '/register' }}
              className="underline text-neutral-600 hover:text-black cursor-pointer font-medium"
            >
              {t('auth.privacyPolicy', 'Privacy Policy')}
            </Link>.
          </p>

          {/* Nút CREATE ACCOUNT */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 bg-[#111111] text-white text-xs font-mono uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? t('auth.creating', 'CREATING ACCOUNT...') : t('auth.register', 'CREATE ACCOUNT')}
          </button>
        </form>

        {/* Chuyển hướng sang Login - ghim cố định ở đáy thẻ với đường viền mờ */}
        <div className="px-8 sm:px-10 py-4 shrink-0 border-t border-neutral-100 text-center text-xs font-mono text-neutral-500 bg-white/40">
          {t('auth.alreadyHaveAccount', 'Already have an account?')}{' '}
          <Link to="/login" className="text-black font-bold uppercase underline hover:text-neutral-700 ml-1">
            {t('auth.login', 'LOGIN')}
          </Link>
        </div>
      </div>

      {/* Dòng bảo mật con dấu dưới thẻ */}
      <div className="mt-6 text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 select-none">
        {t('auth.securityBadge', 'AUTONOMOUS ATELIER SECURITY • 256-BIT ENCRYPTED')}
      </div>
    </div>
  )
}
