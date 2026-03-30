import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import { LoginModal } from "./components/LoginModal";
import Home from "./pages/Home";
import CategoryPage from "./pages/Category";
import ServiceDetail from "./pages/ServiceDetail";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import Offers from "./pages/Offers";
import SearchPage from "./pages/Search";
import SectionDetail from "./pages/SectionDetail";
import Orders from "./pages/Orders";
import Addresses from "./pages/Addresses";
import Wishlist from "./pages/Wishlist";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <LoginModal />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="category/:categoryName" element={<CategoryPage />} />
            <Route path="service/:serviceId" element={<ServiceDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<Orders />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="offers" element={<Offers />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="section/:sectionId" element={<SectionDetail />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
