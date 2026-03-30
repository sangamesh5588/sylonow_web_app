import { Link } from "react-router-dom";

const SEARCH_DATA = [
  {
    title: "Decoration Categories",
    links: [
      "Annaprashan", "Anniversary Decoration", "Baby Shower", "Baby Welcome", "Birthday", 
      "Bride to be", "Bride Welcome", "Cabana", "Candle Light Dinner", "Canopy", "Car Boot", 
      "Ceremony", "Christening", "Christmas", "Cradle Ceremony", "Dohale Jeevan", "Festival", 
      "First Night", "Flower Decor", "Haldi", "Kids Birthday", "Mehndi", "Mundan", 
      "Naming Ceremony", "Office", "Proposal", "Romantic", "Room", "Stage", "Terrace", "Wedding Car"
    ]
  },
  {
    title: "Decoration Services",
    links: [
      "Decoration in Bhubaneshwar", "Decoration in Chandigarh", "Decoration in Ghaziabad", 
      "Decoration in Gurgaon", "Decoration in Jaipur", "Decoration in Jamshedpur", 
      "Decoration in Jodhpur", "Decoration in Kanpur", "Decoration in Lonavala", 
      "Decoration in Lucknow", "Decoration in Nagpur", "Decoration in Navi Mumbai", 
      "Decoration in Noida", "Decoration in Patna", "Decoration in Ranchi", 
      "Decoration in Surat", "Decoration in Vadodara"
    ]
  },
  {
    title: "Our Cake Delivery Cities",
    links: [
      "Agra", "Amritsar", "Aurangabad", "Bhopal", "Bhubaneswar", "Bilaspur", "Chandigarh", 
      "Coimbatore", "Dehradun", "Dhanbad", "Faridabad", "Gandhinagar", "Ghaziabad", 
      "Gorakhpur", "Gurgaon", "Guwahati", "Gwalior", "Howrah", "Indore", "Jabalpur", 
      "Jaipur", "Jalandhar", "Jammu", "Jamshedpur", "Jodhpur", "Kanpur", "Kolhapur", 
      "Kota", "Lonavala", "Lucknow", "Ludhiana", "Meerut", "Nagpur", "Nashik", 
      "Navi Mumbai", "Noida", "Patna", "Prayagraj", "Raipur", "Ranchi", "Secunderabad", 
      "Siliguri", "Surat", "Thane", "Udaipur", "Vadodara", "Varanasi", "Visakhapatnam"
    ]
  },
  {
    title: "Flower Delivery Service",
    links: [
      "Flower Delivery in Delhi", "Flower delivery in Pune", "Flower delivery in Mumbai", 
      "Flower delivery in Ahmedabad", "Flower delivery in Bangalore", "Flower delivery in Kolkata", 
      "Flower delivery in Agra", "Flower delivery in Bhubaneswar", "Flower delivery in Gandhinagar", 
      "Flower delivery in Gurgaon", "Flower delivery in Noida", "Flower delivery in Indore", 
      "Flower delivery in Jabalpur", "Flower delivery in Jaipur", "Flower delivery in Lonavala", 
      "Flower delivery in Lucknow", "Flower delivery in Ludhiana", "Flower delivery in Meerut", 
      "Flower delivery in Nagpur", "Flower delivery in Nashik", "Flower delivery in Hyderabad", 
      "Flower delivery in Surat", "Flower delivery in Navi Mumbai"
    ]
  }
];

export const PopularSearches = () => {
  return (
    <section className="py-12 border-t border-gray-100">
      <h2 className="text-2xl font-bold text-[#0B4964] mb-8">Popular Searches</h2>
      <div className="space-y-8">
        {SEARCH_DATA.map((section) => (
          <div key={section.title} className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4 md:gap-8">
            <h3 className="font-bold text-[#0B4964] text-sm md:text-base">{section.title}</h3>
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              {section.links.map((link, idx) => (
                <span key={link} className="flex items-center">
                  <Link 
                    to={`/search?q=${encodeURIComponent(link)}`}
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
