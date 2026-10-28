import type { MediaAsset } from "@/lib/types";
import { publicMediaUrl } from "@/lib/media";

type Props = {
  name: string;
  cover: MediaAsset | null;
  priority?: boolean;
  className?: string;
  sizes?: string;
};

export function ProjectCover({
  name,
  cover,
  priority,
  className = "",
}: Props) {
  const src = publicMediaUrl(cover?.url);
  const width = cover?.width && cover.width > 0 ? cover.width : 1600;
  const height = cover?.height && cover.height > 0 ? cover.height : 1000;

  return (
    <div className={`media-frame relative aspect-[16/10] ${className}`}>
      {src ? (
        // Using native img: Next image optimizer returns 400 for local API hosts in this environment.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={cover?.alt || `${name} website preview`}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-[var(--duration-hover)] ease-[var(--ease-out)] group-hover:opacity-95"
        />
      ) : (
        <div className="placeholder-cover absolute inset-0" aria-hidden>
          <span>{name}</span>
        </div>
      )}
    </div>
  );
}
