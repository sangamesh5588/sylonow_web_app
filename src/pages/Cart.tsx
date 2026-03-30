import { Link, useNavigate } from "react-router-dom";
import { Button, Card } from "../components/ui";
import { formatCurrency } from "../lib/utils";
import { Trash2, ShoppingBag, ArrowRight, ChevronLeft } from "lucide-react";
import { SERVICES } from "../services/mockData";

const Cart = () => {
  const navigate = useNavigate();
  // Mock cart items
  const cartItems = [
    {
      id: "1",
      service: SERVICES[0],
      date: "2024-04-15",
      time: "06:00 PM",
      addons: ["a1"],
    }
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + item.service.price, 0);
  const addonTotal = 500; // Mock
  const total = subtotal + addonTotal;

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
          <ShoppingBag size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#0B4964]">Your cart is empty</h2>
          <p className="text-gray-500">Looks like you haven't added any decorations yet.</p>
        </div>
        <Link to="/">
          <Button variant="gradient" className="px-8">Start Browsing</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="relative z-[60] w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-all active:scale-90"
        >
          <ChevronLeft size={24} className="text-[#0B4964]" />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0B4964]">Your cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item) => (
            <Card key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 border-none shadow-lg">
              <div className="w-full sm:w-32 aspect-square rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50">
                <img src={item.service.images[0]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#0B4964]">{item.service.title}</h3>
                    <p className="text-xs text-gray-500">{item.date} at {item.time}</p>
                  </div>
                  <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.addons.map(aid => (
                    <span key={aid} className="text-[10px] font-semibold tracking-wider bg-gray-100 px-2 py-1 rounded-lg text-gray-500">
                      + {item.service.addons.find(a => a.id === aid)?.name}
                    </span>
                  ))}
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-lg font-bold text-[#FB2965]">{formatCurrency(item.service.price)}</div>
                  {item.service.originalPrice && (
                    <div className="text-sm text-gray-400 line-through">{formatCurrency(item.service.originalPrice)}</div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="p-8 space-y-6 sticky top-24 border-none shadow-lg">
            <h3 className="text-lg font-semibold text-[#0B4964]">Order summary</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Add-ons</span>
                <span>{formatCurrency(addonTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Convenience fee</span>
                <span>{formatCurrency(99)}</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between text-xl font-bold">
                <span className="text-[#0B4964]">Total</span>
                <span className="text-[#FB2965]">{formatCurrency(total + 99)}</span>
              </div>
            </div>
            <Button variant="gradient" className="w-full h-14 font-bold tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#FB2965]/20" onClick={() => navigate("/checkout")}>
              Checkout <ArrowRight size={18} />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
