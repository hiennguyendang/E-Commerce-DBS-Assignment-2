import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SellerRegisterPage from "./pages/SellerRegisterPage";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SellerShopPage from "./pages/SellerShopPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import ProfilePage from "./pages/ProfilePage";
import SellerDashboardPage from "./pages/SellerDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ReturnsPage from "./pages/ReturnsPage";
import SellerReturnsPage from "./pages/SellerReturnsPage";
import { cartAPI, getAuthToken, getUser, clearAuthData } from "./utils/api";
import Toast from "./components/common/Toast";

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const token = getAuthToken();
      if (!token) return null;
      return getUser();
    } catch {
      return null;
    }
  });

  const [toast, setToast] = useState(null);

  const handleAddToCart = async (product) => {
    try {
      const qty = product.quantity || 1;
      await cartAPI.addItem(product.id, qty);
      setToast({
        message: `Đã thêm "${product.name}" vào giỏ hàng`,
        type: "success",
      });
    } catch (e) {
      console.error("Thêm vào giỏ thất bại:", e);
      setToast({
        message: "Không thể thêm vào giỏ. Vui lòng đăng nhập hoặc thử lại.",
        type: "error",
      });
    }
  };

  const handleLogout = () => {
    setUser(null);
    try {
      clearAuthData();
    } catch {}
  };

  const handleLogin = (userObj) => {
    console.log("Login successful, user:", userObj);
    setUser(userObj);
  };

  return (
    <BrowserRouter>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {user ? (
        <Routes>
          <Route path="/app" element={<AppLayout user={user} onLogout={handleLogout} />}>
            <Route index element={<HomePage onAddToCart={handleAddToCart} />} />
            <Route path="product/:id" element={<ProductDetailPage onAddToCart={handleAddToCart} />} />
            <Route path="seller/:sellerId" element={<SellerShopPage onAddToCart={handleAddToCart} />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="returns" element={<ReturnsPage />} />
            <Route path="profile" element={<ProfilePage user={user} />} />
            <Route path="upgrade-to-seller" element={<SellerRegisterPage existingUser={user} />} />

            {user.role === "Seller" && <Route path="seller" element={<SellerDashboardPage />} />}
            {user.role === "Seller" && <Route path="seller/returns" element={<SellerReturnsPage />} />}
            {user.role === "Admin" && <Route path="admin" element={<AdminDashboardPage />} />}
          </Route>

          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/seller/register" element={<SellerRegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}
