import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronDown,
  Clock3,
  CreditCard,
  MapPin,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Button, Card, Input } from "../components/ui";
import { BookingDraft, clearBookingDraft, createOrder, readAddresses, readBookingDraft, saveBookingDraft, writeAddresses } from "../lib/booking";
import { formatCurrency } from "../lib/utils";
import { SERVICES } from "../services/mockData";
import { useAuth } from "../contexts/AuthContext";
import { Address } from "../types";
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

const Checkout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setShowLoginModal, user } = useAuth();
  const initialDraft = readBookingDraft();
  const [bookingDraft, setBookingDraft] = useState<BookingDraft | null>(initialDraft);
  const service = SERVICES.find((item) => item.id === bookingDraft?.serviceId) ?? SERVICES[0];

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
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
    if (!bookingDraft) {
      toast.error("Choose a date and time before checkout");
      navigate(`/service/${service.id}`);
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
  }, [bookingDraft, isAuthenticated, navigate, service.id, setShowLoginModal, user?.phoneNumber]);

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
  const selectedTimeOptions =
    TIME_GROUPS.find((group) => group.label === selectedTimeGroup)?.slots ?? TIME_GROUPS[2].slots;
  const selectedDateDisplay =
    DATE_OPTIONS.find((option) => option.date === bookingDraft?.date)?.display ?? bookingDraft?.date ?? "";

  const taxes = Math.round(service.price * 0.05);
  const total = service.price + taxes;

  const handleAddAddress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.phoneNumber) return;

    if (!addressForm.houseNumber || !addressForm.fullAddress || !addressForm.city || !addressForm.pincode) {
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
      bookingDraft,
      selectedAddress
    );

    clearBookingDraft();
    toast.success("Booking confirmed! View in My Orders");
    navigate("/orders");
  };

  return (
    <div className="space-y-8 pb-28 md:pb-10">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="relative z-[60] hidden h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-[#eadfdb] transition-all active:scale-90 md:flex"
        >
          <ChevronLeft size={22} className="text-[#0B4964]" />
        </button>
        <div>
          <p className="text-sm font-medium text-[#FB2965]">Checkout</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B4964]">Complete your booking</h1>
        </div>
      </div>

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)]">
        <div className="space-y-6">
          <Card className="overflow-hidden border border-[#f0e7e2] shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center">
              <div className="h-28 w-full overflow-hidden rounded-3xl bg-[#f8fafc] md:w-36">
                <img
                  src={service.images[0]}
                  alt={service.title}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#FB2965]">{service.category}</p>
                <h2 className="mt-1 text-2xl font-bold text-[#22313f]">{service.title}</h2>
                <p className="mt-2 text-sm text-[#667085]">{service.location}</p>
              </div>
              <div className="rounded-2xl bg-[#f8fafc] px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.16em] text-[#98a2b3]">Payable</p>
                <p className="mt-1 text-2xl font-bold text-[#0B4964]">{formatCurrency(total)}</p>
              </div>
            </div>
          </Card>

          <Card className="space-y-5 border border-[#f0e7e2] p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#FB2965]">Date & slot</p>
                <h2 className="text-xl font-bold text-[#0B4964]">Selected booking slot</h2>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#edf0f4] bg-white p-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl bg-[#f8fafc] p-4">
                  <div className="flex items-center gap-3 text-[#0B4964]">
                    <CalendarDays size={18} />
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[#98a2b3]">Date</p>
                      <p className="mt-1 text-base font-semibold">{selectedDateDisplay}</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" className="rounded-full" onClick={() => setShowScheduleForm(true)}>
                    Change
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-[#f8fafc] p-4">
                  <div className="flex items-center gap-3 text-[#0B4964]">
                    <Clock3 size={18} />
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[#98a2b3]">Time slot</p>
                      <p className="mt-1 text-base font-semibold">{bookingDraft?.time}</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" className="rounded-full" onClick={() => setShowScheduleForm(true)}>
                    Change
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="space-y-5 border border-[#f0e7e2] p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#FB2965]">Address</p>
                <h2 className="text-xl font-bold text-[#0B4964]">Where should we set it up?</h2>
                <p className="mt-1 text-sm text-[#667085]">
                  Add and save your event address first, then continue to payment.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={openAddressFlow}>
                <Plus size={16} className="mr-2" />
                Add and save address
              </Button>
            </div>

            {isAuthenticated && addresses.length > 0 ? (
              <div className="grid gap-3">
                {addresses.map((address) => {
                  const isSelected = address.id === selectedAddressId;
                  return (
                    <button
                      key={address.id}
                      type="button"
                      onClick={() => setSelectedAddressId(address.id)}
                      className={`rounded-3xl border p-5 text-left transition ${
                        isSelected
                          ? "border-[#0B4964] bg-[#f5fbff]"
                          : "border-[#eaecf0] bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 text-[#0B4964]">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-[#22313f]">{address.label}</p>
                          <p className="mt-1 text-sm text-[#667085]">{address.fullAddress}</p>
                          <p className="mt-1 text-sm text-[#667085]">
                            {address.city} - {address.pincode}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#d0d5dd] bg-[#fcfcfd] p-6 text-center">
                <p className="text-lg font-semibold text-[#0B4964]">No address added yet</p>
                <p className="mt-2 text-sm text-[#667085]">
                  Tap `Add and save address` to open the address form, pick your location on the map, and save it before payment.
                </p>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24 space-y-6 border border-[#f0e7e2] p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <div>
              <p className="text-sm font-medium text-[#FB2965]">Payment</p>
              <h3 className="text-xl font-bold text-[#0B4964]">Order summary</h3>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-[#667085]">
                <span>Decoration package</span>
                <span>{formatCurrency(service.price)}</span>
              </div>
              <div className="flex justify-between text-[#667085]">
                <span>Taxes & charges</span>
                <span>{formatCurrency(taxes)}</span>
              </div>
              <div className="border-t border-[#eaecf0] pt-4 text-base font-bold">
                <div className="flex justify-between text-[#0B4964]">
                  <span>Total payable</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-[#f8fafc] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 text-[#0B4964] shadow-sm">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="font-semibold text-[#22313f]">Online payment</p>
                  <p className="text-sm text-[#667085]">Secure checkout with confirmation after address validation.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-[#eefbf3] px-4 py-3 text-sm text-[#157f3d]">
              <ShieldCheck size={16} />
              Secure booking protected
            </div>

            <Button
              className="h-14 w-full bg-[#0B4964] text-base font-semibold hover:bg-[#08384e]"
              onClick={handlePlaceOrder}
            >
              {selectedAddress ? "Continue to payment" : "Add or select address"}
            </Button>
          </Card>
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
              className="fixed inset-x-0 bottom-0 z-50 h-[52vh] overflow-y-auto no-scrollbar rounded-t-[40px] bg-[#fbfcfe] p-0 shadow-2xl md:left-1/2 md:top-1/2 md:h-auto md:w-[min(640px,88vw)] md:max-h-[96vh] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[32px] md:bg-white md:p-6"
            >
              <div className="rounded-t-[40px] bg-white px-5 pb-5 pt-4 md:rounded-none md:bg-transparent md:px-0 md:pb-0 md:pt-0">
              <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[#e4e7ec] md:hidden" />
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#FB2965]">Address</p>
                  <h2 className="text-2xl font-bold text-[#0B4964]">Add new address</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="rounded-full bg-[#f4f6fb] p-2 text-[#667085]"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddAddress} className="grid gap-5 overflow-x-hidden md:grid-cols-2">
                <div className="md:col-span-1">
                  <label className="mb-2 block text-sm font-medium text-[#344054]">Label</label>
                  <Input
                    value={addressForm.label}
                    onChange={(event) => setAddressForm((current) => ({ ...current, label: event.target.value }))}
                    placeholder="Home"
                  />
                </div>
                <div className="min-w-0 md:col-span-2">
                  <AddressPicker value={addressForm} onChange={setAddressForm} />
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <Button className="h-12 flex-1 bg-[#0B4964] hover:bg-[#08384e]">Save address</Button>
                  <Button type="button" variant="outline" className="h-12 flex-1" onClick={() => setShowAddressForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
              </div>
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
                <div>
                  <p className="text-sm font-medium text-[#FB2965]">Date & slot</p>
                  <h2 className="text-2xl font-bold text-[#0B4964]">Change booking slot</h2>
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
                        className={`rounded-2xl border px-3 py-4 text-center transition ${
                          bookingDraft.time === slot
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
