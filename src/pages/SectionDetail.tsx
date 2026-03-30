import { useParams, useNavigate } from "react-router-dom";
import { SERVICES } from "../services/mockData";
import { ServiceCard } from "../components/ServiceCard";
import { ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";

const SectionDetail = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getSectionData = () => {
    if (sectionId === "trending") {
      return { title: "Trending now", services: SERVICES.filter(s => s.trending) };
    }
    if (sectionId === "popular") {
      return { title: "Popular picks", services: SERVICES.slice(0, 6) };
    }
    if (sectionId === "birthday") {
      return { title: "Birthday Specials", services: SERVICES.filter(s => s.category === "Birthday") };
    }
    if (sectionId === "proposal") {
      return { title: "Romantic Proposals", services: SERVICES.filter(s => s.category === "Proposal") };
    }
    if (sectionId === "anniversary") {
      return { title: "Anniversary Decor", services: SERVICES.filter(s => s.category === "Anniversary") };
    }
    if (sectionId === "baby-shower") {
      return { title: "Baby Shower Themes", services: SERVICES.filter(s => s.category === "Baby shower") };
    }
    if (sectionId === "experience") {
      return { title: "Unique Experiences", services: SERVICES.filter(s => s.category === "Experience") };
    }
    return { title: "All Services", services: SERVICES };
  };

  const { title, services } = getSectionData();

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
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

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <div className={`grid ${sectionId === "popular" ? "grid-cols-2" : "grid-cols-1"} md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6`}>
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ServiceCard service={service} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionDetail;
