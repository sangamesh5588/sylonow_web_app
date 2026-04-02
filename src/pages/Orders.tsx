import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Package, Calendar, MapPin, Clock, QrCode } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { readOrders } from "../lib/booking";
import { Order } from "../types";
import { formatCurrency } from "../lib/utils";
import { Button, Card } from "../components/ui";

const Orders = () => {
  const navigate = useNavigate();
  const { profile, isAuthenticated, setShowLoginModal } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      navigate("/profile");
      return;
    }

    const userOrders = readOrders(profile?.phone_number);
    setOrders(userOrders);
  }, [profile, isAuthenticated, navigate, setShowLoginModal]);

  const getStatusColor = (status: Order["status"]) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      confirmed: "bg-blue-100 text-blue-700 border border-blue-200",
      completed: "bg-green-100 text-green-700 border border-green-200",
      cancelled: "bg-red-100 text-red-700 border border-red-200",
    };
    return colors[status];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-[#eadfdb] transition-all active:scale-90"
        >
          <ChevronLeft size={22} className="text-[#0B4964]" />
        </button>
        <div>
          <p className="text-sm font-medium text-[#FB2965]">Your Bookings</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B4964]">My Orders</h1>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center space-y-6"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
            <Package size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#0B4964]">No orders yet</h2>
            <p className="text-gray-500">Book your first decoration to see orders here</p>
          </div>
          <Button variant="gradient" onClick={() => navigate("/")}>
            Explore Services
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 border border-[#f0e7e2] shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Order ID: {order.id}</p>
                    <p className="text-sm font-medium text-gray-600">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.serviceId} className="flex gap-4">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                        <img
                          src={item.service.images[0]}
                          alt={item.service.title}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#0B4964] truncate">
                          {item.service.title}
                        </h3>
                        <p className="text-sm text-gray-500">{item.service.category}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                          <Calendar size={14} />
                          <span>{item.date}</span>
                          <Clock size={14} className="ml-2" />
                          <span>{item.time}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#0B4964]">
                          {formatCurrency(item.service.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Address */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-[#0B4964]">{order.address.label}</p>
                      <p>{order.address.fullAddress}</p>
                      <p>{order.address.city} - {order.address.pincode}</p>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="font-semibold text-[#0B4964]">Total Amount</span>
                  <span className="text-xl font-bold text-[#FB2965]">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>

                {/* QR Code */}
                {order.qrCode && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <QrCode size={16} className="text-[#0B4964]" />
                      <p className="text-sm font-semibold text-[#0B4964]">Vendor Verification QR</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 rounded-2xl bg-[#f8fafc] border border-[#edf0f4] p-4">
                      <img src={order.qrCode} alt="Order QR Code" className="w-40 h-40" />
                      <p className="text-[11px] text-[#98a2b3] text-center">Show this QR to the vendor to verify your booking</p>
                      <p className="text-[10px] font-mono text-[#667085]">{order.id}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/service/${order.items[0].serviceId}`)}
                  >
                    View Details
                  </Button>
                  {order.status === "pending" && (
                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50">
                      Cancel Order
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
