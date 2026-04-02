import { useParams, useNavigate } from "react-router-dom";
import { ServiceCard } from "../components/ServiceCard";
import { ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Service } from "../types";
import { fetchAllServices, fetchHomeSections, HomeSection } from "../lib/services";
import { getServicesInArea } from "../lib/areas";

const SectionDetail = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [section, setSection] = useState<HomeSection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([fetchAllServices(), fetchHomeSections()]).then(([svcData, secData]) => {
      setAllServices(svcData);
      const found = secData.find((s) => s.id === sectionId) ?? null;
      setSection(found);
      setLoading(false);
    });
  }, [sectionId]);

  const FLAG_COL_MAP: Record<string, keyof Service> = {
    is_featured_main: "featuredMain",
    is_featured_collage: "featuredCollage",
  };

  const resolveServices = (): Service[] => {
    if (!section) return [];
    if (section.section_type === "flag" && section.flag_column) {
      const col = FLAG_COL_MAP[section.flag_column];
      if (!col) return [];
      return allServices.filter((s) => s[col] === true);
    }
    if (section.section_type === "suggested") {
      return allServices.filter((s) => s.isSuggested);
    }
    if (
      section.section_type === "area" &&
      section.min_lat != null &&
      section.max_lat != null &&
      section.min_lng != null &&
      section.max_lng != null
    ) {
      return getServicesInArea(allServices, {
        min_lat: section.min_lat,
        max_lat: section.max_lat,
        min_lng: section.min_lng,
        max_lng: section.max_lng,
      });
    }
    return [];
  };

  const services = resolveServices();
  const title = section?.title ?? "All Services";

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
          <h1 className="text-xl font-bold text-[#0B4964]">{title}</h1>
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
