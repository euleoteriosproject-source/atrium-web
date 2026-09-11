import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("M1 visual reference", () => {
  it("renders the temporary design-system heading", () => {
    render(Home());

    expect(
      screen.getByRole("heading", { level: 1, name: "Sistema visual Atrium" }),
    ).toBeInTheDocument();
  });
});
