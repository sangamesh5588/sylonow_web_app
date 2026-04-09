import { Star } from "lucide-react";
import { openCustomerInquiryPopup } from "../../lib/customerInquiries";

interface TestimonialItem {
  name: string;
  area: string;
  occasion: string;
  rating: number;
  date: string;
  quote: string;
  initials: string;
  color: string;
}

const testimonials: TestimonialItem[] = [
  {
    name: "Divya M.",
    area: "Jayanagar",
    occasion: "Birthday",
    rating: 5,
    date: "Mar 2026",
    initials: "DM",
    color: "#FB2965",
    quote:
      "Booked just 2 days before and they delivered perfectly. The balloon arch matched exactly what was shown in the photos. My daughter was thrilled — could not have asked for better.",
  },
  {
    name: "Rahul K.",
    area: "Koramangala",
    occasion: "Anniversary",
    rating: 5,
    date: "Feb 2026",
    initials: "RK",
    color: "#0B4964",
    quote:
      "Planned a surprise for our 5th anniversary. The team coordinated everything while I kept my wife occupied. The setup was complete and stunning by the time we returned. Will book again.",
  },
  {
    name: "Ananya S.",
    area: "HSR Layout",
    occasion: "Baby Shower",
    rating: 5,
    date: "Mar 2026",
    initials: "AS",
    color: "#7C3AED",
    quote:
      "The pastel theme was put together beautifully. Everything was ready well before the guests arrived. The team was polite and worked without any disruption. Very happy with the result.",
  },
  {
    name: "Karthik R.",
    area: "Whitefield",
    occasion: "Birthday",
    rating: 4,
    date: "Jan 2026",
    initials: "KR",
    color: "#059669",
    quote:
      "Overall a good experience. Decoration was tasteful and the team arrived on time. One section needed a touch-up later in the evening, but they sorted it out promptly. Fair pricing too.",
  },
  {
    name: "Megha T.",
    area: "BTM Layout",
    occasion: "Bride to Be",
    rating: 5,
    date: "Feb 2026",
    initials: "MT",
    color: "#D97706",
    quote:
      "The rose gold setup was absolutely gorgeous. Every photo from the celebration came out beautifully. Guests kept asking who arranged it. Would highly recommend for any special occasion.",
  },
  {
    name: "Pradeep N.",
    area: "Indiranagar",
    occasion: "Anniversary",
    rating: 5,
    date: "Mar 2026",
    initials: "PN",
    color: "#DB2777",
    quote:
      "Reached out at 11am for a same-day evening setup. They confirmed within 20 minutes and had everything ready by 6pm. Extremely professional and responsive throughout the process.",
  },
  {
    name: "Shruti B.",
    area: "JP Nagar",
    occasion: "Baby Shower",
    rating: 4,
    date: "Dec 2025",
    initials: "SB",
    color: "#2563EB",
    quote:
      "Loved the floral arrangements and the overall theme. Communication on WhatsApp was quick and clear. Setup took slightly longer than estimated but the final result was well worth it.",
  },
  {
    name: "Vivek L.",
    area: "Marathahalli",
    occasion: "Birthday",
    rating: 5,
    date: "Jan 2026",
    initials: "VL",
    color: "#0891B2",
    quote:
      "This was our third booking with Sylonow, and the quality keeps getting better. The LED number setup for my father's 60th birthday was outstanding. Every guest wanted to know who did it.",
  },
];


const StarRow = ({ rating, size = 14 }: { rating: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={size}
        className={s <= rating ? "text-[#F59E0B]" : "text-[#e2e8f0]"}
        fill={s <= rating ? "#F59E0B" : "#e2e8f0"}
      />
    ))}
  </div>
);

interface CustomerTestimonialsProps {
  showReviews?: boolean;
}

export const CustomerTestimonials = ({
  showReviews = true,
}: CustomerTestimonialsProps) => {
  return (
    <section className="space-y-4 pt-4 md:space-y-6 md:pt-8">
      {/* CTA banner */}
      <div className="flex flex-col gap-4 rounded-3xl border border-[#e4ecf3] bg-[#f6f9fc] px-6 py-6 md:flex-row md:items-center md:justify-between md:px-10 md:py-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#7a95aa]">Personal assistance</p>
          <h2 className="mt-2 text-2xl font-bold leading-snug tracking-tight text-[#0B4964] md:text-3xl">
            Still have not found the decoration you want?
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-[#5b6b7b]">
            Share your idea, theme and budget. Our team will help you customise a decoration setup made for your celebration.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openCustomerInquiryPopup("home_popup")}
          className="shrink-0 inline-flex items-center justify-center rounded-2xl bg-[#FB2965] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#e91e5a]"
        >
          Customise now
        </button>
      </div>

      {showReviews ? (
        <div className="rounded-[28px] border border-[#e6edf1] bg-white px-5 py-6 shadow-[0_16px_34px_rgba(15,23,42,0.04)] md:px-8 md:py-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#0B4964] md:text-[32px]">
                What our customers say
              </h2>
              <p className="mt-1 text-sm text-[#667085]">
                Real reviews from celebrations across Bengaluru
              </p>
            </div>
          </div>

          <div className="-mx-5 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-1 scroll-smooth no-scrollbar md:mx-0 md:px-0">
            {testimonials.map((item) => (
              <article
                key={`${item.name}-${item.area}`}
                className="min-w-[82vw] snap-start rounded-[20px] border border-[#edf2f5] bg-[#fcfdff] p-4 sm:min-w-[320px] lg:min-w-[360px]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#13384a]">{item.name}</p>
                      <p className="text-[11px] text-[#7b8794]">{item.area} · {item.date}</p>
                    </div>
                  </div>
                  <div className="shrink-0 rounded-full bg-[#fff7ed] px-2 py-0.5 text-[10px] font-semibold text-[#92400e]">
                    {item.occasion}
                  </div>
                </div>

                <div className="mt-3">
                  <StarRow rating={item.rating} size={13} />
                </div>

                <p className="mt-2 text-sm leading-6 text-[#344054]">"{item.quote}"</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
};
