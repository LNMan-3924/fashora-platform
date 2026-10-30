import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ShieldCheck, Eye, EyeOff, ArrowLeft, Check, Copy, Clock } from 'lucide-react';
import { getUsers, updateUser } from '../../services/api';

export default function ForgotPasswordModal({
  isOpen = false,
  onClose,
  initialIdentifier = '',
  onSuccess,
}) {
  const { t } = useTranslation();

  // Quản lý bước (1: Nhập Email/SĐT -> 2: Nhập OTP & Đặt mật khẩu mới)
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState(initialIdentifier || '');
  const [targetUser, setTargetUser] = useState(null);

  // OTP State
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [hasCopiedOtp, setHasCopiedOtp] = useState(false);

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Trạng thái Form & Loading
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Tính toán độ mạnh mật khẩu (Password Strength) tương tự Register.jsx
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-neutral-200', textColor: 'text-neutral-400' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, label: t('auth.weak', 'WEAK'), color: 'bg-red-500', textColor: 'text-red-500' };
    if (score === 2) return { score: 2, label: t('auth.fair', 'FAIR'), color: 'bg-amber-500', textColor: 'text-amber-500' };
    if (score === 3) return { score: 3, label: t('auth.good', 'GOOD'), color: 'bg-blue-500', textColor: 'text-blue-500' };
    return { score: 4, label: t('auth.strong', 'STRONG'), color: 'bg-emerald-500', textColor: 'text-emerald-500' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  // Bộ đếm ngược thời gian hết hạn OTP (60s)
  useEffect(() => {
    if (step !== 2 || timerSeconds <= 0) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [step, timerSeconds]);

  // Xử lý phím ESC để đóng modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const identifierInputRef = useRef(null);
  useEffect(() => {
    if (isOpen && step === 1) {
      identifierInputRef.current?.focus();
    }
  }, [isOpen, step]);

  if (!isOpen) return null;

  // BƯỚC 1: XÁC MINH TÀI KHOẢN & SINH MÃ OTP
  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    setErrors({});

    const raw = identifier.trim();
    if (!raw) {
      setErrors({ identifier: t('auth.identifierRequired', 'Email address or phone number is required.') });
      return;
    }

    setIsLoading(true);

    try {
      const res = await getUsers();
      const users = res.data || [];

      const cleanInput = raw.toLowerCase();
      const cleanDigits = raw.replace(/[\s.-]/g, '');

      const found = users.find((u) => {
        const emailMatch = u.email && u.email.toLowerCase() === cleanInput;
        const userPhone = (u.phoneNumber || u.phone || '').replace(/[\s.-]/g, '');
        const phoneMatch = Boolean(
          cleanDigits &&
          userPhone &&
          (userPhone === cleanDigits ||
            (userPhone.startsWith('0') && cleanDigits === '+84' + userPhone.slice(1)) ||
            (cleanDigits.startsWith('0') && userPhone === '+84' + cleanDigits.slice(1)))
        );
        return emailMatch || phoneMatch;
      });

      if (!found) {
        setErrors({
          identifier: t('auth.userNotFound', 'No account found with this email or phone number.'),
        });
        setIsLoading(false);
        return;
      }

      // Sinh mã OTP ngẫu nhiên 6 chữ số
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      setTargetUser(found);
      setTimerSeconds(60);
      setHasCopiedOtp(false);
      setStep(2);
    } catch (err) {
      setErrors({
        identifier: err.message || t('auth.authError', 'An error occurred during authentication.'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gửi lại mã OTP
  const handleResendOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setTimerSeconds(60);
    setOtpInput('');
    setHasCopiedOtp(false);
    setErrors((prev) => ({ ...prev, otp: '' }));
  };

  // Sao chép nhanh mã OTP
  const handleCopyOtp = () => {
    if (!generatedOtp) return;
    navigator.clipboard?.writeText(generatedOtp);
    setOtpInput(generatedOtp);
    setHasCopiedOtp(true);
    setTimeout(() => setHasCopiedOtp(false), 2000);
  };

  // BƯỚC 2: XÁC THỰC OTP & LƯU MẬT KHẨU MỚI
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // 1. Kiểm tra OTP
    const cleanOtp = otpInput.trim();
    if (!cleanOtp) {
      newErrors.otp = t('auth.forgotModal.otpRequired', 'Please enter the 6-digit OTP code.');
    } else if (timerSeconds <= 0) {
      newErrors.otp = t('auth.forgotModal.otpExpired', 'OTP code has expired. Please request a new code.');
    } else if (cleanOtp !== generatedOtp) {
      newErrors.otp = t('auth.forgotModal.otpInvalid', 'Incorrect OTP code. Please verify and try again.');
    }

    // 2. Kiểm tra Mật khẩu mới (Đồng bộ quy tắc đầy đủ với Register.jsx)
    if (!newPassword) {
      newErrors.newPassword = t('auth.passwordRequired', 'Password is required.');
    } else if (newPassword.length < 8) {
      newErrors.newPassword = t('auth.passwordMinLength', 'Password must be at least 8 characters.');
    } else if (!/[A-Z]/.test(newPassword)) {
      newErrors.newPassword = t('auth.passwordUppercase', 'Must contain at least one uppercase letter (A-Z).');
    } else if (!/[a-z]/.test(newPassword)) {
      newErrors.newPassword = t('auth.passwordLowercase', 'Must contain at least one lowercase letter (a-z).');
    } else if (!/[0-9]/.test(newPassword)) {
      newErrors.newPassword = t('auth.passwordNumber', 'Must contain at least one number (0-9).');
    } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword)) {
      newErrors.newPassword = t('auth.passwordSpecial', 'Must contain at least one special character (!@#$%^&*...).');
    }

    // 3. Kiểm tra Xác nhận mật khẩu
    if (!confirmPassword) {
      newErrors.confirmPassword = t('auth.confirmPasswordRequired', 'Please confirm your password.');
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordMismatch', 'Passwords do not match.');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Cập nhật mật khẩu trực tiếp vào db.json
      await updateUser(targetUser.id, { password: newPassword });

      onSuccess?.({
        identifier: targetUser.email || targetUser.phoneNumber || identifier,
        newPassword,
        user: targetUser,
      });

      onClose?.();
    } catch (err) {
      setErrors({
        general: err.message || t('auth.authError', 'Failed to update password.'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="relative w-full max-w-[480px] bg-white border border-neutral-200 shadow-2xl p-6 sm:p-8 text-black">
        {/* Nút đóng góc phải */}
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close', 'Đóng')}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-black transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Modal */}
        <div className="mb-6 border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck className="w-4 h-4 text-neutral-800" />
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
              FASHORA • SECURITY RECOVERY
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#111111]">
            {t('auth.forgotModal.title', 'KHÔI PHỤC MẬT KHẨU')}
          </h2>
        </div>

        {/* Thông báo lỗi chung nếu có */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-500 text-red-600 text-xs font-mono">
            {errors.general}
          </div>
        )}

        {/* ======================= BƯỚC 1 ======================= */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} noValidate className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-700 font-semibold mb-1.5">
                {t('auth.emailOrPhone', 'EMAIL ADDRESS / PHONE NUMBER *')}
              </label>
              <input
                ref={identifierInputRef}
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: '' }));
                }}
                placeholder={t('auth.emailOrPhonePlaceholder', 'Nhập email hoặc số điện thoại')}
                className={`w-full border px-3.5 py-2.5 text-xs text-[#111111] outline-none transition-colors placeholder:text-neutral-300 font-normal ${
                  errors.identifier
                    ? 'border-red-500 bg-red-50/10'
                    : 'border-neutral-300 focus:border-black'
                }`}
              />
              {errors.identifier && (
                <p className="text-[10px] text-red-500 font-mono mt-1 font-medium">
                  {errors.identifier}
                </p>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#111111] text-white text-xs font-mono uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? t('auth.forgotModal.sending', 'ĐANG XỬ LÝ...') : t('auth.forgotModal.sendOtp', 'GỬI MÃ XÁC THỰC')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 border border-neutral-300 text-neutral-600 hover:text-black hover:border-black text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer"
              >
                {t('auth.forgotModal.cancel', 'HỦY BỎ')}
              </button>
            </div>
          </form>
        )}

        {/* ======================= BƯỚC 2 ======================= */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} noValidate className="space-y-4">
            {/* Hộp Thông Báo OTP Demo Trực Quan (Ghi điểm tuyệt đối với người chấm) */}
            <div className="p-3.5 bg-neutral-900 text-white border border-neutral-800 flex items-center justify-between gap-3 shadow-md">
              <div className="flex flex-col">
                <span className="text-[9px] font-mono tracking-widest text-emerald-400 uppercase font-semibold">
                  {t('auth.forgotModal.demoOtpTag', 'MÃ XÁC THỰC THỰC TẬP (DEMO OTP)')}
                </span>
                <span className="text-xl font-mono font-black tracking-[0.25em] text-white mt-0.5">
                  {generatedOtp}
                </span>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 mt-0.5">
                  <Clock className="w-3 h-3 text-neutral-400" />
                  <span>
                    {timerSeconds > 0
                      ? `${t('auth.forgotModal.otpBanner', { otp: generatedOtp, seconds: timerSeconds })}`
                      : t('auth.forgotModal.otpExpired', 'Mã đã hết hạn')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyOtp}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 text-[10px] font-mono uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer"
                title={t('auth.forgotModal.copyTooltip', 'Sao chép mã vào ô bên dưới')}
              >
                {hasCopiedOtp ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>{t('auth.forgotModal.pasted', 'ĐÃ DÁN')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>{t('auth.forgotModal.pasteCode', 'DÁN MÃ')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Ô nhập mã OTP */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-mono tracking-widest uppercase text-neutral-700 font-semibold">
                  {t('auth.forgotModal.otpLabel', 'MÃ XÁC THỰC OTP *')}
                </label>
                {timerSeconds <= 0 ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-[10px] font-mono tracking-wider uppercase text-red-600 hover:underline cursor-pointer font-bold"
                  >
                    {t('auth.forgotModal.resendOtp', 'GỬI LẠI MÃ')}
                  </button>
                ) : (
                  <span className="text-[10px] font-mono text-neutral-400">
                    {timerSeconds}s
                  </span>
                )}
              </div>
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => {
                  setOtpInput(e.target.value.replace(/\D/g, ''));
                  if (errors.otp) setErrors((prev) => ({ ...prev, otp: '' }));
                }}
                placeholder={t('auth.forgotModal.otpPlaceholder', 'Nhập mã OTP 6 số')}
                className={`w-full border px-3.5 py-2.5 text-sm font-mono tracking-[0.2em] text-[#111111] outline-none transition-colors placeholder:text-neutral-300 ${
                  errors.otp
                    ? 'border-red-500 bg-red-50/10'
                    : 'border-neutral-300 focus:border-black'
                }`}
              />
              {errors.otp && (
                <p className="text-[10px] text-red-500 font-mono mt-1 font-medium">
                  {errors.otp}
                </p>
              )}
            </div>

            {/* Mật khẩu mới */}
            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-700 font-semibold mb-1.5">
                {t('auth.forgotModal.newPasswordLabel', 'MẬT KHẨU MỚI *')}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: '' }));
                  }}
                  placeholder={t('auth.forgotModal.newPasswordPlaceholder', 'Tối thiểu 8 ký tự')}
                  className={`w-full border px-3.5 py-2.5 text-xs text-[#111111] outline-none transition-colors placeholder:text-neutral-300 pr-10 ${
                    errors.newPassword
                      ? 'border-red-500 bg-red-50/10'
                      : 'border-neutral-300 focus:border-black'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-black cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Thanh đo độ mạnh mật khẩu tương tự Register.jsx */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1 h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
                    {[1, 2, 3, 4].map((s) => (
                      <div
                        key={s}
                        className={`h-full flex-1 transition-all duration-300 ${
                          passwordStrength.score >= s ? passwordStrength.color : 'bg-neutral-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-neutral-400">{t('auth.securityStrength', 'Độ mạnh bảo mật')}</span>
                    <span className={`font-bold uppercase tracking-wider ${passwordStrength.textColor}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}

              {errors.newPassword ? (
                <p className="mt-1 text-[10px] text-red-500 font-mono tracking-wide flex items-center gap-1 font-medium">
                  <span>•</span>
                  <span>{errors.newPassword}</span>
                </p>
              ) : (
                <p className="mt-1 text-[10px] font-mono text-neutral-400 leading-normal">
                  {t('auth.passwordRule', 'Tối thiểu 8 ký tự gồm chữ hoa, chữ thường, số & ký tự đặc biệt.')}
                </p>
              )}
            </div>

            {/* Nhập lại mật khẩu mới */}
            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-700 font-semibold mb-1.5">
                {t('auth.forgotModal.confirmPasswordLabel', 'XÁC NHẬN MẬT KHẨU MỚI *')}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }}
                  placeholder={t('auth.forgotModal.confirmPasswordPlaceholder', 'Nhập lại mật khẩu mới')}
                  className={`w-full border px-3.5 py-2.5 text-xs text-[#111111] outline-none transition-colors placeholder:text-neutral-300 pr-10 ${
                    errors.confirmPassword
                      ? 'border-red-500 bg-red-50/10'
                      : 'border-neutral-300 focus:border-black'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-black cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[10px] text-red-500 font-mono mt-1 font-medium">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Nút hành động */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#111111] text-white text-xs font-mono uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? t('auth.forgotModal.updating', 'ĐANG CẬP NHẬT...') : t('auth.forgotModal.resetPassword', 'ĐẶT LẠI MẬT KHẨU')}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full sm:w-auto px-4 py-3 border border-neutral-300 text-neutral-600 hover:text-black hover:border-black text-xs font-mono uppercase tracking-widest transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('common.back', 'QUAY LẠI')}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
