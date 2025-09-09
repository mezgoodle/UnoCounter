import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../app/page";

test("Page", () => {
  render(<Page />);
  expect(
    screen.getByRole("heading", { level: 1, name: "🃏 UNO Score Tracker" })
  ).toBeDefined();
  expect(
    screen.getByRole("heading", { level: 2, name: "Create New Game" })
  ).toBeDefined();
});
