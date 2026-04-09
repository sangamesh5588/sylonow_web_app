import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { supabase } from "../../lib/supabase";
import { getResponsiveImageProps } from "../../lib/images";
import { CategoryCardDesktop } from "./CategoryCardDesktop";
import { CategoryCardMobile } from "./CategoryCardMobile";

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
    widths: [192, 384],
    quality: 78,
    resize: "cover",
    sizes: "96px",
  });
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="shrink-0 group cursor-pointer w-24"
    >
      <Link to={`/category/${cat.name}`}>
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-sm border border-[#edf0f4] group-hover:border-[#FB2965] transition-all duration-300">
          {!imgLoaded && (
            <div className="absolute inset-0 bg-[#f0f2f5] animate-pulse" />
          )}
          <img
            src={imageProps.src}
            srcSet={imageProps.srcSet}
            sizes={imageProps.sizes}
            alt={cat.name}
            className={`w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setImgLoaded(true)}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-5">
            <span className="text-[10px] font-bold text-white text-center block leading-tight">
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
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pt-2 pb-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="w-[140px] h-[140px] shrink-0 rounded-2xl bg-[#f0f2f5] animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-1">
      {/* Mobile */}
      <div className="flex md:hidden gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pt-2 pb-2">
        {categories.map((cat) => (
          <CategoryCardMobile key={cat.id} name={cat.name} image_url={cat.image_url} />
        ))}
      </div>
      {/* Desktop */}
      <div className="hidden md:grid md:grid-cols-6 md:gap-4">
        {categories.map((cat) => (
          <CategoryCardDesktop key={cat.id} id={cat.id} name={cat.name} image_url={cat.image_url} />
        ))}
      </div>
    </section>
  );
};
