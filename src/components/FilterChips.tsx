import { Filter, ArrowUpDown } from "lucide-react";

export const FilterChips = () => {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full bg-white hover:border-[#0B4964] transition-colors whitespace-nowrap">
        <Filter size={16} className="text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Filter</span>
      </button>

      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full bg-white hover:border-[#0B4964] transition-colors whitespace-nowrap">
        <ArrowUpDown size={16} className="text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Sort: Popularity</span>
      </button>

      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full bg-white hover:border-[#0B4964] transition-colors whitespace-nowrap">
        <span className="text-sm font-medium text-gray-700">Price: low to high</span>
      </button>

      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full bg-white hover:border-[#0B4964] transition-colors whitespace-nowrap">
        <span className="text-sm font-medium text-gray-700">Rating: 4.5+</span>
      </button>
    </div>
  );
};
