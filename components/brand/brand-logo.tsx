import { useId, type SVGProps } from "react";

import { cn } from "@/lib/utils";

import { AtriumMarkArtwork, type BrandSurface } from "./brand-mark";

type BrandLogoProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  surface?: BrandSurface;
  decorative?: boolean;
  title?: string;
};

export function BrandLogo({
  surface = "light",
  decorative = false,
  title = "Atrium",
  className,
  ...props
}: BrandLogoProps) {
  const reactId = useId().replaceAll(":", "");
  const titleId = `atrium-logo-title-${reactId}`;

  return (
    <svg
      viewBox="0 0 580 120"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      aria-hidden={decorative || undefined}
      aria-labelledby={decorative ? undefined : titleId}
      role={decorative ? undefined : "img"}
      data-brand-logo=""
      data-surface={surface}
      className={cn(
        "block",
        surface === "dark" ? "text-brand-off-white" : "text-brand-navy",
        className,
      )}
      {...props}
    >
      {decorative ? null : <title id={titleId}>{title}</title>}
      <g transform="translate(0 9) scale(.22)">
        <AtriumMarkArtwork gradientIdPrefix={`atrium-logo-${reactId}`} />
      </g>
      <g
        transform="translate(150 22)"
        fill="none"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="square"
        strokeLinejoin="bevel"
        aria-hidden="true"
      >
        <path d="M0 76 25 0l25 76" />
        <path d="M70 0h50M95 0v76" />
        <path d="M145 76V0h24c15 0 24 8 24 20s-9 20-24 20h-24m24 0 30 36" />
        <path d="M224 0v76" />
        <path d="M250 0v50c0 18 8 26 25 26s25-8 25-26V0" />
        <path d="M325 76V0l32.5 43L390 0v76" />
      </g>
    </svg>
  );
}
