import { motion } from "motion/react";
import { ChevronRight, Tag } from "lucide-react";

export const OfferBanner = () => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0B4164_0%,#0F5375_52%,#14668A_100%)] p-5 text-white shadow-[0_20px_40px_rgba(11,65,100,0.22)] md:hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_28%)]" />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-white/90">
              <Tag size={14} />
              QUICK BOOK
            </div>

            <div className="space-y-1.5">
              <h3 className="text-[24px] font-black leading-none tracking-tight">Book in 30 sec</h3>
              <p className="max-w-[210px] text-sm leading-5 text-white/80">
                Pick a decor, confirm your slot, and reserve instantly.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold">
              Use code
              <span className="rounded-full bg-white px-2.5 py-1 text-[#0B4164]">SYLO2000</span>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#0B4164] shadow-sm"
          >
            Book Now
            <ChevronRight size={14} strokeWidth={3} />
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.01 }}
        className="relative hidden cursor-pointer overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0B4164_0%,#0F5375_52%,#14668A_100%)] px-10 py-12 text-white shadow-[0_12px_24px_rgba(11,65,100,0.12)] md:block"
      >
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]"
        />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/12 backdrop-blur-sm">
              <Tag size={20} className="text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-[30px] font-black leading-none tracking-tight">
                Book in 30 sec
              </h3>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-base font-medium leading-none text-white/85">
                  Pick a decor, confirm your slot, and reserve instantly. Use code:
                </p>
                <span className="rounded-full border border-white/10 bg-white px-3 py-1.5 text-sm font-bold tracking-wider text-[#0B4164]">
                  SYLO2000
                </span>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-7 py-3 text-xs font-black uppercase tracking-wider text-[#0B4164] shadow-none transition-all"
          >
            Book Now
            <ChevronRight size={14} strokeWidth={3} />
          </motion.button>
        </div>

        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-black/10 blur-3xl" />
      </motion.div>
    </>
  );
};
