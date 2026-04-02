import { Link, useLocation } from "react-router-dom";
import { ArrowRight, ChevronLeft, Mail, MapPin, Phone } from "lucide-react";
import SEO from "../components/SEO";
import { Button, Card } from "../components/ui";
import { COMPANY_CONTACT, COMPANY_PAGES, POLICY_PAGES } from "../lib/siteContent";

const PAGE_MAP = {
  "/terms": POLICY_PAGES.terms_of_service,
  "/privacy": POLICY_PAGES.privacy,
  "/cancellation": POLICY_PAGES.cancellation,
  "/shipping": POLICY_PAGES.shipping,
  "/refund": POLICY_PAGES.refund,
  "/terms-of-service": POLICY_PAGES.terms_of_service,
  "/privacy-policy": POLICY_PAGES.privacy,
  "/refund-policy": POLICY_PAGES.refund,
  "/revenue-policy": POLICY_PAGES.revenue,
  "/gdpr-compliance": POLICY_PAGES.gdpr,
  "/cookie-policy": POLICY_PAGES.cookie,
  "/copyright": POLICY_PAGES.copyright,
  "/delete-account": POLICY_PAGES.delete_account,
  "/about": COMPANY_PAGES.about,
  "/careers": COMPANY_PAGES.careers,
  "/blog": COMPANY_PAGES.blog,
} as const;

const InfoPage = () => {
  const location = useLocation();
  const content = PAGE_MAP[location.pathname as keyof typeof PAGE_MAP];

  if (!content) return null;

  return (
    <div className="space-y-8 pb-14 pt-2 md:space-y-10">
      <SEO
        title={content.title}
        description={content.summary}
        canonical={location.pathname}
        noindex={["/terms", "/privacy", "/cancellation", "/shipping", "/refund", "/terms-of-service", "/privacy-policy", "/refund-policy", "/revenue-policy", "/gdpr-compliance", "/cookie-policy", "/copyright", "/delete-account"].includes(location.pathname)}
      />
      <div className="flex items-start gap-4">
        <Link
          to="/"
          className="relative z-[60] flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white ring-1 ring-[#eadfdb] transition-all active:scale-90"
        >
          <ChevronLeft size={22} className="text-[#0B4964]" />
        </Link>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#FB2965]">{content.eyebrow}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0B4964] md:text-[2.1rem]">
            {content.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#667085] md:text-[15px]">
            {content.summary}
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_360px]">
        <div className="space-y-5">
          {content.sections.map((section) => (
            <Card key={section.title} className="space-y-3 border border-[#f0e7e2] p-5 shadow-none md:p-6">
              <h2 className="text-lg font-semibold text-[#22313f]">{section.title}</h2>
              <div className="space-y-3 text-sm leading-7 text-[#526070]">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-5">
          <Card className="space-y-4 border border-[#f0e7e2] p-5 shadow-none md:p-6">
            <div>
              <p className="text-sm font-medium text-[#FB2965]">Need help?</p>
              <h2 className="text-xl font-semibold text-[#0B4964]">Talk to support</h2>
            </div>
            <div className="space-y-4 text-sm text-[#526070]">
              <a href={`tel:${COMPANY_CONTACT.phone.replace(/\s+/g, "")}`} className="flex items-start gap-3">
                <Phone size={18} className="mt-0.5 shrink-0 text-[#FB2965]" />
                <span>{COMPANY_CONTACT.phone}</span>
              </a>
              <a href={`mailto:${COMPANY_CONTACT.email}`} className="flex items-start gap-3">
                <Mail size={18} className="mt-0.5 shrink-0 text-[#FB2965]" />
                <span>{COMPANY_CONTACT.email}</span>
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY_CONTACT.address)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3"
              >
                <MapPin size={18} className="mt-0.5 shrink-0 text-[#FB2965]" />
                <span>{COMPANY_CONTACT.address}</span>
              </a>
            </div>
          </Card>

          <Card className="space-y-4 border border-[#f0e7e2] p-5 shadow-none md:p-6">
            <div>
              <p className="text-sm font-medium text-[#FB2965]">Quick access</p>
              <h2 className="text-xl font-semibold text-[#0B4964]">Explore more pages</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: "Privacy Policy", to: "/privacy-policy" },
                { label: "Terms of Service", to: "/terms-of-service" },
                { label: "Refund Policy", to: "/refund-policy" },
                { label: "Contact Us", to: "/contact" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center justify-between rounded-2xl border border-[#edf0f4] px-4 py-3 text-sm font-medium text-[#22313f] transition-colors hover:border-[#0B4964] hover:text-[#0B4964]"
                >
                  <span>{link.label}</span>
                  <ArrowRight size={16} />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
