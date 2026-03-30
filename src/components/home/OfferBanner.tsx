import { motion } from "motion/react";
import { Tag, ChevronRight } from "lucide-react";

export const OfferBanner = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.01 }}
      className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-[#FB2965] via-[#FF4D8D] to-[#FB2965] p-6 md:p-10 text-white shadow-xl shadow-[#FB2965]/20 group cursor-pointer"
    >
      {/* Shimmer Effect */}
      <motion.div
        animate={{
          x: ["-100%", "200%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] z-0"
      />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-5">
          <div className="flex w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-md rounded-full items-center justify-center shrink-0 shadow-inner">
            <Tag size={20} className="text-white md:size-24" />
          </div>
          <div className="space-y-0.5 md:space-y-1">
            <h3 className="text-base md:text-xl font-black tracking-tight leading-none uppercase italic">
              FLAT ₹2000 OFF
            </h3>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="text-[10px] md:text-sm font-medium text-white/90 leading-none">
                On your first decoration booking. Use code:
              </p>
              <span className="font-bold bg-white/25 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] md:text-xs tracking-wider border border-white/10 shadow-sm">
                SYLO2000
              </span>
            </div>
          </div>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 bg-white text-[#FB2965] px-4 md:px-6 py-2 md:py-3 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider hover:shadow-lg transition-all shrink-0 shadow-sm"
        >
          Book Now
          <ChevronRight size={14} strokeWidth={3} />
        </motion.button>
      </div>

      {/* Decorative Glows */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-black/10 rounded-full blur-3xl" />
    </motion.div>
  );
};
