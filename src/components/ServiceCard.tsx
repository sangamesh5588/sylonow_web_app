import { Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { formatCurrency } from "../lib/utils";
import { Service } from "../types";
import { readWishlist, toggleWishlist } from "../lib/booking";
import { useAuth } from "../contexts/AuthContext";

interface ServiceCardProps {
  service: Service;
  variant?: "default" | "compact";
}

export const ServiceCard = ({ service, variant = "default" }: ServiceCardProps) => {
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

  const discount =
    service.originalPrice && service.originalPrice > service.price
      ? Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100)
      : null;

  const offerLabel = discount
    ? `Flat ${discount}% OFF`
    : service.tags?.[0] || service.category;

  const supportingLabel = service.trending ? "+ 2 more" : service.tags?.[1] || service.location;
  const isCompact = variant === "compact";

  return (
    <Link to={`/service/${service.id}`} className="block group">
      <article
        className={`overflow-hidden bg-white ring-1 ring-[#f0e7e2] transition-transform duration-300 group-hover:-translate-y-1 ${
          isCompact
            ? "rounded-[20px] shadow-[0_10px_24px_rgba(15,23,42,0.06)] md:rounded-[30px] md:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
            : "rounded-[24px] shadow-[0_16px_40px_rgba(15,23,42,0.08)] md:rounded-[30px]"
        }`}
      >
        <div
          className={`relative overflow-hidden ${
            isCompact
              ? "aspect-[0.92/1] rounded-[20px] md:aspect-[1.08/1] md:rounded-[30px]"
              : "aspect-[1.32/1] rounded-[24px] md:aspect-[1.08/1] md:rounded-[30px]"
          }`}
        >
          <img
            src={service.images[0]}
            alt={service.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />

          <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#163447]/80 via-[#163447]/40 to-transparent text-white ${isCompact ? "p-3 md:p-5" : "p-4 md:p-5"}`}>
            <p className={`${isCompact ? "text-[9px] tracking-[0.18em]" : "text-[10px] tracking-[0.22em]"} font-semibold uppercase text-white/80`}>
              {discount ? "Limited time offer" : "Curated celebration"}
            </p>
            <p className={`mt-1 font-bold tracking-tight ${isCompact ? "text-[13px] leading-4 md:text-[20px]" : "text-[17px] md:text-[20px]"}`}>
              {offerLabel} <span className="font-semibold text-white/85">{isCompact ? "" : supportingLabel}</span>
            </p>
          </div>

          <button
            onClick={handleWishlistClick}
            className={`absolute rounded-full bg-[#6d8aa0]/80 text-white backdrop-blur-sm transition-colors hover:bg-[#FB2965] ${isCompact ? "right-2.5 top-2.5 p-1.5 md:right-4 md:top-4 md:p-2" : "right-3 top-3 p-2 md:right-4 md:top-4"}`}
          >
            <Heart
              size={isCompact ? 15 : 18}
              className={`stroke-[2.3px] ${isWishlisted ? 'fill-current' : ''}`}
            />
          </button>
        </div>

        <div className={`${isCompact ? "space-y-1.5 px-3 py-3 md:space-y-2 md:px-5 md:py-4" : "space-y-2 px-4 py-3 md:px-5 md:py-4"}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className={`overflow-hidden font-bold leading-tight text-[#2b2f38] transition-colors group-hover:text-[#0B4964] ${isCompact ? "text-[13px] md:text-[18px]" : "truncate text-[16px] md:text-[18px]"}`}
                style={isCompact ? { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } : undefined}
              >
                {service.title}
              </h3>
              <p className={`mt-1 truncate text-[#667085] ${isCompact ? "text-[12px]" : "text-sm"}`}>{service.location}</p>
            </div>
            <div className={`inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#1f9d58] font-semibold text-white ${isCompact ? "px-2 py-1 text-[11px]" : "px-2.5 py-1 text-sm"}`}>
              <span>{service.rating.toFixed(1)}</span>
              <Star size={isCompact ? 10 : 12} className="fill-current" />
            </div>
          </div>

          <div className={`flex items-start justify-between gap-3 text-[#667085] ${isCompact ? "text-[12px]" : "text-sm"}`}>
            <p className="min-w-0 truncate">{service.tags?.join(" / ") || service.category}</p>
            <p className="shrink-0">{service.distance || "3.5km"}</p>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className={`text-[#8b96a4] ${isCompact ? "text-[10px]" : "text-[11px]"}`}>
              {service.originalPrice ? (
                <span className="line-through">{formatCurrency(service.originalPrice)}</span>
              ) : null}
            </div>
            <p className={`font-semibold text-[#4c5c68] ${isCompact ? "text-[15px] md:text-lg" : "text-[17px] md:text-lg"}`}>{formatCurrency(service.price)}</p>
          </div>
        </div>
      </article>
    </Link>
  );
};
