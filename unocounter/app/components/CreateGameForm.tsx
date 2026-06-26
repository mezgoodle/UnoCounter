"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "./Button";
import { createGame } from "../lib/storage";

export default function CreateGameForm() {
  const router = useRouter();
  const [playerNames, setPlayerNames] = useState(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasLimit, setHasLimit] = useState(false);
  const [maxScore, setMaxScore] = useState<number | "">(500);

  const addPlayer = () => {
    setPlayerNames([...playerNames, ""]);
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 2) {
      setPlayerNames(playerNames.filter((_, i) => i !== index));
    }
  };

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (playerNames.some((name) => name.trim() === "")) {
      alert("Please fill in all player names");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const parsedMaxScore = hasLimit ? (typeof maxScore === "number" && !Number.isNaN(maxScore) ? Math.max(1, maxScore) : 500) : undefined;
      const newGame = createGame({
        playerNames: playerNames.map((name) => name.trim()),
        maxScore: parsedMaxScore,
      });

      router.push(`/games/${newGame.id}`);
    } catch (error) {
      console.error("Error creating game:", error);
      alert("Failed to create game. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Create New UNO Game
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Player Names
          </label>

          {playerNames.map((name, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => updatePlayerName(index, e.target.value)}
                placeholder={`Player ${index + 1}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {playerNames.length > 2 && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removePlayer(index)}
                  className="px-3"
                >
                  ×
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={addPlayer}
          className="w-full"
        >
          + Add Player
        </Button>

        {/* Point Limit Option */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center">
            <input
              id="set-limit"
              type="checkbox"
              checked={hasLimit}
              onChange={(e) => setHasLimit(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="set-limit" className="ml-2 block text-sm text-gray-900 font-medium">
              Set maximum score limit
            </label>
          </div>

          {hasLimit && (
            <div className="mt-3">
              <label htmlFor="max-score" className="block text-sm font-medium text-gray-700 mb-1">
                Max Score Limit (Game ends when reached)
              </label>
              <input
                id="max-score"
                type="number"
                min="1"
                value={maxScore}
                onChange={(e) => {
                  const val = e.target.value;
                  setMaxScore(val === "" ? "" : parseInt(val, 10));
                }}
                onBlur={() => {
                  if (maxScore === "" || Number.isNaN(maxScore)) {
                    setMaxScore(500);
                  } else {
                    setMaxScore(Math.max(1, maxScore));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating Game..." : "Start Game"}
        </Button>
      </form>
    </div>
  );
}
