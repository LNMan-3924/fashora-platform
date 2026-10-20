import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { AuthGuard, SellerGuard, CheckoutGuard } from '../components/common/ProtectedRoute'
import { ScrollToTop } from '../components/common'

// Layouts
import CustomerLayout from '../layouts/CustomerLayout'
import SellerLayout from '../layouts/SellerLayout'
import StorefrontLayout from '../layouts/StorefrontLayout'
import AuthLayout from '../layouts/AuthLayout'

// 1. Auth Pages
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'

// 2. Customer Pages
import Home from '../pages/customer/Home'
import Explore from '../pages/customer/Explore'
import StoryDetail from '../pages/customer/StoryDetail'
import Shop from '../pages/customer/Shop'
import ProductDetail from '../pages/customer/ProductDetail'
import Cart from '../pages/customer/Cart'
import Checkout from '../pages/customer/Checkout'
import OrderSuccess from '../pages/customer/OrderSuccess'
import Orders from '../pages/customer/Orders'
import OrderDetail from '../pages/customer/OrderDetail'
import Profile from '../pages/customer/Profile'

// 3. Seller Onboarding Page (Luồng 4 bước Become A Seller)
import BecomeSeller from '../pages/seller-onboarding/BecomeSeller'

// 4. Seller Pages
import SellerDashboard from '../pages/seller/Dashboard'
import SellerProducts from '../pages/seller/Products'
import SellerOrders from '../pages/seller/Orders'
import SellerOrderDetail from '../pages/seller/OrderDetail'

// 5. Storefront Pages
import Storefront from '../pages/storefront/Storefront'

// 6. System Page (404 Not Found)
import NotFound from '../pages/NotFound'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
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
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />

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

            {/* Quy trình đăng ký mở Shop (Yêu cầu đăng nhập tài khoản trước) */}
            <Route
              path="/become-seller"
              element={
                <AuthGuard>
                  <BecomeSeller />
                </AuthGuard>
              }
            />
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
          </Route>

          {/* ================= STOREFRONT ROUTES ================= */}
          <Route element={<StorefrontLayout />}>
            <Route path="/store/:slug" element={<Storefront />} />
          </Route>

          {/* ================= 404 NOT FOUND ================= */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
