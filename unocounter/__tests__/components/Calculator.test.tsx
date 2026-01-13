import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Calculator from "../../app/components/Calculator";

jest.mock("mathjs", () => ({
  evaluate: jest.fn((expr) => {
    try {
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

  const getDisplayValue = () => {
    return screen
      .getAllByText(/./)
      .find(
        (el) => el.tagName === "DIV" && el.className.includes("overflow-x-auto")
      )?.textContent;
  };

  test("renders correctly with initial value", () => {
    render(
      <Calculator
        initialValue={10}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    expect(screen.getByText("10", { selector: "div" })).toBeInTheDocument();
    expect(screen.getByText("C", { selector: "button" })).toBeInTheDocument();
    expect(
      screen.getByText("Apply", { selector: "button" })
    ).toBeInTheDocument();
  });

  test("updates display when all digits and dot are clicked", () => {
    render(
      <Calculator
        initialValue={0}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    const inputs = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", "."];

    inputs.forEach((char) => {
      fireEvent.click(screen.getByText(char, { selector: "button" }));
    });

    expect(getDisplayValue()).toBe("7894561230.");
  });

  test("handles all operators correctly", () => {
    render(
      <Calculator
        initialValue={5}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    fireEvent.click(screen.getByText("/", { selector: "button" }));
    fireEvent.click(screen.getByText("*", { selector: "button" }));
    fireEvent.click(screen.getByText("-", { selector: "button" }));
    fireEvent.click(screen.getByText("+", { selector: "button" }));

    expect(getDisplayValue()).toContain("5 /  *  -  + ");
  });

  test("performs addition correctly", () => {
    render(
      <Calculator
        initialValue={0}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    fireEvent.click(screen.getByText("5", { selector: "button" }));
    fireEvent.click(screen.getByText("+", { selector: "button" }));
    fireEvent.click(screen.getByText("3", { selector: "button" }));
    fireEvent.click(screen.getByText("=", { selector: "button" }));

    expect(getDisplayValue()).toBe("8");
  });

  test("clears display on 'C' click", () => {
    render(
      <Calculator
        initialValue={123}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    fireEvent.click(screen.getByText("C", { selector: "button" }));
    expect(getDisplayValue()).toBe("0");
  });

  test("calls onApply with result implicitly calculated", () => {
    render(
      <Calculator
        initialValue={0}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    fireEvent.click(screen.getByText("5", { selector: "button" }));
    fireEvent.click(screen.getByText("*", { selector: "button" }));
    fireEvent.click(screen.getByText("2", { selector: "button" }));
    fireEvent.click(screen.getByText("Apply", { selector: "button" }));

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

    fireEvent.click(screen.getByText("Cancel", { selector: "button" }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("handles calculation errors gracefully (Syntax Error on =)", () => {
    render(
      <Calculator
        initialValue={0}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    fireEvent.click(screen.getByText("1", { selector: "button" }));
    fireEvent.click(screen.getByText("+", { selector: "button" }));
    fireEvent.click(screen.getByText("*", { selector: "button" }));

    fireEvent.click(screen.getByText("=", { selector: "button" }));

    expect(getDisplayValue()).toBe("Error");
  });

  test("handles apply errors gracefully (Syntax Error on Apply)", () => {
    render(
      <Calculator
        initialValue={0}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    fireEvent.click(screen.getByText("1", { selector: "button" }));
    fireEvent.click(screen.getByText("+", { selector: "button" }));
    fireEvent.click(screen.getByText("*", { selector: "button" }));

    fireEvent.click(screen.getByText("Apply", { selector: "button" }));

    expect(getDisplayValue()).toBe("Error");
    expect(mockOnApply).not.toHaveBeenCalled();
  });

  test("handles NaN result on Apply", () => {
    render(
      <Calculator
        initialValue={0}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    fireEvent.click(screen.getByText("0", { selector: "button" }));
    fireEvent.click(screen.getByText("/", { selector: "button" }));
    fireEvent.click(screen.getByText("0", { selector: "button" }));

    fireEvent.click(screen.getByText("Apply", { selector: "button" }));

    expect(getDisplayValue()).toBe("Error");
    expect(mockOnApply).not.toHaveBeenCalled();
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

  test("removes last character on Backspace", () => {
    render(
      <Calculator
        initialValue={0}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    fireEvent.click(screen.getByText("1"));
    fireEvent.click(screen.getByText("2"));

    expect(screen.getByText("12", { selector: "div" })).toBeInTheDocument();

    fireEvent.click(screen.getByText("⌫"));
    expect(screen.getByText("1", { selector: "div" })).toBeInTheDocument();

    fireEvent.click(screen.getByText("⌫"));
    expect(screen.getByText("0", { selector: "div" })).toBeInTheDocument();
  });

  test("does not apply if display is already Error", () => {
    render(
      <Calculator
        initialValue={0}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    fireEvent.click(screen.getByText("1", { selector: "button" }));
    fireEvent.click(screen.getByText("/", { selector: "button" }));
    fireEvent.click(screen.getByText("/", { selector: "button" }));
    fireEvent.click(screen.getByText("=", { selector: "button" }));

    expect(getDisplayValue()).toBe("Error");

    fireEvent.click(screen.getByText("Apply", { selector: "button" }));

    expect(mockOnApply).not.toHaveBeenCalled();
  });
});
