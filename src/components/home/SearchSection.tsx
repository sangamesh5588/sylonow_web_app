import { MapPin, ShoppingCart, Search } from "lucide-react";
import { Link } from "react-router-dom";

export const SearchSection = () => {
  return (
    <div className="md:hidden space-y-4">
      {/* Location and Cart */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin size={20} className="text-[#FB2965]" />
          <div>
            <p className="text-xs text-gray-500">Mumbai</p>
            <p className="text-sm font-semibold text-[#0B4964]">Andheri West</p>
          </div>
        </div>
        <Link to="/cart" className="p-2">
          <ShoppingCart size={24} className="text-[#0B4964]" />
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search 'Decorations'"
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#FB2965] text-sm"
        />
      </div>
    </div>
  );
};
