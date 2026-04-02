import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Layout } from "./components/layout/Layout";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import { SmoothScroll } from "./components/layout/SmoothScroll";
import { AuthProvider } from "./contexts/AuthContext";
import { LoginModal } from "./components/LoginModal";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
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
import Coupons from "./pages/Coupons";
import InfoPage from "./pages/InfoPage";
import ContactPage from "./pages/Contact";
import SitemapPage from "./pages/Sitemap";
import LegalPage from "./pages/Legal";
import WedlyBySylonow from "./pages/wedding-cards/WedlyBySylonow";
import SylonowPartner from "./pages/SylonowPartner";

export default function App() {
  return (
    <HelmetProvider>
    <AuthProvider>
      <BrowserRouter>
        <SmoothScroll />
        <ScrollToTop />
        <LoginModal />
        <PWAInstallPrompt />
        <Routes>
          <Route path="/wedly-by-sylonow" element={<WedlyBySylonow />} />
          <Route path="/sylonow-partner" element={<SylonowPartner />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="category/:categoryName" element={<CategoryPage />} />
            <Route path="category/:categoryName/service/:serviceId" element={<ServiceDetail />} />
            <Route path="service/:serviceId" element={<ServiceDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<Orders />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="offers" element={<Offers />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="section/:sectionId" element={<SectionDetail />} />
            <Route path="terms" element={<InfoPage />} />
            <Route path="terms-of-service" element={<InfoPage />} />
            <Route path="privacy" element={<InfoPage />} />
            <Route path="privacy-policy" element={<InfoPage />} />
            <Route path="cancellation" element={<InfoPage />} />
            <Route path="shipping" element={<InfoPage />} />
            <Route path="refund" element={<InfoPage />} />
            <Route path="refund-policy" element={<InfoPage />} />
            <Route path="revenue-policy" element={<InfoPage />} />
            <Route path="gdpr-compliance" element={<InfoPage />} />
            <Route path="cookie-policy" element={<InfoPage />} />
            <Route path="copyright" element={<InfoPage />} />
            <Route path="delete-account" element={<InfoPage />} />
            <Route path="about" element={<InfoPage />} />
            <Route path="careers" element={<InfoPage />} />
            <Route path="blog" element={<InfoPage />} />
            <Route path="legal" element={<LegalPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="sitemap" element={<SitemapPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </HelmetProvider>
  );
}
