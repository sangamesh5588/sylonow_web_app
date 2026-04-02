import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, ChevronLeft, Clock3, MapPin, ShoppingBag, Trash2 } from "lucide-react";
import { Button, Card } from "../components/ui";
import {
  getCartItemKey,
  getCartUpdatedEventName,
  readCart,
  removeCartItem,
  saveBookingDraft,
} from "../lib/booking";
import { formatCurrency } from "../lib/utils";
import { CartItem } from "../types";

const formatBookingDate = (value: string) => {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const getSelectedAddons = (item: CartItem) =>
  item.selectedAddons
    .map((addonId) => item.service.addons.find((addon) => addon.id === addonId))
    .filter(Boolean);

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const loadCart = () => setCartItems(readCart());

    loadCart();

    const cartUpdatedEvent = getCartUpdatedEventName();
    window.addEventListener(cartUpdatedEvent, loadCart);
    window.addEventListener("storage", loadCart);

    return () => {
      window.removeEventListener(cartUpdatedEvent, loadCart);
      window.removeEventListener("storage", loadCart);
    };
  }, []);

  const serviceSubtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.service.price * (item.quantity || 1), 0),
    [cartItems]
  );

  const addonTotal = useMemo(
    () =>
      cartItems.reduce((sum, item) => {
        const addonsPrice = getSelectedAddons(item).reduce((addonSum, addon) => addonSum + (addon?.price ?? 0), 0);
        return sum + addonsPrice * (item.quantity || 1);
      }, 0),
    [cartItems]
  );

  const total = serviceSubtotal + addonTotal;

  const proceedToCheckout = (item = cartItems[0]) => {
    if (!item) return;

    const addonsPrice = getSelectedAddons(item).reduce((sum, addon) => sum + (addon?.price ?? 0), 0);

    saveBookingDraft({
      serviceId: item.service.id,
      date: item.date,
      time: item.time,
      price: item.service.price + addonsPrice,
    });
    navigate("/checkout");
  };

  const handleRemove = (item: CartItem) => {
    setCartItems(removeCartItem(item));
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-24 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#f5f7fa] text-[#98a2b3]">
          <ShoppingBag size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#0B4964]">Your cart is empty</h2>
          <p className="text-[#667085]">Reserve a decoration and it will show up here.</p>
        </div>
        <Link to="/">
          <Button variant="gradient" className="px-8">
            Start Browsing
          </Button>
        </Link>
      </div>
    );
  }

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
          <p className="text-sm font-medium text-[#667085]">Reserved looks</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B4964]">Your cart</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.32fr)_380px]">
        <div className="space-y-4">
          {cartItems.map((item) => {
            const selectedAddons = getSelectedAddons(item);
            const addonsPrice = selectedAddons.reduce((sum, addon) => sum + (addon?.price ?? 0), 0);
            const itemTotal = (item.service.price + addonsPrice) * (item.quantity || 1);

            return (
              <Card
                key={getCartItemKey(item)}
                className="overflow-hidden rounded-[26px] border border-[#edf0f4] bg-white p-0 shadow-[0_12px_28px_rgba(17,24,39,0.05)]"
              >
                <div className="md:hidden p-3">
                  <div className="flex gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B4964]">
                        <MapPin size={13} className="shrink-0" />
                        <span className="truncate">{item.service.location}</span>
                      </div>

                      <h2
                        className="line-clamp-2 cursor-pointer text-[1.05rem] font-bold leading-snug text-[#22313f]"
                        onClick={() => navigate(`/category/${encodeURIComponent(item.service.category)}/service/${item.service.id}`)}
                      >
                        {item.service.title}
                      </h2>

                      <p className="mt-2 text-[13px] text-[#667085]">
                        {item.service.category}
                      </p>
                    </div>

                    <div
                      className="h-[116px] w-[116px] shrink-0 cursor-pointer overflow-hidden rounded-[24px]"
                      onClick={() => navigate(`/category/${encodeURIComponent(item.service.category)}/service/${item.service.id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          navigate(`/category/${encodeURIComponent(item.service.category)}/service/${item.service.id}`);
                        }
                      }}
                    >
                      <img
                        src={item.service.images[0]}
                        alt={item.service.title}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-[18px] border border-[#edf0f4] bg-[#fcfcfd] px-3 py-2.5">
                      <div className="mb-1 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#98a2b3]">
                        <CalendarDays size={12} />
                        Date
                      </div>
                      <div className="text-[13px] font-semibold text-[#22313f]">{formatBookingDate(item.date)}</div>
                    </div>
                    <div className="rounded-[18px] border border-[#edf0f4] bg-[#fcfcfd] px-3 py-2.5">
                      <div className="mb-1 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#98a2b3]">
                        <Clock3 size={12} />
                        Time
                      </div>
                      <div className="text-[13px] font-semibold text-[#22313f]">{item.time}</div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-[18px] border border-[#edf0f4] bg-[#fcfcfd] px-3 py-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#98a2b3]">
                          Customized amount
                        </p>
                        <p className="mt-1 text-[1.2rem] font-bold text-[#0B4964]">
                          {formatCurrency(item.service.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        {addonsPrice > 0 ? (
                          <>
                            <p className="text-[11px] text-[#667085]">Add-ons {formatCurrency(addonsPrice)}</p>
                            <p className="mt-1 text-[1.2rem] font-bold text-[#0B4964]">{formatCurrency(itemTotal)}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-[11px] text-[#98a2b3]">No add-ons</p>
                            <p className="mt-1 text-[1.2rem] font-bold text-[#0B4964]">{formatCurrency(itemTotal)}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#edf0f4] pt-3">
                    <div className="text-[11px] font-medium text-[#667085]">
                      {selectedAddons.length > 0 ? `${selectedAddons.length} add-on selected` : "Ready for checkout"}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8dee8] bg-white text-[#667085] transition-colors hover:text-[#0B4964]"
                        onClick={() => handleRemove(item)}
                        aria-label={`Remove ${item.service.title} from cart`}
                      >
                        <Trash2 size={16} />
                      </button>
                      <Button
                        variant="secondary"
                        className="h-10 rounded-full border border-[#d8dee8] bg-white px-4 text-[13px] font-semibold text-[#22313f] hover:bg-[#f8fafc]"
                        onClick={() => proceedToCheckout(item)}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="hidden md:grid gap-0 lg:grid-cols-[220px_minmax(0,1fr)]">
                  <div
                    className="relative aspect-[4/3] cursor-pointer overflow-hidden lg:aspect-auto lg:h-full"
                    onClick={() => navigate(`/category/${encodeURIComponent(item.service.category)}/service/${item.service.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/category/${encodeURIComponent(item.service.category)}/service/${item.service.id}`);
                      }
                    }}
                  >
                    <img
                      src={item.service.images[0]}
                      alt={item.service.title}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                      <span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0B4964]">
                        {item.service.category}
                      </span>
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#8d97a6] shadow-sm transition-colors hover:text-[#0B4964]"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRemove(item);
                        }}
                        aria-label={`Remove ${item.service.title} from cart`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between gap-5 p-6">
                    <div className="space-y-4">
                      <h2
                        className="max-w-2xl cursor-pointer text-[1.45rem] font-bold leading-tight text-[#22313f]"
                        onClick={() => navigate(`/category/${encodeURIComponent(item.service.category)}/service/${item.service.id}`)}
                      >
                        {item.service.title}
                      </h2>

                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-[22px] border border-[#edf0f4] bg-[#fcfcfd] px-4 py-3">
                          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#98a2b3]">
                            <CalendarDays size={12} />
                            Date
                          </div>
                          <div className="text-base font-semibold text-[#22313f]">{formatBookingDate(item.date)}</div>
                        </div>
                        <div className="rounded-[22px] border border-[#edf0f4] bg-[#fcfcfd] px-4 py-3">
                          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#98a2b3]">
                            <Clock3 size={12} />
                            Time
                          </div>
                          <div className="text-base font-semibold text-[#22313f]">{item.time}</div>
                        </div>
                        <div className="rounded-[22px] border border-[#edf0f4] bg-[#fcfcfd] px-4 py-3">
                          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#98a2b3]">
                            Customized amount
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-[1.35rem] font-bold text-[#0B4964]">
                              {formatCurrency(item.service.price)}
                            </span>
                            {item.service.originalPrice ? (
                              <span className="text-sm text-[#98a2b3] line-through">
                                {formatCurrency(item.service.originalPrice)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {selectedAddons.length > 0 ? (
                        <div className="rounded-[22px] border border-[#edf0f4] bg-[#fcfcfd] p-4">
                          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#98a2b3]">
                            Add-ons selected
                          </div>
                          <div className="flex flex-wrap gap-2.5">
                            {selectedAddons.map((addon) => (
                              <span
                                key={addon!.id}
                                className="rounded-full bg-[#f3f6f8] px-3 py-1 text-[11px] font-semibold text-[#526071]"
                              >
                                {addon!.name} + {formatCurrency(addon!.price)}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-3 border-t border-[#edf0f4] pt-5 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#98a2b3]">
                          Booking total
                        </p>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-[1.9rem] font-bold text-[#0B4964]">
                            {formatCurrency(itemTotal)}
                          </span>
                          {addonsPrice > 0 ? <span className="text-sm text-[#667085]">with add-ons</span> : null}
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        className="h-11 rounded-full border border-[#d8dee8] bg-white px-5 text-sm font-semibold text-[#22313f] hover:bg-[#f8fafc]"
                        onClick={() => proceedToCheckout(item)}
                      >
                        Review booking
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24 overflow-hidden rounded-[30px] border border-[#edf0f4] bg-white p-0 shadow-[0_18px_44px_rgba(17,24,39,0.06)]">
            <div className="border-b border-[#edf0f4] px-6 py-5">
              <p className="text-sm font-medium text-[#667085]">Checkout</p>
              <h3 className="text-2xl font-bold text-[#22313f]">Order summary</h3>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div className="space-y-3">
                {cartItems.map((item) => {
                  const addonsPrice = getSelectedAddons(item).reduce((sum, addon) => sum + (addon?.price ?? 0), 0);
                  const itemTotal = (item.service.price + addonsPrice) * (item.quantity || 1);

                  return (
                    <div
                      key={`summary-${getCartItemKey(item)}`}
                      className="rounded-[22px] border border-[#edf0f4] bg-[#fcfcfd] p-4"
                    >
                      <p className="line-clamp-2 text-[15px] font-semibold leading-6 text-[#22313f]">
                        {item.service.title}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-3 text-sm text-[#667085]">
                        <span>{formatBookingDate(item.date)}</span>
                        <span>{item.time}</span>
                      </div>
                      <div className="mt-3 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#98a2b3]">
                            Customized amount
                          </p>
                          <p className="mt-1 text-lg font-semibold text-[#0B4964]">
                            {formatCurrency(item.service.price)}
                          </p>
                        </div>
                        <div className="text-right">
                          {addonsPrice > 0 ? (
                            <p className="text-sm text-[#667085]">Add-ons {formatCurrency(addonsPrice)}</p>
                          ) : (
                            <p className="text-sm text-[#98a2b3]">No add-ons</p>
                          )}
                          <p className="mt-1 text-xl font-bold text-[#0B4964]">{formatCurrency(itemTotal)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-[24px] border border-[#edf0f4] bg-[#fcfcfd] p-4">
                <div className="space-y-3 text-sm text-[#5b6778]">
                  <div className="flex items-center justify-between">
                    <span>Customized subtotal</span>
                    <span className="font-semibold text-[#0B4964]">{formatCurrency(serviceSubtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Add-ons total</span>
                    <span className="font-semibold text-[#0B4964]">{formatCurrency(addonTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] bg-[#103f59] px-5 py-4 text-white">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                      Total payable
                    </p>
                    <p className="mt-1 text-3xl font-bold">{formatCurrency(total)}</p>
                  </div>
                  <div className="rounded-full bg-white/12 px-3 py-1 text-xs font-semibold text-white/90">
                    {cartItems.length} booking{cartItems.length > 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              <Button
                className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#FB2965] text-sm font-bold tracking-[0.04em] text-white shadow-[0_14px_28px_rgba(251,41,101,0.18)] hover:bg-[#e61f59]"
                onClick={() => proceedToCheckout()}
              >
                Continue to payment <ArrowRight size={18} />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
