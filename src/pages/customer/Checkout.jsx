import { useState, useRef } from 'react'
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom'
import { useCartStore } from '../../stores/useCartStore'
import { createOrder, updateUser, patchProduct } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
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
  validateField,
  validateShippingAddress,
  groupItemsByShop,
} from '../../constants'

/**
 * Component CheckoutFormContent:
 * Quản lý logic form đặt hàng và tương tác người dùng khi đã xác thực tài khoản.
 * Được mount khi currentUser đã sẵn sàng từ API, đảm bảo khởi tạo đúng dữ liệu mà không cần gọi setState đồng bộ trong effect.
 */
function CheckoutFormContent({
  currentUser,
  updateCurrentUser,
  displayItems,
  selectedCheckoutItems,
}) {
  const navigate = useNavigate()
  const removeItemsFromCart = useCartStore((state) => state.removeItemsFromCart)
  const clearCart = useCartStore((state) => state.clearCart)

  // Danh sách địa chỉ đã lưu: Trích xuất từ currentUser (API backend, không lạm dụng useMemo)
  const savedAddresses = getSavedAddresses(currentUser)

  // State quản lý thông tin người nhận hàng: Khởi tạo từ địa chỉ mặc định hoặc hồ sơ người dùng
  const [formData, setFormData] = useState(() => {
    const defaultAddr = getDefaultShippingAddress(currentUser)
    return {
      fullName:
        defaultAddr?.name ||
        defaultAddr?.fullName ||
        currentUser?.fullName ||
        currentUser?.name ||
        '',
      phone:
        defaultAddr?.phone ||
        defaultAddr?.phoneNumber ||
        currentUser?.phoneNumber ||
        currentUser?.phone ||
        '',
      address: defaultAddr?.address || defaultAddr?.street || '',
      ward: defaultAddr?.ward || '',
      district: defaultAddr?.district || '',
      city: defaultAddr?.city || '',
    }
  })

  // State quản lý phương thức vận chuyển (Mặc định 0 = Miễn phí tiêu chuẩn)
  const [shippingMethod, setShippingMethod] = useState(0)

  // State quản lý phương thức thanh toán (Chỉ COD theo yêu cầu thiết kế)
  const [paymentMethod, setPaymentMethod] = useState('cod')

  // State quản lý các lỗi kiểm tra tính hợp lệ của Form (Form Validation)
  const [errors, setErrors] = useState({})

  // State thể hiện trạng thái đang gửi đơn hàng lên máy chủ (Loading state)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submittingRef = useRef(false)

  // Xử lý chọn nhanh 1 địa chỉ đã lưu từ Profile
  const handleSelectSavedAddress = (addr) => {
    if (!addr) return
    setFormData({
      fullName: addr.name || addr.fullName || '',
      phone: addr.phone || addr.phoneNumber || '',
      address: addr.address || addr.street || '',
      ward: addr.ward || '',
      district: addr.district || '',
      city: addr.city || '',
    })
    setErrors({})
  }

  // Tính toán tổng tiền hàng và tổng thanh toán (tính trực tiếp, không tốn RAM memoize)
  const subtotal = displayItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  )

  const orderTotal = subtotal + shippingMethod

  // Xử lý thay đổi dữ liệu trong form thông tin giao hàng (hỗ trợ cả cặp key-value lẫn DOM SyntheticEvent)
  const handleInputChange = (fieldOrEvent, maybeValue) => {
    let field = fieldOrEvent
    let val = maybeValue

    if (fieldOrEvent && fieldOrEvent.target) {
      field = fieldOrEvent.target.name
      val = fieldOrEvent.target.value
    }

    if (!field) return

    setFormData((prev) => ({
      ...prev,
      [field]: val,
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
  const handleInputBlur = (fieldOrEvent) => {
    const field = fieldOrEvent?.target ? fieldOrEvent.target.name : fieldOrEvent
    if (!field) return

    const errorMsg = validateField(field, formData[field])
    if (errorMsg) {
      setErrors((prev) => ({ ...prev, [field]: errorMsg }))
    }
  }

  // Kiểm tra tổng quát toàn bộ form trước khi gửi đơn bằng hàm dùng chung
  const validateAll = () => {
    const { isValid, errors: newErrors } = validateShippingAddress(formData)
    setErrors(newErrors)
    return { isValid, newErrors }
  }

  // Xử lý xác nhận đặt hàng (Place Order)
  const handleSubmitOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault()

    if (isSubmitting || submittingRef.current) return

    // 1. Kiểm tra giỏ hàng
    if (!displayItems || displayItems.length === 0) {
      alert('Your cart is empty. Please select products to checkout.')
      navigate('/cart')
      return
    }

    // 2. Kiểm tra tính hợp lệ của toàn bộ form
    const { isValid, newErrors } = validateAll()
    if (!isValid) {
      const firstErrorField = Object.keys(newErrors)[0]
      if (firstErrorField) {
        const el =
          document.getElementById(firstErrorField) ||
          document.querySelector(`[name="${firstErrorField}"]`)
        if (el) {
          el.focus?.()
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
      return
    }

    submittingRef.current = true
    setIsSubmitting(true)

    // 3. Phân nhóm các sản phẩm theo từng Shop (Mô hình Multi-Shop Split Orders - Tái sử dụng SSOT)
    const itemsByShop = groupItemsByShop(displayItems)
    const shopEntries = Object.values(itemsByShop)
    const isMultiShop = shopEntries.length > 1
    const baseRandomDigits = Math.floor(100000000 + Math.random() * 900000000)
    const nowTime = Date.now()

    // Tạo payload đơn hàng độc lập cho từng shop
    const orderPayloads = shopEntries.map((shopGroup, index) => {
      // Phí vận chuyển: Nếu có phí Express và mua từ nhiều shop thì chia đều theo shop, hoặc miễn phí Standard
      const groupShippingFee =
        shippingMethod > 0
          ? isMultiShop
            ? Math.round(shippingMethod / shopEntries.length)
            : shippingMethod
          : 0

      const groupSubtotal = shopGroup.items.reduce(
        (acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
        0
      )
      const groupTotal = groupSubtotal + groupShippingFee

      // Mã đơn hàng: Nếu 1 shop -> #SPXVN123456789. Nếu nhiều shop -> #SPXVN123456789-1, #SPXVN123456789-2
      const orderNumber = isMultiShop
        ? `#SPXVN${baseRandomDigits}-${index + 1}`
        : `#SPXVN${baseRandomDigits}`

      return {
        orderNumber,
        userId: currentUser?.id || null,
        customerEmail: currentUser?.email || null,
        recipient: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          ward: (formData.ward || '').trim(),
          district: (formData.district || '').trim(),
          city: (formData.city || '').trim(),
        },
        shopId: shopGroup.shopId,
        shopName: shopGroup.shopName,
        items: shopGroup.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          selectedSize: item.selectedSize || 'Standard',
          selectedColor: item.selectedColor || 'Standard',
          image: item.image || item.images?.[0] || FALLBACK_IMAGE,
          shopId: shopGroup.shopId,
          shopName: shopGroup.shopName,
        })),
        shippingFee: groupShippingFee,
        shippingMethod:
          shippingMethod > 0
            ? 'Express Courier (+₫35,000)'
            : 'Standard Delivery (Complimentary)',
        paymentMethod: 'Cash on Delivery (COD)',
        subtotal: groupSubtotal,
        total: groupTotal,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        logistics: {
          courier: 'SPX Express',
          waybill: `VN${String(nowTime).slice(-7)}${index + 1}VN`,
        },
      }
    })

    // Hàm dọn dẹp giỏ hàng và trừ tồn kho dùng chung (chống trùng lặp giữa try và catch)
    const performPostCheckoutCleanup = () => {
      displayItems.forEach(async (item) => {
        try {
          if (item?.id) {
            const currentStock = typeof item.stock === 'number' ? item.stock : 10
            const newStock = Math.max(0, currentStock - (Number(item.quantity) || 1))
            await patchProduct(item.id, {
              stock: newStock,
              isSoldOut: newStock === 0,
            })
          }
        } catch (stockErr) {
          console.warn('Checkout: Không thể trừ tồn kho sản phẩm:', item?.id, stockErr)
        }
      })

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
    }

    let finalOrders = orderPayloads

    try {
      // 1. Gửi các đơn hàng lên máy chủ db.json qua API POST /orders song song
      const savedOrders = await Promise.all(
        orderPayloads.map((payload) =>
          createOrder(payload).then((res) => res?.data || res)
        )
      )
      if (Array.isArray(savedOrders) && savedOrders.length > 0) {
        finalOrders = savedOrders
      }

      // 2. Tự động lưu địa chỉ vào tài khoản nếu user chưa có địa chỉ lưu sẵn
      const hasAccountAddress =
        Array.isArray(currentUser?.shippingAddresses) && currentUser.shippingAddresses.length > 0

      if (currentUser?.id && !hasAccountAddress && formData.address?.trim()) {
        try {
          const newShippingAddr = {
            id: `ADDR-${Math.floor(1000 + Math.random() * 9000)}`,
            name: formData.fullName.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            ward: (formData.ward || '').trim(),
            district: (formData.district || '').trim(),
            city: (formData.city || '').trim(),
            isDefault: true,
            isVerified: true,
          }

          const userPayload = {
            shippingAddresses: [newShippingAddr],
          }

          const updateRes = await updateUser(currentUser.id, userPayload)
          const updatedUser = updateRes?.data || updateRes
          if (updateCurrentUser) {
            updateCurrentUser(updatedUser)
          }
        } catch (addrErr) {
          console.warn('Checkout: Không thể tự động lưu địa chỉ vào tài khoản qua API:', addrErr)
        }
      }
    } catch (err) {
      console.warn(
        'Checkout: Không thể kết nối API db.json, lưu đơn hàng offline:',
        err?.message
      )
    }

    // =========================================================================
    // HOÀN TẤT ĐẶT HÀNG DÙNG CHUNG (KHỬ TRÙNG LẶP CODE TRY/CATCH)
    // =========================================================================
    // 1. Đồng bộ từng đơn hàng vào LocalStorage (Single Source of Truth)
    finalOrders.forEach((so) => storeUserOrder(so))

    // 2. Thực thi trừ tồn kho và dọn dẹp giỏ hàng
    performPostCheckoutCleanup()

    // 3. Reset cờ submit và cuộn màn hình
    submittingRef.current = false
    setIsSubmitting(false)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

    // 4. Chuẩn hóa dữ liệu và điều hướng sang trang xác nhận thành công
    navigate('/order-success', {
      state: {
        orderNumber: finalOrders.map((o) => o.orderNumber).join(', '),
        orderNumbers: finalOrders.map((o) => ({
          orderNumber: o.orderNumber,
          shopName: o.shopName,
          total: o.total,
        })),
        total: orderTotal,
        orderId: finalOrders[0]?.id,
      },
    })
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
            items={displayItems}
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
  const location = useLocation()
  const cartItems = useCartStore((state) => state.cartItems)

  // Lấy dữ liệu người dùng xác thực từ AuthContext (gọi API)
  const { currentUser, loading: authLoading, updateCurrentUser } = useAuth()

  // Lấy danh sách sản phẩm được tick chọn để thanh toán (tính trực tiếp, không memoize thừa)
  let selectedCheckoutItems = cartItems
  if (
    location.state?.selectedItems &&
    Array.isArray(location.state.selectedItems) &&
    location.state.selectedItems.length > 0
  ) {
    selectedCheckoutItems = location.state.selectedItems
  } else {
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
        if (validItems.length > 0) selectedCheckoutItems = validItems
      }
    } catch {
      // ignore
    }
  }

  // Danh sách sản phẩm thực tế cần thanh toán
  const displayItems = selectedCheckoutItems

  // 1. Kiểm tra trạng thái tải thông tin xác thực từ API
  if (authLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs font-mono tracking-widest uppercase text-neutral-400">
          Loading checkout details...
        </p>
      </div>
    )
  }

  // 2. Yêu cầu: Khi chưa login thì không cho vào checkout, nếu vào thì chuyển đến login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 3. Trường hợp giỏ hàng hoặc danh sách thanh toán trống
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
            <Link
              to="/cart"
              className="w-full sm:w-auto px-6 py-3 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors cursor-pointer inline-block text-center"
            >
              RETURN TO CART
            </Link>
            <Link
              to="/shop"
              className="w-full sm:w-auto px-6 py-3 border border-neutral-300 text-neutral-700 text-xs font-semibold uppercase tracking-wider hover:border-black hover:text-black transition-colors cursor-pointer inline-block text-center"
            >
              EXPLORE SHOP
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <CheckoutFormContent
      key={currentUser.id}
      currentUser={currentUser}
      updateCurrentUser={updateCurrentUser}
      displayItems={displayItems}
      selectedCheckoutItems={selectedCheckoutItems}
    />
  )
}
