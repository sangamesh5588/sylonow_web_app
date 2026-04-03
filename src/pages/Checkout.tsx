import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  BadgeAlert,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronDown,
  CreditCard,
  MapPin,
  Pencil,
  Plus,
  ReceiptIndianRupee,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Button, Card, Input } from "../components/ui";
import { supabase } from "../lib/supabase";
import QRCode from "qrcode";
import { BookingDraft, clearBookingDraft, createOrder, readAddresses, readBookingDraft, saveBookingDraft, writeAddresses } from "../lib/booking";
import { CheckoutCoupon, fetchActiveCoupons, findCoupon, isCouponAvailableForAmount, calcDiscount } from "../lib/coupons";
import { createRazorpayOrder, openRazorpayCheckout, verifyRazorpayPayment } from "../lib/razorpay";
import { formatCurrency } from "../lib/utils";
import { fetchServiceById, fetchPricingLogic, getAdvanceAmount, PricingTier } from "../lib/services";
import { useAuth } from "../contexts/AuthContext";
import { Address, Service } from "../types";
import { AddressDraft, AddressPicker } from "../components/address/AddressPicker";
import { normalizeCityName } from "../lib/citySelection";
import { COMPANY_CONTACT } from "../lib/siteContent";
import { parseNoticeHours, getAvailableDates, getAvailableSlotsForDate } from "../lib/bookingAvailability";

const CouponSection = ({
  couponInput,
  appliedCouponCode,
  coupons,
  appliedCoupon,
  discountAmount,
  onCouponInputChange,
  onApplyCoupon,
  onRemoveCoupon,
  onQuickApply,
  onViewMore,
  baseServicePrice,
}: {
  couponInput: string;
  appliedCouponCode: string | null;
  coupons: CheckoutCoupon[];
  appliedCoupon: CheckoutCoupon | null;
  discountAmount: number;
  onCouponInputChange: (value: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  onQuickApply: (code: string, isApplied: boolean) => void;
  onViewMore: () => void;
  baseServicePrice: number;
}) => (
  <Card className="space-y-4 border border-[#f0e7e2] p-4 shadow-none">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-[#FB2965]">Coupons</p>
        <h3 className="mt-1 text-lg font-semibold text-[#22313f]">Apply coupon</h3>
      </div>
      <button
        type="button"
        onClick={onViewMore}
        className="shrink-0 text-sm font-medium text-[#0B4964]"
      >
        View more
      </button>
    </div>

    <div className="flex gap-2">
      <Input
        value={couponInput}
        onChange={(event) => onCouponInputChange(event.target.value.toUpperCase())}
        placeholder="Enter coupon code"
        className="h-11 rounded-full border-[#e4e7ec] text-sm"
      />
      <Button
        type="button"
        variant="secondary"
        className="h-11 shrink-0 rounded-full px-4 text-sm text-[#0B4964]"
        onClick={onApplyCoupon}
      >
        Apply
      </Button>
    </div>

    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {coupons.slice(0, 2).map((coupon) => {
        const isApplied = appliedCouponCode === coupon.code;
        const isAvailable = isCouponAvailableForAmount(coupon, baseServicePrice);
        return (
          <button
            key={coupon.code}
            type="button"
            onClick={() => onQuickApply(coupon.code, isApplied)}
            disabled={!isAvailable}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
              isApplied
                ? "border-[#0B4964] bg-[#edf5ff] text-[#0B4964]"
                : isAvailable
                  ? "border-[#e4e7ec] bg-white text-[#475467]"
                  : "border-[#eaecf0] bg-[#f8fafc] text-[#98a2b3]"
            }`}
          >
            {coupon.code}
          </button>
        );
      })}
    </div>

    {appliedCoupon ? (
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#eefbf3] px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#157f3d]">{appliedCoupon.code} applied</p>
          <p className="text-xs text-[#039855]">You save {formatCurrency(discountAmount)}</p>
        </div>
        <button
          type="button"
          onClick={onRemoveCoupon}
          className="shrink-0 text-sm font-medium text-[#157f3d]"
        >
          Remove
        </button>
      </div>
    ) : null}
  </Card>
);

const getMobileAddressPreview = (address?: string | null) => {
  if (!address) return "No address selected";

  const words = address.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 4) return address;

  return `${words.slice(0, 4).join(" ")}...`;
};

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, setShowLoginModal, profile } = useAuth();
  const requiresLogin = !isAuthenticated || !profile?.phone_number;
  const initialDraft = readBookingDraft();
  const [bookingDraft, setBookingDraft] = useState<BookingDraft | null>(initialDraft);
  const [service, setService] = useState<Service | null>(null);
  const [loadingService, setLoadingService] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [coupons, setCoupons] = useState<CheckoutCoupon[]>([]);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [payMode, setPayMode] = useState<"advance" | "full">("full");
  const [payModeOpen, setPayModeOpen] = useState(false);
  const [pendingAddressAction, setPendingAddressAction] = useState(false);
  const [selectedTimeGroup, setSelectedTimeGroup] = useState<"Morning" | "Afternoon" | "Evening">("Evening");
  const [showStickyCheckoutBar, setShowStickyCheckoutBar] = useState(false);
  const checkoutActionRef = useRef<HTMLButtonElement | null>(null);
  const [addressForm, setAddressForm] = useState<AddressDraft>({
    label: "Home",
    houseNumber: "",
    fullAddress: "",
    city: "",
    pincode: "",
    latitude: undefined,
    longitude: undefined,
    placeId: undefined,
  });

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddressForm({
      label: "Home",
      houseNumber: "",
      fullAddress: "",
      city: "",
      pincode: "",
      latitude: undefined,
      longitude: undefined,
      placeId: undefined,
    });
  };

  useEffect(() => {
    if (!bookingDraft?.serviceId) {
      setService(null);
      setLoadingService(false);
      return;
    }

    let isActive = true;
    setLoadingService(true);

    fetchServiceById(bookingDraft.serviceId)
      .then((nextService) => {
        if (isActive) {
          setService(nextService);
        }
      })
      .finally(() => {
        if (isActive) {
          setLoadingService(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [bookingDraft?.serviceId]);

  useEffect(() => {
    fetchActiveCoupons().then(setCoupons);
    fetchPricingLogic().then(setPricingTiers);
  }, []);

  useEffect(() => {
    if (!bookingDraft || !service) {
      return;
    }

    if (requiresLogin) {
      setAddresses([]);
      setSelectedAddressId("");
      return;
    }

    const nextAddresses = readAddresses(profile?.phone_number);
    setAddresses(nextAddresses);
    if (nextAddresses[0]) {
      setSelectedAddressId(nextAddresses[0].id);
    }
  }, [bookingDraft, requiresLogin, service, profile?.phone_number]);

  useEffect(() => {
    if (!requiresLogin && pendingAddressAction) {
      setShowAddressForm(true);
      setPendingAddressAction(false);
    }
  }, [requiresLogin, pendingAddressAction]);

  useEffect(() => {
    const hasModalOpen = showAddressForm || showAddressPicker || showScheduleForm;
    if (!hasModalOpen) return;

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPaddingRight = body.style.paddingRight;
    const previousHtmlOverflow = documentElement.style.overflow;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.paddingRight = previousBodyPaddingRight;
      documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [showAddressForm, showAddressPicker, showScheduleForm]);

  const noticeHours = parseNoticeHours(service?.bookingNotice);
  const dateOptions = useMemo(() => getAvailableDates(noticeHours), [noticeHours]);
  const availableSlotsForDate = useMemo(
    () => getAvailableSlotsForDate(bookingDraft?.date ?? "", noticeHours),
    [bookingDraft?.date, noticeHours]
  );
  const timeGroups = useMemo(() => [
    { label: "Morning" as const, slots: availableSlotsForDate.filter((s) => ["9:00 AM", "10:30 AM", "12:00 PM"].includes(s)) },
    { label: "Afternoon" as const, slots: availableSlotsForDate.filter((s) => ["1:30 PM", "3:00 PM", "4:30 PM"].includes(s)) },
    { label: "Evening" as const, slots: availableSlotsForDate.filter((s) => ["6:00 PM", "7:30 PM", "9:00 PM"].includes(s)) },
  ].filter((g) => g.slots.length > 0), [availableSlotsForDate]);

  useEffect(() => {
    if (!bookingDraft?.time) return;
    const matchingGroup = timeGroups.find((group) =>
      (group.slots as readonly string[]).includes(bookingDraft.time)
    );
    if (matchingGroup) {
      setSelectedTimeGroup(matchingGroup.label);
    }
  }, [bookingDraft?.time, timeGroups]);

  // When available slots change (date change), auto-select first valid group + slot
  useEffect(() => {
    if (timeGroups.length === 0) return;
    const currentGroupStillValid = timeGroups.some((g) => g.label === selectedTimeGroup);
    const targetGroup = currentGroupStillValid
      ? timeGroups.find((g) => g.label === selectedTimeGroup)!
      : timeGroups[0];
    if (!currentGroupStillValid) {
      setSelectedTimeGroup(targetGroup.label);
    }
    if (!bookingDraft?.time || !targetGroup.slots.includes(bookingDraft.time)) {
      setBookingDraft((prev) => {
        if (!prev) return prev;
        const next = { ...prev, time: targetGroup.slots[0] };
        saveBookingDraft(next);
        return next;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeGroups]);

  const selectedAddress = useMemo(
    () => addresses.find((item) => item.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId]
  );
  const serviceCity = normalizeCityName((service?.location ?? "").split(",")[0] || "Bengaluru");
  const selectedAddressCity = selectedAddress?.city ? normalizeCityName(selectedAddress.city) : "";
  const isSelectedAddressServiceable =
    !selectedAddress || !selectedAddressCity || selectedAddressCity === serviceCity;
  const mobileAddressPreview = getMobileAddressPreview(selectedAddress?.fullAddress);
  const selectedTimeOptions =
    timeGroups.find((group) => group.label === selectedTimeGroup)?.slots ?? timeGroups[timeGroups.length - 1]?.slots ?? [];
  const selectedDateDisplay =
    dateOptions.find((option) => option.date === bookingDraft?.date)?.display ?? bookingDraft?.date ?? "";
  const appliedCoupon = useMemo(() => findCoupon(coupons, appliedCouponCode), [coupons, appliedCouponCode]);
  const baseServicePrice = bookingDraft?.price ?? service?.price ?? 0;
  const originalPrice = service?.originalPrice ?? baseServicePrice;
  const priceDiscount = Math.max(originalPrice - baseServicePrice, 0);
  const couponDiscount = appliedCoupon ? calcDiscount(appliedCoupon, baseServicePrice) : 0;
  const discountAmount = couponDiscount; // kept for coupon UI compatibility
  const discountedServicePrice = Math.max(baseServicePrice - couponDiscount, 0);

  // Travel fee calculation
  const distanceKm = useMemo(() => {
    if (
      !selectedAddress?.latitude || !selectedAddress?.longitude ||
      !service?.latitude || !service?.longitude
    ) return null;
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(selectedAddress.latitude - service.latitude);
    const dLng = toRad(selectedAddress.longitude - service.longitude);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(service.latitude)) *
      Math.cos(toRad(selectedAddress.latitude)) *
      Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }, [selectedAddress?.latitude, selectedAddress?.longitude, service?.latitude, service?.longitude]);

  const freeServiceKm = service?.freeServiceKm ?? 0;
  const extraChargesPerKm = service?.extraChargesPerKm ?? 0;
  const extraKm = distanceKm !== null && distanceKm > freeServiceKm
    ? Math.ceil(distanceKm - freeServiceKm)
    : 0;
  const travelFee = extraKm > 0 ? extraKm * extraChargesPerKm : 0;

  const total = discountedServicePrice + travelFee;
  const totalSaved = priceDiscount + couponDiscount + Math.round(baseServicePrice * 0.02) + Math.round(baseServicePrice * 0.03);
  const advanceAmount = getAdvanceAmount(pricingTiers, total) ?? Math.round(total * 0.3);
  const FULL_PAYMENT_DISCOUNT = 100;
  const fullPayAmount = Math.max(total - FULL_PAYMENT_DISCOUNT, 0);
  const payNow = payMode === "advance" ? advanceAmount : fullPayAmount;
  const remainingAfterAdvance = payMode === "advance" ? total - advanceAmount : 0;

  useEffect(() => {
    const button = checkoutActionRef.current;
    if (!button) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyCheckoutBar(!entry.isIntersecting);
      },
      { threshold: 0.35 }
    );

    observer.observe(button);
    return () => observer.disconnect();
  }, [service?.id, payNow, selectedAddressId, isSelectedAddressServiceable, isPaying]);

  useEffect(() => {
    const couponFromQuery = searchParams.get("coupon");
    if (!couponFromQuery) {
      setAppliedCouponCode(null);
      return;
    }

    const coupon = findCoupon(coupons, couponFromQuery);
    if (!coupon || !isCouponAvailableForAmount(coupon, baseServicePrice)) {
      setAppliedCouponCode(null);
      return;
    }

    setAppliedCouponCode(coupon.code);
    setCouponInput(coupon.code);
  }, [baseServicePrice, searchParams, coupons]);

  if (!bookingDraft) {
    return (
      <div className="space-y-8 pb-20 pt-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="relative z-[60] flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-[#eadfdb] transition-all active:scale-90"
          >
            <ChevronLeft size={22} className="text-[#0B4964]" />
          </button>
          <div>
            <p className="text-sm font-medium text-[#FB2965]">Checkout</p>
            <h1 className="text-2xl font-bold tracking-tight text-[#0B4964]">Complete your booking</h1>
          </div>
        </div>

        <Card className="mx-auto max-w-2xl rounded-[32px] border border-[#f0e7e2] bg-[linear-gradient(180deg,#fffdfb_0%,#fff6f0_100%)] p-8 text-center shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff1f4] text-[#FB2965]">
            <CalendarDays size={28} />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-[#0B4964]">Choose your booking slot first</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#667085]">
            Before checkout, select a date and time from the service page or continue from cart with a saved booking slot.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              variant="outline"
              className="h-12 rounded-full px-6 text-sm font-semibold"
              onClick={() => navigate("/cart")}
            >
              Back to cart
            </Button>
            <Button
              className="h-12 rounded-full bg-[#0B4964] px-6 text-sm font-semibold hover:bg-[#08384e]"
              onClick={() => navigate("/")}
            >
              Browse services
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (loadingService) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B4964] border-t-transparent" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="space-y-6 pb-20 pt-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="relative z-[60] flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-[#eadfdb] transition-all active:scale-90"
          >
            <ChevronLeft size={22} className="text-[#0B4964]" />
          </button>
          <div>
            <p className="text-sm font-medium text-[#FB2965]">Checkout</p>
            <h1 className="text-lg font-semibold text-[#0B4964]">Complete your booking</h1>
          </div>
        </div>

        <Card className="border border-[#f0e7e2] p-6 text-center shadow-none">
          <h2 className="text-xl font-semibold text-[#22313f]">Selected service not found</h2>
          <p className="mt-2 text-sm text-[#667085]">
            Open the service details page again and continue with a fresh booking slot.
          </p>
          <Button
            className="mt-5 h-12 rounded-full bg-[#0B4964] px-6 hover:bg-[#08384e]"
            onClick={() => navigate("/")}
          >
            Browse services
          </Button>
        </Card>
      </div>
    );
  }

  const handleAddAddress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile?.phone_number) return;

    if (!addressForm.fullAddress || !addressForm.city || !addressForm.pincode) {
      toast.error("Please fill all address details");
      return;
    }

    let nextAddresses: Address[];
    if (editingAddressId) {
      nextAddresses = addresses.map((a) =>
        a.id === editingAddressId ? { ...a, ...addressForm } : a
      );
      setAddresses(nextAddresses);
      setSelectedAddressId(editingAddressId);
      writeAddresses(profile!.phone_number, nextAddresses);
      setEditingAddressId(null);
      toast.success("Address updated");
    } else {
      const nextAddress: Address = {
        id: `address-${Date.now()}`,
        ...addressForm,
      };
      nextAddresses = [nextAddress, ...addresses];
      setAddresses(nextAddresses);
      setSelectedAddressId(nextAddress.id);
      writeAddresses(profile!.phone_number, nextAddresses);
      toast.success("Address added");
    }

    if (normalizeCityName(addressForm.city) !== serviceCity) {
      toast.info(`This setup is currently available in ${serviceCity}. You can keep this address saved and switch to a supported city anytime.`);
    }

    setShowAddressForm(false);
    resetAddressForm();
  };

  const updateBookingDraft = (updates: Partial<BookingDraft>) => {
    if (!bookingDraft) return;
    const nextDraft = { ...bookingDraft, ...updates };
    setBookingDraft(nextDraft);
    saveBookingDraft(nextDraft);
  };

  const openAddressFlow = () => {
    if (requiresLogin) {
      setPendingAddressAction(true);
      setShowLoginModal(true);
      toast.error("Please login to add an address");
      return;
    }

    setShowAddressForm(true);
  };

  const handleApplyCoupon = () => {
    const normalizedCode = couponInput.trim().toUpperCase();
    if (!normalizedCode) {
      toast.error("Enter a coupon code");
      return;
    }

    const coupon = findCoupon(coupons, normalizedCode);
    if (!coupon) {
      toast.error("Invalid coupon code");
      return;
    }

    if (!isCouponAvailableForAmount(coupon, baseServicePrice)) {
      toast.error(`Coupon valid on orders above ${formatCurrency(coupon.minOrderAmount)}`);
      return;
    }

    setAppliedCouponCode(coupon.code);
    setCouponInput(coupon.code);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("coupon", coupon.code);
    setSearchParams(nextParams, { replace: true });
    toast.success(`${coupon.code} applied`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCouponCode(null);
    setCouponInput("");
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("coupon");
    setSearchParams(nextParams, { replace: true });
    toast.success("Coupon removed");
  };

  const handleQuickApplyCoupon = (code: string, isApplied: boolean) => {
    setCouponInput(code);
    if (isApplied) {
      handleRemoveCoupon();
      return;
    }
    const coupon = findCoupon(coupons, code);
    if (!coupon) return;
    if (!isCouponAvailableForAmount(coupon, baseServicePrice)) {
      toast.error(`Coupon valid on orders above ${formatCurrency(coupon.minOrderAmount)}`);
      return;
    }
    setAppliedCouponCode(code);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("coupon", code);
    setSearchParams(nextParams, { replace: true });
    toast.success(`${code} applied`);
  };

  const handleViewMoreCoupons = () => {
    navigate(`/coupons?returnTo=/checkout&amount=${baseServicePrice}&coupon=${appliedCouponCode ?? ""}`);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Add or select an address to continue");
      openAddressFlow();
      return;
    }

    if (requiresLogin) {
      setPendingAddressAction(true);
      setShowLoginModal(true);
      toast.error("Please login to continue");
      return;
    }

    if (!profile?.phone_number || !bookingDraft) return;
    if (!isSelectedAddressServiceable) {
      toast.error(`This setup is currently available only in ${serviceCity}. Please select a supported address to continue.`);
      return;
    }

    try {
      setIsPaying(true);

      const order = await createRazorpayOrder({
        amount: payNow,
        serviceId: service.id,
        serviceTitle: service.title,
        bookingDate: bookingDraft.date,
        bookingTime: bookingDraft.time,
        phoneNumber: profile.phone_number,
        couponCode: appliedCouponCode,
      });

      const paymentResult = await openRazorpayCheckout({
        order,
        name: "Sylonow",
        description: `${service.title} booking`,
        phoneNumber: profile.phone_number.replace(/\D/g, "").slice(-10),
      });

      await verifyRazorpayPayment(paymentResult);

      // Parse booking time from "9:00 AM" → "09:00:00"
      const parseTime = (t: string): string => {
        const [time, meridiem] = t.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (meridiem === "PM" && hours !== 12) hours += 12;
        if (meridiem === "AM" && hours === 12) hours = 0;
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
      };

      const { data: { user } } = await supabase.auth.getUser();
      const orderId = `order-${Date.now()}`;
      const qrCode = await QRCode.toDataURL(orderId, { width: 256, margin: 2 });

      const { error: orderError } = await supabase.from("orders").insert({
        id: orderId,
        user_id: user?.id ?? null,
        customer_name: profile.full_name ?? profile.phone_number,
        customer_phone: profile.phone_number,
        service_title: service.title,
        service_description: service.description ?? null,
        booking_date: new Date(bookingDraft.date).toISOString(),
        booking_time: parseTime(bookingDraft.time),
        total_amount: total,
        advance_amount: payNow,
        remaining_amount: remainingAfterAdvance,
        status: "confirmed",
        payment_status: remainingAfterAdvance > 0 ? "partial" : "paid",
        address_id: selectedAddress.id ?? null,
        qr_code: qrCode,
      });

      if (orderError) throw new Error(orderError.message);

      await createOrder(
        profile.phone_number,
        user?.id ?? "",
        service,
        bookingDraft,
        selectedAddress,
        total,
        "confirmed",
        orderId
      );

      clearBookingDraft();
      toast.success("Payment successful! Booking confirmed.");
      navigate("/orders");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Payment failed. Please try again.";
      toast.error(message);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden pt-1 pb-28 md:space-y-8 md:pb-10">
      <div className="flex items-start gap-3 pl-1 pt-1 sm:items-center sm:gap-4 sm:pl-0 sm:pt-0">
        <button
          onClick={() => navigate(-1)}
          className="relative z-[60] flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-[#eadfdb] transition-all active:scale-90"
        >
          <ChevronLeft size={22} className="text-[#0B4964]" />
        </button>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#FB2965]">Checkout</p>
          <h1 className="text-lg font-semibold tracking-tight text-[#0B4964] sm:text-xl">Complete your booking</h1>
        </div>
      </div>

      <div className="grid w-full max-w-full items-start gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)] xl:gap-8">
        <div className="space-y-6">
          <Card className="border border-[#f0e7e2] p-4 shadow-none sm:p-5">
            <div className="mb-4 flex min-w-0 items-center gap-2 text-[#0B4964]">
              <MapPin size={14} className="shrink-0" />
              <p className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold uppercase tracking-[0.04em]">
                {mobileAddressPreview}
              </p>
            </div>

            <div className="flex min-w-0 items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0B4964]">
                  {service.location.split(",")[0]}
                </p>
                <h2 className="mt-2 break-words text-xl font-semibold leading-tight text-[#22313f] sm:text-2xl">
                  {service.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#667085]">
                  {service.category}
                </p>
              </div>

              <div className="h-32 w-32 shrink-0 overflow-hidden rounded-[24px] bg-[#f8fafc] sm:h-36 sm:w-36">
                <img
                  src={service.images[0]}
                  alt={service.title}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </Card>

          <Card className="space-y-4 border border-[#f0e7e2] p-5 shadow-none sm:p-6">
            <div className="flex items-center gap-2 text-[#98a2b3]">
              <CalendarDays size={18} className="shrink-0" />
              <p className="text-sm font-semibold uppercase tracking-[0.04em]">Date & slot</p>
            </div>

            <div className="border-b border-[#edf0f4] pb-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#98a2b3]">Date</p>
                  <p className="mt-1 text-[15px] font-semibold text-[#22313f]">{selectedDateDisplay}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="shrink-0 rounded-full px-4 text-[#0B4964]"
                  onClick={() => setShowScheduleForm(true)}
                >
                  Change
                </Button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#98a2b3]">Time slot</p>
                  <p className="mt-1 text-[15px] font-semibold text-[#22313f]">{bookingDraft?.time}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="shrink-0 rounded-full px-4 text-[#0B4964]"
                  onClick={() => setShowScheduleForm(true)}
                >
                  Change
                </Button>
              </div>
            </div>
          </Card>

          <div className="xl:hidden">
            <CouponSection
              couponInput={couponInput}
              appliedCouponCode={appliedCouponCode}
              coupons={coupons}
              appliedCoupon={appliedCoupon}
              discountAmount={discountAmount}
              onCouponInputChange={setCouponInput}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              onQuickApply={handleQuickApplyCoupon}
              onViewMore={handleViewMoreCoupons}
              baseServicePrice={baseServicePrice}
            />
          </div>

          <Card className="space-y-4 border border-[#f0e7e2] p-5 shadow-none sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#FB2965]">Address</p>
                <h2 className="text-lg font-semibold text-[#0B4964]">Setup location</h2>
              </div>
            </div>

            {selectedAddress ? (
              <>
                <div className="flex items-start gap-3 rounded-[20px] border border-[#0B4964] bg-[#f5fbff] p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0B4964] text-white">
                    <MapPin size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#98a2b3]">{selectedAddress.label}</p>
                    <p className="mt-0.5 break-words text-sm font-medium text-[#22313f]">{selectedAddress.fullAddress}</p>
                    <p className="text-xs text-[#667085]">{selectedAddress.city} - {selectedAddress.pincode}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddressPicker(true)}
                    className="shrink-0 rounded-full border border-[#eadfdb] bg-white px-3 py-1 text-xs font-semibold text-[#0B4964] transition hover:border-[#0B4964]"
                  >
                    Change
                  </button>
                </div>

                {distanceKm !== null && freeServiceKm > 0 ? (
                  <div className={`flex items-center gap-2 rounded-2xl px-3 py-2 ${travelFee > 0 ? "bg-[#fff8f0]" : "bg-[#f0faf4]"}`}>
                    <span className="text-base">{travelFee > 0 ? "🚗" : "✅"}</span>
                    <div className="min-w-0 flex-1">
                      {travelFee > 0 ? (
                        <>
                          <p className="text-xs font-semibold text-[#9a3412]">
                            Travel charge applies — {distanceKm.toFixed(1)} km from vendor
                          </p>
                          <p className="text-[11px] text-[#7c5b42] mt-0.5">
                            Free within {freeServiceKm} km · Extra {extraKm} km × ₹{extraChargesPerKm}/km = <span className="font-bold">+{formatCurrency(travelFee)}</span> added to total
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-semibold text-[#157f3d]">
                            No travel charge — within free service range
                          </p>
                          <p className="text-[11px] text-[#4a8a5c] mt-0.5">
                            Your location is {distanceKm.toFixed(1)} km away · Free up to {freeServiceKm} km
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <button
                type="button"
                onClick={openAddressFlow}
                className="flex w-full items-center gap-4 rounded-[24px] border border-dashed border-[#d0d5dd] bg-white p-5 text-left transition hover:border-[#0B4964]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef4f8] text-[#0B4964]">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#22313f]">No address yet</p>
                  <p className="mt-0.5 text-xs text-[#667085]">Tap to add your event location</p>
                </div>
              </button>
            )}
          </Card>

          {/* Address Picker Modal */}
          <AnimatePresence>
            {showAddressPicker && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
                onClick={() => setShowAddressPicker(false)}
              >
                <motion.div
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 60, opacity: 0 }}
                  transition={{ type: "spring", damping: 28, stiffness: 300 }}
                  className="w-full max-w-md rounded-t-[28px] bg-white p-5 sm:rounded-[28px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-[#22313f]">Select Address</h3>
                    <button
                      type="button"
                      onClick={() => setShowAddressPicker(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f4f7] text-[#667085] hover:bg-[#eaecf0]"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {addresses.map((address) => {
                      const isSelected = address.id === selectedAddressId;
                      return (
                        <div
                          key={address.id}
                          className={`flex items-start gap-3 rounded-[18px] border p-3.5 transition ${
                            isSelected ? "border-[#0B4964] bg-[#f5fbff]" : "border-[#e4e7ec] bg-white"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAddressId(address.id);
                              setShowAddressPicker(false);
                            }}
                            className="flex min-w-0 flex-1 items-start gap-3 text-left"
                          >
                            <MapPin size={16} className="mt-0.5 shrink-0 text-[#0B4964]" />
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] uppercase tracking-[0.14em] text-[#98a2b3]">{address.label}</p>
                              <p className="mt-0.5 break-words text-sm font-medium text-[#22313f]">{address.fullAddress}</p>
                              <p className="text-xs text-[#667085]">{address.city} - {address.pincode}</p>
                            </div>
                          </button>
                          <div className="flex shrink-0 items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAddressId(address.id);
                                setAddressForm({
                                  label: address.label,
                                  fullAddress: address.fullAddress,
                                  city: address.city,
                                  pincode: address.pincode,
                                  latitude: address.latitude,
                                  longitude: address.longitude,
                                  placeId: address.placeId,
                                });
                                setShowAddressPicker(false);
                                setShowAddressForm(true);
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f2f4f7] text-[#667085] hover:bg-[#eaecf0]"
                            >
                              <Pencil size={13} />
                            </button>
                            {isSelected && (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0B4964] text-white">
                                <Check size={12} />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAddressPicker(false);
                      openAddressFlow();
                    }}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-[18px] border border-dashed border-[#d0d5dd] bg-[#f9fafb] py-3 text-sm font-semibold text-[#0B4964] transition hover:border-[#0B4964]"
                  >
                    <Plus size={15} />
                    Add new address
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <div className="hidden xl:block">
            <CouponSection
              couponInput={couponInput}
              appliedCouponCode={appliedCouponCode}
              coupons={coupons}
              appliedCoupon={appliedCoupon}
              discountAmount={discountAmount}
              onCouponInputChange={setCouponInput}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              onQuickApply={handleQuickApplyCoupon}
              onViewMore={handleViewMoreCoupons}
              baseServicePrice={baseServicePrice}
            />
          </div>

          <div className="flex items-center justify-center gap-2 rounded-2xl bg-[#f8fafc] px-4 py-3">
            <ShieldCheck size={15} className="shrink-0 text-[#0B4964]" />
            <p className="text-[11px] font-medium text-[#475467]">
              100% secure payments powered by{" "}
              <span className="font-semibold text-[#0B4964]">Razorpay</span>
            </p>
          </div>

          <Card className="overflow-hidden border border-[#f0e7e2] p-0 shadow-none xl:sticky xl:top-24">
            <button
              type="button"
              onClick={() => setShowPriceBreakdown((current) => !current)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4d7f57] text-white">
                <CreditCard size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold leading-none text-[#22313f]">
                  To Pay {formatCurrency(payNow)}
                </p>
                <p className="mt-0.5 text-xs text-[#039855]">Incl. all taxes & charges</p>
              </div>
              <ChevronDown
                size={18}
                className={`shrink-0 text-[#667085] transition-transform ${showPriceBreakdown ? "rotate-180" : ""}`}
              />
            </button>
            {totalSaved > 0 ? (
              <div className="flex items-center gap-2 border-t border-dashed border-[#c5e8d0] bg-[#f0faf4] px-4 py-2">
                <span className="text-base">🎉</span>
                <p className="text-xs font-semibold text-[#157f3d]">
                  You're saving <span className="text-[#0B4964]">{formatCurrency(totalSaved)}</span> on this order!
                </p>
              </div>
            ) : null}
          </Card>

          {showPriceBreakdown ? (
            <Card className="border border-[#f0e7e2] p-4 shadow-none">
              <div className="flex items-center gap-1.5 mb-3">
                <ReceiptIndianRupee size={14} className="shrink-0 text-[#0B4964]" />
                <h3 className="text-sm font-semibold text-[#22313f]">Price Breakdown</h3>
              </div>

              <div className="space-y-2 text-[13px]">
                <div className="flex items-center justify-between gap-4 text-[#475467]">
                  <span>Service Price</span>
                  <div className="flex items-center gap-1.5">
                    {originalPrice > baseServicePrice ? (
                      <span className="text-xs text-[#98a2b3] line-through">{formatCurrency(originalPrice)}</span>
                    ) : null}
                    <span className="font-semibold text-[#22313f]">{formatCurrency(baseServicePrice)}</span>
                  </div>
                </div>

                {couponDiscount > 0 ? (
                  <div className="flex items-center justify-between gap-4 text-[#039855]">
                    <span>Coupon Discount</span>
                    <span className="font-semibold">− {formatCurrency(couponDiscount)}</span>
                  </div>
                ) : null}

                <div className="flex items-center justify-between gap-4 text-[#475467]">
                  <span>Platform Fee</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[#98a2b3] line-through">{formatCurrency(Math.round(baseServicePrice * 0.02))}</span>
                    <span className="font-semibold text-[#039855]">FREE</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 text-[#475467]">
                  <span>Taxes & GST</span>
                  <span className="font-semibold text-[#039855]">Included</span>
                </div>

                {payMode === "full" ? (
                  <div className="flex items-center justify-between gap-4 text-[#039855]">
                    <span className="flex items-center gap-1.5">
                      Full Payment Discount
                      <span className="rounded-full bg-[#039855] px-2 py-0.5 text-[10px] font-bold text-white">INSTANT</span>
                    </span>
                    <span className="font-semibold">− {formatCurrency(FULL_PAYMENT_DISCOUNT)}</span>
                  </div>
                ) : null}

                {distanceKm !== null && freeServiceKm > 0 ? (
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span className={travelFee > 0 ? "text-[#e07b00]" : "text-[#039855]"}>
                        Travel &amp; Setup Logistics
                      </span>
                      <p className="text-[11px] text-[#98a2b3] mt-0.5">
                        {distanceKm.toFixed(1)} km away · Free up to {freeServiceKm} km
                        {travelFee > 0
                          ? ` · +${extraKm} km extra @ ₹${extraChargesPerKm}/km`
                          : ""}
                      </p>
                    </div>
                    <span className={`font-semibold shrink-0 ${travelFee > 0 ? "text-[#e07b00]" : "text-[#039855]"}`}>
                      {travelFee > 0 ? `+ ${formatCurrency(travelFee)}` : "FREE"}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="mt-3 border-t border-[#eaecf0] pt-3 flex items-center justify-between gap-4">
                <div>
                  <span className="text-sm font-semibold text-[#22313f]">Order Total</span>
                  {totalSaved > 0 ? (
                    <p className="text-[11px] text-[#039855] font-medium">🎉 Saving {formatCurrency(totalSaved + (payMode === "full" ? FULL_PAYMENT_DISCOUNT : 0))}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  {payMode === "full" && (
                    <span className="text-sm text-[#98a2b3] line-through">{formatCurrency(total)}</span>
                  )}
                  <span className="text-lg font-bold text-[#0B4964]">{formatCurrency(payNow)}</span>
                </div>
              </div>
            </Card>
          ) : null}

          {/* Payment mode selector */}
          {pricingTiers.length > 0 && (
            <Card className="overflow-hidden border border-[#f0e7e2] p-0 shadow-none">
              {/* Header / collapsed trigger */}
              <button
                type="button"
                onClick={() => setPayModeOpen((o) => !o)}
                className="flex w-full items-center justify-between gap-3 px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#fff5f8]">
                    <CreditCard size={18} className="text-[#FB2965]" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-medium text-[#FB2965] uppercase tracking-wide">Payment option</p>
                    <p className="text-sm font-semibold text-[#22313f]">
                      {payMode === "advance"
                        ? `Pay Advance — ${formatCurrency(advanceAmount)}`
                        : <span className="flex items-center gap-2 text-[#039855]">Pay Full — {formatCurrency(fullPayAmount)} <span className="rounded-full bg-[#039855] px-2 py-0.5 text-[10px] font-bold text-white">₹{FULL_PAYMENT_DISCOUNT} OFF</span></span>}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-[#667085] transition-transform duration-200 ${payModeOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown options */}
              <AnimatePresence initial={false}>
                {payModeOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 border-t border-[#f0e7e2] px-4 py-3">
                      {/* Pay Advance */}
                      <label
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-all ${payMode === "advance" ? "border-[#0B4964] bg-[#eef4f8]" : "border-[#eaecf0] bg-white"}`}
                      >
                        <input
                          type="radio"
                          name="payMode"
                          value="advance"
                          checked={payMode === "advance"}
                          onChange={() => { setPayMode("advance"); setPayModeOpen(false); }}
                          className="h-4 w-4 accent-[#0B4964]"
                        />
                        <div className="flex flex-1 items-center justify-between gap-2">
                          <div>
                            <p className={`text-sm font-semibold ${payMode === "advance" ? "text-[#0B4964]" : "text-[#344054]"}`}>Pay Advance</p>
                            <p className="text-[11px] text-[#98a2b3]">Rest {formatCurrency(total - advanceAmount)} due on day of setup</p>
                          </div>
                          <span className="text-base font-bold text-[#0B4964]">{formatCurrency(advanceAmount)}</span>
                        </div>
                      </label>

                      {/* Pay Full */}
                      <label
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-all ${payMode === "full" ? "border-[#039855] bg-[#f6fef9]" : "border-[#eaecf0] bg-white"}`}
                      >
                        <input
                          type="radio"
                          name="payMode"
                          value="full"
                          checked={payMode === "full"}
                          onChange={() => { setPayMode("full"); setPayModeOpen(false); }}
                          className="h-4 w-4 accent-[#039855]"
                        />
                        <div className="flex flex-1 items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-semibold ${payMode === "full" ? "text-[#039855]" : "text-[#344054]"}`}>Pay Full</p>
                              <span className="rounded-full bg-[#039855] px-2 py-0.5 text-[10px] font-bold text-white">₹{FULL_PAYMENT_DISCOUNT} OFF</span>
                            </div>
                            <p className="text-[11px] text-[#98a2b3]">
                              <span className="line-through">{formatCurrency(total)}</span> · nothing due later
                            </p>
                          </div>
                          <span className="text-base font-bold text-[#039855]">{formatCurrency(fullPayAmount)}</span>
                        </div>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )}

          {/* To Pay summary */}
          <Card className="overflow-hidden border border-[#e5e9ee] p-0 shadow-none">
            <div className="flex items-center justify-between gap-3 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B4964] text-white">
                  <CreditCard size={18} />
                </div>
                <div>
                  <p className="text-base font-bold text-[#22313f]">To Pay {formatCurrency(payNow)}</p>
                  <p className="text-[11px] text-[#98a2b3]">
                    {payMode === "advance"
                      ? `Advance · Balance ${formatCurrency(remainingAfterAdvance)} on day of setup`
                      : <span className="text-[#039855] font-semibold">Full payment · ₹{FULL_PAYMENT_DISCOUNT} off applied!</span>}
                  </p>
                </div>
              </div>
            </div>
            {totalSaved > 0 && (
              <div className="border-t border-dashed border-[#d1fadf] bg-[#f6fef9] px-4 py-2.5">
                <p className="text-xs font-semibold text-[#039855]">🎉 You're saving {formatCurrency(totalSaved)} on this order!</p>
              </div>
            )}
          </Card>

          {selectedAddress && !isSelectedAddressServiceable ? (
            <Card className="space-y-4 border border-[#fed7aa] bg-[#fffaf5] p-4 shadow-none">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#fff1e8] text-[#e07b00]">
                  <MapPin size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#9a3412]">
                    This setup is not live in {selectedAddressCity} yet
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#7c5b42]">
                    We currently fulfil this decoration in {serviceCity}. You can save this address, switch to a supported city, or talk to our team for a custom availability check.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-11 rounded-full border-[#f2c7a7] text-[#9a3412] hover:border-[#e07b00]"
                  onClick={() => setShowAddressPicker(true)}
                >
                  Change address
                </Button>
                <Button
                  className="h-11 rounded-full bg-[#FB2965] hover:bg-[#e02456]"
                  onClick={() => window.location.assign(`tel:${COMPANY_CONTACT.phone.replace(/\s+/g, "")}`)}
                >
                  Talk to support
                </Button>
              </div>
            </Card>
          ) : null}

          <Button
            ref={checkoutActionRef}
            className="h-14 w-full bg-[#FB2965] text-base font-semibold hover:bg-[#e02456]"
            onClick={handlePlaceOrder}
            disabled={isPaying || (Boolean(selectedAddress) && !isSelectedAddressServiceable)}
          >
            {selectedAddress
              ? !isSelectedAddressServiceable
                ? `Available in ${serviceCity} only`
                : isPaying
                  ? "Opening Razorpay..."
                  : `Pay ${formatCurrency(payNow)} now`
              : "Add or select address"}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showStickyCheckoutBar && !showAddressForm && !showAddressPicker && !showScheduleForm ? (
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 28 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-0 z-30 px-3 pb-3 pt-2 sm:px-4 xl:px-6"
          >
            <div className="mx-auto flex w-full max-w-[1200px] items-center gap-3 rounded-[28px] border border-[#f2d1db] bg-white/96 px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.16)] backdrop-blur-xl">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#98a2b3]">To pay</p>
                <p className="truncate text-base font-bold text-[#22313f]">{formatCurrency(payNow)}</p>
                <p className="truncate text-[11px] text-[#667085]">
                  {selectedAddress
                    ? !isSelectedAddressServiceable
                      ? `Available in ${serviceCity} only`
                      : payMode === "advance"
                        ? `Advance payment • Balance ${formatCurrency(remainingAfterAdvance)} later`
                        : `Full payment • ₹${FULL_PAYMENT_DISCOUNT} off applied`
                    : "Add or select address to continue"}
                </p>
              </div>
              <Button
                className="h-12 shrink-0 rounded-full bg-[#FB2965] px-5 text-sm font-semibold hover:bg-[#e02456] sm:px-6"
                onClick={handlePlaceOrder}
                disabled={isPaying || (Boolean(selectedAddress) && !isSelectedAddressServiceable)}
              >
                {selectedAddress
                  ? !isSelectedAddressServiceable
                    ? `Available in ${serviceCity} only`
                    : isPaying
                      ? "Opening Razorpay..."
                      : `Pay ${formatCurrency(payNow)}`
                  : "Add address"}
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showAddressForm ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddressForm(false);
                resetAddressForm();
              }}
              className="fixed inset-0 z-40 bg-[#101828]/35 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[70vh] flex-col overflow-hidden rounded-t-[36px] bg-white px-5 pb-6 pt-5 shadow-2xl overscroll-contain md:left-1/2 md:top-1/2 md:h-[min(92vh,860px)] md:w-[min(720px,88vw)] md:max-h-none md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[32px] md:px-6 md:pb-6 md:pt-5"
            >
              <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[#e4e7ec] md:hidden" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#FB2965]">Address</p>
                  <h2 className="text-xl font-semibold text-[#0B4964]">
                    {editingAddressId ? "Edit address" : "Add event location"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddressForm(false);
                    resetAddressForm();
                  }}
                  className="rounded-full bg-[#f4f6fb] p-2 text-[#667085]"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddAddress} className="mt-6 flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#344054]">Label</label>
                    <Input
                      value={addressForm.label}
                      onChange={(event) => setAddressForm((current) => ({ ...current, label: event.target.value }))}
                      placeholder="Home"
                    />
                  </div>
                  <div className="mt-5 min-w-0">
                    <AddressPicker value={addressForm} onChange={setAddressForm} />
                  </div>
                </div>
                <div className="mt-5 shrink-0 border-t border-[#eef2f6] pt-4">
                  <Button className="h-12 w-full rounded-2xl bg-[#0B4964] font-semibold hover:bg-[#08384e]">
                    {editingAddressId ? "Update address" : "Save address"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showScheduleForm && bookingDraft ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScheduleForm(false)}
              className="fixed inset-0 z-40 bg-[#101828]/35 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto no-scrollbar rounded-t-[36px] bg-white px-5 pb-8 pt-5 shadow-2xl md:left-1/2 md:top-1/2 md:w-[min(640px,88vw)] md:max-h-[97vh] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[32px] md:px-6 md:pb-8 md:pt-5"
            >
              <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[#e4e7ec] md:hidden" />
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#FB2965]">Date & slot</p>
                  <h2 className="text-xl font-semibold text-[#0B4964]">Change booking slot</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowScheduleForm(false)}
                  className="rounded-full bg-[#f4f6fb] p-2 text-[#667085]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 space-y-6">
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
                        onClick={() => updateBookingDraft({ date: option.date })}
                        className={`min-w-[132px] rounded-2xl border px-4 py-3 text-left transition ${
                          bookingDraft.date === option.date
                            ? "border-[#0B4964] bg-[#f5fbff] text-[#0B4964]"
                            : "border-[#e4e7ec] bg-white text-[#344054]"
                        }`}
                      >
                        <p className="text-xs">{option.label}</p>
                        <p className="mt-1 text-base font-semibold">{option.display}</p>
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
                          updateBookingDraft({ time: group.slots[0] });
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
                    {selectedTimeOptions.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => updateBookingDraft({ time: slot })}
                        className={`rounded-2xl border px-2 py-4 text-center transition ${
                          bookingDraft.time === slot
                            ? "border-[#0B4964] bg-[#f5fbff] text-[#0B4964]"
                            : "border-[#e4e7ec] bg-white text-[#344054]"
                        }`}
                      >
                        <p className="text-[14px] font-bold">{slot}</p>
                        <p className="mt-1 text-[11px] text-[#1570ef]">Available</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button className="mb-2 mt-6 h-12 w-full rounded-2xl bg-[#0B4964] font-semibold hover:bg-[#08384e]" onClick={() => setShowScheduleForm(false)}>
                Update slot
              </Button>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
