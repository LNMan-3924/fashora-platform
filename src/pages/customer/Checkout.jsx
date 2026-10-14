import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCartStore } from '../../stores/useCartStore'
import { createOrder, getProducts } from '../../services/api'
import {
  CheckoutSteps,
  ShippingForm,
  ShippingMethod,
  PaymentMethod,
  OrderReview,
  CheckoutOrderSummary,
} from '../../components/checkout'

/**
 * Dữ liệu sản phẩm mẫu dự phòng (Atelier Demo Items) khi giỏ hàng trống và chưa kết nối được API.
 */
const DEMO_ORDER_ITEMS = [
  {
    id: 'demo-1',
    name: 'Cropped Structured Satin Shirt',
    price: 420000,
    quantity: 1,
    selectedSize: 'M',
    selectedColor: 'PURE WHITE',
    image: '/images/products/shirt/shirt-01.jpg',
  },
  {
    id: 'demo-2',
    name: 'Acid Flame Ombré Balloon Pants',
    price: 490000,
    quantity: 2,
    selectedSize: 'L',
    selectedColor: 'WASHED BLACK',
    image: '/images/products/pants/pants-01.jpg',
  },
  {
    id: 'demo-3',
    name: 'Multi-Buckle Thigh-High Moto Boots',
    price: 890000,
    quantity: 1,
    selectedSize: '39',
    selectedColor: 'OBSIDIAN BLACK',
    image: '/images/products/shoes/shoes-01.jpg',
  },
]

/**
 * Trang Đặt hàng Checkout (Customer Checkout Page):
 * - Tích hợp gọi API POST /orders vào db.json khi người dùng xác nhận đặt hàng.
 * - Lấy danh sách sản phẩm mẫu từ API GET /products khi giỏ hàng trống.
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

  // State lưu sản phẩm mẫu lấy từ API db.json khi giỏ hàng trống
  const [apiDemoItems, setApiDemoItems] = useState([])

  useEffect(() => {
    if (cartItems.length > 0) return

    let isMounted = true
    getProducts()
      .then((res) => {
        if (!isMounted) return
        const data = res?.data || res
        if (Array.isArray(data) && data.length > 0) {
          const sample = data.slice(0, 3).map((item) => ({
            ...item,
            image: item.image || item.images?.[0] || '/assets/fallback.png',
            selectedSize: item.sizes?.[0] || 'M',
            selectedColor: item.colors?.[0] || 'Standard',
            quantity: 1,
          }))
          setApiDemoItems(sample)
        }
      })
      .catch((err) => {
        console.warn('Checkout: Khong the lay san pham demo tu API db.json, su dung fallback:', err?.message)
      })

    return () => {
      isMounted = false
    }
  }, [cartItems.length])

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
        sessionStorage.getItem('fashora_checkout_items') || '[]'
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

  // Nếu có sản phẩm chọn thanh toán -> dùng selectedCheckoutItems.
  // Nếu giỏ hàng trống -> dùng API demo hoặc DEMO_ORDER_ITEMS
  const displayItems =
    selectedCheckoutItems.length > 0
      ? selectedCheckoutItems
      : apiDemoItems.length > 0
        ? apiDemoItems
        : DEMO_ORDER_ITEMS

  // 2. State quản lý thông tin người nhận hàng
  const [formData, setFormData] = useState({
    fullName: 'Helena Vance',
    phone: '0912345678',
    address: '742 Evergreen Terrace',
    ward: 'Phường Bến Nghé',
    district: 'Quận 1',
    city: 'Thành phố Hồ Chí Minh',
  })

  // State lưu lỗi validate của từng ô input
  const [errors, setErrors] = useState({})

  // State phương thức vận chuyển: 0 (Standard - Miễn phí) hoặc 50000 (Express)
  const [shippingMethod, setShippingMethod] = useState(0)

  // State phương thức thanh toán: Theo yêu cầu chỉ giữ lại COD
  const [paymentMethod, setPaymentMethod] = useState('cod')

  // State trạng thái đang gửi đơn hàng
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Hàm kiểm tra tính hợp lệ của từng trường input
   * Trả về thông báo lỗi dạng chuỗi tiếng Việt, hoặc rỗng nếu hợp lệ.
   */
  const validateField = (name, value) => {
    const trimmed = (value || '').trim()

    switch (name) {
      case 'fullName':
        if (!trimmed) return 'Họ và tên không được để trống.'
        if (trimmed.length < 2) return 'Họ và tên cần có ít nhất 2 ký tự.'
        return ''

      case 'phone': {
        if (!trimmed) return 'Số điện thoại không được để trống.'
        // Chuẩn hóa định dạng SĐT Việt Nam: 10 số bắt đầu bằng 0 hoặc +84
        const cleanPhone = trimmed.replace(/\s+/g, '')
        const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/
        if (!phoneRegex.test(cleanPhone)) {
          return 'Số điện thoại không hợp lệ (ví dụ: 0912345678 hoặc +84912345678).'
        }
        return ''
      }

      case 'address':
        if (!trimmed) return 'Địa chỉ đường / số nhà không được để trống.'
        if (trimmed.length < 3) return 'Vui lòng nhập địa chỉ chi tiết hơn.'
        return ''

      case 'ward':
        if (!trimmed) return 'Phường / Xã không được để trống.'
        return ''

      case 'district':
        if (!trimmed) return 'Quận / Huyện không được để trống.'
        return ''

      case 'city':
        if (!trimmed) return 'Tỉnh / Thành phố không được để trống.'
        return ''

      default:
        return ''
    }
  }

  /**
   * Xử lý thay đổi dữ liệu khi người dùng nhập vào input
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Nếu trường đó đang có lỗi, xóa ngay thông báo lỗi khi người dùng bắt đầu sửa
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  /**
   * Xử lý kiểm tra dữ liệu khi người dùng rời khỏi ô input (onBlur)
   */
  const handleInputBlur = (e) => {
    const { name, value } = e.target
    const fieldError = validateField(name, value)
    if (fieldError) {
      setErrors((prev) => ({ ...prev, [name]: fieldError }))
    }
  }

  /**
   * Xử lý khi người dùng nhấn đặt hàng (Place Order):
   * 1. Validate toàn bộ form thông tin.
   * 2. Tạo payload đơn hàng đầy đủ.
   * 3. Gửi lên máy chủ API POST /orders lưu vào db.json.
   * 4. Dọn sạch giỏ hàng và chuyển hướng sang Order Success.
   */
  const handleSubmitOrder = async (e) => {
    if (e) e.preventDefault()

    // Kiểm tra toàn bộ các trường thông tin
    const newErrors = {}
    Object.keys(formData).forEach((key) => {
      const errorMsg = validateField(key, formData[key])
      if (errorMsg) {
        newErrors[key] = errorMsg
      }
    })

    // Nếu phát hiện có lỗi
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)

      // Cuộn mượt đến phần tử đầu tiên bị lỗi để người dùng tiện sửa
      const firstErrorKey = Object.keys(newErrors)[0]
      const errorElement = document.querySelector(`[name="${firstErrorKey}"]`)
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        errorElement.focus()
      }
      return
    }

    // Nếu dữ liệu hợp lệ: Bắt đầu xử lý đơn hàng
    setIsSubmitting(true)

    const subtotal = displayItems.reduce(
      (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
      0
    )
    const orderTotal = subtotal + shippingMethod
    const generatedOrderNumber =
      '#SPXVN' + Math.floor(100000000 + Math.random() * 900000000)

    const orderPayload = {
      orderNumber: generatedOrderNumber,
      recipient: {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        ward: formData.ward,
        district: formData.district,
        city: formData.city,
      },
      items: displayItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize || 'Standard',
        selectedColor: item.selectedColor || 'Standard',
        image: item.image || item.images?.[0] || '/assets/fallback.png',
      })),
      shippingMethod:
        shippingMethod === 0
          ? 'Standard Delivery (Complimentary)'
          : 'Express Priority Courier (50,000₫)',
      shippingFee: shippingMethod,
      paymentMethod: 'Cash on Delivery (COD)',
      subtotal,
      total: orderTotal,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }

    try {
      // Gửi đơn hàng lên máy chủ db.json qua API POST /orders
      const res = await createOrder(orderPayload)
      const savedOrder = res?.data || res

      // Xóa CHỈ những sản phẩm đã được thanh toán khỏi giỏ hàng
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

      // Cuộn lên đầu trang trước khi chuyển trang
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
        'Checkout: Khong the luu don hang len db.json, su dung luong offline.',
        err?.message
      )
      // Vẫn hỗ trợ điều hướng an toàn trong trường hợp máy chủ chưa bật
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

      // Cuộn lên đầu trang trước khi chuyển trang
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

      navigate('/order-success', {
        state: {
          orderNumber: generatedOrderNumber,
          total: orderTotal,
        },
      })
    }
  }

  return (
    <div className="w-full">
      {/* 1. Thanh tiến trình các bước đặt hàng (Step Indicators) */}
      <CheckoutSteps />

      {/* Thông báo hiển thị chế độ demo nếu giỏ hàng hiện tại đang trống */}
      {cartItems.length === 0 && (
        <div className="mb-6 p-3.5 bg-neutral-100/70 border border-neutral-200 text-xs text-neutral-600 flex items-center justify-between flex-wrap gap-2">
          <span>
            <strong className="text-[#111111] uppercase tracking-wider">
              Atelier Archive Preview:
            </strong>{' '}
            Displaying sample archive garments for checkout simulation.
          </span>
          <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
            M STUDIO PREVIEW
          </span>
        </div>
      )}

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

        {/* CỘT PHẢI: Tóm tắt đơn hàng, danh sách sản phẩm & con dấu bảo mật */}
        <CheckoutOrderSummary
          items={displayItems}
          shippingFee={shippingMethod}
        />
      </div>
    </div>
  )
}