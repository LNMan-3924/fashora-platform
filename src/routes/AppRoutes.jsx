import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import CustomerLayout from '../layouts/CustomerLayout'
import SellerLayout from '../layouts/SellerLayout'
import StorefrontLayout from '../layouts/StorefrontLayout'

// 1. Auth Pages
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'

// 2. Customer Pages
import Home from '../pages/customer/Home'
import Explore from '../pages/customer/Explore'
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

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= AUTH ROUTES ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= CUSTOMER ROUTES ================= */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/profile" element={<Profile />} />

          {/* Quy trình đăng ký mở Shop cho người dùng */}
          <Route path="/become-seller" element={<BecomeSeller />} />
        </Route>

        {/* ================= SELLER ROUTES ================= */}
        <Route element={<SellerLayout />}>
          <Route path="/seller" element={<Navigate to="/seller/dashboard" replace />} />
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/products" element={<SellerProducts />} />
          <Route path="/seller/orders" element={<SellerOrders />} />
          <Route path="/seller/orders/:id" element={<SellerOrderDetail />} />
        </Route>

        {/* ================= STOREFRONT ROUTES ================= */}
        <Route element={<StorefrontLayout />}>
          {/* Hỗ trợ slug động để mở bất kỳ gian hàng nào (vd: /store/m-studio) */}
          <Route path="/store/:slug" element={<Storefront />} />
        </Route>

        {/* ================= 404 NOT FOUND ================= */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes