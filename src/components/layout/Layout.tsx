import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";
import { Toaster } from "sonner";

import { PopularSearches } from "../home/PopularSearches";

export const Layout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isProfilePage = location.pathname === "/profile";
  const isOffersPage = location.pathname === "/offers";
  const isCategoryPage = location.pathname.startsWith("/category/");
  const isSearchPage = location.pathname === "/search";

  // Show bottom nav only on main pages (home, offers, profile)
  const showBottomNav = isHomePage || isOffersPage || isProfilePage;
  const showPopularSearches = isHomePage || isCategoryPage || isSearchPage;

  return (
    <div className={`min-h-screen bg-white text-[#1A1A1A] ${showBottomNav ? 'pb-32 md:pb-0' : 'pb-8'}`}>
      <Navbar />
      <main className="pt-4 max-w-7xl mx-auto px-4">
        <Outlet />
        {showPopularSearches && <PopularSearches />}
      </main>
      {isHomePage && <Footer />}
      {showBottomNav && <BottomNav />}
      <Toaster position="top-center" theme="dark" richColors />
    </div>
  );
};
