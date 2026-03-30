import { MapPin, Search, ShoppingBag, User, ChevronDown } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../contexts/AuthContext";

export const Navbar = () => {
  const { user, isAuthenticated, setShowLoginModal, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isDecorationsPage = location.pathname.startsWith("/category/");
  const isServiceDetailPage = location.pathname.startsWith("/service/");
  const showSearchBar = isHomePage || isDecorationsPage || isServiceDetailPage;
  const showMobileSearchBar = isHomePage || isDecorationsPage;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className={`${isHomePage ? "sticky" : "relative"} md:relative top-0 z-50 bg-white border-b border-gray-100`}>
      {/* Desktop Header */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="flex flex-col shrink-0">
            <span className="text-3xl font-bold text-[#FB2965] leading-none tracking-tighter">Sylonow</span>
            <span className="text-[10px] font-semibold text-gray-400 tracking-widest mt-1">Gifting starts here!</span>
          </Link>

          {/* Location Selector */}
          <div className="flex items-center gap-2 cursor-pointer group shrink-0">
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-gray-100 transition-colors">
              <MapPin className="text-gray-600" size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-500">Select City</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-[#0B4964]">Not Selected</span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* Search Bar */}
          {showSearchBar ? (
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
              <input
                type="text"
                placeholder='Search "Decorations"'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 bg-gray-50 border border-gray-100 rounded-full px-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#FB2965]/10 transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </form>
          ) : (
            <div className="flex-1" />
          )}

          {/* Actions */}
          <div className="flex items-center gap-8 shrink-0">
            {isAuthenticated ? (
              <Link to="/profile" className="flex flex-col items-center gap-1 group">
                <div className="w-10 h-10 bg-[#FB2965]/10 rounded-full flex items-center justify-center">
                  <User size={20} className="text-[#FB2965]" />
                </div>
                <span className="text-[10px] font-semibold text-gray-500 truncate max-w-[60px]">{user?.name || 'Profile'}</span>
              </Link>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="flex flex-col items-center gap-1 group">
                <User size={24} className="text-gray-600 group-hover:text-[#FB2965] transition-colors" />
                <span className="text-[10px] font-semibold text-gray-500">Login</span>
              </button>
            )}

            <Link to="/cart" className="flex flex-col items-center gap-1 group relative">
              <ShoppingBag size={24} className="text-gray-600 group-hover:text-[#FB2965] transition-colors" />
              <span className="text-[10px] font-semibold text-gray-500">Cart</span>
              <span className="absolute -top-1 right-0 w-4 h-4 bg-[#FB2965] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">0</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <AnimatePresence initial={false}>
          {!isScrolled && isHomePage && (
            <motion.div
              initial={{ height: "auto", opacity: 1 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#FB2965]/10 rounded-lg flex items-center justify-center">
                    <MapPin className="text-[#FB2965]" size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold tracking-widest text-gray-400 leading-none">Mumbai</span>
                    <span className="text-xs font-semibold text-[#0B4964]">Andheri West</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Link to="/cart" className="p-2 hover:bg-gray-50 rounded-full transition-colors relative">
                    <ShoppingBag size={20} className="text-gray-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[#FB2965] rounded-full border-2 border-white"></span>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Search Bar */}
        {showMobileSearchBar && (
          <div className={`px-4 pb-4 transition-all duration-300 ${isScrolled ? "pt-4" : "pt-3"}`}>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder='Search "Decorations"'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 bg-gray-50 border border-gray-100 rounded-full px-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#FB2965]/10 transition-all shadow-sm"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </form>
          </div>
        )}
      </div>
    </header>
  );
};
