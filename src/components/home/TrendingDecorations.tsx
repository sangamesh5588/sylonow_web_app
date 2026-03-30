import { SERVICES } from "../../services/mockData";
import { ServiceSection } from "./ServiceSection";

export const TrendingDecorations = () => {
  const trendingServices = SERVICES.filter((s) => s.trending);

  return (
    <ServiceSection title="Trending now" services={trendingServices} sectionId="trending" />
  );
};
