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
}

export const ServiceCard = ({ service }: ServiceCardProps) => {
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

  return (
    <Link to={`/service/${service.id}`} className="block group">
      <article className="overflow-hidden rounded-[30px] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] ring-1 ring-[#f0e7e2] transition-transform duration-300 group-hover:-translate-y-1">
        <div className="relative aspect-[1.08/1] overflow-hidden rounded-[30px]">
          <img
            src={service.images[0]}
            alt={service.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#163447]/80 via-[#163447]/40 to-transparent p-5 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80">
              {discount ? "Limited time offer" : "Curated celebration"}
            </p>
            <p className="mt-1 text-[20px] font-bold tracking-tight">
              {offerLabel} <span className="font-semibold text-white/85">{supportingLabel}</span>
            </p>
          </div>

          <button
            onClick={handleWishlistClick}
            className="absolute right-4 top-4 rounded-full bg-[#6d8aa0]/80 p-2 text-white backdrop-blur-sm transition-colors hover:bg-[#FB2965]"
          >
            <Heart
              size={18}
              className={`stroke-[2.3px] ${isWishlisted ? 'fill-current' : ''}`}
            />
          </button>
        </div>

        <div className="space-y-2 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-[18px] font-bold leading-tight text-[#2b2f38] transition-colors group-hover:text-[#0B4964]">
                {service.title}
              </h3>
              <p className="mt-1 truncate text-sm text-[#667085]">{service.location}</p>
            </div>
            <div className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#1f9d58] px-2.5 py-1 text-sm font-semibold text-white">
              <span>{service.rating.toFixed(1)}</span>
              <Star size={12} className="fill-current" />
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 text-sm text-[#667085]">
            <p className="min-w-0 truncate">{service.tags?.join(" / ") || service.category}</p>
            <p className="shrink-0">{service.distance || "3.5km"}</p>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="text-[11px] text-[#8b96a4]">
              {service.originalPrice ? (
                <span className="line-through">{formatCurrency(service.originalPrice)}</span>
              ) : null}
            </div>
            <p className="text-lg font-semibold text-[#4c5c68]">{formatCurrency(service.price)}</p>
          </div>
        </div>
      </article>
    </Link>
  );
};
