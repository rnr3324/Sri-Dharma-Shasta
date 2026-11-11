import { Routes, Route, Navigate } from 'react-router-dom'
import Splash from './pages/Splash'
import LanguageSelect from './pages/LanguageSelect'
import Layout from './components/Layout'
import Home from './pages/Home'
import Store from './pages/Store'
import Tantri from './pages/Tantri'
import Cart from './pages/Cart'
import Done from './pages/Done'
import Admin from './pages/Admin'
import ProductDetails from './pages/ProductDetails'

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<Admin />} />
      <Route path="/" element={<Splash />} />
      <Route path="/language" element={<LanguageSelect />} />
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/store" element={<Store />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/tantri" element={<Tantri />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/done" element={<Done />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
