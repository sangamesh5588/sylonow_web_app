import { Navigation, SlidersHorizontal } from "lucide-react";

type SortFilter = "popular" | "price-asc" | "price-desc" | "rating";

interface SortOption {
  label: string;
  value: SortFilter;
}

interface CategoryTopSectionProps {
  activeFilterCount: number;
  isSticky: boolean;
  nearMe: boolean;
  onFilterOpen: () => void;
  onNearMeToggle: () => void;
  onSortChange: (sort: SortFilter) => void;
  selectedSort: SortFilter;
  sortOptions: readonly SortOption[];
}

export const CategoryTopSection = ({
  activeFilterCount,
  isSticky,
  nearMe,
  onFilterOpen,
  onNearMeToggle,
  onSortChange,
  selectedSort,
  sortOptions,
}: CategoryTopSectionProps) => {
  return (
    <section
      className={`sticky z-40 -mx-4 px-4 transition-all duration-200 md:top-0 ${
        isSticky ? "top-[72px]" : "top-0"
      } ${
        isSticky
          ? "bg-white/95 pb-2 pt-2 shadow-[0_12px_24px_rgba(15,23,42,0.08)] backdrop-blur-md"
          : "bg-white pb-2 pt-2"
      }`}
    >
      <div className="space-y-2.5">
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex min-w-max gap-2">
            <button
              type="button"
              onClick={onFilterOpen}
              className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 transition-colors hover:border-[#0B4964] whitespace-nowrap"
            >
              <SlidersHorizontal size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filter</span>
              {activeFilterCount > 0 ? (
                <span className="ml-1 rounded-full bg-[#FB2965] px-2 py-0.5 text-[11px] text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              onClick={onNearMeToggle}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 whitespace-nowrap transition-colors ${
                nearMe
                  ? "border-[#0B4964] bg-[#0B4964] text-white"
                  : "border-gray-300 bg-white hover:border-[#0B4964] text-gray-700"
              }`}
            >
              <Navigation size={16} className={nearMe ? "text-white" : "text-gray-600"} />
              <span className="text-sm font-medium">Near Me</span>
            </button>

            {sortOptions.map((option) => {
              const isActive = option.value === selectedSort;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSortChange(option.value)}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 whitespace-nowrap transition-colors ${
                    isActive
                      ? "border-[#0B4964] bg-[#0B4964] text-white"
                      : "border-gray-300 bg-white hover:border-[#0B4964]"
                  }`}
                >
                  <span className={`text-sm font-medium ${isActive ? "text-white" : "text-gray-700"}`}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
