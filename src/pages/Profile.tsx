import {
  BadgeCheck,
  ChevronRight,
  Heart,
  LifeBuoy,
  LogOut,
  MapPin,
  Package,
  PencilLine,
  ShieldCheck,
  Sparkles,
  TicketPercent,
  User as UserIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EditProfileModal } from "../components/EditProfileModal";
import { Button, Card } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { readAddresses, readOrders, readWishlist } from "../lib/booking";

const Profile = () => {
  const { profile, isAuthenticated, logout, setShowLoginModal } = useAuth();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);

  const stats = useMemo(() => {
    const phoneNumber = profile?.phone_number;

    return {
      orders: readOrders(phoneNumber).length,
      addresses: readAddresses(phoneNumber).length,
      wishlist: readWishlist().length,
    };
  }, [profile?.phone_number]);

  const quickActions = [
    {
      icon: Package,
      label: "My Orders",
      caption: "Track bookings",
      onClick: () => navigate("/orders"),
    },
    {
      icon: MapPin,
      label: "Addresses",
      caption: "Saved places",
      onClick: () => navigate("/addresses"),
    },
    {
      icon: Heart,
      label: "Wishlist",
      caption: "Saved looks",
      onClick: () => navigate("/wishlist"),
    },
    {
      icon: TicketPercent,
      label: "Coupons",
      caption: "Offers & codes",
      onClick: () => navigate("/coupons"),
    },
  ];

  const accountLinks = [
    {
      icon: PencilLine,
      label: "Edit Profile",
      desc: "Update your name and account details",
      onClick: () => setShowEditModal(true),
    },
    {
      icon: ShieldCheck,
      label: "Legal",
      desc: "Privacy policy, terms, delete account and more",
      onClick: () => navigate("/legal"),
    },
    {
      icon: LifeBuoy,
      label: "Help & Support",
      desc: "Talk to our team for booking help",
      onClick: () => navigate("/contact"),
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className="px-1 py-6 md:px-0 md:py-10">
        <Card className="overflow-hidden border border-[#f3e2e7] shadow-none">
          <div className="space-y-5 px-6 py-8 text-center md:px-10 md:py-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#FB2965]/10 text-[#FB2965]">
              <UserIcon size={28} />
            </div>
            <div className="space-y-2">
              <h1 className="text-[1.9rem] font-semibold tracking-[-0.04em] text-[#18212f] md:text-[2.2rem]">
                Login to continue
              </h1>
              <p className="mx-auto max-w-md text-sm leading-7 text-[#667085] md:text-[15px]">
                View your orders, saved addresses, and wishlist in one place.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Button
                className="h-12 rounded-2xl bg-[#FB2965] px-6 text-sm font-semibold text-white hover:bg-[#e7225a]"
                onClick={() => setShowLoginModal(true)}
              >
                Login with Phone Number
              </Button>
              <button
                type="button"
                className="text-sm font-medium text-[#667085] transition-colors hover:text-[#FB2965]"
                onClick={() => navigate("/contact")}
              >
                Need help?
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28 pt-4 md:space-y-8 md:pb-10 md:pt-8">
      <Card className="overflow-hidden border border-[#f2e5e9] shadow-none">
        <div className="space-y-6 px-5 py-5 md:px-8 md:py-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-[28px] border border-[#ffd6e2] bg-[#fff7fa] text-[1.9rem] font-semibold text-[#18212f] md:h-24 md:w-24 md:text-[2.1rem]">
                {(profile?.full_name || "User").charAt(0).toUpperCase()}
                <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-[#FB2965] text-white">
                  <BadgeCheck size={14} />
                </span>
              </div>
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#fff2f6] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FB2965]">
                    <Sparkles size={12} />
                    Profile
                  </span>
                  <span className="rounded-full border border-[#ebedf2] px-3 py-1 text-[11px] font-medium text-[#667085]">
                    Verified account
                  </span>
                </div>
                <div>
                  <h1 className="truncate text-[1.8rem] font-semibold tracking-[-0.04em] text-[#18212f] md:text-[2.3rem]">
                    {profile?.full_name || "Sylonow User"}
                  </h1>
                  <p className="mt-1 text-sm font-medium text-[#667085]">
                    {profile?.phone_number || ""}
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="hidden h-11 rounded-2xl border-[#f0d4dc] px-5 text-sm font-semibold text-[#18212f] hover:bg-[#fff6f8] md:inline-flex"
              onClick={() => setShowEditModal(true)}
            >
              Edit profile
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Orders", value: stats.orders },
              { label: "Addresses", value: stats.addresses },
              { label: "Wishlist", value: stats.wishlist },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[24px] border border-[#edf0f4] bg-[#fcfcfd] px-3 py-4 text-center md:px-4"
              >
                <p className="text-[1.3rem] font-semibold tracking-[-0.03em] text-[#18212f] md:text-[1.6rem]">
                  {item.value}
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#98a2b3] md:text-xs">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          <Button
            className="h-12 w-full rounded-2xl bg-[#FB2965] text-sm font-semibold text-white hover:bg-[#e7225a] md:hidden"
            onClick={() => setShowEditModal(true)}
          >
            Edit profile
          </Button>
        </div>
      </Card>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#98a2b3]">
            Quick access
          </p>
          <h2 className="mt-2 text-[1.65rem] font-semibold tracking-[-0.04em] text-[#18212f] md:text-[2rem]">
            Everything you need, right here.
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {quickActions.map((item, index) => (
            <motion.button
              key={item.label}
              type="button"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={item.onClick}
              className="rounded-[28px] border border-[#edf0f4] bg-white px-4 py-4 text-left shadow-none transition-colors hover:border-[#f4c4d3] hover:bg-[#fff8fa] md:px-5 md:py-5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff2f6] text-[#FB2965]">
                <item.icon size={22} />
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-[#18212f] md:text-[15px]">
                  {item.label}
                </h3>
                <p className="mt-1 text-xs leading-5 text-[#667085]">
                  {item.caption}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_320px]">
        <Card className="border border-[#edf0f4] p-2 shadow-none">
          <div className="space-y-1">
            {accountLinks.map((item, index) => (
              <motion.button
                key={item.label}
                type="button"
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 + index * 0.06 }}
                onClick={item.onClick}
                className="flex w-full items-center justify-between rounded-[24px] px-4 py-4 text-left transition-colors hover:bg-[#fff8fa] md:px-5"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff2f6] text-[#FB2965]">
                    <item.icon size={22} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#18212f] md:text-[15px]">
                      {item.label}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[#667085] md:text-sm">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="shrink-0 text-[#98a2b3]" />
              </motion.button>
            ))}
          </div>
        </Card>

        <Card className="border border-[#edf0f4] p-5 shadow-none">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#98a2b3]">
            Account note
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[#18212f]">
            Keep your account checkout-ready.
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#667085]">
            Saved addresses, reserved decorations, and policy access all stay in
            one place so booking feels fast and clear whenever you come back.
          </p>

          <Button
            variant="ghost"
            className="mt-6 h-12 w-full justify-center gap-2 rounded-2xl border border-[#f5d3dc] text-sm font-semibold text-[#FB2965] hover:bg-[#fff4f7] hover:text-[#FB2965]"
            onClick={logout}
          >
            <LogOut size={18} />
            Logout Account
          </Button>
        </Card>
      </section>

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </div>
  );
};

export default Profile;
