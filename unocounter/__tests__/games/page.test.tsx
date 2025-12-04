import { render } from "@testing-library/react";
import GameList from "../../app/games/page";
import { redirect } from "next/navigation";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("GameList Page", () => {
  test("redirects to home page", () => {
    try {
      render(<GameList />);
    } catch (e) {
      // redirect throws an error in Next.js, so we catch it
    }
    expect(redirect).toHaveBeenCalledWith("/");
  });
});
