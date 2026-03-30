import { User as UserIcon, MapPin, Package, LogOut, ChevronRight, Settings, Heart, ChevronLeft } from "lucide-react";
import { Button, Card } from "../components/ui";
import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { EditProfileModal } from "../components/EditProfileModal";

const Profile = () => {
  const { user, isAuthenticated, logout, setShowLoginModal } = useAuth();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);

  const menuItems = [
    { icon: Package, label: "My Orders", desc: "View all your past and current orders" },
    { icon: MapPin, label: "Saved Addresses", desc: "Manage your delivery addresses" },
    { icon: Heart, label: "Wishlist", desc: "Your favorite decorations" },
    { icon: Settings, label: "Settings", desc: "Account preferences and security" },
  ];

  const handleMenuClick = (label: string) => {
    switch (label) {
      case "My Orders":
        navigate("/orders");
        break;
      case "Saved Addresses":
        navigate("/addresses");
        break;
      case "Wishlist":
        navigate("/wishlist");
        break;
      case "Settings":
        toast.info("Settings coming soon!");
        break;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
          <UserIcon size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#0B4964]">Login to view profile</h2>
          <p className="text-gray-500">Access your orders, addresses, and more.</p>
        </div>
        <Button variant="gradient" className="px-8" onClick={() => setShowLoginModal(true)}>
          Login with Phone Number
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-12">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#FB2965] to-[#FF4500] p-1 shadow-lg">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-3xl font-bold overflow-hidden text-[#0B4964]">
            {(user?.name || "User").charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#0B4964]">
            {user?.name || "Sylonow User"}
          </h1>
          <p className="text-gray-500 text-xs font-medium">
            +91 {user?.phoneNumber || ""}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-gray-200"
          onClick={() => setShowEditModal(true)}
        >
          Edit Profile
        </Button>
      </div>

      {/* Menu Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {menuItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card
              className="p-6 flex items-center justify-between group cursor-pointer hover:border-[#FB2965]/50 transition-all border-gray-100 shadow-sm"
              onClick={() => handleMenuClick(item.label)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-[#FB2965] transition-colors">
                  <item.icon size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#0B4964]">{item.label}</h3>
                  <p className="text-[10px] text-gray-500">{item.desc}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-300 group-hover:text-[#0B4964] transition-colors" />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Logout */}
      <div className="pt-8 border-t border-gray-100">
        <Button variant="ghost" className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center gap-2 h-14 rounded-2xl" onClick={logout}>
          <LogOut size={20} /> Logout Account
        </Button>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </div>
  );
};

export default Profile;
