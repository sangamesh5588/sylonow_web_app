import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";
import { Toaster } from "sonner";
import { PopularSearches } from "../home/PopularSearches";
import { CustomerTestimonials } from "../home/CustomerTestimonials";
import { CustomerInquiryPopup } from "../home/CustomerInquiryPopup";
import { CartSync } from "./CartSync";
import {
  CustomerInquirySource,
  OPEN_CUSTOMER_INQUIRY_EVENT,
} from "../../lib/customerInquiries";

export const Layout = () => {
  const location = useLocation();
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquirySource, setInquirySource] =
    useState<CustomerInquirySource>("home_popup");
  const isHomePage = location.pathname === "/";
  const isProfilePage = location.pathname === "/profile";
  const isOffersPage = location.pathname === "/offers";
  const isCategoryPage = location.pathname.startsWith("/category/");
  const isCategoryListingPage = /^\/category\/[^/]+$/.test(location.pathname);
  const isSearchPage = location.pathname === "/search";
  const showTestimonials = isHomePage || isCategoryListingPage;

  const showBottomNav = isHomePage || isOffersPage || isProfilePage || isCategoryPage;
  const showPopularSearches = isHomePage || isCategoryPage || isSearchPage;

  useEffect(() => {
    const handleOpenInquiry = (event: Event) => {
      const nextSource =
        event instanceof CustomEvent && event.detail?.source
          ? (event.detail.source as CustomerInquirySource)
          : "home_popup";
      setInquirySource(nextSource);
      setInquiryOpen(true);
    };

    window.addEventListener(OPEN_CUSTOMER_INQUIRY_EVENT, handleOpenInquiry);
    return () =>
      window.removeEventListener(OPEN_CUSTOMER_INQUIRY_EVENT, handleOpenInquiry);
  }, []);

  return (
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden bg-white text-[#1A1A1A] ${showBottomNav ? 'pb-32 md:pb-0' : 'pb-8'}`}>
      <Navbar />
      <main className={`mx-auto w-full max-w-7xl overflow-x-hidden px-4 ${isCategoryPage ? "pt-0" : "pt-4"}`}>
        <Outlet />
        {showTestimonials && <CustomerTestimonials showReviews={isHomePage} />}
        {showPopularSearches && <PopularSearches />}
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
      {showBottomNav && <BottomNav />}
      <CustomerInquiryPopup
        open={inquiryOpen}
        onClose={() => {
          localStorage.setItem("inquiry_popup_seen", "1");
          setInquiryOpen(false);
        }}
        source={inquirySource}
      />
      <CartSync />
      <Toaster
        position="top-right"
        theme="light"
        toastOptions={{
          duration: 2200,
          classNames: {
            toast:
              "!rounded-2xl !border !border-[#e4e7ec] !bg-white/95 !text-[#22313f] !shadow-[0_14px_30px_rgba(15,23,42,0.10)] !backdrop-blur-md",
            title: "!text-sm !font-semibold !text-[#22313f]",
            description: "!text-xs !text-[#667085]",
            success: "!border-[#d1fadf] !bg-[#f6fffa]",
            error: "!border-[#fecdca] !bg-[#fff7f5]",
            info: "!border-[#dbeafe] !bg-[#f8fbff]",
            warning: "!border-[#fde68a] !bg-[#fffdf5]",
          },
        }}
      />
    </div>
  );
};
