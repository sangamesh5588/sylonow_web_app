import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Heart,
  MapPin,
  ShoppingBag,
  Star,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { readWishlist, toggleWishlist } from "../lib/booking";
import { formatCurrency } from "../lib/utils";
import { fetchAllServices } from "../lib/services";
import { getOptimizedImageUrl } from "../lib/images";
import { Service } from "../types";
import { Button, Card } from "../components/ui";

const Wishlist = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setShowLoginModal } = useAuth();
  const [wishlistServices, setWishlistServices] = useState<Service[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      navigate("/profile");
      return;
    }
    fetchAllServices().then((all) => {
      setAllServices(all);
      const ids = readWishlist();
      setWishlistServices(all.filter((s) => ids.includes(s.id)));
    });
  }, [isAuthenticated, navigate, setShowLoginModal]);

  const handleRemove = (serviceId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = toggleWishlist(serviceId);
    setWishlistServices(allServices.filter((s) => updated.includes(s.id)));
    toast.success("Removed from wishlist");
  };

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-8 pb-8 pt-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-[#eadfdb] transition-all active:scale-90"
        >
          <ChevronLeft size={22} className="text-[#0B4964]" />
        </button>
        <div>
          <p className="text-sm font-medium text-[#FB2965]">Saved looks</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B4964]">
            Wishlist ({wishlistServices.length})
          </h1>
        </div>
      </div>

      {wishlistServices.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center space-y-6 py-16 text-center"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <Heart size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#0B4964]">Your wishlist is empty</h2>
            <p className="text-gray-500">Start adding decorations you love to see them here</p>
          </div>
          <Button variant="gradient" onClick={() => navigate("/")}>
            Explore Services
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {wishlistServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <Card className="overflow-hidden rounded-[28px] border border-[#f0e4dd] bg-[linear-gradient(180deg,#fffdfb_0%,#fff7f2_100%)] p-0 shadow-[0_20px_45px_rgba(17,24,39,0.08)]">
                <div
                  className="cursor-pointer"
                  onClick={() => navigate(`/category/${encodeURIComponent(service.category)}/service/${service.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigate(`/category/${encodeURIComponent(service.category)}/service/${service.id}`);
                    }
                  }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={getOptimizedImageUrl(service.images[0], {
                        width: 720,
                        height: 540,
                        quality: 80,
                        resize: "cover",
                      })}
                      alt={service.title}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0B4964] backdrop-blur">
                        {service.category}
                      </span>
                      <button
                        onClick={(e) => handleRemove(service.id, e)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#8d97a6] shadow-sm backdrop-blur transition-colors hover:text-[#FB2965]"
                        aria-label={`Remove ${service.title} from wishlist`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 p-4">
                    <div className="space-y-2">
                      <h2 className="line-clamp-2 text-lg font-bold leading-snug text-[#0B4964]">
                        {service.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#6b7280]">
                        <span className="flex items-center gap-1">
                          <Star size={13} className="fill-[#ffb85c] text-[#ffb85c]" />
                          {service.rating} ({service.reviews})
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={13} />
                          {service.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {service.tags?.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#5b6778] ring-1 ring-[#eee3dc]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-end justify-between gap-4 border-t border-[#f0e4dd] pt-4">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-[#FB2965]">
                            {formatCurrency(service.price)}
                          </span>
                          {service.originalPrice && (
                            <span className="text-sm text-[#a0a8b5] line-through">
                              {formatCurrency(service.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        className="h-11 rounded-full border border-[#f0d7de] bg-white px-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#0B4964] hover:bg-[#fff7fa]"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/category/${encodeURIComponent(service.category)}/service/${service.id}`);
                        }}
                      >
                        <ShoppingBag size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
