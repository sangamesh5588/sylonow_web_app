import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

const BASE_URL = "https://sylonow.com";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-banner.png`;

export default function SEO({ title, description, canonical, ogImage, noindex = false }: SEOProps) {
  const fullTitle = title
    ? `${title} | Sylonow - Birthday Decoration Bangalore`
    : "Sylonow | Birthday Decoration & Surprise Planning in Bangalore | Same-Day Celebration Services";

  const metaDescription = description ||
    "Bangalore's #1 Birthday Decoration & Surprise Planning Service. Premium balloon decoration, romantic room setups, anniversary celebrations & surprise parties. Book now for same-day celebration services!";

  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : BASE_URL;
  const image = ogImage || DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:site_name" content="Sylonow" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
