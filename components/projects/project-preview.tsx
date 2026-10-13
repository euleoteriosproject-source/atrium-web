import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type ProjectPreviewProps = Readonly<{
  src: string;
  alt: string;
  href: string;
  external?: boolean;
  className?: string;
  priority?: boolean;
}>;

export function ProjectPreview({
  src,
  alt,
  href,
  external = false,
  className,
  priority = false,
}: ProjectPreviewProps) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(
        "project-frame group relative block overflow-hidden rounded-[1rem] border border-navy-950/10 bg-surface-elevated shadow-[var(--shadow-raised)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-brand-blue/25 hover:shadow-[var(--shadow-project)] focus-visible:outline-offset-4",
        className,
      )}
    >
      <div className="relative aspect-[36/25] overflow-hidden bg-surface-cloud">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="project-image object-cover object-top"
        />
      </div>
    </Link>
  );
}
