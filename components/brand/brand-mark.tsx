import { useId, type SVGProps } from "react";

import { cn } from "@/lib/utils";

export type BrandSurface = "light" | "dark";

type BrandSvgProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  surface?: BrandSurface;
  decorative?: boolean;
  title?: string;
};

type AtriumMarkArtworkProps = {
  gradientIdPrefix: string;
};

export function AtriumMarkArtwork({
  gradientIdPrefix,
}: AtriumMarkArtworkProps) {
  const leftGradientId = `${gradientIdPrefix}-left`;
  const rightGradientId = `${gradientIdPrefix}-right`;
  const archGradientId = `${gradientIdPrefix}-arch`;

  return (
    <>
      <defs>
        <linearGradient
          id={leftGradientId}
          x1="70"
          y1="420"
          x2="310"
          y2="35"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1677FF" />
          <stop offset="1" stopColor="#27C8F5" />
        </linearGradient>
        <linearGradient
          id={rightGradientId}
          x1="298"
          y1="38"
          x2="520"
          y2="420"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1757E8" />
          <stop offset="0.55" stopColor="#1677FF" />
          <stop offset="1" stopColor="#1757E8" />
        </linearGradient>
        <linearGradient
          id={archGradientId}
          x1="38"
          y1="410"
          x2="526"
          y2="270"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1677FF" />
          <stop offset="0.48" stopColor="#27C8F5" />
          <stop offset="1" stopColor="#1757E8" />
        </linearGradient>
      </defs>

      <path
        fill={`url(#${rightGradientId})`}
        d="M294 38c25 0 45 14 58 38l190 344H432L259 108l17-34c7-14 10-22 18-36Z"
      />
      <path
        fill={`url(#${leftGradientId})`}
        d="M39 420 215 76c12-24 32-38 59-38h36L166 320l-50 100H39Z"
      />
      <path
        fill={`url(#${archGradientId})`}
        d="M39 420 109 293c40-72 105-111 183-111 80 0 146 39 186 111l70 127H438l-46-85c-22-41-57-62-100-62-42 0-77 21-99 62l-46 85H39Z"
      />
    </>
  );
}

export function BrandMark({
  surface = "light",
  decorative = false,
  title = "Atrium",
  className,
  ...props
}: BrandSvgProps) {
  const reactId = useId().replaceAll(":", "");
  const titleId = `atrium-mark-title-${reactId}`;

  return (
    <svg
      viewBox="0 0 560 460"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      aria-hidden={decorative || undefined}
      aria-labelledby={decorative ? undefined : titleId}
      role={decorative ? undefined : "img"}
      data-brand-mark=""
      data-surface={surface}
      className={cn("block", className)}
      {...props}
    >
      {decorative ? null : <title id={titleId}>{title}</title>}
      <AtriumMarkArtwork gradientIdPrefix={`atrium-mark-${reactId}`} />
    </svg>
  );
}
