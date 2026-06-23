import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import VoucherCategory from './pages/VoucherCategory';
import VoucherDetail from './pages/VoucherDetail';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Wallet from './pages/Wallet';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/categories/:categoryId" element={<VoucherCategory />} />
        <Route path="/categories" element={<VoucherCategory />} />
        <Route path="/voucher-detail" element={<VoucherDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
