import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Service } from "../../types";
import { formatCurrency } from "../../lib/utils";
import { Heart, Star } from "lucide-react";
import { toast } from "sonner";
import { readWishlist, toggleWishlist } from "../../lib/booking";
import { useAuth } from "../../contexts/AuthContext";
import { getOptimizedImageUrl } from "../../lib/images";

export const ServiceCardMobile = ({ service, index }: { service: Service; index: number }) => {
  const { isAuthenticated, setShowLoginModal } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

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

  // Square 160×160 image — no height mismatch, no srcSet confusion
  const src = getOptimizedImageUrl(service.images[0], {
    width: 320,
    height: 320,
    quality: 80,
    resize: "cover",
  });

  return (
    <div className="w-[160px] min-w-[160px] flex-shrink-0">
      <Link to={`/category/${encodeURIComponent(service.category)}/service/${service.id}`}>
        <div className="group cursor-pointer">
          <div className="relative rounded-2xl overflow-hidden mb-3 shadow-sm" style={{ width: 160, height: 160 }}>
            {!imgLoaded && (
              <div className="absolute inset-0 bg-[#f0f2f5] animate-pulse" />
            )}
            <img
              ref={(el) => { if (el?.complete) setImgLoaded(true); }}
              src={src}
              alt={service.title}
              width={160}
              height={160}
              className={`w-full h-full object-cover ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              decoding="async"
              referrerPolicy="no-referrer"
              onLoad={() => setImgLoaded(true)}
            />
            <button
              onClick={handleWishlistClick}
              className="absolute top-3 right-3 text-white hover:text-[#FB2965] transition-colors drop-shadow-md"
            >
              <Heart size={18} className={isWishlisted ? "fill-current" : ""} />
            </button>
          </div>
          <div className="px-0.5 space-y-0.5">
            <h3 className="font-bold text-[#0B4964] text-xs truncate">{service.title}</h3>
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <span className="text-[11px] font-semibold text-[#344054]">
                {formatCurrency(service.price)} incl. setup
              </span>
              <span>•</span>
              <div className="flex items-center gap-0.5 text-black">
                <Star size={10} fill="currentColor" />
                <span className="font-bold">{service.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
