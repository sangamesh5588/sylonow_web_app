import { useParams, useNavigate } from "react-router-dom";
import { ServiceCard } from "../components/ServiceCard";
import { ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Service } from "../types";
import { fetchAllServices } from "../lib/services";

const SectionDetail = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAllServices().then((data) => {
      setAllServices(data);
      setLoading(false);
    });
  }, []);

  const getSectionData = () => {
    if (sectionId === "trending") {
      return { title: "Trending now", services: allServices.filter(s => s.trending) };
    }
    if (sectionId === "popular") {
      return { title: "Popular picks", services: [...allServices].sort((a, b) => b.rating - a.rating).slice(0, 8) };
    }
    // Match category by converting sectionId back (e.g. "baby-shower" → match "Baby shower")
    const matchedCategory = allServices.find(
      s => s.category.toLowerCase().replace(/\s+/g, "-") === sectionId
    )?.category;

    if (matchedCategory) {
      return { title: matchedCategory, services: allServices.filter(s => s.category === matchedCategory) };
    }

    return { title: "All Services", services: allServices };
  };

  const { title, services } = getSectionData();

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-3 md:px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="relative z-[60] w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-all active:scale-90"
          >
            <ChevronLeft size={24} className="text-[#0B4964]" />
          </button>
          {sectionId !== "popular" && (
            <h1 className="text-xl font-bold text-[#0B4964]">{title}</h1>
          )}
        </div>
      </div>

      <div className="container mx-auto px-3 py-5 md:px-4 md:py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B4964] border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ServiceCard service={service} variant="compact" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionDetail;
