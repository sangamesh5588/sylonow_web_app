import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronDown,
  CreditCard,
  MapPin,
  Plus,
  ReceiptIndianRupee,
  ShieldCheck,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Button, Card, Input } from "../components/ui";
import { BookingDraft, clearBookingDraft, createOrder, readAddresses, readBookingDraft, saveBookingDraft, writeAddresses } from "../lib/booking";
import { CHECKOUT_COUPONS, findCheckoutCoupon, isCouponAvailableForAmount } from "../lib/coupons";
import { formatCurrency } from "../lib/utils";
import { fetchServiceById } from "../lib/services";
import { useAuth } from "../contexts/AuthContext";
import { Address, Service } from "../types";
import { AddressDraft, AddressPicker } from "../components/address/AddressPicker";

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
  { label: "Morning", slots: ["9:00 AM", "10:30 AM", "12:00 PM"] },
  { label: "Afternoon", slots: ["1:30 PM", "3:00 PM", "4:30 PM"] },
  { label: "Evening", slots: ["6:00 PM", "7:30 PM", "9:00 PM"] },
] as const;

const CouponSection = ({
  couponInput,
  appliedCouponCode,
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
  appliedCoupon: (typeof CHECKOUT_COUPONS)[number] | null;
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
      {CHECKOUT_COUPONS.slice(0, 2).map((coupon) => {
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
  const { isAuthenticated, setShowLoginModal, user } = useAuth();
  const initialDraft = readBookingDraft();
  const [bookingDraft, setBookingDraft] = useState<BookingDraft | null>(initialDraft);
  const [service, setService] = useState<Service | null>(null);
  const [loadingService, setLoadingService] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [pendingAddressAction, setPendingAddressAction] = useState(false);
  const [selectedTimeGroup, setSelectedTimeGroup] = useState<(typeof TIME_GROUPS)[number]["label"]>("Evening");
  const [addressForm, setAddressForm] = useState<AddressDraft>({
    label: "Home",
    fullAddress: "",
    city: "",
    pincode: "",
    latitude: undefined,
    longitude: undefined,
    placeId: undefined,
  });

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
    if (!bookingDraft || !service) {
      return;
    }

    if (!isAuthenticated) {
      setAddresses([]);
      setSelectedAddressId("");
      return;
    }

    const nextAddresses = readAddresses(user?.phoneNumber);
    setAddresses(nextAddresses);
    if (nextAddresses[0]) {
      setSelectedAddressId(nextAddresses[0].id);
    }
  }, [bookingDraft, isAuthenticated, service, user?.phoneNumber]);

  useEffect(() => {
    if (isAuthenticated && pendingAddressAction) {
      setShowAddressForm(true);
      setPendingAddressAction(false);
    }
  }, [isAuthenticated, pendingAddressAction]);

  useEffect(() => {
    if (!bookingDraft?.time) return;
    const matchingGroup = TIME_GROUPS.find((group) =>
      (group.slots as readonly string[]).includes(bookingDraft.time)
    );
    if (matchingGroup) {
      setSelectedTimeGroup(matchingGroup.label);
    }
  }, [bookingDraft?.time]);

  const selectedAddress = useMemo(
    () => addresses.find((item) => item.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId]
  );
  const mobileAddressPreview = getMobileAddressPreview(selectedAddress?.fullAddress);
  const selectedTimeOptions =
    TIME_GROUPS.find((group) => group.label === selectedTimeGroup)?.slots ?? TIME_GROUPS[2].slots;
  const selectedDateDisplay =
    DATE_OPTIONS.find((option) => option.date === bookingDraft?.date)?.display ?? bookingDraft?.date ?? "";
  const appliedCoupon = useMemo(() => findCheckoutCoupon(appliedCouponCode), [appliedCouponCode]);
  const baseServicePrice = bookingDraft?.price ?? service?.price ?? 0;
  const discountAmount = appliedCoupon
    ? Math.round(baseServicePrice * (appliedCoupon.discountPercent / 100))
    : 0;
  const discountedServicePrice = Math.max(baseServicePrice - discountAmount, 0);
  const platformFee = Math.round(discountedServicePrice * 0.02);
  const taxAndGst = Math.round(discountedServicePrice * 0.03);
  const total = discountedServicePrice + platformFee + taxAndGst;

  useEffect(() => {
    const couponFromQuery = searchParams.get("coupon");
    if (!couponFromQuery) {
      setAppliedCouponCode(null);
      return;
    }

    const coupon = findCheckoutCoupon(couponFromQuery);
    if (!coupon || !isCouponAvailableForAmount(coupon, baseServicePrice)) {
      setAppliedCouponCode(null);
      return;
    }

    setAppliedCouponCode(coupon.code);
    setCouponInput(coupon.code);
  }, [baseServicePrice, searchParams]);

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
    if (!user?.phoneNumber) return;

    if (!addressForm.fullAddress || !addressForm.city || !addressForm.pincode) {
      toast.error("Please fill all address details");
      return;
    }

    const nextAddress: Address = {
      id: `address-${Date.now()}`,
      ...addressForm,
    };

    const nextAddresses = [nextAddress, ...addresses];
    setAddresses(nextAddresses);
    setSelectedAddressId(nextAddress.id);
    writeAddresses(user.phoneNumber, nextAddresses);
    setShowAddressForm(false);
    setAddressForm({
      label: "Home",
      fullAddress: "",
      city: "",
      pincode: "",
      latitude: undefined,
      longitude: undefined,
      placeId: undefined,
    });
    toast.success("Address added");
  };

  const updateBookingDraft = (updates: Partial<BookingDraft>) => {
    if (!bookingDraft) return;
    const nextDraft = { ...bookingDraft, ...updates };
    setBookingDraft(nextDraft);
    saveBookingDraft(nextDraft);
  };

  const openAddressFlow = () => {
    if (!isAuthenticated) {
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

    const coupon = findCheckoutCoupon(normalizedCode);
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
    const coupon = findCheckoutCoupon(code);
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

  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      setPendingAddressAction(true);
      setShowLoginModal(true);
      toast.error("Please login to continue");
      return;
    }

    if (!selectedAddress) {
      toast.error("Add or select an address to continue");
      openAddressFlow();
      return;
    }

    if (!user?.phoneNumber || !bookingDraft) return;

    // Create order before clearing draft
    createOrder(
      user.phoneNumber,
      user.phoneNumber,
      service,
      { ...bookingDraft, price: discountedServicePrice },
      selectedAddress,
      total
    );

    clearBookingDraft();
    toast.success("Booking confirmed! View in My Orders");
    navigate("/orders");
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
                <p className="mt-3 break-words text-sm leading-6 text-[#667085]">
                  {service.category} - PartyCraft Studio
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

          <Card className="space-y-5 border border-[#f0e7e2] p-5 shadow-none sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[#FB2965]">Address</p>
                <h2 className="text-lg font-semibold text-[#0B4964]">Setup location</h2>
              </div>
              <button
                type="button"
                onClick={openAddressFlow}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[#eadfdb] bg-white px-4 py-2 text-sm font-medium text-[#0B4964] transition-colors hover:border-[#0B4964] sm:w-auto"
              >
                <Plus size={15} />
                Add address
              </button>
            </div>

            {isAuthenticated && addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((address) => {
                  const isSelected = address.id === selectedAddressId;
                  return (
                    <button
                      key={address.id}
                      type="button"
                      onClick={() => setSelectedAddressId(address.id)}
                      className={`flex w-full flex-col gap-3 rounded-[24px] border p-4 text-left transition sm:flex-row sm:items-center sm:justify-between ${
                        isSelected
                          ? "border-[#0B4964] bg-[#f5fbff]"
                          : "border-[#e4e7ec] bg-white"
                      }`}
                    >
                      <div className="flex min-w-0 items-start gap-3 text-[#0B4964]">
                        <MapPin size={18} className="mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-[#98a2b3]">{address.label}</p>
                          <p className="mt-1 break-words text-sm font-medium text-[#22313f]">{address.fullAddress}</p>
                          <p className="text-xs text-[#667085]">{address.city} - {address.pincode}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="flex h-6 w-6 shrink-0 self-end items-center justify-center rounded-full bg-[#0B4964] text-white sm:self-auto">
                          <Check size={14} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
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
        </div>

        <div className="space-y-4">
          <div className="hidden xl:block">
            <CouponSection
              couponInput={couponInput}
              appliedCouponCode={appliedCouponCode}
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

          <Card className="border border-[#f0e7e2] p-4 shadow-none xl:sticky xl:top-24">
            <button
              type="button"
              onClick={() => setShowPriceBreakdown((current) => !current)}
              className="flex w-full items-center gap-3 text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4d7f57] text-white">
                <CreditCard size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xl font-semibold leading-none text-[#22313f] sm:text-2xl">
                  To Pay {formatCurrency(total)}
                </p>
                <p className="mt-1 text-sm font-medium text-[#039855]">Incl. all taxes & charges</p>
              </div>
              <ChevronDown
                size={20}
                className={`shrink-0 text-[#667085] transition-transform ${showPriceBreakdown ? "rotate-180" : ""}`}
              />
            </button>
          </Card>

          {showPriceBreakdown ? (
            <Card className="space-y-5 border border-[#f0e7e2] p-5 shadow-none sm:p-6">
              <div className="flex items-center gap-2 text-[#22313f]">
                <ReceiptIndianRupee size={18} className="shrink-0 text-[#0B4964]" />
                <h3 className="text-lg font-semibold leading-none">Price Breakdown</h3>
              </div>

              <div className="space-y-4 text-[15px]">
                <div className="flex items-center justify-between gap-4 text-[#475467]">
                  <span>Service Price</span>
                  <span className="shrink-0 font-semibold text-[#22313f]">{formatCurrency(baseServicePrice)}</span>
                </div>
                {discountAmount > 0 ? (
                  <div className="flex items-center justify-between gap-4 text-[#039855]">
                    <span>Coupon Discount</span>
                    <span className="shrink-0 font-semibold">- {formatCurrency(discountAmount)}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-4 text-[#475467]">
                  <span>Platform Fee</span>
                  <span className="shrink-0 font-semibold text-[#22313f]">{formatCurrency(platformFee)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-[#475467]">
                  <span>Taxes & GST</span>
                  <span className="shrink-0 font-semibold text-[#22313f]">{formatCurrency(taxAndGst)}</span>
                </div>
              </div>

              <div className="border-t border-[#eaecf0] pt-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-lg font-semibold leading-none text-[#22313f] sm:text-xl">Total Pay-Advance</span>
                  <span className="shrink-0 text-xl font-semibold leading-none text-[#0B4964] sm:text-2xl">{formatCurrency(total)}</span>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border border-[#f0e7e2] p-4 shadow-none">
              <div className="flex items-center gap-2 rounded-full bg-[#eefbf3] px-4 py-3 text-sm text-[#157f3d]">
                <ShieldCheck size={16} />
                Secure booking protected
              </div>
            </Card>
          )}

          <Button
            className="h-14 w-full bg-[#0B4964] text-base font-semibold hover:bg-[#08384e]"
            onClick={handlePlaceOrder}
          >
            {selectedAddress ? "Continue to payment" : "Add or select address"}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showAddressForm ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddressForm(false)}
              className="fixed inset-0 z-40 bg-[#101828]/35 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto no-scrollbar rounded-t-[36px] bg-white px-5 pb-8 pt-5 shadow-2xl md:left-1/2 md:top-1/2 md:w-[min(640px,88vw)] md:max-h-[97vh] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[32px] md:px-6 md:pb-8 md:pt-5"
            >
              <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[#e4e7ec] md:hidden" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#FB2965]">Address</p>
                  <h2 className="text-xl font-semibold text-[#0B4964]">Add event location</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="rounded-full bg-[#f4f6fb] p-2 text-[#667085]"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddAddress} className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#344054]">Label</label>
                  <Input
                    value={addressForm.label}
                    onChange={(event) => setAddressForm((current) => ({ ...current, label: event.target.value }))}
                    placeholder="Home"
                  />
                </div>
                <div className="min-w-0">
                  <AddressPicker value={addressForm} onChange={setAddressForm} />
                </div>
                <Button className="mb-2 mt-6 h-12 w-full rounded-2xl bg-[#0B4964] font-semibold hover:bg-[#08384e]">
                  Save address
                </Button>
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
                    {DATE_OPTIONS.map((option) => (
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
                    {TIME_GROUPS.map((group) => (
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
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {selectedTimeOptions.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => updateBookingDraft({ time: slot })}
                        className={`rounded-2xl border px-3 py-4 text-center transition ${
                          bookingDraft.time === slot
                            ? "border-[#0B4964] bg-[#f5fbff] text-[#0B4964]"
                            : "border-[#e4e7ec] bg-white text-[#344054]"
                        }`}
                      >
                        <p className="text-[15px] font-semibold">{slot}</p>
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
