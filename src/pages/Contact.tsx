import { Link } from "react-router-dom";
import { ChevronLeft, Mail, MapPin, Phone } from "lucide-react";
import SEO from "../components/SEO";
import { Button, Card } from "../components/ui";
import { COMPANY_CONTACT } from "../lib/siteContent";

const ContactPage = () => {
  return (
    <div className="space-y-8 pb-14 pt-2 md:space-y-10">
      <SEO
        title="Contact Us - Sylonow Decoration Services Bangalore"
        description="Get in touch with Sylonow for birthday decoration, anniversary setups & surprise planning in Bangalore. Call +91 90359 54661 or email info@sylonow.com."
        canonical="/contact"
      />
      <div className="flex items-start gap-4">
        <Link
          to="/"
          className="relative z-[60] flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white ring-1 ring-[#eadfdb] transition-all active:scale-90"
        >
          <ChevronLeft size={22} className="text-[#0B4964]" />
        </Link>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#FB2965]">About Company</p>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0B4964] md:text-[2.1rem]">Contact Us</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#667085] md:text-[15px]">
            Reach out for booking support, service questions, payment help, or partnership enquiries. We’ve made all primary contact actions live here.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_360px]">
        <Card className="space-y-6 border border-[#f0e7e2] p-5 shadow-none md:p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#22313f]">Customer support details</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <a href={`tel:${COMPANY_CONTACT.phone.replace(/\s+/g, "")}`} className="rounded-[24px] border border-[#edf0f4] p-4">
                <Phone size={20} className="text-[#FB2965]" />
                <p className="mt-3 text-sm font-semibold text-[#22313f]">Call us</p>
                <p className="mt-1 text-sm text-[#667085]">{COMPANY_CONTACT.phone}</p>
              </a>
              <a href={`mailto:${COMPANY_CONTACT.email}`} className="rounded-[24px] border border-[#edf0f4] p-4">
                <Mail size={20} className="text-[#FB2965]" />
                <p className="mt-3 text-sm font-semibold text-[#22313f]">Email support</p>
                <p className="mt-1 text-sm text-[#667085]">{COMPANY_CONTACT.email}</p>
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY_CONTACT.address)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-[24px] border border-[#edf0f4] p-4"
              >
                <MapPin size={20} className="text-[#FB2965]" />
                <p className="mt-3 text-sm font-semibold text-[#22313f]">Visit address</p>
                <p className="mt-1 text-sm text-[#667085]">{COMPANY_CONTACT.address}</p>
              </a>
            </div>
          </div>

          <div className="rounded-[24px] bg-[#fff8fb] p-5">
            <h3 className="text-lg font-semibold text-[#22313f]">Best way to contact us</h3>
            <p className="mt-2 text-sm leading-7 text-[#667085]">
              For urgent event updates, call support directly. For partnerships, invoice questions, or booking changes, email is best because it creates a written thread our team can track.
            </p>
          </div>
        </Card>

        <Card className="space-y-4 border border-[#f0e7e2] p-5 shadow-none md:p-6">
          <div>
            <p className="text-sm font-medium text-[#FB2965]">Quick actions</p>
            <h2 className="text-xl font-semibold text-[#0B4964]">Useful pages</h2>
          </div>
          <div className="space-y-3">
            <Link to="/about" className="block rounded-2xl border border-[#edf0f4] px-4 py-3 text-sm font-medium text-[#22313f] hover:border-[#0B4964] hover:text-[#0B4964]">
              About Us
            </Link>
            <Link to="/privacy-policy" className="block rounded-2xl border border-[#edf0f4] px-4 py-3 text-sm font-medium text-[#22313f] hover:border-[#0B4964] hover:text-[#0B4964]">
              Privacy Policy
            </Link>
            <Link to="/sitemap" className="block rounded-2xl border border-[#edf0f4] px-4 py-3 text-sm font-medium text-[#22313f] hover:border-[#0B4964] hover:text-[#0B4964]">
              Sitemap
            </Link>
          </div>
          <Button
            className="h-12 w-full bg-[#FB2965] font-semibold hover:bg-[#e02456]"
            onClick={() => window.location.assign(`mailto:${COMPANY_CONTACT.email}`)}
          >
            Email Sylonow
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default ContactPage;
