import { Home, LayoutGrid, Percent, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";

export const BottomNav = () => {
  const location = useLocation();
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: LayoutGrid, label: "Decorations", path: "/category/Birthday" },
    { icon: Percent, label: "Offers", path: "/offers" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 px-4 py-2 pb-4">
      <div className="flex items-center justify-between">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 transition-colors flex-1",
                (item.label === "Decorations" ? location.pathname.startsWith("/category/") : isActive)
                  ? "text-[#FB2965]"
                  : "text-gray-400"
              )
            }
          >
            <item.icon size={20} />
            <span className="text-[10px] font-semibold">
              {item.label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
