import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  Clock3,
  MapPin,
  ShoppingBag,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button, Card } from "../components/ui";
import { saveBookingDraft } from "../lib/booking";
import { formatCurrency } from "../lib/utils";
import { SERVICES } from "../services/mockData";

const Cart = () => {
  const navigate = useNavigate();

  const cartItems = [
    {
      id: "1",
      service: SERVICES[0],
      date: "2024-04-15",
      time: "06:00 PM",
      addons: ["a1"],
    },
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + item.service.price, 0);
  const addonTotal = 500;
  const convenienceFee = 99;
  const total = subtotal + addonTotal + convenienceFee;

  const proceedToCheckout = (item = cartItems[0]) => {
    saveBookingDraft({
      serviceId: item.service.id,
      date: item.date,
      time: item.time,
      price: item.service.price,
    });
    navigate("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-24 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <ShoppingBag size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#0B4964]">Your cart is empty</h2>
          <p className="text-gray-500">Looks like you haven&apos;t added any decorations yet.</p>
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
          <p className="text-sm font-medium text-[#FB2965]">Booked looks</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B4964]">Your cart</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <div className="space-y-6">
          {cartItems.map((item) => {
            const selectedAddons = item.addons
              .map((addonId) => item.service.addons.find((addon) => addon.id === addonId))
              .filter(Boolean);

            return (
              <Card
                key={item.id}
                className="overflow-hidden rounded-[28px] border border-[#f0e4dd] bg-[linear-gradient(180deg,#fffdfb_0%,#fff4ee_100%)] p-0 shadow-[0_18px_48px_rgba(17,24,39,0.08)]"
              >
                <div className="grid gap-0 md:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:h-full">
                    <img
                      src={item.service.images[0]}
                      alt={item.service.title}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0B4964] backdrop-blur">
                        {item.service.category}
                      </span>
                      <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#8d97a6] shadow-sm backdrop-blur transition-colors hover:text-[#FB2965]">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between gap-4 p-4 sm:p-5">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {item.service.tags?.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[#5b6778] ring-1 ring-[#eee3dc]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h2 className="max-w-xl text-xl font-bold leading-tight text-[#0B4964]">
                          {item.service.title}
                        </h2>
                        <p className="line-clamp-2 max-w-2xl text-sm leading-5 text-[#5b6778]">
                          {item.service.description}
                        </p>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-3">
                        <div className="rounded-2xl bg-white px-3 py-2.5 ring-1 ring-[#eee3dc]">
                          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8d97a6]">
                            <CalendarDays size={12} />
                            Date
                          </div>
                          <div className="text-sm font-semibold text-[#0B4964]">{item.date}</div>
                        </div>
                        <div className="rounded-2xl bg-white px-3 py-2.5 ring-1 ring-[#eee3dc]">
                          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8d97a6]">
                            <Clock3 size={12} />
                            Time
                          </div>
                          <div className="text-sm font-semibold text-[#0B4964]">{item.time}</div>
                        </div>
                        <div className="rounded-2xl bg-white px-3 py-2.5 ring-1 ring-[#eee3dc]">
                          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8d97a6]">
                            <MapPin size={12} />
                            City
                          </div>
                          <div className="text-sm font-semibold text-[#0B4964]">{item.service.location}</div>
                        </div>
                      </div>

                      {selectedAddons.length > 0 && (
                        <div className="rounded-[22px] bg-white p-3 ring-1 ring-[#eee3dc]">
                          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#0B4964]">
                            <Sparkles size={15} className="text-[#FB2965]" />
                            Selected add-ons
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedAddons.map((addon) => (
                              <span
                                key={addon!.id}
                                className="rounded-full bg-[#fff1f4] px-3 py-1 text-[11px] font-semibold text-[#c43d67]"
                              >
                                + {addon!.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 border-t border-[#f0e4dd] pt-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8d97a6]">
                          Final price
                        </p>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-[#FB2965]">
                            {formatCurrency(item.service.price)}
                          </span>
                          {item.service.originalPrice && (
                            <span className="text-sm text-[#a0a8b5] line-through">
                              {formatCurrency(item.service.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        className="h-11 rounded-full border border-[#f0d7de] bg-white px-5 text-sm font-semibold text-[#0B4964] hover:bg-[#fff7fa]"
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
          <Card className="sticky top-24 overflow-hidden rounded-[30px] border border-[#f0e4dd] bg-[radial-gradient(circle_at_top,#fff3ea_0%,#fffdfb_58%)] p-0 shadow-[0_24px_50px_rgba(17,24,39,0.08)]">
            <div className="border-b border-[#f0e4dd] px-6 py-5">
              <p className="text-sm font-medium text-[#FB2965]">Checkout</p>
              <h3 className="text-2xl font-bold text-[#0B4964]">Order summary</h3>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div className="rounded-[24px] bg-white p-4 ring-1 ring-[#eee3dc]">
                <div className="space-y-3 text-sm text-[#5b6778]">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#0B4964]">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Add-ons</span>
                    <span className="font-semibold text-[#0B4964]">{formatCurrency(addonTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Convenience fee</span>
                    <span className="font-semibold text-[#0B4964]">{formatCurrency(convenienceFee)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] bg-[#0B4964] px-5 py-4 text-white">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                      Total payable
                    </p>
                    <p className="mt-1 text-3xl font-bold">{formatCurrency(total)}</p>
                  </div>
                  <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                    1 booking
                  </div>
                </div>
              </div>

              <Button
                variant="gradient"
                className="flex h-14 w-full items-center justify-center gap-2 rounded-full text-sm font-bold tracking-[0.16em] shadow-lg shadow-[#FB2965]/20"
                onClick={() => proceedToCheckout()}
              >
                Checkout <ArrowRight size={18} />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
