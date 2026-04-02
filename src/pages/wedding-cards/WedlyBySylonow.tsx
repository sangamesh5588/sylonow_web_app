import { motion } from "motion/react";
import {
  ArrowRight,
  CalendarHeart,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Gift,
  HeartHandshake,
  LayoutTemplate,
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import graphicPreview from "../../../graphic.mp4";

const showcaseStats = [
  { label: "Starting at", value: "₹999" },
  { label: "Best for", value: "Wedding websites" },
  { label: "Preview flow", value: "Fast approval" },
];

const coreFeatures = [
  {
    icon: LayoutTemplate,
    title: "Elegant wedding pages",
    description:
      "Create one polished invite website with story, functions, venue details, and RSVP-ready flow in a single shareable link.",
  },
  {
    icon: MessageCircleHeart,
    title: "Built for WhatsApp sharing",
    description:
      "Each invite is crafted to open beautifully on mobile so families can open, read, and share it instantly.",
  },
  {
    icon: CalendarHeart,
    title: "Event timeline clarity",
    description:
      "Keep every ceremony, timing, and venue organized in one elegant structure instead of sending scattered messages.",
  },
  {
    icon: Gift,
    title: "Premium personalized touch",
    description:
      "Names, stories, welcome notes, family introductions, and gallery moments can be styled to feel truly yours.",
  },
];

const steps = [
  "Share your names, wedding dates, venues, and preferred style.",
  "We design the Wedlyz page and send you a preview for approval.",
  "After your final changes, you get a clean public link ready to share.",
];

const pricingPlans = [
  {
    id: "classic",
    name: "Classic Wedding Card",
    price: "₹999",
    description:
      "A polished wedding invitation page for any kind of wedding card requirement with names, date, venue, and elegant layout.",
    points: [
      "Single wedding invite website",
      "Names, date, time, venue details",
      "Mobile-friendly shareable link",
    ],
  },
  {
    id: "combo",
    name: "Combo Pack",
    price: "₹1,499",
    isPopular: true,
    description:
      "A stronger presentation with the invite website plus one graphic visual represented video for sharing and excitement.",
    points: [
      "Wedding invite website included",
      "1 graphic visual video included",
      "Better shareability for WhatsApp",
    ],
  },
  {
    id: "custom",
    name: "Custom Plan",
    price: "₹2,999",
    description:
      "For couples who want custom sections, deeper personalization, and a wedding experience designed around their exact requirement.",
    points: [
      "Customized section structure",
      "Personalized content planning",
      "Made as per requirement",
    ],
  },
];

const buildWhatsappLink = (planName: string, price: string) =>
  "https://wa.me/919035954664?text=" +
  encodeURIComponent(
    `Hey, how can you help me? I want to enquire for the ${planName} at ${price} for my wedding invitation website.`
  );

const faqs = [
  {
    question: "What is Wedlyz by Sylonow?",
    answer:
      "Wedlyz is Sylonow's online wedding invitation experience where your wedding details live on one elegant shareable website instead of a static card alone.",
  },
  {
    question: "Can this page include multiple functions?",
    answer:
      "Yes. We can structure haldi, mehendi, sangeet, wedding, reception, and custom function timelines clearly inside the same invite website.",
  },
  {
    question: "Will it work well on mobile?",
    answer:
      "That is the main focus. Wedlyz is designed to look polished on phones first so your guests can open it comfortably from WhatsApp and browsers.",
  },
  {
    question: "Can we personalize colors, text, and photos?",
    answer:
      "Yes. Names, story copy, image selection, wedding schedule, welcome note, and tone can all be customized to match your celebration.",
  },
  {
    question: "Can we preview before sharing?",
    answer:
      "Yes. A preview link is shared before final delivery so you can review content and request changes with confidence.",
  },
];

const WedlyBySylonow = () => {
  const [selectedPlanId, setSelectedPlanId] = useState("combo");

  const selectedPlan = useMemo(
    () =>
      pricingPlans.find((plan) => plan.id === selectedPlanId) ?? pricingPlans[1],
    [selectedPlanId]
  );

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Wedlyz by Sylonow";

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f4ef] text-[#1b1b1f]">
      <section className="border-b border-[#e7ddd3] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 md:gap-8 md:px-8">
          <div>
            <p
              className="text-[24px] uppercase text-[#33433c] md:text-[30px]"
              style={{ fontFamily: '"Para", serif', letterSpacing: "0" }}
            >
              WEDLYZ
            </p>
          </div>

          <a
            href="https://hemanthpriyanka.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[#eaded3] bg-white px-4 py-2 text-xs font-medium text-[#1b1b1f] transition-colors hover:bg-[#f7f2ec] md:px-5 md:py-2.5 md:text-sm"
          >
            View demo preview
            <ExternalLink size={16} />
          </a>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
        <section className="grid gap-8 rounded-[36px] border border-[#eaded3] bg-white p-5 shadow-[0_16px_50px_rgba(56,43,32,0.06)] md:grid-cols-[minmax(0,1.05fr)_460px] md:p-8 lg:p-10">
          <div className="space-y-7">
            <div className="space-y-3">
              <div className="space-y-2">
                <p className="text-[13px] font-semibold uppercase tracking-[0.42em] text-[#33433c]">
                  WEDLYZ
                </p>
                <p className="text-sm font-medium text-[#7a7f88]">
                  Powered by Sylonow
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <h2 className="max-w-3xl font-bold leading-[1.02] tracking-[-0.05em] text-[#17171c] md:max-w-[720px]">
                <span className="text-[2.05rem] text-[#33433c] md:text-[2.65rem] lg:text-[2.95rem]">
                  Online wedding invitation website from{" "}
                </span>
                <span className="text-[2.6rem] text-[#1F8F55] md:text-[3.25rem] lg:text-[3.65rem]">
                  ₹999.
                </span>
              </h2>
              <p className="max-w-2xl text-base leading-8 text-[#5f6470] md:text-lg">
                Clean, elegant, and easy to share. Send your names, function
                details, and venue info to get your wedding invite website
                designed in one beautiful link.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:max-w-sm">
              <a
                href={buildWhatsappLink(selectedPlan.name, selectedPlan.price)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#fb2965] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#e8225a]"
              >
                Enquire now
                <ArrowRight size={17} />
              </a>
              <p className="text-sm leading-7 text-[#7a7f88]">
                Tell us your names, wedding date, and style. We will help you
                shape the right Wedlyz invite for your celebration.
              </p>
            </div>

            <div className="hidden gap-3 sm:grid-cols-3 md:grid">
              {showcaseStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-[#efe6dc] bg-[#fcfaf7] px-4 py-4"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#9a8f83]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-base font-semibold text-[#1b1b1f]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-[32px] border border-[#efe3d9] bg-[#fcfaf8]">
              <div className="flex items-center justify-between border-b border-[#efe3d9] px-4 py-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#9a8f83]">
                    Demo Preview
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#1b1b1f]">
                    Wedding invite website preview
                  </p>
                </div>
                <a
                  href="https://hemanthpriyanka.vercel.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[#eaded3] px-4 py-2 text-xs font-semibold text-[#1b1b1f] transition-colors hover:bg-white"
                >
                  Open
                  <ExternalLink size={14} />
                </a>
              </div>

              <div className="relative aspect-[4/5] bg-[#f0ece7]">
                <iframe
                  title="Wedlyz demo website"
                  src="https://hemanthpriyanka.vercel.app/"
                  className="h-full w-full"
                  loading="lazy"
                />
              </div>
            </div>

          </div>
        </section>

        <section className="mt-8 grid gap-6 md:mt-10 lg:grid-cols-[420px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-[32px] border border-[#eaded3] bg-white shadow-[0_10px_30px_rgba(56,43,32,0.04)]">
            <div className="border-b border-[#efe3d9] px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9a8f83]">
                Graphic Visual Preview
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#1b1b1f]">
                Included in combo pack
              </h3>
            </div>
            <div className="bg-[#f5eee7] p-4">
              <div className="overflow-hidden rounded-[26px] border border-[#eaded3] bg-black">
                <video
                  className="h-full w-full"
                  src={graphicPreview}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9a8f83]">
                Pricing
              </p>
              <h3 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-[#1b1b1f] md:text-[2.6rem]">
                Simple plans for every wedding style
              </h3>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5f6470] md:text-[15px]">
                Choose a clean starting package or go custom if you want
                something more personal and detailed. Every option is designed
                to feel premium, compact, and easy to share.
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {pricingPlans.map((plan) => (
                <button
                  key={plan.name}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`rounded-[30px] border p-5 text-left shadow-[0_10px_30px_rgba(56,43,32,0.04)] transition-all ${
                    selectedPlanId === plan.id
                      ? "border-[#fb2965] bg-[#fff9fb] ring-2 ring-[#fb2965]/12"
                      : "border-[#eaded3] bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-xl font-semibold tracking-[-0.03em] text-[#1b1b1f]">
                      {plan.name}
                    </h4>
                    {plan.isPopular ? (
                      <span className="rounded-full bg-[#fff1f6] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#fb2965]">
                        Popular
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-[#fb2965]">
                    {plan.price}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#5f6470]">
                    {plan.description}
                  </p>

                  <div className="mt-5 space-y-3">
                    {plan.points.map((point) => (
                      <div key={point} className="flex items-start gap-3">
                        <CheckCircle2
                          size={18}
                          className="mt-0.5 shrink-0 text-[#fb2965]"
                        />
                        <p className="text-sm leading-6 text-[#3d4350]">{point}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-[#f2e7df] pt-4">
                    <span className="text-sm font-medium text-[#7a7f88]">
                      {selectedPlanId === plan.id ? "Selected plan" : "Tap to select"}
                    </span>
                    <a
                      href={buildWhatsappLink(plan.name, plan.price)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="text-sm font-semibold text-[#1b1b1f] underline-offset-4 hover:text-[#fb2965] hover:underline"
                    >
                      Enquire
                    </a>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:mt-10 md:grid-cols-2 xl:grid-cols-4">
          {coreFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-[30px] border border-[#eaded3] bg-white p-5 shadow-[0_10px_30px_rgba(56,43,32,0.04)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1f6] text-[#fb2965]">
                <feature.icon size={22} />
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-[#1b1b1f]">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#5f6470]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 md:mt-10 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-[32px] border border-[#eaded3] bg-white p-6 shadow-[0_10px_30px_rgba(56,43,32,0.04)] md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9a8f83]">
              What Wedlyz means
            </p>
            <h3 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.05em] text-[#1b1b1f] md:text-[2.7rem]">
              More than a card. It is your wedding story online.
            </h3>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-[#5f6470] md:text-[15px]">
              Traditional invitations share the event. Wedlyz helps you share
              the emotion behind it too. Guests can see your celebration in one
              refined space with names, dates, venue details, photos, family
              notes, and wedding-day warmth, all in a link that is easy to send
              and beautiful to open.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {[
                "Names, venues, and ceremony schedule in one place",
                "Easy mobile browsing for every guest",
                "Premium presentation without app installation",
                "Perfect for WhatsApp and shareable links",
              ].map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-3 rounded-[22px] border border-[#f0e7dd] bg-[#fcfaf7] px-4 py-4"
                >
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#fb2965]" />
                  <p className="text-sm leading-7 text-[#3d4350]">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-[#eaded3] bg-white p-6 shadow-[0_10px_30px_rgba(56,43,32,0.04)] md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9a8f83]">
              How it works
            </p>
            <div className="mt-5 space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="flex gap-4 rounded-[24px] border border-[#f0e7dd] bg-[#fcfaf7] px-4 py-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1f1f25] text-sm font-semibold text-white">
                    0{index + 1}
                  </div>
                  <p className="pt-1 text-sm leading-7 text-[#3d4350]">{step}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[26px] bg-[#fff1f6] p-5">
              <div className="flex items-center gap-3">
                <Clock3 size={18} className="text-[#fb2965]" />
                <p className="text-sm font-semibold text-[#1b1b1f]">
                  Preview-first process
                </p>
              </div>
              <p className="mt-3 text-sm leading-7 text-[#5f6470]">
                We shape the invite with you first, then publish the final
                version only after your review feels right.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[36px] border border-[#eaded3] bg-white p-6 shadow-[0_10px_30px_rgba(56,43,32,0.04)] md:mt-10 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9a8f83]">
                FAQ
              </p>
              <h3 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-[#1b1b1f] md:text-[2.6rem]">
                Common questions about Wedlyz
              </h3>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fff8f0] px-4 py-2 text-sm font-medium text-[#7c5b16]">
              <Star size={16} />
              Designed to feel premium and easy
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-[26px] border border-[#f0e7dd] bg-[#fcfaf7] p-5"
              >
                <h4 className="text-lg font-semibold tracking-[-0.03em] text-[#1b1b1f]">
                  {faq.question}
                </h4>
                <p className="mt-3 text-sm leading-7 text-[#5f6470]">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[36px] border border-[#eaded3] bg-[#1f1f25] px-6 py-8 text-white shadow-[0_10px_30px_rgba(56,43,32,0.1)] md:mt-10 md:px-8 md:py-10">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ffb9ce]">
                Wedlyz by Sylonow
              </p>
              <h3 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] md:text-[2.8rem]">
                Ready to create your wedding invitation website?
              </h3>
              <p className="mt-4 max-w-3xl text-sm leading-8 text-white/76 md:text-[15px]">
                Share your wedding details with us and we will shape a polished
                online invitation page that feels modern, memorable, and easy to
                send to everyone.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <a
                href="https://hemanthpriyanka.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#fb2965] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#e8225a]"
              >
                View demo again
                <ExternalLink size={16} />
              </a>
              <a
                href={buildWhatsappLink(selectedPlan.name, selectedPlan.price)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-white/18 bg-white/6 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <HeartHandshake size={16} />
                Enquire for {selectedPlan.name}
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default WedlyBySylonow;
