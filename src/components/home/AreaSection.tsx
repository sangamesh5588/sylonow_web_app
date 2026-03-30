import { ChevronRight, Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Service } from "../../types";

interface AreaSectionProps {
  title: string;
  services: Service[];
}

export const AreaSection = ({ title, services }: AreaSectionProps) => {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 group cursor-pointer">
            <h2 className="text-2xl font-bold text-[#0B4964]">{title}</h2>
            <ChevronRight className="text-gray-400 group-hover:text-[#FB2965] group-hover:translate-x-1 transition-all" size={24} />
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 lg:grid lg:grid-cols-6 lg:gap-4 pt-4 pb-4">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 w-[240px] lg:w-full group cursor-pointer"
            >
              <Link to={`/service/${service.id}`}>
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-3 shadow-sm">
                  <img
                    src={service.images[0]}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors">
                    <Heart size={18} />
                  </button>
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
                    <span className="text-[10px] font-bold text-[#0B4964] uppercase tracking-wider">Guest favourite</span>
                  </div>
                </div>
                <h3 className="font-bold text-[#0B4964] text-sm mb-1 line-clamp-1 group-hover:text-[#FB2965] transition-colors">{service.title}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">₹{service.price.toLocaleString()} for 1 night</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-400 fill-yellow-400" size={14} />
                    <span className="text-xs font-bold text-gray-700">{service.rating}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
