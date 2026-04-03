import { FormEvent, ReactNode, TouchEvent, useEffect, useMemo, useRef, useState } from "react";
import SEO from "../components/SEO";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  BadgeAlert,
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
  Star,
  Timer,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Badge, Button } from "../components/ui";
import { readWishlist, saveBookingDraft, toggleWishlist, upsertCartItem } from "../lib/booking";
import { CheckoutCoupon, calcDiscount, fetchActiveCoupons, findCoupon, isCouponAvailableForAmount } from "../lib/coupons";
import { formatCurrency } from "../lib/utils";
import { fetchServiceById, fetchAllServices } from "../lib/services";
import { Service } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

import { parseNoticeHours, getAvailableDates, getAvailableSlotsForDate } from "../lib/bookingAvailability";

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

const SIMILARITY_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "arch",
  "at",
  "backdrop",
  "balloon",
  "balloons",
  "by",
  "decoration",
  "decorations",
  "for",
  "in",
  "of",
  "on",
  "setup",
  "setups",
  "the",
  "theme",
  "with",
]);

const getSimilarityTokens = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !SIMILARITY_STOP_WORDS.has(token));

const InclusionList = ({ items }: { items: string[] }) => {
  if (items.length === 0) {
    return (
      <div className="px-1 pb-1 pt-2 text-sm text-[#667085]">
        Inclusions will be updated soon for this setup.
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#edf0f4]">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-3 py-4">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eef4f8] text-[#0B4964]">
            <Check size={14} />
          </div>
          <p className="text-[15px] font-medium leading-6 text-[#22313f]">{item}</p>
        </div>
      ))}
    </div>
  );
};

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, profile, setShowLoginModal } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [coupons, setCoupons] = useState<CheckoutCoupon[]>([]);
  const [loadingService, setLoadingService] = useState(true);

  useEffect(() => {
    if (!serviceId) return;
    setLoadingService(true);
    fetchServiceById(serviceId).then((svc) => {
      setService(svc);
      setLoadingService(false);
      if (svc) {
        const noticeHours = parseNoticeHours(svc.bookingNotice);
        const dates = getAvailableDates(noticeHours);
        if (dates.length > 0) {
          const firstDate = dates[0].date;
          setSelectedDate(firstDate);
          const slots = getAvailableSlotsForDate(firstDate, noticeHours);
          const firstSlot = slots[0] ?? "9:00 AM";
          setSelectedTime(firstSlot);
          if (["1:30 PM", "3:00 PM", "4:30 PM"].includes(firstSlot)) setSelectedTimeGroup("Afternoon");
          else if (["6:00 PM", "7:30 PM", "9:00 PM"].includes(firstSlot)) setSelectedTimeGroup("Evening");
          else setSelectedTimeGroup("Morning");
        }
      }
    }).catch(() => {
      setLoadingService(false);
    });
    fetchAllServices().then(setAllServices).catch(() => {});
  }, [serviceId]);

  useEffect(() => {
    let isActive = true;

    fetchActiveCoupons()
      .then((data) => {
        if (isActive) setCoupons(data);
      })
      .catch(() => {
        if (isActive) setCoupons([]);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const [activeImage, setActiveImage] = useState(0);
  const [isImageLightboxOpen, setIsImageLightboxOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeGroup, setSelectedTimeGroup] = useState<"Morning" | "Afternoon" | "Evening">("Morning");
  const [selectedTime, setSelectedTime] = useState("");
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => readWishlist());
  const [selectedVenueType, setSelectedVenueType] = useState<(typeof VENUE_TYPES)[number]>("Home");
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [isHighlightsOpen, setIsHighlightsOpen] = useState(true);
  const [activeDetailTab, setActiveDetailTab] = useState<(typeof DETAIL_TABS)[number]>("Specifications");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [imageDirection, setImageDirection] = useState(0);
  const mobileTitleRef = useRef<HTMLHeadingElement | null>(null);
  const thumbnailStripRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const [isMobileTitleWrapped, setIsMobileTitleWrapped] = useState(false);
  const [needFastOpen, setNeedFastOpen] = useState(false);
  const [fastDate, setFastDate] = useState("");
  const [fastTime, setFastTime] = useState("");
  const [fastPhone, setFastPhone] = useState("");
  const [fastSubmitting, setFastSubmitting] = useState(false);
  const [fastDone, setFastDone] = useState(false);

  const discount =
    service?.originalPrice && service.originalPrice > service.price
      ? Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100)
      : 0;

  const noticeHours = parseNoticeHours(service?.bookingNotice);
  const dateOptions = useMemo(() => getAvailableDates(noticeHours), [noticeHours]);
  const availableSlots = useMemo(
    () => getAvailableSlotsForDate(selectedDate, noticeHours),
    [selectedDate, noticeHours]
  );
  const timeGroups = useMemo(() => [
    { label: "Morning" as const, slots: availableSlots.filter((s) => ["9:00 AM", "10:30 AM", "12:00 PM"].includes(s)) },
    { label: "Afternoon" as const, slots: availableSlots.filter((s) => ["1:30 PM", "3:00 PM", "4:30 PM"].includes(s)) },
    { label: "Evening" as const, slots: availableSlots.filter((s) => ["6:00 PM", "7:30 PM", "9:00 PM"].includes(s)) },
  ].filter((g) => g.slots.length > 0), [availableSlots]);

  // When date changes, auto-select first group with slots and its first slot
  useEffect(() => {
    if (timeGroups.length === 0) return;
    const currentGroupStillValid = timeGroups.some((g) => g.label === selectedTimeGroup);
    if (!currentGroupStillValid) {
      const firstGroup = timeGroups[0];
      setSelectedTimeGroup(firstGroup.label);
      setSelectedTime(firstGroup.slots[0]);
    } else {
      // Group is still valid but make sure the selected slot is still available
      const currentGroup = timeGroups.find((g) => g.label === selectedTimeGroup)!;
      if (!currentGroup.slots.includes(selectedTime)) {
        setSelectedTime(currentGroup.slots[0]);
      }
    }
  }, [timeGroups]);

  const selectedGroup = useMemo(
    () => timeGroups.find((group) => group.label === selectedTimeGroup) ?? timeGroups[0],
    [timeGroups, selectedTimeGroup]
  );
  const appliedCoupon = useMemo(
    () => findCoupon(coupons, appliedCouponCode),
    [appliedCouponCode, coupons]
  );
  const couponDiscount = useMemo(() => {
    if (!service || !appliedCoupon) return 0;
    if (!isCouponAvailableForAmount(appliedCoupon, service.price)) return 0;
    return calcDiscount(appliedCoupon, service.price);
  }, [appliedCoupon, service]);
  const finalPrice = useMemo(() => {
    if (!service) return 0;
    return Math.max(service.price - couponDiscount, 0);
  }, [couponDiscount, service]);
  const similarServices = useMemo(
    () => {
      if (!service) return [];

      const referencePrice = service.price;
      const targetTitleTokens = new Set(getSimilarityTokens(service.title));
      const targetMetaTokens = new Set(
        getSimilarityTokens([service.category, ...(service.tags ?? [])].join(" "))
      );

      return allServices
        .filter((item) => item.id !== service.id)
        .map((item) => {
          const itemTitleTokens = new Set(getSimilarityTokens(item.title));
          const itemMetaTokens = new Set(
            getSimilarityTokens([item.category, item.description, ...(item.tags ?? [])].join(" "))
          );

          let score = 0;

          targetTitleTokens.forEach((token) => {
            if (itemTitleTokens.has(token)) score += 16;
            else if (itemMetaTokens.has(token)) score += 8;
          });

          targetMetaTokens.forEach((token) => {
            if (itemTitleTokens.has(token)) score += 7;
            else if (itemMetaTokens.has(token)) score += 4;
          });

          if (item.category === service.category) score += 18;

          const priceGap = Math.abs(item.price - referencePrice);
          const priceGapRatio = referencePrice > 0 ? priceGap / referencePrice : 1;

          if (priceGapRatio <= 0.1) score += 18;
          else if (priceGapRatio <= 0.2) score += 14;
          else if (priceGapRatio <= 0.35) score += 9;
          else if (priceGapRatio <= 0.5) score += 4;

          if (item.trending) score += 3;
          score += Math.min(item.rating, 5);

          return { item, score, priceGap };
        })
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          if (a.priceGap !== b.priceGap) return a.priceGap - b.priceGap;
          if (b.item.rating !== a.item.rating) return b.item.rating - a.item.rating;
          return b.item.reviews - a.item.reviews;
        })
        .map(({ item }) => item)
        .slice(0, 8);
    },
    [allServices, service]
  );
  const mobileSimilarServices = similarServices.slice(0, 4);
  const desktopSimilarServices = similarServices.slice(0, 8);
  const activeDetailSection = useMemo(() => {
    const tabKeyMap = {
      Specifications: "specifications",
      "Service policy": "service_policy",
      "Need to know": "need_to_know",
    } as const;
    const key = tabKeyMap[activeDetailTab];
    const dynamicItems = service?.bookingTerms?.[key] ?? [];
    return {
      title: DETAIL_CONTENT[activeDetailTab].title,
      items: dynamicItems.map((item) => ({ label: item.title, value: item.description })),
    };
  }, [activeDetailTab, service]);

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

  useEffect(() => {
    const strip = thumbnailStripRef.current;
    if (!strip) return;

    const activeThumb = strip.querySelector<HTMLButtonElement>(`button[data-image-index="${activeImage}"]`);
    activeThumb?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeImage]);

  useEffect(() => {
    if (!isImageLightboxOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isImageLightboxOpen]);


  if (loadingService) {
    return (
      <div className="animate-pulse pb-32">
        {/* Image skeleton */}
        <div className="relative -mx-4 aspect-[1/1] bg-[#e8eaed] md:mx-0 md:aspect-[16/9] md:rounded-[28px]" />

        <div className="mt-5 space-y-3 px-1">
          {/* Title */}
          <div className="h-6 w-3/4 rounded-full bg-[#e8eaed]" />
          {/* Location + rating row */}
          <div className="flex items-center gap-3">
            <div className="h-4 w-24 rounded-full bg-[#e8eaed]" />
            <div className="h-4 w-16 rounded-full bg-[#e8eaed]" />
          </div>
          {/* Tags */}
          <div className="flex gap-2 pt-1">
            <div className="h-7 w-20 rounded-full bg-[#e8eaed]" />
            <div className="h-7 w-24 rounded-full bg-[#e8eaed]" />
            <div className="h-7 w-16 rounded-full bg-[#e8eaed]" />
          </div>
          {/* Price row */}
          <div className="flex items-center justify-between pt-2">
            <div className="h-8 w-32 rounded-full bg-[#e8eaed]" />
            <div className="h-5 w-20 rounded-full bg-[#e8eaed]" />
          </div>
        </div>

        {/* Inclusions block */}
        <div className="mt-6 rounded-[24px] bg-[#f4f6f8] p-5 space-y-3">
          <div className="h-4 w-32 rounded-full bg-[#e8eaed]" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-4 rounded-full bg-[#e8eaed]" />
              <div className="h-3 rounded-full bg-[#e8eaed]" style={{ width: `${55 + i * 8}%` }} />
            </div>
          ))}
        </div>

        {/* Date/time row */}
        <div className="mt-6 flex gap-3">
          <div className="h-14 flex-1 rounded-[18px] bg-[#e8eaed]" />
          <div className="h-14 flex-1 rounded-[18px] bg-[#e8eaed]" />
        </div>

        {/* CTA button */}
        <div className="mt-6 h-14 w-full rounded-[18px] bg-[#e8eaed]" />
      </div>
    );
  }

  if (!service) return <div className="py-24 text-center text-lg text-[#667085]">Service not found</div>;

  const isWishlisted = wishlistIds.includes(service.id);
  const inclusionItems = Array.from(
    new Set(service.inclusions.map((item) => item.trim()).filter(Boolean))
  );

  const selectedDateLabel =
    dateOptions.find((option) => option.date === selectedDate)?.display ?? selectedDate;

  const ensureAuthenticated = () => {
    if (!isAuthenticated || !profile?.phone_number) {
      toast.error("Please login to continue");
      setShowLoginModal(true);
      return false;
    }

    return true;
  };

  const handleReserve = () => {
    upsertCartItem({
      serviceId: service.id,
      service,
      selectedAddons: [],
      date: selectedDate,
      time: selectedTime,
      quantity: 1,
    });
    toast.success("Added to cart");
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/category/${encodeURIComponent(service.category)}/service/${service.id}`;

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
    saveBookingDraft({
      serviceId: service.id,
      date: selectedDate,
      time: selectedTime,
      price: service.price,
    });

    const checkoutParams = new URLSearchParams();
    if (couponDiscount > 0 && appliedCoupon) {
      checkoutParams.set("coupon", appliedCoupon.code);
    }

    const checkoutQuery = checkoutParams.toString();
    navigate(checkoutQuery ? `/checkout?${checkoutQuery}` : "/checkout");
  };

  // Need it fast
  const handleNeedFast = async () => {
    if (!fastDate || !fastTime) {
      toast.error("Please select a date and time");
      return;
    }
    setFastSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("need_fast").insert({
      service_id: service.id,
      service_title: service.title,
      preferred_date: fastDate,
      preferred_time: fastTime,
      phone: fastPhone || null,
      user_id: user?.id || null,
    });
    setFastSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setFastDone(true);
  };

  const openImageLightbox = () => setIsImageLightboxOpen(true);
  const closeImageLightbox = () => setIsImageLightboxOpen(false);

  const handlePrevImage = () => {
    setImageDirection(-1);
    setActiveImage((current) => (current === 0 ? service.images.length - 1 : current - 1));
  };

  const handleNextImage = () => {
    setImageDirection(1);
    setActiveImage((current) => (current === service.images.length - 1 ? 0 : current + 1));
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartXRef.current = null;

    if (startX == null || endX == null) return;

    const deltaX = startX - endX;
    if (Math.abs(deltaX) < 40) return;

    if (deltaX > 0) {
      handleNextImage();
    } else {
      handlePrevImage();
    }
  };

  return (
    <div className="space-y-8 pb-32 pt-[68px] md:pt-0 md:pb-14">
      <SEO
        title={`${service.title} - ${service.category} Decoration Bangalore`}
        description={`Book ${service.title} in Bangalore starting at ₹${service.price.toLocaleString("en-IN")}. Rated ${service.rating}/5. ${service.description?.slice(0, 100) || "Professional setup included."}`}
        canonical={`/category/${encodeURIComponent(service.category)}/service/${service.id}`}
        ogImage={service.images?.[0]}
      />
      <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between bg-white px-4 py-3 md:static md:px-0 md:py-0">
        <button
          onClick={() => navigate(-1)}
          className="relative z-[60] flex h-11 w-11 items-center justify-center rounded-2xl bg-white ring-1 ring-[#eadfdb] transition-all active:scale-90 md:hidden"
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
              className="h-11 w-full rounded-full border border-[#eadfdb] bg-white pl-10 pr-4 text-sm text-[#22313f] outline-none transition focus:border-[#0B4964]"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={openImageLightbox}
            className="relative aspect-square overflow-hidden rounded-[34px] bg-[#f8f8f8] md:aspect-[4/3]"
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.img
                key={`${service.id}-${activeImage}`}
                src={service.images[activeImage] ?? service.images[0]}
                alt={service.title}
                initial={{ opacity: 0, x: imageDirection >= 0 ? 34 : -34 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: imageDirection >= 0 ? -34 : 34 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
                fetchPriority="high"
                decoding="async"
              />
            </AnimatePresence>
            {service.images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  onClickCapture={(event) => event.stopPropagation()}
                  className="absolute left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-[#22313f] shadow-sm backdrop-blur-sm transition hover:bg-white"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  onClickCapture={(event) => event.stopPropagation()}
                  className="absolute right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-[#22313f] shadow-sm backdrop-blur-sm transition hover:bg-white"
                  aria-label="Next image"
                >
                  <ChevronLeft size={18} className="rotate-180" />
                </button>
              </>
            ) : null}
            <div className="absolute right-4 top-4 flex gap-2 md:hidden">
              <button
                onClick={handleShare}
                onClickCapture={(event) => event.stopPropagation()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 text-[#22313f] shadow-sm"
              >
                <Share2 size={18} />
              </button>
              <button
                onClick={handleReserve}
                onClickCapture={(event) => event.stopPropagation()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 text-[#22313f] shadow-sm"
              >
                <Heart size={18} className={isWishlisted ? "fill-[#FB2965] text-[#FB2965]" : ""} />
              </button>
            </div>
            {service.images.length > 1 ? (
              <>
                <div className="absolute inset-x-0 bottom-4 flex justify-center md:hidden">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#111827]/36 px-3 py-2 backdrop-blur-sm">
                    {service.images.map((_, index) => (
                      <button
                        key={`mobile-image-dot-${index}`}
                        type="button"
                        onClick={() => {
                          setImageDirection(index > activeImage ? 1 : -1);
                          setActiveImage(index);
                        }}
                        onClickCapture={(event) => event.stopPropagation()}
                        aria-label={`View image ${index + 1}`}
                        className={`h-2.5 rounded-full transition-all ${
                          activeImage === index ? "w-5 bg-white" : "w-2.5 bg-white/45"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-5 hidden justify-center md:flex">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/82 px-3 py-2 backdrop-blur-sm ring-1 ring-white/60">
                    {service.images.map((_, index) => (
                      <button
                        key={`desktop-image-dot-${index}`}
                        type="button"
                        onClick={() => {
                          setImageDirection(index > activeImage ? 1 : -1);
                          setActiveImage(index);
                        }}
                        onClickCapture={(event) => event.stopPropagation()}
                        aria-label={`View image ${index + 1}`}
                        className={`rounded-full transition-all ${
                          activeImage === index ? "h-2.5 w-6 bg-[#0B4964]" : "h-2.5 w-2.5 bg-[#0B4964]/28"
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-[11px] font-semibold text-[#22313f]">
                      {activeImage + 1}/{service.images.length}
                    </span>
                  </div>
                </div>
              </>
            ) : null}
          </motion.div>

          <div ref={thumbnailStripRef} className="hidden gap-3 overflow-x-auto no-scrollbar md:flex md:gap-2.5">
            {service.images.map((image, index) => (
              <button
                key={`${service.id}-${index}`}
                type="button"
                onClick={() => {
                  setImageDirection(index > activeImage ? 1 : -1);
                  setActiveImage(index);
                }}
                data-image-index={index}
                className={`h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 md:h-20 md:w-20 ${
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
              className="overflow-hidden text-[20px] font-semibold leading-[1.15] tracking-tight text-[#1f2430]"
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
                <p className="text-xs text-[#98a2b3]">After offer price</p>
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
                  {dateOptions.map((option) => (
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
                  {timeGroups.map((group) => (
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
                  {(selectedGroup?.slots ?? []).map((slot) => (
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

            <div className="mt-5 border-t border-[#edf0f4] pt-4">
              <button
                type="button"
                onClick={() => setIsDetailsOpen((current) => !current)}
                className="flex w-full items-center justify-between gap-3 text-left"
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
                  <div className="mt-3 grid gap-x-8 gap-y-0 border-t border-[#edf0f4] pb-2 pt-1 md:grid-cols-2">
                    {activeDetailSection.items.map((item) => (
                      <div
                        key={`desktop-description-${activeDetailTab}-${item.label}`}
                        className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 border-b border-[#edf0f4] py-3 last:border-b-0"
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
                {coupons.map((coupon) => {
                  const isApplied = appliedCouponCode === coupon.code;
                  const isAvailable = isCouponAvailableForAmount(coupon, service.price);
                  const savings = isAvailable ? calcDiscount(coupon, service.price) : 0;
                  const chipLabel = isAvailable
                    ? `Save ${formatCurrency(savings)}`
                    : `Min order ${formatCurrency(coupon.minOrderAmount)}`;
                  const helperText = coupon.description || (isAvailable
                    ? "Apply this coupon at checkout."
                    : `Valid on bookings above ${formatCurrency(coupon.minOrderAmount)}`);

                  return (
                    <article
                      key={coupon.code}
                      className={`relative w-[82%] shrink-0 overflow-hidden rounded-[24px] border p-4 transition md:w-auto ${
                        isApplied
                          ? "border-[#0B4964] bg-[#f5fbff]"
                          : isAvailable
                            ? "border-[#eadfdb] bg-[linear-gradient(135deg,#f5e6ff_0%,#f8efff_58%,#ffffff_100%)]"
                            : "border-[#e4e7ec] bg-[#f8fafc]"
                      }`}
                    >
                      <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-[32px] bg-[#0B4964]/8" />
                      <div className="relative flex h-full flex-col justify-between gap-4">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#667085]">{coupon.title}</p>
                          <h4 className="text-lg font-bold leading-6 text-[#22313f]">{coupon.code}</h4>
                          <div className="inline-flex rounded-full border border-[#eadfdb] bg-white px-3 py-1 text-xs font-semibold text-[#344054]">
                            {chipLabel}
                          </div>
                          <p className="text-xs text-[#667085]">{helperText}</p>
                        </div>
                        <button
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => {
                            setAppliedCouponCode(isApplied ? null : coupon.code);
                            toast.success(isApplied ? "Coupon removed" : `${coupon.code} applied`);
                          }}
                          className={`inline-flex w-fit items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                            isApplied
                              ? "bg-[#0B4964] text-white"
                              : isAvailable
                                ? "border border-[#0B4964] bg-white text-[#0B4964]"
                                : "cursor-not-allowed border border-[#d0d5dd] bg-white text-[#98a2b3]"
                          }`}
                        >
                          {isApplied ? "Applied" : isAvailable ? "Apply coupon" : "Not eligible"}
                        </button>
                      </div>
                    </article>
                  );
                })}
                {coupons.length === 0 ? (
                  <div className="w-[82%] shrink-0 rounded-[24px] border border-dashed border-[#d0d5dd] bg-[#f8fafc] p-4 text-sm text-[#667085]">
                    Coupons will appear here when active offers are available.
                  </div>
                ) : null}
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
                  <div className="px-5 pb-5">
                    <InclusionList items={inclusionItems} />
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

            <div className="mt-5 border-t border-[#edf0f4] pt-4">
              <button
                type="button"
                onClick={() => setIsDetailsOpen((current) => !current)}
                className="flex w-full items-center justify-between gap-3 text-left"
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
                    <div className="mt-3 grid gap-x-8 gap-y-0 border-t border-[#edf0f4] pb-2 pt-1 md:grid-cols-2">
                      {activeDetailSection.items.map((item) => (
                        <div
                          key={`${activeDetailTab}-${item.label}`}
                          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 border-b border-[#edf0f4] py-3 last:border-b-0"
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
              {mobileSimilarServices.map((item) => (
                <Link key={item.id} to={`/category/${encodeURIComponent(item.category)}/service/${item.id}`} className="group block">
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
          <section className="hidden overflow-hidden rounded-[32px] border border-[#eadfdb] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:block">
            <div className="space-y-7 px-8 py-8">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-none bg-[#FB2965]/10 text-[#FB2965]">{service.category}</Badge>
                  <div className="inline-flex items-center gap-1 rounded-full bg-[#fff7df] px-3 py-1 text-[13px] font-semibold text-[#5f4b00]">
                    <Star size={14} className="fill-current" />
                    {service.rating} ({service.reviews} reviews)
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-[#eef7ff] px-3 py-1 text-[13px] text-[#305a79]">
                    <MapPin size={14} />
                    {service.location}
                  </div>
                </div>

                <div className="space-y-4">
                  <h1 className="max-w-3xl text-[2.2rem] font-bold leading-[1.08] tracking-[-0.03em] text-[#0B4964]">
                    {service.title}
                  </h1>
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="text-[2.5rem] font-bold leading-none text-[#FB2965]">{formatCurrency(finalPrice)}</div>
                    {service.price !== finalPrice ? (
                      <div className="pb-1 text-[15px] text-[#98a2b3] line-through">{formatCurrency(service.price)}</div>
                    ) : service.originalPrice ? (
                      <div className="pb-1 text-[15px] text-[#98a2b3] line-through">{formatCurrency(service.originalPrice)}</div>
                    ) : null}
                    {discount ? (
                      <div className="rounded-full bg-[#e9fff1] px-3 py-1 text-[13px] font-semibold text-[#1f9d58]">
                        Save {discount}%
                      </div>
                    ) : null}
                    {appliedCoupon ? (
                      <div className="rounded-full bg-[#eef6ff] px-3 py-1 text-[13px] font-medium text-[#0B4964]">
                        {appliedCoupon.code} applied
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#edf0f4] pt-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#98a2b3]">Booking schedule</p>
                    <h2 className="mt-0.5 text-[1.1rem] font-bold leading-tight text-[#0B4964]">Choose date and time</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsScheduleOpen(true)}
                    className="inline-flex items-center gap-1 rounded-full border border-[#eadfdb] bg-white px-4 py-2 text-[13px] font-medium text-[#0B4964] transition-colors hover:border-[#0B4964]"
                  >
                    Change
                  </button>
                </div>

                <div className="mt-4 grid gap-0 overflow-hidden rounded-[20px] border border-[#edf0f4] md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setIsScheduleOpen(true)}
                    className="border-b border-[#edf0f4] px-4 py-3.5 text-left transition-colors hover:bg-[#fafcff] md:border-b-0 md:border-r"
                  >
                    <div className="flex items-center gap-3 text-[#0B4964]">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef4f8]">
                        <CalendarDays size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#98a2b3]">Selected date</p>
                        <p className="mt-0.5 text-[1.1rem] font-semibold leading-none">{selectedDateLabel}</p>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsScheduleOpen(true)}
                    className="px-4 py-3.5 text-left transition-colors hover:bg-[#fafcff]"
                  >
                    <div className="flex items-center gap-3 text-[#0B4964]">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef4f8]">
                        <Clock3 size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#98a2b3]">Selected time</p>
                        <p className="mt-0.5 text-[1.1rem] font-semibold leading-none">{selectedTime}</p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="mt-3 rounded-[16px] border border-[#edf0f4] bg-[#fafcff] px-4 py-3 text-[12px] leading-6 text-[#526070]">
                  Next step after booking: confirm address, event notes, and final installation slot with the team.
                </div>

                {/* Need it fast */}
                <button
                  type="button"
                  onClick={() => { setFastDone(false); setFastDate(selectedDate); setFastTime(selectedTime); setFastPhone(profile?.phone_number || ""); setNeedFastOpen(true); }}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-[#ff1744] to-[#FB2965] py-3 text-[13px] font-bold text-white shadow-[0_4px_18px_rgba(251,41,101,0.35)] transition-all hover:shadow-[0_6px_24px_rgba(251,41,101,0.5)] hover:brightness-105 active:scale-[0.98]"
                >
                  <Zap size={14} className="fill-white" />
                  Need it fast? Request priority slot
                </button>
              </div>
            </div>

            <div className="border-t border-[#edf0f4] px-8 py-5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const next = toggleWishlist(service.id);
                    setWishlistIds(next);
                    toast.success(next.includes(service.id) ? "Added to wishlist" : "Removed from wishlist");
                  }}
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition ${
                    isWishlisted
                      ? "border-[#FB2965] bg-[#fff0f4] text-[#FB2965]"
                      : "border-[#e4e7ec] bg-white text-[#667085]"
                  }`}
                >
                  <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
                <Button
                  variant="outline"
                  className="h-14 flex-1 rounded-2xl border-[#0B4964] text-sm font-semibold text-[#0B4964]"
                  onClick={() => { handleReserve(); navigate("/cart"); }}
                >
                  Reserve
                </Button>
                <Button
                  className="h-14 flex-1 rounded-2xl bg-[#FB2965] text-sm font-semibold hover:bg-[#e02456]"
                  onClick={handleBookNow}
                >
                  Book Now
                </Button>
              </div>
            </div>
          </section>

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
                  <div className="px-6 pb-6 md:px-8 md:pb-8">
                    <InclusionList items={inclusionItems} />
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
        <div className="grid grid-cols-4 gap-5">
          {desktopSimilarServices.map((item) => (
            <Link key={`desktop-${item.id}`} to={`/category/${encodeURIComponent(item.category)}/service/${item.id}`} className="group block">
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

      <AnimatePresence>
        {isImageLightboxOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-[#05070bcc]/95 backdrop-blur-sm"
            onClick={closeImageLightbox}
          >
            <div className="flex h-full w-full items-center justify-center p-4 md:p-8">
              <div
                className="relative flex h-full w-full max-w-6xl items-center justify-center"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={closeImageLightbox}
                  className="absolute right-0 top-0 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur-sm transition hover:bg-white/18"
                  aria-label="Close full screen image"
                >
                  <X size={20} />
                </button>

                {service.images.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-0 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur-sm transition hover:bg-white/18 md:flex"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-0 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur-sm transition hover:bg-white/18 md:flex"
                      aria-label="Next image"
                    >
                      <ChevronLeft size={20} className="rotate-180" />
                    </button>
                  </>
                ) : null}

                <motion.div
                  key={`lightbox-${service.id}-${activeImage}`}
                  initial={{ opacity: 0, x: imageDirection >= 0 ? 42 : -42 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: imageDirection >= 0 ? -42 : 42 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  className="flex h-full w-full items-center justify-center"
                >
                  <img
                    src={service.images[activeImage] ?? service.images[0]}
                    alt={service.title}
                    className="max-h-[84vh] w-auto max-w-full rounded-[28px] object-contain shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>

                {service.images.length > 1 ? (
                  <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/10 px-3 py-2 backdrop-blur-sm">
                    {service.images.map((_, index) => (
                      <button
                        key={`lightbox-image-dot-${index}`}
                        type="button"
                        onClick={() => {
                          setImageDirection(index > activeImage ? 1 : -1);
                          setActiveImage(index);
                        }}
                        aria-label={`View image ${index + 1}`}
                        className={`h-2.5 rounded-full transition-all ${
                          activeImage === index ? "w-5 bg-white" : "w-2.5 bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#eadfdb] bg-white/95 px-4 py-3 pb-4 backdrop-blur md:hidden">
        <button
          type="button"
          onClick={() => { setFastDone(false); setFastDate(selectedDate); setFastTime(selectedTime); setFastPhone(profile?.phone_number || ""); setNeedFastOpen(true); }}
          className="mb-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff1744] to-[#FB2965] py-2.5 text-[13px] font-bold text-white shadow-[0_4px_14px_rgba(251,41,101,0.3)] active:scale-[0.98]"
        >
          <Zap size={13} className="fill-white" />
          Need it fast? Request priority slot
        </button>
        <div className="mx-auto flex max-w-md items-center gap-2">
          {/* Wishlist */}
          <button
            type="button"
            onClick={() => {
              const next = toggleWishlist(service.id);
              setWishlistIds(next);
              toast.success(next.includes(service.id) ? "Added to wishlist" : "Removed from wishlist");
            }}
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition ${
              isWishlisted
                ? "border-[#FB2965] bg-[#fff0f4] text-[#FB2965]"
                : "border-[#e4e7ec] bg-white text-[#667085]"
            }`}
          >
            <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
          {/* Reserve → cart */}
          <Button
            variant="outline"
            className="h-14 flex-1 rounded-2xl border-[#0B4964] text-sm font-semibold text-[#0B4964]"
            onClick={() => {
              handleReserve();
              navigate("/cart");
            }}
          >
            Reserve
          </Button>
          {/* Book Now → checkout */}
          <Button
            className="h-14 flex-1 rounded-2xl bg-[#FB2965] text-sm font-semibold hover:bg-[#e02456]"
            onClick={handleBookNow}
          >
            Book Now
          </Button>
        </div>
      </div>

      {/* Need it fast modal */}
      <AnimatePresence>
        {needFastOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px]"
              onClick={() => setNeedFastOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="fixed inset-x-0 bottom-0 z-[90] rounded-t-[28px] bg-white p-5 pb-10 shadow-2xl md:inset-auto md:left-1/2 md:top-1/2 md:w-[460px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[28px] md:pb-6"
            >
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#e4e7ec] md:hidden" />

              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff0f4]">
                    <Zap size={18} className="fill-[#FB2965] text-[#FB2965]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#0B4964]">Need it fast?</h2>
                    <p className="text-xs text-[#667085]">Tell us your preferred slot — we'll confirm priority</p>
                  </div>
                </div>
                <button type="button" onClick={() => setNeedFastOpen(false)} className="rounded-full p-1.5 text-[#98a2b3] hover:bg-[#f2f4f7]">
                  <X size={18} />
                </button>
              </div>

              {fastDone ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e9fff1]">
                    <Check size={26} className="text-[#1f9d58]" />
                  </div>
                  <p className="text-base font-bold text-[#0B4964]">Request received!</p>
                  <p className="text-sm text-[#667085]">Our team will reach out to confirm your priority slot as soon as possible.</p>
                  <button
                    type="button"
                    onClick={() => setNeedFastOpen(false)}
                    className="mt-2 rounded-full bg-[#0B4964] px-8 py-2.5 text-sm font-semibold text-white"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#98a2b3] mb-1">
                    {service.title}
                  </div>

                  {/* Date + Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#344054]">Preferred date</label>
                      <input
                        type="date"
                        value={fastDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={e => setFastDate(e.target.value)}
                        className="w-full rounded-2xl border border-[#eadfdb] bg-[#fafcff] px-3 py-2.5 text-sm text-[#22313f] focus:outline-none focus:ring-2 focus:ring-[#0B4964]/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#344054]">Preferred time</label>
                      <input
                        type="time"
                        value={fastTime.includes(":") && !fastTime.includes("AM") && !fastTime.includes("PM") ? fastTime : "10:00"}
                        onChange={e => setFastTime(e.target.value)}
                        className="w-full rounded-2xl border border-[#eadfdb] bg-[#fafcff] px-3 py-2.5 text-sm text-[#22313f] focus:outline-none focus:ring-2 focus:ring-[#0B4964]/20"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#344054]">Your phone number</label>
                    <input
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={fastPhone}
                      onChange={e => setFastPhone(e.target.value)}
                      className="w-full rounded-2xl border border-[#eadfdb] bg-[#fafcff] px-3 py-2.5 text-sm text-[#22313f] placeholder:text-[#98a2b3] focus:outline-none focus:ring-2 focus:ring-[#0B4964]/20"
                    />
                  </div>

                  <div className="rounded-2xl bg-[#fff5f8] px-4 py-3 text-xs text-[#FB2965]">
                    <span className="font-semibold">How it works:</span> We'll call or WhatsApp you within 30 minutes to confirm availability for your requested slot.
                  </div>

                  <button
                    type="button"
                    disabled={fastSubmitting}
                    onClick={handleNeedFast}
                    className="w-full rounded-2xl bg-[#FB2965] py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#e02456] disabled:opacity-60"
                  >
                    {fastSubmitting ? "Sending request…" : "Request Priority Slot"}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                      {dateOptions.map((option) => (
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
                      {timeGroups.map((group) => (
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
                      {(selectedGroup?.slots ?? []).map((slot) => (
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
