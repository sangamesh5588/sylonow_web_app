import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Service } from "../../types";
import { Badge } from "../ui";
import { formatCurrency } from "../../lib/utils";
import { motion } from "motion/react";
import { ChevronRight, Heart, Star } from "lucide-react";
import { toast } from "sonner";
import { readWishlist, toggleWishlist } from "../../lib/booking";
import { useAuth } from "../../contexts/AuthContext";

interface ServiceSectionProps {
  title: string;
  services: Service[];
  sectionId?: string;
}

// Nested component to manage individual wishlist state
const ServiceCardWithWishlist = ({ service, index }: { service: Service; index: number }) => {
  const { isAuthenticated, setShowLoginModal } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const wishlist = readWishlist();
    setIsWishlisted(wishlist.includes(service.id));
  }, [service.id]);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to add to wishlist");
      setShowLoginModal(true);
      return;
    }

    const updated = toggleWishlist(service.id);
    const nowWishlisted = updated.includes(service.id);
    setIsWishlisted(nowWishlisted);
    toast.success(nowWishlisted ? "Added to wishlist" : "Removed from wishlist");
  };

  return (
    <motion.div
      key={service.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="min-w-[160px] w-[160px] md:min-w-[280px] md:w-[280px]"
    >
      <Link to={`/service/${service.id}`}>
        <div className="group cursor-pointer">
          <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-all duration-500">
            <img
              src={service.images[0]}
              alt={service.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-3 left-3">
              <Badge className="bg-white/90 backdrop-blur-sm text-black border-none text-[9px] px-2 py-0.5 rounded-md font-bold tracking-tight shadow-sm">
                Guest favourite
              </Badge>
            </div>
            <button
              onClick={handleWishlistClick}
              className="absolute top-3 right-3 text-white hover:text-[#FB2965] transition-colors drop-shadow-md"
            >
              <Heart size={18} className={isWishlisted ? 'fill-current' : ''} />
            </button>
          </div>
          <div className="px-0.5 space-y-0.5">
            <h3 className="font-bold text-[#0B4964] text-xs truncate">{service.title}</h3>
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <span className="font-medium">{formatCurrency(service.price)} for 1 night</span>
              <span>•</span>
              <div className="flex items-center gap-0.5 text-black">
                <Star size={10} fill="currentColor" />
                <span className="font-bold">{service.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export const ServiceSection = ({ title, services, sectionId }: ServiceSectionProps) => {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <Link
          to={sectionId ? `/section/${sectionId}` : "#"}
          className={`flex items-center gap-3 group ${!sectionId && "pointer-events-none"}`}
        >
          <h2 className="text-xl font-bold text-[#0B4964] tracking-tight">{title}</h2>
          <ChevronRight size={24} className="text-[#0B4964]" />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 pt-4 pb-4">
        {services.map((service, index) => (
          <ServiceCardWithWishlist key={service.id} service={service} index={index} />
        ))}
      </div>
    </section>
  );
};
