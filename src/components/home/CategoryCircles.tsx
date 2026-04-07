import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { supabase } from "../../lib/supabase";
import { getResponsiveImageProps } from "../../lib/images";

interface Category {
  id: string;
  name: string;
  image_url: string | null;
  sort_order: number;
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1530103862676-fa8c9d34bb34?w=200&h=200&fit=crop";

const CategoryCard = ({ cat, index }: { cat: Category; index: number }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const imageProps = getResponsiveImageProps(cat.image_url || PLACEHOLDER_IMAGE, {
    widths: [120, 180, 240, 320],
    height: 420,
    quality: 78,
    resize: "cover",
    sizes: "(max-width: 768px) 96px, 180px",
  });
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="shrink-0 md:shrink group cursor-pointer w-24 md:w-full"
    >
      <Link to={`/category/${cat.name}`}>
        <div className="relative w-24 h-28 md:w-full md:h-44 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-[#edf0f4] group-hover:border-[#FB2965] transition-all duration-300">
          {!imgLoaded && (
            <div className="absolute inset-0 bg-[#f0f2f5] animate-pulse" />
          )}
          <img
            src={imageProps.src}
            srcSet={imageProps.srcSet}
            sizes={imageProps.sizes}
            alt={cat.name}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setImgLoaded(true)}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-6 md:px-3 md:pb-3 md:pt-10">
            <span className="text-[10px] md:text-sm font-bold text-white text-center block leading-tight">
              {cat.name}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

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
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 pt-2 pb-2 md:grid md:grid-cols-6 md:overflow-visible">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="w-24 h-28 md:w-full md:h-44 shrink-0 rounded-2xl md:rounded-3xl bg-[#f0f2f5] animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-1">
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 pt-2 pb-2 md:grid md:grid-cols-6 md:gap-4 md:overflow-visible">
        {categories.map((cat, index) => (
          <CategoryCard key={cat.id} cat={cat} index={index} />
        ))}
      </div>
    </section>
  );
};
