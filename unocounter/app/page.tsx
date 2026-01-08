"use client";

import React, { useState, useEffect } from "react";
import CreateGameForm from "./components/CreateGameForm";
import GameCard from "./components/GameCard";
import Button from "./components/Button";
import { Game } from "./types/game";
import { getGames, deleteGame } from "./lib/storage";

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGames(getGames());
  }, []);

  const handleDeleteGame = (gameId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this game? This action cannot be undone."
      )
    ) {
      if (deleteGame(gameId)) {
        setGames(getGames());
      }
    }
  };

  const activeGames = games.filter((game) => game.isActive);
  const finishedGames = games.filter((game) => !game.isActive);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🃏 UNO Score Tracker
          </h1>
          <p className="text-xl text-gray-600">
            Keep track of your UNO game scores and see who&apos;s winning!
          </p>
        </div>

        {/* Create Game Section */}
        <div className="mb-12">
          {!showCreateForm ? (
            <div className="text-center">
              <Button
                onClick={() => setShowCreateForm(true)}
                size="lg"
                className="px-8"
              >
                🎮 Start New Game
              </Button>
            </div>
          ) : (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Create New Game
                </h2>
                <Button
                  variant="secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
              <CreateGameForm />
            </div>
          )}
        </div>

        {/* Active Games */}
        {activeGames.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              🟢 Active Games ({activeGames.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onDelete={handleDeleteGame}
                />
              ))}
            </div>
          </div>
        )}

        {/* Finished Games */}
        {finishedGames.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              🏁 Finished Games ({finishedGames.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {finishedGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onDelete={handleDeleteGame}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {games.length === 0 && !showCreateForm && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No games yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start your first UNO game to begin tracking scores!
            </p>
            <Button onClick={() => setShowCreateForm(true)} size="lg">
              Create Your First Game
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
