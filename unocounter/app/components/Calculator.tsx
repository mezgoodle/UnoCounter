"use client";

import React, { useState } from "react";
import Button from "./Button";
import { evaluate } from "mathjs";

interface CalculatorProps {
  initialValue?: number;
  onClose: () => void;
  onApply: (value: number) => void;
}

export default function Calculator({
  initialValue = 0,
  onClose,
  onApply,
}: CalculatorProps) {
  const [display, setDisplay] = useState(initialValue.toString());
  const [resetNext, setResetNext] = useState(true);

  const handleDigit = (digit: string) => {
    if (resetNext) {
      setDisplay(digit);
      setResetNext(false);
    } else {
      setDisplay((prev) => (prev === "0" ? digit : prev + digit));
    }
  };

  const handleOp = (op: string) => {
    setDisplay((prev) => prev + " " + op + " ");
    setResetNext(false);
  };

  const handleClear = () => {
    setDisplay("0");
    setResetNext(true);
  };

  const handleCalculate = () => {
    try {
      const result = evaluate(display);
      setDisplay(String(result));
      setResetNext(true);
    } catch (e) {
      setDisplay("Error");
      setResetNext(true);
    }
  };

  const handleApply = () => {
    let finalValue = display;
    if (/[\+\-\*\/]/.test(display) && !display.includes("Error")) {
      try {
        finalValue = String(evaluate(display));
      } catch (e) {
        // ignore
      }
    }

    if (finalValue === "Error") return;

    onApply(parseFloat(finalValue) || 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-72">
        <div className="mb-4 text-right bg-gray-100 p-3 rounded text-2xl font-mono overflow-x-auto">
          {display}
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <button
            onClick={handleClear}
            className="col-span-1 bg-red-100 text-red-800 p-3 rounded font-bold hover:bg-red-200"
          >
            C
          </button>
          <button
            onClick={() => handleOp("/")}
            className="bg-gray-200 p-3 rounded hover:bg-gray-300"
          >
            /
          </button>
          <button
            onClick={() => handleOp("*")}
            className="bg-gray-200 p-3 rounded hover:bg-gray-300"
          >
            *
          </button>
          <button
            onClick={() => handleOp("-")}
            className="bg-gray-200 p-3 rounded hover:bg-gray-300"
          >
            -
          </button>

          <button
            onClick={() => handleDigit("7")}
            className="bg-gray-50 p-3 rounded hover:bg-gray-100"
          >
            7
          </button>
          <button
            onClick={() => handleDigit("8")}
            className="bg-gray-50 p-3 rounded hover:bg-gray-100"
          >
            8
          </button>
          <button
            onClick={() => handleDigit("9")}
            className="bg-gray-50 p-3 rounded hover:bg-gray-100"
          >
            9
          </button>
          <button
            onClick={() => handleOp("+")}
            className="bg-gray-200 p-3 rounded hover:bg-gray-300 row-span-2 flex items-center justify-center"
          >
            +
          </button>

          <button
            onClick={() => handleDigit("4")}
            className="bg-gray-50 p-3 rounded hover:bg-gray-100"
          >
            4
          </button>
          <button
            onClick={() => handleDigit("5")}
            className="bg-gray-50 p-3 rounded hover:bg-gray-100"
          >
            5
          </button>
          <button
            onClick={() => handleDigit("6")}
            className="bg-gray-50 p-3 rounded hover:bg-gray-100"
          >
            6
          </button>

          <button
            onClick={() => handleDigit("1")}
            className="bg-gray-50 p-3 rounded hover:bg-gray-100"
          >
            1
          </button>
          <button
            onClick={() => handleDigit("2")}
            className="bg-gray-50 p-3 rounded hover:bg-gray-100"
          >
            2
          </button>
          <button
            onClick={() => handleDigit("3")}
            className="bg-gray-50 p-3 rounded hover:bg-gray-100"
          >
            3
          </button>
          <button
            onClick={handleCalculate}
            className="bg-blue-100 text-blue-800 p-3 rounded font-bold hover:bg-blue-200 row-span-2 flex items-center justify-center"
          >
            =
          </button>

          <button
            onClick={() => handleDigit("0")}
            className="col-span-2 bg-gray-50 p-3 rounded hover:bg-gray-100"
          >
            0
          </button>
          <button
            onClick={() => handleDigit(".")}
            className="bg-gray-50 p-3 rounded hover:bg-gray-100"
          >
            .
          </button>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleApply} className="flex-1">
            Apply
          </Button>
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
