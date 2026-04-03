import { AnimatePresence, motion } from "motion/react";
import { MessageCircle, PhoneCall, X } from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_WHATSAPP_MESSAGE =
  "Hi Sylonow, I want help with decoration booking.";
const WHATSAPP_NUMBER = "9035954662";
const CALL_OPTIONS = ["9035954662", "9035954663", "9035954664"] as const;

export const SupportFab = () => {
  const [open, setOpen] = useState(false);

  const whatsappHref = useMemo(
    () =>
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        DEFAULT_WHATSAPP_MESSAGE
      )}`,
    []
  );

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.button
            type="button"
            aria-label="Close support actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-transparent"
          />
        ) : null}
      </AnimatePresence>

      <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-3 md:bottom-8 md:right-8">
        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.94 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex flex-col items-end gap-2"
            >
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-full border border-[#d1fadf] bg-white px-4 py-3 shadow-[0_14px_30px_rgba(15,23,42,0.16)] transition-transform hover:-translate-y-0.5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#22c55e] p-2.5 text-white">
                  <img
                    src="/assets/partner/whatsapp.png"
                    alt="WhatsApp"
                    className="h-full w-full object-contain"
                  />
                </span>
                <span className="pr-1 text-sm font-semibold text-[#22313f]">
                  WhatsApp
                </span>
              </a>

              <div className="w-[240px] rounded-[28px] border border-[#dbeafe] bg-white p-3 shadow-[0_14px_30px_rgba(15,23,42,0.16)]">
                <div className="mb-3 flex items-center gap-3 px-1">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0B4964] text-white">
                    <PhoneCall size={20} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#22313f]">Call now</p>
                    <p className="text-xs text-[#667085]">Choose a number</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {CALL_OPTIONS.map((number, index) => (
                    <a
                      key={number}
                      href={`tel:${number}`}
                      className="flex items-center justify-between rounded-2xl border border-[#eef2f6] px-3 py-2.5 text-sm transition hover:border-[#0B4964] hover:bg-[#f8fbff]"
                    >
                      <span className="font-medium text-[#22313f]">
                        {index + 1}. {number}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0B4964]">
                        Call
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? "Close support actions" : "Open support actions"}
          className={`flex h-[60px] w-[60px] items-center justify-center rounded-full text-white shadow-[0_20px_36px_rgba(15,23,42,0.22)] transition-colors ${
            open ? "bg-[#0B4964]" : "bg-[#FB2965]"
          }`}
        >
          {open ? <X size={24} /> : <MessageCircle size={24} />}
        </motion.button>
      </div>
    </>
  );
};
