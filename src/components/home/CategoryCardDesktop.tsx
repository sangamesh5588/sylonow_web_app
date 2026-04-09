import { Link } from "react-router-dom";
import { useState } from "react";
import { getOptimizedImageUrl } from "../../lib/images";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1530103862676-fa8c9d34bb34?w=400&h=400&fit=crop";

interface CategoryCardDesktopProps {
  id: string;
  name: string;
  image_url: string | null;
}

export const CategoryCardDesktop = ({ name, image_url }: CategoryCardDesktopProps) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  // Original images are 400×400 squares. Request at 480×480 (2x for sharp retina).
  // No height mismatch — fetched square, displayed in a square-ish landscape card via object-cover.
  const src = getOptimizedImageUrl(image_url || PLACEHOLDER_IMAGE, {
    width: 480,
    height: 480,
    quality: 82,
    resize: "cover",
  });

  return (
    <Link to={`/category/${name}`}>
      <div className="group cursor-pointer">
        <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-sm border border-[#edf0f4] group-hover:border-[#FB2965] transition-all duration-300">
          {!imgLoaded && (
            <div className="absolute inset-0 bg-[#f0f2f5] animate-pulse" />
          )}
          <img
            ref={(el) => { if (el?.complete) setImgLoaded(true); }}
            src={src}
            alt={name}
            width={480}
            height={480}
            className={`w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setImgLoaded(true)}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-10">
            <span className="text-sm font-bold text-white text-center block leading-tight">
              {name}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
