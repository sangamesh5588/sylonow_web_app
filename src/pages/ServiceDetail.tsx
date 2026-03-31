import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  BadgeAlert,
  Bookmark,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  Clock3,
  Heart,
  Image as ImageIcon,
  MapPin,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge, Button } from "../components/ui";
import { readWishlist, saveBookingDraft, toggleWishlist } from "../lib/booking";
import { formatCurrency } from "../lib/utils";
import { fetchServiceById, fetchAllServices } from "../lib/services";
import { Service } from "../types";
import { useAuth } from "../contexts/AuthContext";

const DATE_OPTIONS = Array.from({ length: 15 }, (_, index) => {
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + index);

  const label =
    index === 0
      ? "Today"
      : index === 1
        ? "Tomorrow"
        : new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(baseDate);

  return {
    label,
    date: baseDate.toISOString().split("T")[0],
    display: new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
    }).format(baseDate),
  };
});

const TIME_GROUPS = [
  {
    label: "Morning",
    slots: ["9:00 AM", "10:30 AM", "12:00 PM"],
  },
  {
    label: "Afternoon",
    slots: ["1:30 PM", "3:00 PM", "4:30 PM"],
  },
  {
    label: "Evening",
    slots: ["6:00 PM", "7:30 PM", "9:00 PM"],
  },
] as const;

const VENUE_TYPES = ["Home", "Apartment", "Restaurant", "Terrace", "Banquet", "Villa", "Office"] as const;

const FAQ_ITEMS = [
  {
    question: "How far in advance should I book?",
    answer: "For the best slot availability, book at least 2 to 4 days in advance. Same-day slots may still open up for select locations.",
  },
  {
    question: "Can I customize the decoration theme later?",
    answer: "Yes. After booking, the team can confirm colors, setup references, and event notes before the installation date.",
  },
  {
    question: "What happens if I need to reschedule?",
    answer: "You can request a reschedule based on slot availability. Earlier notice improves the chances of moving your booking smoothly.",
  },
];

const PRODUCT_HIGHLIGHTS = [
  { icon: Sparkles, label: "Premium Balloon Arch Setup" },
  { icon: Check, label: "Customizable Theme Colors" },
  { icon: ShieldCheck, label: "LED Name Backdrop" },
  { icon: CalendarDays, label: "Cake Table Decoration Included" },
];

const DETAIL_TABS = ["Specifications", "Service policy", "Need to know"] as const;

const DETAIL_CONTENT: Record<
  (typeof DETAIL_TABS)[number],
  { title: string; items: Array<{ label: string; value: string }> }
> = {
  Specifications: {
    title: "General",
    items: [
      { label: "Setup type", value: "Premium balloon arch" },
      { label: "Backdrop style", value: "LED name display" },
      { label: "Theme colors", value: "Customizable" },
      { label: "Coverage", value: "Entry + cake table area" },
      { label: "Best for", value: "Birthday, surprise setups" },
      { label: "Recommended venue", value: "Home, terrace, restaurant" },
      { label: "Installation time", value: "2 to 3 hours" },
      { label: "Teardown", value: "Included after event" },
    ],
  },
  "Service policy": {
    title: "Booking terms",
    items: [
      { label: "Advance booking", value: "Recommended 2 to 4 days prior" },
      { label: "Reschedule", value: "Allowed subject to slot availability" },
      { label: "Cancellation", value: "Review with support before confirmation" },
      { label: "Travel coverage", value: "Included in core city limits" },
      { label: "Extra charges", value: "May apply for remote venues" },
      { label: "Damage policy", value: "Customer liable for venue-side damage" },
    ],
  },
  "Need to know": {
    title: "Before booking",
    items: [
      { label: "Power source", value: "1 nearby socket required" },
      { label: "Space needed", value: "Approx. 8 ft x 6 ft clear area" },
      { label: "Access support", value: "Lift or easy stair access preferred" },
      { label: "Outdoor use", value: "Possible in dry weather only" },
      { label: "Custom note", value: "Name text can be shared after booking" },
      { label: "Address confirmation", value: "Final setup address required before payment" },
    ],
  },
};

const COUPON_OPTIONS = [
  {
    code: "PRIVATEHALL",
    title: "20% discount",
    subtitle: "Exclusive screening pass",
    description: "Valid on bookings above 3999",
    discountPercent: 20,
  },
  {
    code: "SYLONOW10",
    title: "Flat 10% off",
    subtitle: "Decor launch benefit",
    description: "Applies instantly on this package",
    discountPercent: 10,
  },
] as const;

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, setShowLoginModal } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loadingService, setLoadingService] = useState(true);

  useEffect(() => {
    if (!serviceId) return;
    setLoadingService(true);
    Promise.all([fetchServiceById(serviceId), fetchAllServices()]).then(([svc, all]) => {
      setService(svc);
      setAllServices(all);
      setLoadingService(false);
    });
  }, [serviceId]);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedDate, setSelectedDate] = useState(DATE_OPTIONS[0].date);
  const [selectedTimeGroup, setSelectedTimeGroup] = useState<(typeof TIME_GROUPS)[number]["label"]>("Morning");
  const [selectedTime, setSelectedTime] = useState("9:00 AM");
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => readWishlist());
  const [selectedVenueType, setSelectedVenueType] = useState<(typeof VENUE_TYPES)[number]>("Home");
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [isHighlightsOpen, setIsHighlightsOpen] = useState(true);
  const [activeDetailTab, setActiveDetailTab] = useState<(typeof DETAIL_TABS)[number]>("Specifications");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const mobileTitleRef = useRef<HTMLHeadingElement | null>(null);
  const [isMobileTitleWrapped, setIsMobileTitleWrapped] = useState(false);

  const discount =
    service?.originalPrice && service.originalPrice > service.price
      ? Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100)
      : 0;

  const selectedGroup = useMemo(
    () => TIME_GROUPS.find((group) => group.label === selectedTimeGroup) || TIME_GROUPS[0],
    [selectedTimeGroup]
  );
  const appliedCoupon = useMemo(
    () => COUPON_OPTIONS.find((coupon) => coupon.code === appliedCouponCode) ?? null,
    [appliedCouponCode]
  );
  const finalPrice = useMemo(() => {
    if (!service) return 0;
    if (!appliedCoupon) return service.price;
    return Math.round(service.price * (1 - appliedCoupon.discountPercent / 100));
  }, [appliedCoupon, service]);
  const similarServices = useMemo(
    () =>
      allServices.filter((item) => item.id !== serviceId)
        .sort((a, b) => {
          const categoryScore =
            Number(b.category === service?.category) - Number(a.category === service?.category);
          if (categoryScore !== 0) return categoryScore;
          const trendingScore = Number(b.trending) - Number(a.trending);
          if (trendingScore !== 0) return trendingScore;
          return b.rating - a.rating;
        })
        .slice(0, 4),
    [allServices, service?.category, serviceId]
  );
  const activeDetailSection = DETAIL_CONTENT[activeDetailTab];

  useEffect(() => {
    const updateTitleWrap = () => {
      const title = mobileTitleRef.current;
      if (!title) return;
      const computedLineHeight = Number.parseFloat(window.getComputedStyle(title).lineHeight);
      if (!computedLineHeight) return;
      setIsMobileTitleWrapped(title.scrollHeight > computedLineHeight * 1.4);
    };

    updateTitleWrap();
    window.addEventListener("resize", updateTitleWrap);
    return () => window.removeEventListener("resize", updateTitleWrap);
  }, [service?.title]);

  if (loadingService) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B4964] border-t-transparent" />
      </div>
    );
  }

  if (!service) return <div className="py-24 text-center text-lg text-[#667085]">Service not found</div>;

  const isWishlisted = wishlistIds.includes(service.id);

  const selectedDateLabel =
    DATE_OPTIONS.find((option) => option.date === selectedDate)?.display ?? selectedDate;

  const ensureAuthenticated = () => {
    if (!isAuthenticated) {
      toast.error("Please login to continue");
      setShowLoginModal(true);
      return false;
    }

    return true;
  };

  const handleReserve = () => {
    if (!ensureAuthenticated()) return;
    const next = toggleWishlist(service.id);
    const isSaved = next.includes(service.id);
    setWishlistIds(next);
    toast.success(isSaved ? "Added to wishlist" : "Removed from wishlist");
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/service/${service.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: service.title,
          text: service.description,
          url: shareUrl,
        });
        return;
      } catch {
        // fall back to clipboard when share sheet is dismissed or unavailable
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Unable to share right now");
    }
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchValue.trim()) return;
    navigate(`/search?search=${encodeURIComponent(searchValue.trim())}`);
  };

  const handleBookNow = () => {
    if (!ensureAuthenticated()) return;

    saveBookingDraft({
      serviceId: service.id,
      date: selectedDate,
      time: selectedTime,
      price: finalPrice,
    });

    navigate("/checkout");
  };

  return (
    <div className="space-y-8 pb-32 md:pb-14">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="relative z-[60] flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-[#eadfdb] transition-all active:scale-90"
        >
          <ChevronLeft size={22} className="text-[#0B4964]" />
        </button>
        <form onSubmit={handleSearchSubmit} className="ml-3 flex-1 md:hidden">
          <div className="relative">
            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder='Search "Decorations"'
              className="h-11 w-full rounded-full border border-[#eadfdb] bg-white pl-10 pr-4 text-sm text-[#22313f] shadow-sm outline-none transition focus:border-[#0B4964]"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
          </div>
        </form>
        <button
          onClick={handleReserve}
          className="hidden items-center gap-2 rounded-full border border-[#eadfdb] bg-white px-4 py-2 text-sm font-medium text-[#0B4964] md:inline-flex"
        >
          <Bookmark size={16} />
          Reserve
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.15fr_0.95fr]">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-[1.08/0.82] overflow-hidden rounded-[34px] bg-[#f8f8f8] md:aspect-[1.08/0.82]"
          >
            <img
              src={service.images[activeImage] ?? service.images[0]}
              alt={service.title}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#17374b]/75 to-transparent p-6 text-white md:pb-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/18 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                <ShieldCheck size={14} />
                Setup included
              </div>
            </div>
            <div className="absolute right-4 top-4 flex gap-2 md:hidden">
              <button
                onClick={handleShare}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 text-[#22313f] shadow-sm"
              >
                <Share2 size={18} />
              </button>
              <button
                onClick={handleReserve}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 text-[#22313f] shadow-sm"
              >
                <Heart size={18} className={isWishlisted ? "fill-[#FB2965] text-[#FB2965]" : ""} />
              </button>
            </div>
          </motion.div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {service.images.map((image, index) => (
              <button
                key={`${service.id}-${index}`}
                type="button"
                onClick={() => setActiveImage(index)}
                className={`h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 ${
                  activeImage === index ? "border-[#0B4964]" : "border-transparent"
                }`}
              >
                <img src={image} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>

          <div className="space-y-3 md:hidden">
            <h3
              ref={mobileTitleRef}
              className="overflow-hidden text-[1.55rem] font-bold leading-[1.12] tracking-tight text-[#1f2430]"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {service.title}
            </h3>
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-1 text-sm text-[#f59e0b]">
                  <Star size={14} className="fill-current" />
                  <span>{service.rating} ({service.reviews} reviews)</span>
                </div>
                <p className="text-xs text-[#98a2b3]">Starting price</p>
                {appliedCoupon ? (
                  <p className="text-xs font-medium text-[#1570ef]">{appliedCoupon.code} applied</p>
                ) : null}
              </div>
              <div className="text-right">
                {service.price !== finalPrice ? (
                  <div className="text-sm text-[#98a2b3] line-through">{formatCurrency(service.price)}</div>
                ) : service.originalPrice ? (
                  <div className="text-sm text-[#98a2b3] line-through">{formatCurrency(service.originalPrice)}</div>
                ) : null}
                <div className="text-[1.9rem] font-bold leading-none text-[#0B4964]">{formatCurrency(finalPrice)}</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 rounded-[24px] border border-[#eef2f6] bg-[#fcfdff] px-2 py-3">
              <MobileFeature icon={<ShieldCheck size={18} />} label="Verified" />
              <MobileFeature icon={<ImageIcon size={18} />} label="Real Photos" />
              <MobileFeature icon={<Timer size={18} />} label="On-Time" />
              <MobileFeature icon={<Star size={18} />} label="Quality" />
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#98a2b3]">Venue type</p>
              <div className="flex flex-wrap gap-2">
                {VENUE_TYPES.map((type) => {
                  const isActive = selectedVenueType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedVenueType(type)}
                      className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? "border-[#0B4964] bg-[#0B4964] text-white"
                          : "border-[#e4e7ec] bg-white text-[#526070]"
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-5 rounded-[26px] border border-[#eef2f6] bg-white p-4">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-[#22313f]">Select date</h3>
                  <CalendarDays size={16} className="text-[#98a2b3]" />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                  {DATE_OPTIONS.map((option) => (
                    <button
                      key={option.date}
                      type="button"
                      onClick={() => setSelectedDate(option.date)}
                      className={`min-w-[128px] rounded-2xl border px-4 py-3 text-left transition ${
                        selectedDate === option.date
                          ? "border-[#0B4964] bg-[#f5fbff] text-[#0B4964]"
                          : "border-[#e4e7ec] bg-white text-[#344054]"
                      }`}
                    >
                      <p className="text-xs">{option.label}</p>
                      <p className="mt-1 text-lg font-semibold">{option.display}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-[#22313f]">Select preferred time</h3>
                <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                  {TIME_GROUPS.map((group) => (
                    <button
                      key={group.label}
                      type="button"
                      onClick={() => {
                        setSelectedTimeGroup(group.label);
                        setSelectedTime(group.slots[0]);
                      }}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        selectedTimeGroup === group.label
                          ? "border-[#0B4964] bg-[#eaf4fb] text-[#0B4964]"
                          : "border-[#e4e7ec] bg-white text-[#667085]"
                      }`}
                    >
                      {group.label}
                    </button>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {selectedGroup.slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`rounded-2xl border px-3 py-4 text-center transition ${
                        selectedTime === slot
                          ? "border-[#0B4964] bg-[#f5fbff] text-[#0B4964]"
                          : "border-[#e4e7ec] bg-white text-[#344054]"
                      }`}
                    >
                      <p className="text-base font-semibold">{slot}</p>
                      <p className="mt-1 text-[11px] text-[#1570ef]">Available</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden rounded-[28px] bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] ring-1 ring-[#f0e7e2] md:block">
            <p className="text-base leading-7 text-[#526070]">{service.description}</p>
          </div>

          <section className="hidden rounded-[32px] border border-[#eadfdb] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:block md:p-8">
            <div className="flex flex-wrap gap-2">
              {DETAIL_TABS.map((tab) => {
                const isActive = activeDetailTab === tab;
                return (
                  <button
                    key={`desktop-description-${tab}`}
                    type="button"
                    onClick={() => setActiveDetailTab(tab)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "border-[#1f2430] bg-[#1f2430] text-white"
                        : "border-[#d9dde3] bg-white text-[#526070]"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 overflow-hidden rounded-[24px] border border-[#edf0f4] bg-[#fcfdff]">
              <button
                type="button"
                onClick={() => setIsDetailsOpen((current) => !current)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#98a2b3]">All details</p>
                  <h3 className="mt-1 text-lg font-bold text-[#22313f]">{activeDetailSection.title}</h3>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-[#667085] transition-transform ${isDetailsOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isDetailsOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-x-8 gap-y-0 border-t border-[#edf0f4] px-5 pb-2 pt-1 md:grid-cols-2">
                      {activeDetailSection.items.map((item) => (
                        <div
                          key={`desktop-description-${activeDetailTab}-${item.label}`}
                          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 border-b border-[#edf0f4] py-3"
                        >
                          <p className="text-sm text-[#667085]">{item.label}</p>
                          <p className="text-sm font-medium text-[#22313f]">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </section>

          <section className="space-y-3 md:hidden">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#98a2b3]">Offers</p>
              <h3 className="text-xl font-bold text-[#22313f]">Available coupons</h3>
            </div>
            <div className="relative -mx-4 md:mx-0">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-white to-transparent md:hidden" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent md:hidden" />
              <div className="flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar md:grid md:grid-cols-2 md:px-0">
              {COUPON_OPTIONS.map((coupon) => {
                const isApplied = appliedCouponCode === coupon.code;
                return (
                  <article
                    key={coupon.code}
                    className={`relative w-[82%] shrink-0 overflow-hidden rounded-[24px] border p-4 transition md:w-auto ${
                      isApplied
                        ? "border-[#0B4964] bg-[#f5fbff]"
                        : "border-[#eadfdb] bg-[linear-gradient(135deg,#f5e6ff_0%,#f8efff_58%,#ffffff_100%)]"
                    }`}
                  >
                    <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-[32px] bg-[#0B4964]/8" />
                    <div className="relative flex h-full flex-col justify-between gap-4">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#667085]">{coupon.title}</p>
                        <h4 className="text-lg font-bold leading-6 text-[#22313f]">{coupon.code}</h4>
                        <div className="inline-flex rounded-full border border-[#eadfdb] bg-white px-3 py-1 text-xs font-semibold text-[#344054]">
                          {coupon.subtitle}
                        </div>
                        <p className="text-xs text-[#667085]">{coupon.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCouponCode(isApplied ? null : coupon.code);
                          toast.success(isApplied ? "Coupon removed" : `${coupon.code} applied`);
                        }}
                        className={`inline-flex w-fit items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                          isApplied
                            ? "bg-[#0B4964] text-white"
                            : "border border-[#0B4964] bg-white text-[#0B4964]"
                        }`}
                      >
                        {isApplied ? "Applied" : "Apply coupon"}
                      </button>
                    </div>
                  </article>
                );
              })}
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[28px] border border-[#eadfdb] bg-white md:hidden">
            <button
              type="button"
              onClick={() => setIsHighlightsOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#98a2b3]">Service details</p>
                <h3 className="text-xl font-bold text-[#22313f]">Product highlights</h3>
              </div>
              <ChevronDown
                size={18}
                className={`text-[#667085] transition-transform ${isHighlightsOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isHighlightsOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2">
                    {PRODUCT_HIGHLIGHTS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="flex items-center gap-3 rounded-2xl border border-[#edf0f4] bg-[#fcfdff] px-4 py-4"
                        >
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef4f8] text-[#0B4964]">
                            <Icon size={18} />
                          </div>
                          <p className="text-sm font-medium text-[#22313f]">{item.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </section>

          <section className="rounded-[28px] border border-[#eadfdb] bg-white p-4 md:hidden md:p-5">
            <div className="flex flex-wrap gap-2">
              {DETAIL_TABS.map((tab) => {
                const isActive = activeDetailTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveDetailTab(tab)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "border-[#1f2430] bg-[#1f2430] text-white"
                        : "border-[#d9dde3] bg-white text-[#526070]"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-[#edf0f4] bg-[#fcfdff]">
              <button
                type="button"
                onClick={() => setIsDetailsOpen((current) => !current)}
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#98a2b3]">All details</p>
                  <h3 className="mt-1 text-lg font-bold text-[#22313f]">{activeDetailSection.title}</h3>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-[#667085] transition-transform ${isDetailsOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isDetailsOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-x-8 gap-y-0 border-t border-[#edf0f4] px-4 pb-2 pt-1 md:grid-cols-2">
                      {activeDetailSection.items.map((item) => (
                        <div
                          key={`${activeDetailTab}-${item.label}`}
                          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 border-b border-[#edf0f4] py-3"
                        >
                          <p className="text-sm text-[#667085]">{item.label}</p>
                          <p className="text-sm font-medium text-[#22313f]">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </section>

          <section className="space-y-3 md:hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#98a2b3]">Discover more</p>
                <h3 className="text-xl font-bold text-[#22313f]">Similar decorations</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {similarServices.map((item) => (
                <Link key={item.id} to={`/service/${item.id}`} className="group block">
                  <article className="space-y-2">
                    <div className="relative aspect-square overflow-hidden rounded-[22px] bg-[#f8fafc]">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          if (!ensureAuthenticated()) return;
                          const next = toggleWishlist(item.id);
                          const isSaved = next.includes(item.id);
                          setWishlistIds(next);
                          toast.success(isSaved ? "Added to wishlist" : "Removed from wishlist");
                        }}
                        className="absolute right-2 top-2 rounded-full bg-[#ffffffdd] p-1.5 text-[#22313f] shadow-sm"
                      >
                        <Heart
                          size={14}
                          className={wishlistIds.includes(item.id) ? "fill-[#FB2965] text-[#FB2965]" : ""}
                        />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <h4
                        className="overflow-hidden text-sm font-semibold leading-5 text-[#22313f]"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {item.title}
                      </h4>
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="truncate text-[#0B4964]">{formatCurrency(item.price)} incl. setup</span>
                        <span className="inline-flex shrink-0 items-center gap-1 text-[#1f2430]">
                          <Star size={12} className="fill-current text-[#f59e0b]" />
                          {item.rating}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="hidden rounded-[32px] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] ring-1 ring-[#f0e7e2] md:block md:p-8">
            <div className="hidden flex-wrap items-center gap-2 md:flex">
              <Badge className="border-none bg-[#FB2965]/10 text-[#FB2965]">{service.category}</Badge>
              <div className="inline-flex items-center gap-1 rounded-full bg-[#fff7df] px-3 py-1 text-sm font-semibold text-[#5f4b00]">
                <Star size={14} className="fill-current" />
                {service.rating} ({service.reviews} reviews)
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-[#eef7ff] px-3 py-1 text-sm text-[#305a79]">
                <MapPin size={14} />
                {service.location}
              </div>
            </div>

            <h1 className="mt-4 hidden text-3xl font-bold tracking-tight text-[#0B4964] md:block md:text-4xl">{service.title}</h1>

            <div className="mt-5 hidden items-end gap-3 md:flex">
              <div className="text-4xl font-bold text-[#FB2965]">{formatCurrency(finalPrice)}</div>
              {service.price !== finalPrice ? (
                <div className="pb-1 text-lg text-[#98a2b3] line-through">{formatCurrency(service.price)}</div>
              ) : service.originalPrice ? (
                <div className="pb-1 text-lg text-[#98a2b3] line-through">{formatCurrency(service.originalPrice)}</div>
              ) : null}
              {discount ? (
                <div className="rounded-full bg-[#e9fff1] px-3 py-1 text-sm font-semibold text-[#1f9d58]">
                  Save {discount}%
                </div>
              ) : null}
            </div>
            {appliedCoupon ? (
              <div className="mt-3 inline-flex rounded-full bg-[#eef6ff] px-3 py-1 text-sm font-medium text-[#0B4964]">
                {appliedCoupon.code} applied
              </div>
            ) : null}
          </div>

          <div className="hidden rounded-[32px] border border-[#eadfdb] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:block md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#98a2b3]">Booking schedule</p>
                <h2 className="mt-2 text-2xl font-bold text-[#0B4964]">Choose date and time</h2>
                <p className="mt-1 text-sm text-[#667085]">
                  Pick your preferred setup slot. You can update it in the next step if the team suggests a better time.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleOpen(true)}
                className="inline-flex items-center gap-1 rounded-full border border-[#eadfdb] bg-white px-4 py-2 text-sm font-medium text-[#0B4964] hover:border-[#0B4964] transition-colors"
              >
                Change
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setIsScheduleOpen(true)}
                className="rounded-3xl border border-[#e5e7eb] bg-[#fcfcfd] p-5 text-left"
              >
                <div className="flex items-center gap-3 text-[#0B4964]">
                  <CalendarDays size={20} />
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-[#98a2b3]">Selected date</p>
                    <p className="mt-1 text-lg font-semibold">{selectedDateLabel}</p>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setIsScheduleOpen(true)}
                className="rounded-3xl border border-[#e5e7eb] bg-[#fcfcfd] p-5 text-left"
              >
                <div className="flex items-center gap-3 text-[#0B4964]">
                  <Clock3 size={20} />
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-[#98a2b3]">Selected time</p>
                    <p className="mt-1 text-lg font-semibold">{selectedTime}</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-6 rounded-3xl bg-[#f8fafc] p-4 text-sm text-[#526070]">
              Next step after booking: confirm address, event notes, and final installation slot with the team.
            </div>
          </div>

          <div className="hidden gap-4 md:flex">
            <Button variant="outline" className="h-14 flex-1 text-base font-semibold" onClick={handleReserve}>
              Reserve
            </Button>
            <Button className="h-14 flex-1 bg-[#0B4964] text-base font-semibold hover:bg-[#08384e]" onClick={handleBookNow}>
              Book Now
            </Button>
          </div>

          <section className="hidden overflow-hidden rounded-[32px] border border-[#eadfdb] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:block">
            <button
              type="button"
              onClick={() => setIsHighlightsOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-3 px-6 py-5 text-left md:px-8"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#98a2b3]">Service details</p>
                <h3 className="text-[1.7rem] font-bold text-[#22313f]">Product highlights</h3>
              </div>
              <ChevronDown
                size={20}
                className={`text-[#667085] transition-transform ${isHighlightsOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isHighlightsOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-3 px-6 pb-6 md:px-8 md:pb-8">
                    {PRODUCT_HIGHLIGHTS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="flex items-center gap-3 rounded-2xl border border-[#edf0f4] bg-[#fcfdff] px-4 py-4"
                        >
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef4f8] text-[#0B4964]">
                            <Icon size={18} />
                          </div>
                          <p className="text-sm font-medium text-[#22313f]">{item.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </section>

          <div className="rounded-[32px] border border-[#eadfdb] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:hidden md:p-8">
            <div className="flex items-center gap-2 text-[#0B4964]">
              <BadgeAlert size={18} />
              <h2 className="text-xl font-bold">FAQs</h2>
            </div>
            <div className="mt-5 space-y-3">
              {FAQ_ITEMS.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={item.question} className="overflow-hidden rounded-2xl border border-[#edf0f4]">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                    >
                      <span className="font-semibold text-[#22313f]">{item.question}</span>
                      <ChevronDown
                        size={18}
                        className={`text-[#667085] transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-5 text-sm leading-6 text-[#667085]">{item.answer}</p>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      <section className="hidden space-y-3 md:block">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#98a2b3]">Discover more</p>
            <h3 className="text-xl font-bold text-[#22313f]">Similar decorations</h3>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {similarServices.map((item) => (
            <Link key={`desktop-${item.id}`} to={`/service/${item.id}`} className="group block">
              <article className="space-y-2">
                <div className="relative aspect-square overflow-hidden rounded-[22px] bg-[#f8fafc]">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (!ensureAuthenticated()) return;
                      const next = toggleWishlist(item.id);
                      const isSaved = next.includes(item.id);
                      setWishlistIds(next);
                      toast.success(isSaved ? "Added to wishlist" : "Removed from wishlist");
                    }}
                    className="absolute right-2 top-2 rounded-full bg-[#ffffffdd] p-1.5 text-[#22313f] shadow-sm"
                  >
                    <Heart
                      size={14}
                      className={wishlistIds.includes(item.id) ? "fill-[#FB2965] text-[#FB2965]" : ""}
                    />
                  </button>
                </div>
                <div className="space-y-1">
                  <h4
                    className="overflow-hidden text-sm font-semibold leading-5 text-[#22313f]"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-[#0B4964]">{formatCurrency(item.price)} incl. setup</span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-[#1f2430]">
                      <Star size={12} className="fill-current text-[#f59e0b]" />
                      {item.rating}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      <div className="hidden rounded-[32px] border border-[#eadfdb] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:block">
        <div className="flex items-center gap-2 text-[#0B4964]">
          <BadgeAlert size={18} />
          <h2 className="text-xl font-bold">FAQs</h2>
        </div>
        <div className="mt-5 space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={`desktop-${item.question}`} className="overflow-hidden rounded-2xl border border-[#edf0f4]">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                >
                  <span className="font-semibold text-[#22313f]">{item.question}</span>
                  <ChevronDown
                    size={18}
                    className={`text-[#667085] transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-6 text-[#667085]">{item.answer}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#eadfdb] bg-white/95 p-4 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md gap-3">
          <Button variant="outline" className="h-14 flex-1 text-base font-semibold" onClick={handleReserve}>
            Reserve
          </Button>
          <Button className="h-14 flex-1 bg-[#0B4964] text-base font-semibold hover:bg-[#08384e]" onClick={handleBookNow}>
            Book Now
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isScheduleOpen ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsScheduleOpen(false)}
              className="fixed inset-0 z-40 bg-[#101828]/35 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] bg-white p-5 shadow-2xl md:left-1/2 md:top-1/2 md:w-[640px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[32px]"
            >
              <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[#e4e7ec] md:hidden" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#0B4964]">Book a Decoration</h2>
                  <p className="mt-1 text-sm text-[#667085]">{service.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="rounded-full p-2 text-[#667085] hover:bg-[#f8fafc]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 rounded-[28px] border border-[#eaecf0] bg-white p-5">
                <div className="space-y-6">
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-[#344054]">Select date</h3>
                      <CalendarDays size={16} className="text-[#667085]" />
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                      {DATE_OPTIONS.map((option) => (
                        <button
                          key={option.date}
                          type="button"
                          onClick={() => setSelectedDate(option.date)}
                          className={`min-w-[140px] rounded-2xl border px-4 py-3 text-left transition ${
                            selectedDate === option.date
                              ? "border-[#0B4964] bg-[#f5fbff] text-[#0B4964]"
                              : "border-[#e4e7ec] bg-white text-[#344054]"
                          }`}
                        >
                          <p className="text-xs">{option.label}</p>
                          <p className="mt-1 text-lg font-semibold">{option.display}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#344054]">Select preferred time</h3>
                    <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                      {TIME_GROUPS.map((group) => (
                        <button
                          key={group.label}
                          type="button"
                          onClick={() => {
                            setSelectedTimeGroup(group.label);
                            setSelectedTime(group.slots[0]);
                          }}
                          className={`rounded-full border px-4 py-2 text-sm transition ${
                            selectedTimeGroup === group.label
                              ? "border-[#0B4964] bg-[#eaf4fb] text-[#0B4964]"
                              : "border-[#e4e7ec] bg-white text-[#667085]"
                          }`}
                        >
                          {group.label}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {selectedGroup.slots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`rounded-2xl border px-3 py-4 text-center transition ${
                            selectedTime === slot
                              ? "border-[#0B4964] bg-[#f5fbff] text-[#0B4964]"
                              : "border-[#e4e7ec] bg-white text-[#344054]"
                          }`}
                        >
                          <p className="text-base font-semibold">{slot}</p>
                          <p className="mt-1 text-[11px] text-[#1570ef]">Available</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="gradient"
                    className="mt-6 h-12 w-full font-semibold shadow-md hover:shadow-lg transition-shadow"
                    onClick={() => setIsScheduleOpen(false)}
                  >
                    Proceed
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default ServiceDetail;

const MobileFeature = ({ icon, label }: { icon: ReactNode; label: string }) => (
  <div className="flex flex-col items-center gap-2 text-center">
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0B4964] ring-1 ring-[#e8edf3]">
      {icon}
    </div>
    <span className="text-[10px] font-medium leading-4 text-[#344054]">{label}</span>
  </div>
);
