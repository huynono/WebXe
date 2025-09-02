// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google'; // ✅ import provider

import Home from './components/Home'; 
import Login from './components/LoginForm'; 
import RegisterForm from './components/RegisterForm'; 
import Detail from './components/Detail'; 
import Admin from './components/Admin'; 
import AdminProduct from './components/AdminProduct'; 
import EditProduct from './components/EditProduct';
import CarListing from './components/CarListing';
import LoginAdmin from './components/LoginAdmin';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderSuccess from './components/OrderSuccess';
import MyOrders from './components/MyOrders';
import ChatAI from './components/ChatAI';
import AdminChatWidget from './components/AdminChatWidget';
function App() {
  // 👉 Copy Client ID từ Google Console vào đây
  const clientId = "13487730626-552o2asvklccucrjhggcjg8ppfp3d98j.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:slug" element={<Detail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/detail" element={<Detail />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/product" element={<AdminProduct />} />
            <Route path="/admin/product/edit/:id" element={<EditProduct />} />
            <Route path="/cars" element={<CarListing />} />
            <Route path="/loginadmin" element={<LoginAdmin />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/ordersuccess" element={<OrderSuccess />} />
            <Route path="/ordersuccess/:id" element={<OrderSuccess />} />
            <Route path="/myorders" element={<MyOrders />} />
            <Route path="/chatai" element={<ChatAI />} />
            <Route path="/adminchat" element={<AdminChatWidget />} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
