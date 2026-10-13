import Image from "next/image";

import { founderProfile } from "@/content/founder";

type FounderProfileCardProps = {
  tone?: "light" | "dark";
};

export function FounderProfileCard({
  tone = "light",
}: FounderProfileCardProps) {
  const isDark = tone === "dark";

  return (
    <figure
      className={`overflow-hidden rounded-[1.125rem] border shadow-[var(--shadow-feature)] ${
        isDark
          ? "border-offwhite/15 bg-navy-800 text-offwhite"
          : "border-navy-950/10 bg-navy-950 text-offwhite"
      }`}
    >
      <div className="relative aspect-[4/4.25] overflow-hidden bg-surface-cloud sm:aspect-[4/4.1]">
        <Image
          src={founderProfile.image}
          alt={founderProfile.alt}
          fill
          sizes="(min-width: 1024px) 36vw, (min-width: 640px) 72vw, calc(100vw - 3rem)"
          className="object-cover object-[center_42%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-navy-950/35 to-transparent"
        />
      </div>
      <figcaption className="relative border-t border-offwhite/12 px-6 py-6 sm:px-8 sm:py-7">
        <span
          aria-hidden="true"
          className="absolute top-0 left-6 h-px w-14 bg-accent-on-dark sm:left-8"
        />
        <p className="text-caption font-bold tracking-[0.14em] text-accent-on-dark uppercase">
          {founderProfile.eyebrow}
        </p>
        <p className="mt-3 text-h4 font-semibold">{founderProfile.name}</p>
        <p className="mt-1 text-body-sm text-offwhite/68">
          {founderProfile.role}
        </p>
      </figcaption>
    </figure>
  );
}
