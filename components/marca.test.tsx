import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Marca } from "./marca";

describe("Marca", () => {
  it("renders the {x} brand icon with an accessible name", () => {
    render(<Marca />);
    expect(screen.getByRole("img", { name: "ne{s,x}t" })).toBeInTheDocument();
  });
});
