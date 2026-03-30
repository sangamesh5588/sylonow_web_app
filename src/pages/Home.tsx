import { TrendingDecorations } from "../components/home/TrendingDecorations";
import { CategoryCircles } from "../components/home/CategoryCircles";
import { OfferBanner } from "../components/home/OfferBanner";
import { ServiceSection } from "../components/home/ServiceSection";
import { FilterChips } from "../components/FilterChips";
import { SERVICES } from "../services/mockData";

const Home = () => {
  const trendingNow = SERVICES.slice(0, 8);
  const popularPicks = SERVICES.slice(0, 6);
  const birthdayServices = SERVICES.filter(s => s.category === "Birthday");
  const proposalServices = SERVICES.filter(s => s.category === "Proposal");
  const anniversaryServices = SERVICES.filter(s => s.category === "Anniversary");
  const babyShowerServices = SERVICES.filter(s => s.category === "Baby shower");
  const experienceServices = SERVICES.filter(s => s.category === "Experience");

  return (
    <div className="space-y-8 md:space-y-12 pb-40 md:pb-12 pt-4">
      <div className="space-y-8 md:space-y-12">
        <OfferBanner />
        <CategoryCircles />
        <TrendingDecorations />

        <FilterChips />

        <ServiceSection title="Trending now" services={trendingNow} sectionId="trending" />
        <ServiceSection title="Popular picks" services={popularPicks} sectionId="popular" />
        <ServiceSection title="Birthday Specials" services={birthdayServices} sectionId="birthday" />
        <ServiceSection title="Romantic Proposals" services={proposalServices} sectionId="proposal" />
        <ServiceSection title="Anniversary Decor" services={anniversaryServices} sectionId="anniversary" />
        <ServiceSection title="Baby Shower Themes" services={babyShowerServices} sectionId="baby-shower" />
        <ServiceSection title="Unique Experiences" services={experienceServices} sectionId="experience" />
      </div>
    </div>
  );
};

export default Home;
