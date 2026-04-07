export type SupabaseResizeMode = "cover" | "contain" | "fill";

interface SupabaseTransformOptions {
  width: number;
  height?: number;
  quality?: number;
  resize?: SupabaseResizeMode;
  format?: "origin";
}

interface ResponsiveImageOptions extends Omit<SupabaseTransformOptions, "width"> {
  widths: number[];
  sizes: string;
}

const PUBLIC_OBJECT_PREFIX = "/storage/v1/object/public/";
const PUBLIC_RENDER_PREFIX = "/storage/v1/render/image/public/";
const RESERVED_TRANSFORM_PARAMS = new Set(["width", "height", "quality", "resize", "format"]);

const isTransformableAsset = (path: string) => {
  const extension = path.split(".").pop()?.toLowerCase();
  return extension !== "svg" && extension !== "gif";
};

const encodeStoragePath = (path: string) =>
  path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

const parseSupabaseStorageUrl = (imageUrl: string) => {
  try {
    const url = new URL(imageUrl);
    const prefix = [PUBLIC_OBJECT_PREFIX, PUBLIC_RENDER_PREFIX].find((candidate) =>
      url.pathname.startsWith(candidate)
    );

    if (!prefix) return null;

    const objectPath = decodeURIComponent(url.pathname.slice(prefix.length));
    const firstSlash = objectPath.indexOf("/");
    if (firstSlash === -1 || !isTransformableAsset(objectPath)) return null;

    return {
      origin: url.origin,
      bucket: objectPath.slice(0, firstSlash),
      path: objectPath.slice(firstSlash + 1),
      searchParams: new URLSearchParams(url.search),
    };
  } catch {
    return null;
  }
};

export const getOptimizedImageUrl = (
  imageUrl: string | undefined,
  options: SupabaseTransformOptions
) => {
  if (!imageUrl) return "";

  const parsed = parseSupabaseStorageUrl(imageUrl);
  if (!parsed) return imageUrl;

  const transformedUrl = new URL(
    `${parsed.origin}${PUBLIC_RENDER_PREFIX}${parsed.bucket}/${encodeStoragePath(parsed.path)}`
  );

  parsed.searchParams.forEach((value, key) => {
    if (!RESERVED_TRANSFORM_PARAMS.has(key)) {
      transformedUrl.searchParams.append(key, value);
    }
  });

  transformedUrl.searchParams.set("width", String(options.width));

  if (options.height) {
    transformedUrl.searchParams.set("height", String(options.height));
  }

  if (options.quality) {
    transformedUrl.searchParams.set("quality", String(options.quality));
  }

  if (options.resize) {
    transformedUrl.searchParams.set("resize", options.resize);
  }

  if (options.format) {
    transformedUrl.searchParams.set("format", options.format);
  }

  return transformedUrl.toString();
};

export const getResponsiveImageProps = (
  imageUrl: string | undefined,
  options: ResponsiveImageOptions
) => {
  if (!imageUrl) {
    return {
      src: "",
      srcSet: undefined,
      sizes: undefined,
    };
  }

  const uniqueWidths = [...new Set(options.widths)].sort((left, right) => left - right);
  const baseTransform = {
    height: options.height,
    quality: options.quality,
    resize: options.resize,
    format: options.format,
  };

  const src = getOptimizedImageUrl(imageUrl, {
    width: uniqueWidths[uniqueWidths.length - 1],
    ...baseTransform,
  });

  const parsed = parseSupabaseStorageUrl(imageUrl);
  if (!parsed) {
    return {
      src,
      srcSet: undefined,
      sizes: undefined,
    };
  }

  return {
    src,
    srcSet: uniqueWidths
      .map((width) => `${getOptimizedImageUrl(imageUrl, { width, ...baseTransform })} ${width}w`)
      .join(", "),
    sizes: options.sizes,
  };
};
