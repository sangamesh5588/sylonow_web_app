import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { SERVICES } from "../services/mockData";
import { Button } from "../components/ui";
import { Search as SearchIcon, ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { ServiceCard } from "../components/ServiceCard";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  const filteredServices = SERVICES.filter((s) => 
    s.title.toLowerCase().includes(searchQuery) || 
    s.description.toLowerCase().includes(searchQuery) ||
    s.category.toLowerCase().includes(searchQuery)
  );

  return (
    <div className="space-y-8 py-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="relative z-[60] w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-all active:scale-90"
          >
            <ChevronLeft size={24} className="text-[#0B4964]" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0B4964]">
            {searchQuery ? `Search results for "${searchQuery}"` : "Search decorations"}
          </h1>
        </div>
        <p className="text-gray-500 ml-14">{filteredServices.length} results found</p>
      </div>

      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ServiceCard service={service} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
            <SearchIcon size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#0B4964]">No results found</h2>
            <p className="text-gray-500 max-w-xs">
              We couldn't find any decorations matching your search. Try different keywords.
            </p>
          </div>
          <Link to="/">
            <Button variant="outline">Go back home</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
