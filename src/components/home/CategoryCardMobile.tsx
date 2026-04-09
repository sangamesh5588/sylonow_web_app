import { Link } from "react-router-dom";
import { useState } from "react";
import { getOptimizedImageUrl } from "../../lib/images";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1530103862676-fa8c9d34bb34?w=400&h=400&fit=crop";

interface CategoryCardMobileProps {
  name: string;
  image_url: string | null;
}

export const CategoryCardMobile = ({ name, image_url }: CategoryCardMobileProps) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  // Source images are 400×400. Request 2x for retina = 800×800 square, no crop on fetch.
  const src = getOptimizedImageUrl(image_url || PLACEHOLDER_IMAGE, {
    width: 800,
    height: 800,
    quality: 80,
    resize: "cover",
  });

  return (
    <Link to={`/category/${name}`} className="shrink-0 block w-[140px]">
      <div className="relative w-[140px] h-[140px] rounded-2xl overflow-hidden shadow-sm border border-[#edf0f4]">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-[#f0f2f5] animate-pulse" />
        )}
        <img
          ref={(el) => { if (el?.complete) setImgLoaded(true); }}
          src={src}
          alt={name}
          width={140}
          height={140}
          className={`w-full h-full object-cover object-center ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setImgLoaded(true)}
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-2 pb-2 pt-6">
          <span className="text-[11px] font-bold text-white text-center block leading-tight">
            {name}
          </span>
        </div>
      </div>
    </Link>
  );
};
