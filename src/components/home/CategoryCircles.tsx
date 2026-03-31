import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { supabase } from "../../lib/supabase";

interface Category {
  id: string;
  name: string;
  image_url: string | null;
  sort_order: number;
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1530103862676-fa8c9d34bb34?w=200&h=200&fit=crop";

export const CategoryCircles = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, image_url, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!error && data) {
        setCategories(data);
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-1">
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 pt-2 pb-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="w-24 h-28 md:w-28 md:h-32 shrink-0 rounded-2xl bg-[#f0f2f5] animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-1">
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 pt-2 pb-2">
        {categories.map((cat, index) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="shrink-0 group cursor-pointer"
          >
            <Link to={`/category/${cat.name}`}>
              <div className="relative w-24 h-28 md:w-28 md:h-32 rounded-2xl overflow-hidden shadow-sm border border-[#edf0f4] group-hover:border-[#FB2965] transition-all duration-300">
                <img
                  src={cat.image_url || PLACEHOLDER_IMAGE}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1.5 pt-4">
                  <span className="text-[10px] md:text-xs font-bold text-white text-center block leading-tight">
                    {cat.name}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
