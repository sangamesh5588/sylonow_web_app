import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAllServices } from "../../lib/services";
import { Service } from "../../types";

interface SearchSection {
  title: string;
  links: string[];
}

const dedupe = (items: string[]) =>
  Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));

const toDisplayCategory = (value: string) =>
  value
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const toAreaKeyword = (value: string) =>
  value
    .replace(/^best in\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();

export const PopularSearches = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [areas, setAreas] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    fetchAllServices().then((serviceData) => {
      if (!active) return;
      setServices(serviceData);
      const areaNames = serviceData.flatMap((service) => (service.areaTags ?? []).map(toAreaKeyword));
      setAreas(dedupe(areaNames));
    });

    return () => {
      active = false;
    };
  }, []);

  const searchSections = useMemo<SearchSection[]>(() => {
    const categories = dedupe(services.map((service) => toDisplayCategory(service.category)));
    const locationTargets = areas;

    const nearMeKeywords = dedupe([
      "Decoration near me",
      "Event decoration near me",
      "Birthday decoration near me",
      ...categories.flatMap((category) => [
        `${category} decoration near me`,
        `${category} decorators near me`,
      ]),
    ]);

    const locationKeywords = dedupe(
      locationTargets.flatMap((location) => {
        return [
          `Decoration in ${location}`,
          ...categories.map((category) => `${category} decoration in ${location}`),
        ];
      })
    );

    return [
      {
        title: "Decoration Categories",
        links: categories,
      },
      {
        title: "SEO Decoration Keywords",
        links: nearMeKeywords.slice(0, 40),
      },
      {
        title: `Decoration Services by Area (${locationTargets.length})`,
        links: locationKeywords.slice(0, 48),
      },
    ];
  }, [areas, services]);

  return (
    <section className="py-12 border-t border-gray-100">
      <h2 className="text-2xl font-bold text-[#0B4964] mb-8">Popular Searches</h2>
      <div className="space-y-8">
        {searchSections.map((section) => (
          <div key={section.title} className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4 md:gap-8">
            <h3 className="font-bold text-[#0B4964] text-sm md:text-base">{section.title}</h3>
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              {section.links.map((link, idx) => (
                <span key={link} className="flex items-center">
                  <Link 
                    to={`/search?search=${encodeURIComponent(link)}`}
                    className="text-xs text-gray-500 hover:text-[#FB2965] transition-colors"
                  >
                    {link}
                  </Link>
                  {idx < section.links.length - 1 && (
                    <span className="ml-2 text-gray-300">|</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
