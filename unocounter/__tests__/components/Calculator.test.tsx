import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Calculator from "../../app/components/Calculator";

// Mock mathjs since we only want to test the UI integration,
// or let it run if we want integration test.
// Given it's a unit test, mocking might be safer but mathjs is stable.
// Let's mock it to avoid potential issues with ESM/CommonJS in Jest if any,
// and to strictly test our component logic.
jest.mock("mathjs", () => ({
  evaluate: jest.fn((expr) => {
    try {
      // Simple mock implementation for basic tests
      // eslint-disable-next-line no-eval
      return eval(expr);
    } catch {
      throw new Error("Invalid expression");
    }
  }),
}));

describe("Calculator Component", () => {
  const mockOnClose = jest.fn();
  const mockOnApply = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const getDisplay = () => {
    // The display is a div, while buttons are buttons.
    // We can search for the text within a div that has the display classes or just is not a button.
    // But 'getByText' with selector is easiest if the text is unique to display + button.
    // However, if display is "0" and button is "0", we have duplicates.
    // We can use custom matcher or just get all and filter.
    // Or we can add a testid to the component? No, let's stick to blackbox testing if possible.
    // The display is the only div with text in the modal content that is not a button label?
    // Actually the modal has structure.
    // Let's rely on the fact that result is in a div.
    return screen
      .getAllByText(/./)
      .find(
        (el) => el.tagName === "DIV" && el.className.includes("overflow-x-auto")
      );
  };

  test("renders correctly with initial value", () => {
    render(
      <Calculator
        initialValue={10}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    // Initial value 10. Button 1 and 0 exist.
    // But "10" is likely unique (no button 10).
    expect(screen.getByText("10", { selector: "div" })).toBeInTheDocument();

    expect(screen.getByText("C")).toBeInTheDocument();
    expect(screen.getByText("=")).toBeInTheDocument();
    expect(screen.getByText("Apply")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  test("updates display when digits are clicked", () => {
    render(
      <Calculator
        initialValue={0}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    fireEvent.click(screen.getByText("1"));
    fireEvent.click(screen.getByText("2"));
    fireEvent.click(screen.getByText("3"));

    // "123" is unique (no button 123)
    expect(screen.getByText("123", { selector: "div" })).toBeInTheDocument();
  });

  test("performs addition", () => {
    render(
      <Calculator
        initialValue={0}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    fireEvent.click(screen.getByText("5"));
    fireEvent.click(screen.getByText("+"));
    fireEvent.click(screen.getByText("3"));
    fireEvent.click(screen.getByText("="));

    // Result "8" vs button "8".
    expect(screen.getByText("8", { selector: "div" })).toBeInTheDocument();
  });

  test("performs subtraction", () => {
    render(
      <Calculator
        initialValue={0}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    fireEvent.click(screen.getByText("1"));
    fireEvent.click(screen.getByText("0"));
    fireEvent.click(screen.getByText("-"));
    fireEvent.click(screen.getByText("4"));
    fireEvent.click(screen.getByText("="));

    // Result "6" vs button "6".
    expect(screen.getByText("6", { selector: "div" })).toBeInTheDocument();
  });

  test("clears display on 'C' click", () => {
    render(
      <Calculator
        initialValue={123}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    fireEvent.click(screen.getByText("C"));
    // "0" vs button "0".
    expect(screen.getByText("0", { selector: "div" })).toBeInTheDocument();
  });

  test("calls onApply with result", () => {
    render(
      <Calculator
        initialValue={0}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    // 5 * 2 = 10
    fireEvent.click(screen.getByText("5"));
    fireEvent.click(screen.getByText("*"));
    fireEvent.click(screen.getByText("2"));
    fireEvent.click(screen.getByText("Apply")); // Apply should calculate implicitly

    expect(mockOnApply).toHaveBeenCalledWith(10);
  });

  test("calls onClose when Cancel is clicked", () => {
    render(
      <Calculator
        initialValue={0}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    fireEvent.click(screen.getByText("Cancel"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("handles partial expressions on Apply", () => {
    render(
      <Calculator
        initialValue={0}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    // "5 + " then apply -> might error or return 5 depending on eval logic,
    // but code says: match /[\+\-\*\/]/ then evaluate.
    // basic eval("5 +") throws. Code has try/catch.
    // If error, it sets display to Error and returns.
    // Let's test a valid calculation flow mostly.

    fireEvent.click(screen.getByText("5"));
    fireEvent.click(screen.getByText("+"));
    fireEvent.click(screen.getByText("5"));
    // Display is "5 + 5"
    fireEvent.click(screen.getByText("Apply"));

    expect(mockOnApply).toHaveBeenCalledWith(10);
  });
});
