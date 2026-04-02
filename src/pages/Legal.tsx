import { ChevronLeft, ExternalLink, Mail, Shield, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, Card } from "../components/ui";
import { COMPANY_CONTACT } from "../lib/siteContent";

const legalLinks = [
  {
    title: "Privacy Policy",
    desc: "See how your account, booking, and browser data are handled.",
    to: "/privacy-policy",
  },
  {
    title: "Terms of Service",
    desc: "Review booking terms, pricing scope, and service conditions.",
    to: "/terms-of-service",
  },
  {
    title: "Delete Account",
    desc: "Understand how account deletion requests and retention work.",
    to: "/delete-account",
  },
  {
    title: "Refund Policy",
    desc: "Check refund review timelines and eligible scenarios.",
    to: "/refund-policy",
  },
  {
    title: "Revenue Policy",
    desc: "Understand payouts, collections, and platform pricing rules.",
    to: "/revenue-policy",
  },
  {
    title: "Cookie Policy",
    desc: "Learn how saved preferences and browser storage are used.",
    to: "/cookie-policy",
  },
  {
    title: "GDPR Compliance",
    desc: "Read about access, correction, and deletion style requests.",
    to: "/gdpr-compliance",
  },
  {
    title: "Copyright Policy",
    desc: "View ownership and content use guidelines on Sylonow.",
    to: "/copyright",
  },
];

const Legal = () => {
  return (
    <div className="space-y-6 pb-24 pt-3 md:space-y-8 md:pb-10 md:pt-6">
      <div className="flex items-start gap-4">
        <Link
          to="/profile"
          className="relative z-[60] flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white ring-1 ring-[#eadfdb] transition-all active:scale-90"
        >
          <ChevronLeft size={22} className="text-[#18212f]" />
        </Link>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#FB2965]">Legal</p>
          <h1 className="text-[1.9rem] font-semibold tracking-[-0.04em] text-[#18212f] md:text-[2.35rem]">
            Policies and account protections
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#667085]">
            Everything important is grouped here so profile stays clean on
            mobile while your privacy, terms, cookies, refund, and account
            actions are still easy to reach.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_320px]">
        <div className="grid gap-4 sm:grid-cols-2">
          {legalLinks.map((item) => (
            <Link key={item.to} to={item.to}>
              <Card className="h-full border border-[#edf0f4] p-5 shadow-none transition-colors hover:border-[#f4c4d3] hover:bg-[#fff9fb]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-[#18212f]">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#667085]">
                      {item.desc}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff2f6] text-[#FB2965]">
                    <ExternalLink size={18} />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="space-y-5">
          <Card className="border border-[#edf0f4] p-5 shadow-none">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff2f6] text-[#FB2965]">
              <Shield size={22} />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-[#18212f]">
              Need help with a policy request?
            </h2>
            <p className="mt-2 text-sm leading-7 text-[#667085]">
              If you need support with privacy, account deletion, refunds, or a
              legal-style request, our support team can guide you from here.
            </p>
            <a
              href={`mailto:${COMPANY_CONTACT.email}`}
              className="mt-5 flex items-center gap-3 rounded-2xl border border-[#edf0f4] px-4 py-3 text-sm font-medium text-[#18212f] transition-colors hover:bg-[#fff8fa]"
            >
              <Mail size={18} className="text-[#FB2965]" />
              {COMPANY_CONTACT.email}
            </a>
          </Card>

          <Card className="border border-[#f4d9df] p-5 shadow-none">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4f7] text-[#FB2965]">
              <Trash2 size={22} />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-[#18212f]">
              Delete account
            </h2>
            <p className="mt-2 text-sm leading-7 text-[#667085]">
              If you want to permanently remove your account, start from the
              dedicated page so we can handle the request safely.
            </p>
            <Link to="/delete-account">
              <Button className="mt-5 h-12 w-full rounded-2xl bg-[#FB2965] text-sm font-semibold text-white hover:bg-[#e7225a]">
                Open delete account page
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Legal;
