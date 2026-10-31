import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { AuthGuard, SellerGuard, CheckoutGuard } from '../components/common/ProtectedRoute'
import { ScrollToTop } from '../components/common'

// Layouts
import CustomerLayout from '../layouts/CustomerLayout'
import SellerLayout from '../layouts/SellerLayout'
import StorefrontLayout from '../layouts/StorefrontLayout'
import AuthLayout from '../layouts/AuthLayout'

// 1. Core Primary Customer Pages (Direct import để trang chủ & browse tải tức thì)
import Home from '../pages/customer/Home'
import Explore from '../pages/customer/Explore'
import Shop from '../pages/customer/Shop'
import ProductDetail from '../pages/customer/ProductDetail'
import Cart from '../pages/customer/Cart'

// 2. Auth Pages (Code Splitting - Lazy Load)
const Login = lazy(() => import('../pages/auth/Login'))
const Register = lazy(() => import('../pages/auth/Register'))

// 3. Customer Secondary Pages (Code Splitting - Lazy Load)
const StoryDetail = lazy(() => import('../pages/customer/StoryDetail'))
const BestSeller = lazy(() => import('../pages/customer/BestSeller'))
const Checkout = lazy(() => import('../pages/customer/Checkout'))
const OrderSuccess = lazy(() => import('../pages/customer/OrderSuccess'))
const Orders = lazy(() => import('../pages/customer/Orders'))
const OrderDetail = lazy(() => import('../pages/customer/OrderDetail'))
const Profile = lazy(() => import('../pages/customer/Profile'))
const FollowingShops = lazy(() => import('../pages/customer/FollowingShops'))
const PolicyPage = lazy(() => import('../pages/customer/PolicyPage'))

// 4. Seller Onboarding Pages (Code Splitting - Lazy Load)
const BecomeSellerLayout = lazy(() => import('../pages/seller-onboarding/BecomeSellerLayout'))
const BecomeSellerOverview = lazy(() => import('../pages/seller-onboarding/BecomeSellerOverview'))
const BecomeSellerInfo = lazy(() => import('../pages/seller-onboarding/BecomeSellerInfo'))
const BecomeSellerReview = lazy(() => import('../pages/seller-onboarding/BecomeSellerReview'))
const BecomeSellerSuccess = lazy(() => import('../pages/seller-onboarding/BecomeSellerSuccess'))

// 5. Seller Center Pages (Code Splitting - Lazy Load)
const SellerDashboard = lazy(() => import('../pages/seller/Dashboard'))
const SellerProducts = lazy(() => import('../pages/seller/Products'))
const SellerOrders = lazy(() => import('../pages/seller/Orders'))
const SellerOrderDetail = lazy(() => import('../pages/seller/OrderDetail'))
const SellerSettings = lazy(() => import('../pages/seller/Settings'))

// 6. Storefront & 404 Pages (Code Splitting - Lazy Load)
const Storefront = lazy(() => import('../pages/storefront/Storefront'))
const NotFound = lazy(() => import('../pages/NotFound'))

// Component Loading Fallback tối giản chuẩn Editorial FASHORA
function PageFallback() {
  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center">
      <div className="inline-block w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-[2px] animate-spin" />
    </div>
  )
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* ================= AUTH ROUTES ================= */}
            {/* Bọc trong AuthLayout: Có Header (không Nav, không Hamburger) + Footer đen */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* ================= CUSTOMER ROUTES ================= */}
            <Route element={<CustomerLayout />}>
              {/* Public Routes - Explore hiển thị đầu tiên khi vào web */}
              <Route path="/" element={<Explore />} />
              <Route path="/home" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/explore/story/:id" element={<StoryDetail />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/best-seller" element={<BestSeller />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/terms-of-use" element={<PolicyPage title="TERMS OF USE" />} />
              <Route path="/privacy-policy" element={<PolicyPage title="PRIVACY POLICY" />} />
              <Route path="/shopping-guide" element={<PolicyPage title="SHOPPING GUIDE" />} />
              <Route path="/exchange-policy" element={<PolicyPage title="EXCHANGE POLICY" />} />

              {/* Protected Route: CHECKOUT
                  Gõ tay /checkout khi giỏ hàng trống hoặc chưa đăng nhập -> Tự động chuyển về /cart */}
              <Route
                path="/checkout"
                element={
                  <CheckoutGuard>
                    <Checkout />
                  </CheckoutGuard>
                }
              />

              <Route
                path="/order-success"
                element={
                  <AuthGuard>
                    <OrderSuccess />
                  </AuthGuard>
                }
              />

              {/* Protected Routes: Đơn hàng
                  Chưa đăng nhập mà vào -> Tự động chuyển hướng sang /login */}
              <Route
                path="/orders"
                element={
                  <AuthGuard>
                    <Orders />
                  </AuthGuard>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <AuthGuard>
                    <OrderDetail />
                  </AuthGuard>
                }
              />

              {/* Customer Profile (Yêu cầu đăng nhập trước) */}
              <Route
                path="/profile"
                element={
                  <AuthGuard>
                    <Profile />
                  </AuthGuard>
                }
              />

              {/* Các Gian Hàng Đang Theo Dõi (Yêu cầu đăng nhập trước) */}
              <Route
                path="/following"
                element={
                  <AuthGuard>
                    <FollowingShops />
                  </AuthGuard>
                }
              />
              <Route path="/following-shops" element={<Navigate to="/following" replace />} />

              {/* Quy trình đăng ký mở Shop (Yêu cầu đăng nhập tài khoản trước) */}
              <Route
                path="/become-seller"
                element={
                  <AuthGuard>
                    <BecomeSellerLayout />
                  </AuthGuard>
                }
              >
                <Route index element={<BecomeSellerOverview />} />
                <Route path="info" element={<BecomeSellerInfo />} />
                <Route path="review" element={<BecomeSellerReview />} />
                <Route path="success" element={<BecomeSellerSuccess />} />
              </Route>
            </Route>

            {/* ================= SELLER ROUTES ================= */}
            {/* Được bảo vệ nghiêm ngặt bằng SellerGuard: Người chưa đăng nhập tuyệt đối không thể vào */}
            <Route
              element={
                <SellerGuard>
                  <SellerLayout />
                </SellerGuard>
              }
            >
              <Route path="/seller" element={<Navigate to="/seller/dashboard" replace />} />
              <Route path="/seller/dashboard" element={<SellerDashboard />} />
              <Route path="/seller/products" element={<SellerProducts />} />
              <Route path="/seller/orders" element={<SellerOrders />} />
              <Route path="/seller/orders/:id" element={<SellerOrderDetail />} />
              <Route path="/seller/settings" element={<SellerSettings />} />
            </Route>

            {/* ================= STOREFRONT ROUTES ================= */}
            <Route element={<StorefrontLayout />}>
              <Route path="/store/:slug" element={<Storefront />} />
            </Route>

            {/* ================= 404 NOT FOUND ================= */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
