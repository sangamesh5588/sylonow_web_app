import { Link } from "react-router-dom";
import { CATEGORIES } from "../../services/mockData";
import { motion } from "motion/react";
import { Star, Users } from "lucide-react";

export const CategoryScroll = () => {
  const categoryIcons: Record<string, string> = {
    Birthday: "🎂",
    Proposal: "❤️",
    Anniversary: "✨",
    "Baby Shower": "👶",
    Festive: "🎉",
    Corporate: "🎁",
    Wedding: "💍",
    Gifts: "🛍️",
    Experience: "🎡",
  };

  const categoryBadges: Record<string, string> = {
    Birthday: "47 mins",
    Anniversary: "32 mins",
    Festive: "2-years, ₹0 cost.",
    Wedding: "New",
    Experience: "Top Rated",
  };

  return (
    <section className="py-8 md:py-12">
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Left Content: Heading + Grid Card */}
        <div className="w-full lg:max-w-xl space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0B4964] leading-tight tracking-tight">
            Home services at your <br /> doorstep
          </h2>

          {/* Category Grid Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 md:p-10 w-full">
            <h3 className="text-xl font-semibold text-gray-400 mb-8">What are you looking for?</h3>
            
            <div className="grid grid-cols-3 gap-y-12 gap-x-6">
              {CATEGORIES.map((category, index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/category/${category}`}
                    className="flex flex-col items-center gap-3 group"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 md:w-28 md:h-28 rounded-3xl bg-gray-50 flex items-center justify-center text-5xl group-hover:bg-gray-100 transition-all duration-500 transform group-hover:scale-110 group-hover:-rotate-3 shadow-sm group-hover:shadow-md">
                        {categoryIcons[category] || "🎈"}
                      </div>
                      {categoryBadges[category] && (
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border border-gray-100 shadow-xl px-3 py-1 rounded-full whitespace-nowrap z-10">
                          <span className="text-[8px] md:text-[10px] font-bold text-green-600 tracking-widest">{categoryBadges[category]}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-gray-400 text-center leading-tight group-hover:text-[#0B4964] transition-colors tracking-widest mt-2">
                      {category}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content: Image Collage (Desktop Only) */}
        <div className="hidden lg:grid grid-cols-2 gap-4 flex-1 h-[600px]">
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <img src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80" alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <img src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80" alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <img src="https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80" alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <img src="https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80" alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>
      </div>

      {/* Stats Bottom Bar */}
      <div className="mt-16 flex flex-wrap gap-12 items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
            <Star size={24} className="text-[#0B4964]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-[#0B4964]">4.8</span>
            <span className="text-xs font-semibold text-gray-400">Service Rating*</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
            <Users size={24} className="text-[#0B4964]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-[#0B4964]">12M+</span>
            <span className="text-xs font-semibold text-gray-400">Customers Globally*</span>
          </div>
        </div>
      </div>
    </section>
  );
};
