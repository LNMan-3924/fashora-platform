import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCartStore } from '../../stores/useCartStore'
import { createOrder } from '../../services/api'
import {
  CheckoutSteps,
  ShippingForm,
  ShippingMethod,
  PaymentMethod,
  OrderReview,
  CheckoutOrderSummary,
} from '../../components/checkout'
import {
  getDefaultShippingAddress,
  getSavedAddresses,
} from '../../components/profile'
import {
  storeUserOrder,
  COMMERCE_STORAGE_KEYS,
  FALLBACK_IMAGE,
} from '../../constants'

/**
 * Trang Đặt hàng Checkout (Customer Checkout Page):
 * - Tích hợp gọi API POST /orders vào db.json khi người dùng xác nhận đặt hàng.
 * - Tự động đồng bộ với giỏ hàng thực tế từ Zustand Store (không dùng mock/demo items).
 * - Lưu đơn hàng vào LocalStorage (fashora_user_orders) để tra cứu lịch sử mua hàng mọi lúc.
 * - Quản lý form thông tin người nhận, gói vận chuyển, phương thức thanh toán COD.
 * - Kiểm tra (validate) chặt chẽ dữ liệu đầu vào người dùng: họ tên, SĐT, địa chỉ 3 cấp.
 * - Hỗ trợ responsive toàn diện trên Mobile, Tablet và Desktop.
 */
export default function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()

  // 1. Lấy dữ liệu giỏ hàng và hàm xóa từ Zustand Store
  const cartItems = useCartStore((state) => state.cartItems)
  const removeItemsFromCart = useCartStore((state) => state.removeItemsFromCart)
  const clearCart = useCartStore((state) => state.clearCart)

  // Lấy danh sách sản phẩm được tick chọn để thanh toán:
  // - Ưu tiên 1: Lấy từ state do trang Cart truyền sang (location.state.selectedItems)
  // - Ưu tiên 2: Lấy từ sessionStorage (nếu người dùng F5 tải lại trang Checkout)
  // - Ưu tiên 3: Nếu vào trực tiếp mà giỏ có hàng thì lấy toàn bộ cartItems
  const selectedCheckoutItems = useMemo(() => {
    if (
      location.state?.selectedItems &&
      Array.isArray(location.state.selectedItems) &&
      location.state.selectedItems.length > 0
    ) {
      return location.state.selectedItems
    }
    try {
      const saved = JSON.parse(
        sessionStorage.getItem(COMMERCE_STORAGE_KEYS.CHECKOUT_ITEMS) || '[]'
      )
      if (Array.isArray(saved) && saved.length > 0) {
        // Chỉ giữ lại các sản phẩm vẫn còn thực tế trong giỏ hàng
        const validItems = saved.filter((s) =>
          cartItems.some(
            (c) =>
              c.id === s.id &&
              (c.selectedSize || 'Standard') === (s.selectedSize || 'Standard') &&
              (c.selectedColor || 'Standard') === (s.selectedColor || 'Standard')
          )
        )
        if (validItems.length > 0) return validItems
      }
    } catch {
      // ignore
    }
    return cartItems
  }, [location.state, cartItems])

  // Danh sách sản phẩm thực tế cần thanh toán
  const displayItems = selectedCheckoutItems

  // 2. Danh sách địa chỉ đã lưu từ Profile
  const [savedAddresses] = useState(() => getSavedAddresses())

  // State quản lý thông tin người nhận hàng: Tự động nạp từ địa chỉ mặc định trong Profile (nếu có)
  const [formData, setFormData] = useState(() => {
    const defaultAddr = getDefaultShippingAddress()
    return {
      fullName: defaultAddr?.name || '',
      phone: defaultAddr?.phone || '',
      address: defaultAddr?.street || '',
      ward: defaultAddr?.ward || '',
      district: defaultAddr?.district || '',
      city: defaultAddr?.city || '',
    }
  })

  // Xử lý chọn nhanh 1 địa chỉ đã lưu từ Profile
  const handleSelectSavedAddress = (addr) => {
    setFormData({
      fullName: addr.name || '',
      phone: addr.phone || '',
      address: addr.street || '',
      ward: addr.ward || '',
      district: addr.district || '',
      city: addr.city || '',
    })
    setErrors({})
  }

  // 3. State quản lý phương thức vận chuyển (Mặc định 0 = Miễn phí tiêu chuẩn)
  const [shippingMethod, setShippingMethod] = useState(0)

  // 4. State quản lý phương thức thanh toán (Chỉ COD theo yêu cầu thiết kế)
  const [paymentMethod, setPaymentMethod] = useState('cod')

  // 5. State quản lý các lỗi kiểm tra tính hợp lệ của Form (Form Validation)
  const [errors, setErrors] = useState({})

  // 6. State thể hiện trạng thái đang gửi đơn hàng lên máy chủ (Loading state)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Tính toán tổng tiền hàng và tổng thanh toán
  const subtotal = useMemo(() => {
    return displayItems.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    )
  }, [displayItems])

  const orderTotal = subtotal + shippingMethod

  // Xử lý thay đổi dữ liệu trong form thông tin giao hàng
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Tự động xóa thông báo lỗi của trường đó khi người dùng bắt đầu nhập lại
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  // Kiểm tra tính hợp lệ từng trường khi người dùng blur khỏi ô input
  const handleInputBlur = (field) => {
    const value = (formData[field] || '').trim()
    let errorMsg = ''

    if (field === 'fullName' && !value) {
      errorMsg = 'Full name is required.'
    } else if (field === 'phone') {
      if (!value) {
        errorMsg = 'Phone number is required.'
      } else {
        const cleanPhone = value.replace(/[\s.-]/g, '')
        const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/
        if (!phoneRegex.test(cleanPhone)) {
          errorMsg = 'Please enter a valid Vietnamese phone number (10 digits).'
        }
      }
    } else if (field === 'address' && !value) {
      errorMsg = 'Street address is required.'
    } else if (field === 'ward' && !value) {
      errorMsg = 'Ward is required.'
    } else if (field === 'district' && !value) {
      errorMsg = 'District is required.'
    } else if (field === 'city' && !value) {
      errorMsg = 'City / Province is required.'
    }

    if (errorMsg) {
      setErrors((prev) => ({ ...prev, [field]: errorMsg }))
    }
  }

  // Kiểm tra tổng quát toàn bộ form trước khi gửi đơn
  const validateAll = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.'
    }

    const cleanPhone = formData.phone.replace(/[\s.-]/g, '')
    if (!cleanPhone) {
      newErrors.phone = 'Phone number is required.'
    } else {
      const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phone = 'Please enter a valid Vietnamese phone number (10 digits).'
      }
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Street address is required.'
    }
    if (!formData.ward.trim()) {
      newErrors.ward = 'Ward is required.'
    }
    if (!formData.district.trim()) {
      newErrors.district = 'District is required.'
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City / Province is required.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Xử lý xác nhận đặt hàng (Place Order)
  const handleSubmitOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault()

    if (isSubmitting) return

    // 1. Kiểm tra giỏ hàng
    if (!displayItems || displayItems.length === 0) {
      alert('Your cart is empty. Please select products to checkout.')
      navigate('/cart')
      return
    }

    // 2. Kiểm tra tính hợp lệ của toàn bộ form
    const isValid = validateAll()
    if (!isValid) {
      const firstErrorField = Object.keys(errors)[0]
      if (firstErrorField) {
        const el = document.getElementById(firstErrorField)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setIsSubmitting(true)

    // Tạo mã đơn hàng độc nhất theo chuẩn SPXVN + 9 chữ số ngẫu nhiên
    const randomDigits = Math.floor(100000000 + Math.random() * 900000000)
    const generatedOrderNumber = `#SPXVN${randomDigits}`

    // 3. Chuẩn bị payload đơn hàng đầy đủ
    const orderPayload = {
      orderNumber: generatedOrderNumber,
      recipient: {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        ward: formData.ward.trim(),
        district: formData.district.trim(),
        city: formData.city.trim(),
      },
      shopName: displayItems[0]?.shopName || 'M STUDIO',
      items: displayItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        selectedSize: item.selectedSize || 'Standard',
        selectedColor: item.selectedColor || 'Standard',
        image: item.image || item.images?.[0] || FALLBACK_IMAGE,
      })),
      shippingFee: shippingMethod,
      shippingMethod:
        shippingMethod > 0
          ? 'Express Courier (+₫35,000)'
          : 'Standard Delivery (Complimentary)',
      paymentMethod: 'Cash on Delivery (COD)',
      subtotal,
      total: orderTotal,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      logistics: {
        courier: 'SPX Express',
        waybill: `VN${Date.now().toString().slice(-8)}VN`,
      },
    }

    try {
      // Gửi đơn hàng lên máy chủ db.json qua API POST /orders
      const res = await createOrder(orderPayload)
      const savedOrder = res?.data || res

      // Đồng bộ vào LocalStorage bằng hàm dùng chung (Single Source of Truth)
      storeUserOrder(savedOrder || orderPayload)

      // Xóa các sản phẩm đã được thanh toán khỏi giỏ hàng
      if (removeItemsFromCart && selectedCheckoutItems.length > 0) {
        removeItemsFromCart(selectedCheckoutItems)
      } else {
        clearCart()
      }
      try {
        sessionStorage.removeItem(COMMERCE_STORAGE_KEYS.CHECKOUT_ITEMS)
      } catch {
        // ignore
      }

      setIsSubmitting(false)
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

      navigate('/order-success', {
        state: {
          orderNumber: savedOrder?.orderNumber || generatedOrderNumber,
          total: savedOrder?.total || orderTotal,
          orderId: savedOrder?.id,
        },
      })
    } catch (err) {
      console.warn(
        'Checkout: Khong the ket noi API db.json, luu don hang offline:',
        err?.message
      )
      // Vẫn hỗ trợ lưu đơn hàng offline an toàn
      persistOrderLocally(orderPayload)

      if (removeItemsFromCart && selectedCheckoutItems.length > 0) {
        removeItemsFromCart(selectedCheckoutItems)
      } else {
        clearCart()
      }
      try {
        sessionStorage.removeItem('fashora_checkout_items')
      } catch {
        // ignore
      }

      setIsSubmitting(false)
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

      navigate('/order-success', {
        state: {
          orderNumber: generatedOrderNumber,
          total: orderTotal,
        },
      })
    }
  }

  // TRƯỜNG HỢP GIỎ HÀNG HOẶC DANH SÁCH THANH TOÁN TRỐNG
  if (displayItems.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-md mx-auto p-8 sm:p-12 border border-neutral-200 bg-[#FAFAFA] rounded-[2px]">
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-[0.2em] text-[#111111] mb-2">
            NO ITEMS SELECTED FOR CHECKOUT
          </h2>
          <p className="text-xs text-neutral-500 mb-8 leading-relaxed">
            Your checkout list is currently empty. Please select products from your cart or explore our collections.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="w-full sm:w-auto px-6 py-3 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors cursor-pointer"
            >
              RETURN TO CART
            </button>
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="w-full sm:w-auto px-6 py-3 border border-neutral-300 text-neutral-700 text-xs font-semibold uppercase tracking-wider hover:border-black hover:text-black transition-colors cursor-pointer"
            >
              EXPLORE SHOP
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* 1. Thanh tiến trình các bước đặt hàng (Step Indicators) */}
      <CheckoutSteps />

      {/* 2. Bố cục chính 2 cột: Cột trái 7 phần (Forms), Cột phải 5 phần (Sticky Order Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* CỘT TRÁI: Các bước nhập thông tin, vận chuyển, COD & review */}
        <form
          onSubmit={handleSubmitOrder}
          noValidate
          className="lg:col-span-7 space-y-8"
        >
          {/* Bước 1: Form thông tin người nhận (Họ tên, SĐT, Địa chỉ 3 cấp) */}
          <ShippingForm
            formData={formData}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            errors={errors}
            savedAddresses={savedAddresses}
            onSelectSavedAddress={handleSelectSavedAddress}
          />

          {/* Bước 2: Phương thức giao hàng (Tiêu chuẩn hoặc Hỏa tốc) */}
          <ShippingMethod
            selectedMethod={shippingMethod}
            onChange={(cost) => setShippingMethod(cost)}
          />

          {/* Bước 3: Phương thức thanh toán (Chỉ giữ lại COD theo yêu cầu) */}
          <PaymentMethod
            selectedMethod={paymentMethod}
            onChange={(method) => setPaymentMethod(method)}
          />

          {/* Bước 4: Xem lại đơn hàng & Nút Place Order */}
          <OrderReview
            formData={formData}
            shippingMethod={shippingMethod}
            paymentMethod={paymentMethod}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmitOrder}
          />
        </form>

        {/* CỘT PHẢI: Tóm tắt đơn hàng, danh sách sản phẩm thực tế & con dấu bảo mật */}
        <CheckoutOrderSummary
          items={displayItems}
          shippingFee={shippingMethod}
        />
      </div>
    </div>
  )
}