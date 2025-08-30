"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "./Button";
import { createGame } from "../lib/storage";

export default function CreateGameForm() {
  const router = useRouter();
  const [playerNames, setPlayerNames] = useState(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Validate that all player names are filled
    if (playerNames.some((name) => name.trim() === "")) {
      alert("Please fill in all player names");
      return;
    }

    if (playerNames.length < 2) {
      alert("You need at least 2 players");
      return;
    }

    setIsSubmitting(true);

    try {
      const newGame = createGame({
        playerNames: playerNames.map((name) => name.trim()),
      });

      // Redirect to the new game
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

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating Game..." : "Start Game"}
        </Button>
      </form>
    </div>
  );
}
