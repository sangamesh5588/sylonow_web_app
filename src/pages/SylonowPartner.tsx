import { Link } from "react-router-dom";
import SEO from "../components/SEO";

const PARTNER_IOS_URL = "https://apps.apple.com/in/app/sylonow-partner/id6758403817";
const PARTNER_ANDROID_URL = "https://play.google.com/store/apps/details?id=com.sylonow.SylonowVendor";

const openPartnerStoreByDevice = () => {
  const ua = navigator.userAgent;
  const isApple = /iPad|iPhone|iPod|Macintosh|MacIntel/.test(ua);
  window.open(isApple ? PARTNER_IOS_URL : PARTNER_ANDROID_URL, "_blank");
};

export default function SylonowPartnerPage() {
  return (
    <main className="min-h-screen bg-[#FDFCFB] px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
      <SEO
        title="Sylonow Partner - Join as Event Planner or Theatre Owner"
        description="Are you an event planner or private theatre owner in Bangalore? Download the Sylonow Partner app and start receiving orders. Join Sylonow's growing partner network."
        canonical="/sylonow-partner"
      />
      <section className="mx-auto w-full max-w-[760px] overflow-hidden rounded-[28px] border border-[#0B4164]/15 bg-white shadow-[0_24px_54px_rgba(11,65,100,0.12)]">

        {/* Header */}
        <header className="border-b border-[#0B4164]/10 px-5 py-4 sm:px-7 sm:py-5">
          <div>
            <p
              className="text-[28px] leading-none tracking-[0.08em] text-[#0B4164]"
              style={{ fontFamily: '"Para", serif' }}
            >
              Sylonow
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#C4A484]">
              Partner
            </p>
          </div>
        </header>

        <div className="space-y-10 px-5 py-7 sm:px-7 sm:py-10">

          {/* Hero */}
          <div className="rounded-[24px] border border-[#0B4164]/10 bg-[#F8FBFD] p-6 shadow-[0_10px_26px_rgba(11,65,100,0.08)] sm:p-8">
            <h1 className="text-2xl font-semibold leading-tight text-[#0B4164] sm:text-[30px]">
              If you are an event planner or private theatre owner,
            </h1>
            <p className="mt-3 text-base leading-relaxed text-[#2D2D2D]/80 sm:text-lg">
              download the Sylonow partner app and start getting orders.
            </p>
            <button
              type="button"
              onClick={openPartnerStoreByDevice}
              className="mt-6 inline-flex items-center rounded-full bg-[#0B4164] px-7 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#08304a] active:scale-95"
            >
              Download App
            </button>
          </div>

          {/* Image cards */}
          <div className="grid grid-cols-2 gap-4">
            <article className="overflow-hidden rounded-[20px] border border-[#0B4164]/10 bg-[#F8FBFD]">
              <div className="relative h-36 w-full sm:h-44 overflow-hidden">
                <img
                  src="/assets/partner/event-decoration.png"
                  alt="Event decoration by Sylonow"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#0B4164]">
                Event Decoration
              </p>
            </article>

            <article className="overflow-hidden rounded-[20px] border border-[#0B4164]/10 bg-[#F8FBFD]">
              <div className="relative h-36 w-full sm:h-44 overflow-hidden">
                <img
                  src="/assets/partner/private-theatre.png"
                  alt="Private theatre setup by Sylonow"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#0B4164]">
                Private Theatre
              </p>
            </article>
          </div>

          {/* Store buttons */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <a
              href={PARTNER_ANDROID_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-[#0B4164]/15 bg-[#FDFCFB] px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.12em] text-[#0B4164] transition-colors hover:bg-[#F5F0EB]"
            >
              Android
            </a>
            <a
              href={PARTNER_IOS_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-[#0B4164]/15 bg-[#FDFCFB] px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.12em] text-[#0B4164] transition-colors hover:bg-[#F5F0EB]"
            >
              App Store
            </a>
          </div>

          {/* View site CTA */}
          <div className="pt-2 text-center">
            <p className="text-lg font-medium text-[#0B4164] sm:text-xl">Take a look at Sylonow</p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#0B4164]/30 bg-white px-7 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#0B4164] transition-colors hover:bg-[#F5F0EB]"
            >
              View <span aria-hidden="true">→</span>
            </Link>
          </div>

        </div>
      </section>
    </main>
  );
}
