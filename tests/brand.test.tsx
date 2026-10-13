import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { BrandLogo, BrandMark } from "@/components/brand";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

afterEach(() => cleanup());

describe("Atrium brand components", () => {
  it("renders the official mark with an accessible title", () => {
    render(<BrandMark title="Símbolo Atrium" />);

    const mark = screen.getByRole("img", { name: "Símbolo Atrium" });
    expect(mark).toHaveAttribute("data-brand-mark");
    expect(mark).toHaveAttribute("data-surface", "light");
    expect(mark.querySelectorAll("linearGradient")).toHaveLength(3);
  });

  it("supports light and dark logo surfaces", () => {
    const { container } = render(
      <>
        <BrandLogo title="Atrium claro" surface="light" />
        <BrandLogo title="Atrium escuro" surface="dark" />
      </>,
    );

    expect(screen.getByRole("img", { name: "Atrium claro" })).toHaveClass(
      "text-brand-navy",
    );
    expect(screen.getByRole("img", { name: "Atrium escuro" })).toHaveClass(
      "text-brand-off-white",
    );
    const gradientIds = Array.from(
      container.querySelectorAll("linearGradient"),
      (gradient) => gradient.id,
    );
    expect(new Set(gradientIds).size).toBe(gradientIds.length);
  });

  it("removes accessible naming and text when decorative", () => {
    const { container } = render(<BrandLogo decorative />);

    const logo = container.querySelector("[data-brand-logo]");
    expect(logo).toHaveAttribute("aria-hidden", "true");
    expect(logo).not.toHaveAttribute("role");
    expect(logo?.querySelector("title")).toBeNull();
    expect(screen.queryByText("Atrium")).not.toBeInTheDocument();
  });

  it("uses the centralized logo in the public navbar and footer", () => {
    const { container } = render(
      <>
        <Navbar />
        <Footer />
      </>,
    );

    const logos = container.querySelectorAll("[data-brand-logo]");
    expect(logos).toHaveLength(2);
    expect(logos[0]).toHaveAttribute("data-surface", "light");
    expect(logos[1]).toHaveAttribute("data-surface", "dark");
    expect(container.querySelector(".bg-gold-500")).toBeNull();
  });
});
