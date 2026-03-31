import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { SERVICES } from "../services/mockData";
import { Button } from "../components/ui";
import { Search as SearchIcon, ChevronLeft, Heart, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { formatCurrency } from "../lib/utils";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

  const filteredServices = SERVICES.filter((s) => 
    s.title.toLowerCase().includes(searchQuery) || 
    s.description.toLowerCase().includes(searchQuery) ||
    s.category.toLowerCase().includes(searchQuery)
  );

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(`/search?search=${encodeURIComponent(searchValue.trim())}`);
  };

  return (
    <div className="space-y-8 py-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="relative z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-all active:scale-90 hover:bg-gray-200"
          >
            <ChevronLeft size={24} className="text-[#0B4964]" />
          </button>
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder='Search "Decorations"'
              className="h-11 w-full rounded-full border border-gray-200 bg-white pl-11 pr-4 text-sm text-[#22313f] shadow-sm focus:border-[#0B4964] focus:outline-none focus:ring-2 focus:ring-[#0B4964]/10"
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </form>
        </div>
        <div className="ml-[52px]">
          <h1 className="text-xl font-semibold tracking-tight text-[#0B4964]">
            {searchQuery ? `Search results for "${searchQuery}"` : "Search decorations"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{filteredServices.length} results found</p>
        </div>
      </div>

      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/service/${service.id}`} className="block group">
                <article className="overflow-hidden rounded-[22px] border border-[#edf0f4] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition-transform duration-300 group-hover:-translate-y-1 md:rounded-[28px] md:shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
                  <div className="relative">
                    <div className="aspect-[0.9/1] overflow-hidden rounded-b-[24px] rounded-t-[22px] md:aspect-[1.18/1] md:rounded-b-[32px] md:rounded-t-[28px]">
                      <img
                        src={service.images[0]}
                        alt={service.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#14384c]/85 via-[#14384c]/35 to-transparent px-3 pb-3 pt-8 text-white md:px-4 md:pb-5 md:pt-10">
                      <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/80 md:text-[10px] md:tracking-[0.22em]">
                        Limited time offer
                      </p>
                      <p className="mt-1 text-[11px] font-bold leading-4 md:text-[15px] md:leading-5">
                        Flat 29% OFF <span className="font-semibold text-white/85 hidden md:inline">+ 2 more</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#7b91a3]/85 text-white backdrop-blur-sm md:right-3 md:top-3 md:h-11 md:w-11"
                    >
                      <Heart size={16} className="md:h-[18px] md:w-[18px]" />
                    </button>
                  </div>

                  <div className="space-y-2 px-3 pb-3 pt-3 md:space-y-3 md:px-4 md:pb-4 md:pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2
                          className="overflow-hidden text-[13px] font-bold leading-4 text-[#22313f] md:text-[15px] md:leading-5"
                          style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
                        >
                          {service.title}
                        </h2>
                        <p className="mt-1 truncate text-[12px] text-[#667085] md:text-sm">{service.location}</p>
                      </div>
                      <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#16a34a] px-2 py-1 text-[11px] font-semibold text-white md:px-2.5 md:text-sm">
                        <span>{service.rating.toFixed(1)}</span>
                        <Star size={12} className="fill-current" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-[12px] text-[#667085] md:text-sm">
                      <p className="truncate">{service.category}</p>
                      <p className="shrink-0">{service.distance || "2.4km"}</p>
                    </div>

                    <div className="flex items-end justify-between gap-2">
                      <div className="text-[10px] text-[#98a2b3] md:text-xs">
                        {service.originalPrice ? <span className="line-through">{formatCurrency(service.originalPrice)}</span> : null}
                      </div>
                      <p className="text-[14px] font-bold text-[#4c5c68] md:text-[16px]">{formatCurrency(service.price)}</p>
                    </div>
                  </div>
                </article>
              </Link>
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
