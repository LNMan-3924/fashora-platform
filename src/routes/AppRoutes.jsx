import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Layouts
import CustomerLayout from '../layouts/CustomerLayout'
import SellerLayout from '../layouts/SellerLayout'
import StorefrontLayout from '../layouts/StorefrontLayout'

// Customer Pages
import Home from '../pages/Home'
import Login from '../pages/Login'
import Explore from '../pages/Explore'
import Shop from '../pages/Shop'
import ProductDetail from '../pages/ProductDetail'
import Cart from '../pages/Cart'
import Checkout from '../pages/Checkout'
import Orders from '../pages/Orders'
import OrderDetail from '../pages/OrderDetail'
import Profile from '../pages/Profile'

// Seller Pages
import SellerDashboard from '../pages/seller/Dashboard'
import SellerProducts from '../pages/seller/Products'
import SellerOrders from '../pages/seller/Orders'
import SellerOrderDetail from '../pages/seller/OrderDetail'

// Storefront Pages
import Storefront from '../pages/storefront/Storefront'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route độc lập */}
        <Route path="/login" element={<Login />} />

        {/* Customer Routes lồng trong CustomerLayout */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Seller Routes lồng trong SellerLayout */}
        <Route element={<SellerLayout />}>
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/products" element={<SellerProducts />} />
          <Route path="/seller/orders" element={<SellerOrders />} />
          <Route path="/seller/orders/:id" element={<SellerOrderDetail />} />
        </Route>

        {/* Public Storefront Route lồng trong StorefrontLayout */}
        <Route element={<StorefrontLayout />}>
          <Route path="/store/m-studio" element={<Storefront />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
