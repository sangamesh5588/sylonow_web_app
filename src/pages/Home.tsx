import { useEffect, useState } from "react";
import SEO from "../components/SEO";
import { CategoryCircles } from "../components/home/CategoryCircles";
import { OfferBanner } from "../components/home/OfferBanner";
import { ServiceSection } from "../components/home/ServiceSection";
import { SupportFab } from "../components/home/SupportFab";
import { fetchAllServices, fetchHomeSections, HomeSection } from "../lib/services";
import { getServicesInArea } from "../lib/areas";
import { Service } from "../types";

const HOME_SCROLL_KEY = "home_scroll_y";

const SectionSkeleton = () => (
  <div className="space-y-3">
    <div className="h-7 w-40 rounded-xl bg-gray-100 animate-pulse" />
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="min-w-[160px] w-[160px] md:min-w-[280px] md:w-[280px] shrink-0">
          <div className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
          <div className="mt-2 h-3 w-3/4 rounded bg-gray-100 animate-pulse" />
          <div className="mt-1 h-3 w-1/2 rounded bg-gray-100 animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);

const Home = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);

  // Restore scroll after content loads
  useEffect(() => {
    if (loading) return;
    const saved = sessionStorage.getItem(HOME_SCROLL_KEY);
    if (saved) {
      requestAnimationFrame(() => window.scrollTo(0, Number(saved)));
      sessionStorage.removeItem(HOME_SCROLL_KEY);
    }
  }, [loading]);

  // Save scroll position on any click (before navigation)
  useEffect(() => {
    const saveScroll = () => sessionStorage.setItem(HOME_SCROLL_KEY, String(window.scrollY));
    window.addEventListener("click", saveScroll, { capture: true });
    return () => window.removeEventListener("click", saveScroll, { capture: true });
  }, []);

  useEffect(() => {
    Promise.all([fetchAllServices(), fetchHomeSections()]).then(([svcData, secData]) => {
      setServices(svcData);
      setSections(secData);
      setLoading(false);
    });
  }, []);

  const FLAG_COL_MAP: Record<string, keyof Service> = {
    is_featured_main: "featuredMain",
    is_featured_collage: "featuredCollage",
  };

  const resolveServices = (section: HomeSection): Service[] => {
    if (section.section_type === "flag" && section.flag_column) {
      const col = FLAG_COL_MAP[section.flag_column];
      if (!col) return [];
      return services.filter((s) => s[col] === true);
    }
    if (section.section_type === "suggested") {
      return services.filter((s) => s.isSuggested);
    }
    if (
      section.section_type === "area" &&
      section.min_lat != null &&
      section.max_lat != null &&
      section.min_lng != null &&
      section.max_lng != null
    ) {
      return getServicesInArea(services, {
        min_lat: section.min_lat,
        max_lat: section.max_lat,
        min_lng: section.min_lng,
        max_lng: section.max_lng,
      });
    }
    return [];
  };

  return (
    <div className="space-y-5 pb-40 pt-4 md:space-y-12 md:pb-12">
      <SEO
        title="Birthday Decoration & Surprise Planning in Bangalore"
        description="Bangalore's #1 Birthday Decoration & Surprise Planning Service. Premium balloon decoration, romantic room setups, anniversary celebrations & surprise parties. Book now for same-day celebration services!"
        canonical="/"
      />
      <div className="space-y-5 md:space-y-12">
        <OfferBanner />
        <CategoryCircles />

        {loading ? (
          // Skeletons keep page height so footer doesn't flash during scroll restore
          <div className="space-y-8">
            {Array.from({ length: 6 }).map((_, i) => <SectionSkeleton key={i} />)}
          </div>
        ) : (
          <>
            {sections.map((section) => {
              const sectionServices = resolveServices(section);
              if (sectionServices.length === 0) return null;
              return (
                <ServiceSection
                  key={section.id}
                  title={section.title}
                  services={sectionServices}
                  sectionId={section.id}
                />
              );
            })}
          </>
        )}
      </div>
      <SupportFab />
    </div>
  );
};

export default Home;
