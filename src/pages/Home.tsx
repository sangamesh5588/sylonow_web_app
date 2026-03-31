import { useEffect, useState } from "react";
import { CategoryCircles } from "../components/home/CategoryCircles";
import { OfferBanner } from "../components/home/OfferBanner";
import { ServiceSection } from "../components/home/ServiceSection";
import { fetchAllServices } from "../lib/services";
import { Service } from "../types";

const Home = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllServices().then((data) => {
      setServices(data);
      setLoading(false);
    });
  }, []);

  const trending = services.filter((s) => s.trending).slice(0, 8);
  const popular = [...services].sort((a, b) => b.rating - a.rating).slice(0, 8);

  // Group by category
  const categoryMap = new Map<string, Service[]>();
  for (const s of services) {
    const list = categoryMap.get(s.category) || [];
    list.push(s);
    categoryMap.set(s.category, list);
  }

  return (
    <div className="space-y-5 pb-40 pt-4 md:space-y-12 md:pb-12">
      <div className="space-y-5 md:space-y-12">
        <OfferBanner />
        <CategoryCircles />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B4964] border-t-transparent" />
          </div>
        ) : (
          <>
            {trending.length > 0 && (
              <ServiceSection title="Trending now" services={trending} sectionId="trending" />
            )}
            {popular.length > 0 && (
              <ServiceSection title="Popular picks" services={popular} sectionId="popular" />
            )}
            {[...categoryMap.entries()].map(([category, categoryServices]) => (
              <ServiceSection
                key={category}
                title={category}
                services={categoryServices}
                sectionId={category.toLowerCase().replace(/\s+/g, "-")}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
