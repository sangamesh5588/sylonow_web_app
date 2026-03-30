import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Heart, X } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { readWishlist, toggleWishlist } from "../lib/booking";
import { SERVICES } from "../services/mockData";
import { Service } from "../types";
import { Button } from "../components/ui";
import { ServiceCard } from "../components/ServiceCard";

const Wishlist = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setShowLoginModal } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [wishlistServices, setWishlistServices] = useState<Service[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      navigate("/profile");
      return;
    }

    loadWishlist();
  }, [isAuthenticated, navigate, setShowLoginModal]);

  const loadWishlist = () => {
    const ids = readWishlist();
    setWishlistIds(ids);

    const services = SERVICES.filter((service) => ids.includes(service.id));
    setWishlistServices(services);
  };

  const handleRemove = (serviceId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(serviceId);
    loadWishlist();
    toast.success("Removed from wishlist");
  };

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-[#eadfdb] transition-all active:scale-90"
        >
          <ChevronLeft size={22} className="text-[#0B4964]" />
        </button>
        <div>
          <p className="text-sm font-medium text-[#FB2965]">Your Favorites</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B4964]">
            Wishlist ({wishlistServices.length})
          </h1>
        </div>
      </div>

      {/* Wishlist Grid */}
      {wishlistServices.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center space-y-6"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
            <Heart size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#0B4964]">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500">
              Start adding decorations you love to see them here
            </p>
          </div>
          <Button variant="gradient" onClick={() => navigate("/")}>
            Explore Services
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <ServiceCard service={service} />

              {/* Remove Button Overlay */}
              <button
                onClick={(e) => handleRemove(service.id, e)}
                className="absolute top-4 right-4 z-10 rounded-full bg-red-500 p-2 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
