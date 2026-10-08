import { BrowserRouter, Routes, Route } from 'react-router-dom'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>FASHORA Home</div>} />
        <Route path="/shop" element={<div>FASHORA Shop</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
