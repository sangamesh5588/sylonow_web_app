import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Card } from "../components/ui";

const GROUPS = [
  {
    title: "Main pages",
    links: [
      { label: "Home", to: "/" },
      { label: "Offers", to: "/offers" },
      { label: "Search", to: "/search" },
      { label: "Profile", to: "/profile" },
      { label: "Orders", to: "/orders" },
      { label: "Wishlist", to: "/wishlist" },
      { label: "Addresses", to: "/addresses" },
      { label: "Cart", to: "/cart" },
      { label: "Checkout", to: "/checkout" },
      { label: "Coupons", to: "/coupons" },
    ],
  },
  {
    title: "Legal pages",
    links: [
      { label: "Privacy Policy", to: "/privacy-policy" },
      { label: "Refund Policy", to: "/refund-policy" },
      { label: "Revenue Policy", to: "/revenue-policy" },
      { label: "GDPR Compliance", to: "/gdpr-compliance" },
      { label: "Terms of Service", to: "/terms-of-service" },
      { label: "Cookie Policy", to: "/cookie-policy" },
      { label: "Copyright Policy", to: "/copyright" },
      { label: "Delete Account", to: "/delete-account" },
      { label: "Cancellation Policy", to: "/cancellation" },
      { label: "Shipping Policy", to: "/shipping" },
    ],
  },
  {
    title: "Company pages",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Contact Us", to: "/contact" },
      { label: "Careers", to: "/careers" },
      { label: "Blog", to: "/blog" },
    ],
  },
];

const SitemapPage = () => {
  return (
    <div className="space-y-8 pb-14 pt-2 md:space-y-10">
      <div className="flex items-start gap-4">
        <Link
          to="/"
          className="relative z-[60] flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white ring-1 ring-[#eadfdb] transition-all active:scale-90"
        >
          <ChevronLeft size={22} className="text-[#0B4964]" />
        </Link>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#FB2965]">About Company</p>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0B4964] md:text-[2.1rem]">Sitemap</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#667085] md:text-[15px]">
            This page links the key customer, company, and policy pages so every footer path is reachable and functional.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {GROUPS.map((group) => (
          <Card key={group.title} className="space-y-4 border border-[#f0e7e2] p-5 shadow-none md:p-6">
            <h2 className="text-lg font-semibold text-[#22313f]">{group.title}</h2>
            <div className="space-y-3">
              {group.links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block rounded-2xl border border-[#edf0f4] px-4 py-3 text-sm font-medium text-[#22313f] transition-colors hover:border-[#0B4964] hover:text-[#0B4964]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SitemapPage;
