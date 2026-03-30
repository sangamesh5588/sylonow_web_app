import { Link } from "react-router-dom";
import { motion } from "motion/react";

const categories = [
  { name: "Flowers", image: "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=200&h=200&fit=crop" },
  { name: "Cakes", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop" },
  { name: "Decorations", image: "https://images.unsplash.com/photo-1530103862676-fa8c9d34bb34?w=200&h=200&fit=crop" },
  { name: "Gifts", image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&h=200&fit=crop" },
  { name: "Experience", image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&h=200&fit=crop" },
  { name: "Name Board", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200&h=200&fit=crop" },
  { name: "Wedding", image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=200&h=200&fit=crop" },
  { name: "Plants", image: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=200&h=200&fit=crop" },
  { name: "Home Decor", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=200&h=200&fit=crop" },
  { name: "Personalized", image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=200&fit=crop" },
  { name: "Blog", image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=200&h=200&fit=crop" },
];

export const CategoryCircles = () => {
  return (
    <section className="py-1">
      <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 pt-2 pb-2">
        {categories.map((cat, index) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer"
          >
            <Link to={`/category/${cat.name}`} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#FB2965] transition-all duration-300 shadow-sm">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[10px] md:text-xs font-bold text-[#0B4964] text-center whitespace-nowrap">
                {cat.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
