"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../../components/Button";
import Calculator from "../../components/Calculator";
import { Game } from "../../types/game";
import { getGame, addRound, endGame } from "../../lib/storage";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [roundScores, setRoundScores] = useState<{
    [playerId: string]: number;
  }>({});
  const [activeCalculatorPlayerId, setActiveCalculatorPlayerId] = useState<
    string | null
  >(null);

  const gameId = params.game as string;

  useEffect(() => {
    const loadGame = () => {
      const loadedGame = getGame(gameId);
      if (!loadedGame) {
        alert("Game not found");
        router.push("/");
        return;
      }
      setGame(loadedGame);
      setLoading(false);

      // Initialize round scores with 0 for all players
      const initialScores: { [playerId: string]: number } = {};
      loadedGame.players.forEach((player) => {
        initialScores[player.id] = 0;
      });
      setRoundScores(initialScores);
    };

    loadGame();
  }, [gameId, router]);

  const handleScoreChange = (playerId: string, score: string) => {
    const numScore = parseInt(score) || 0;
    setRoundScores((prev) => ({
      ...prev,
      [playerId]: numScore,
    }));
  };

  const handleCalculatorApply = (val: number) => {
    if (activeCalculatorPlayerId) {
      setRoundScores((prev) => ({
        ...prev,
        [activeCalculatorPlayerId]: val,
      }));
      setActiveCalculatorPlayerId(null);
    }
  };

  const handleSubmitRound = () => {
    if (!game) return;

    const scores = Object.entries(roundScores).map(([playerId, score]) => ({
      playerId,
      score,
    }));

    const updatedGame = addRound(gameId, { scores });
    if (updatedGame) {
      setGame(updatedGame);
      setShowScoreForm(false);

      // Reset round scores
      const resetScores: { [playerId: string]: number } = {};
      updatedGame.players.forEach((player) => {
        resetScores[player.id] = 0;
      });
      setRoundScores(resetScores);
    }
  };

  const handleEndGame = () => {
    if (!game || !confirm("Are you sure you want to end this game?")) return;

    const updatedGame = endGame(gameId);
    if (updatedGame) {
      setGame(updatedGame);
    }
  };

  const DealerBadge = () => (
    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
      Dealer
    </span>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-red-600 mb-4">Game not found</div>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getWinner = () => {
    if (!game.players.length) return null;
    return game.players.reduce(
      (prev: Game["players"][0], current: Game["players"][0]) =>
        prev.totalScore < current.totalScore ? prev : current,
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
            >
              ← Back to Games
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              UNO Game #{game.id.slice(-6)}
            </h1>
            <p className="text-gray-600">
              Created {new Date(game.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex gap-3">
            {game.isActive && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setShowScoreForm(!showScoreForm)}
                >
                  {showScoreForm ? "Cancel" : "Add Round Scores"}
                </Button>
                <Button variant="danger" onClick={handleEndGame}>
                  End Game
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Game Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Game Status</h2>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                game.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {game.isActive ? "Active" : "Finished"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Current Turn:</span>
              <span className="ml-2 font-medium">{game.currentTurn}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Rounds:</span>
              <span className="ml-2 font-medium">{game.rounds.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Players:</span>
              <span className="ml-2 font-medium">{game.players.length}</span>
            </div>
          </div>
        </div>

        {/* Score Form */}
        {showScoreForm && game.isActive && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Round {game.currentTurn} Scores
            </h3>

            <div className="space-y-4">
              {game.players.map((player) => (
                <div key={player.id} className="flex items-center gap-4">
                  <label className="flex-1 text-sm font-medium text-gray-700">
                    {player.name}
                    {game.dealerId === player.id && <DealerBadge />}
                  </label>
                  <div className="flex gap-2 w-full">
                    <input
                      type="number"
                      value={roundScores[player.id] || ""}
                      onChange={(e) =>
                        handleScoreChange(player.id, e.target.value)
                      }
                      placeholder="0"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Button
                      variant="secondary"
                      onClick={() => setActiveCalculatorPlayerId(player.id)}
                      className="!px-3"
                    >
                      🧮
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={handleSubmitRound}>Submit Round</Button>
              <Button
                variant="secondary"
                onClick={() => setShowScoreForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {activeCalculatorPlayerId && (
          <Calculator
            initialValue={roundScores[activeCalculatorPlayerId] || 0}
            onClose={() => setActiveCalculatorPlayerId(null)}
            onApply={(value) => handleCalculatorApply(value)}
          />
        )}

        {/* Player Scores */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Player Scores
          </h2>

          <div className="space-y-3">
            {game.players.map((player: Game["players"][0], index: number) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400 w-8">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900">
                    {player.name}
                  </span>
                  {game.dealerId === player.id && <DealerBadge />}
                  {getWinner()?.id === player.id && (
                    <span className="text-yellow-600">🏆</span>
                  )}
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {player.totalScore}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Round History */}
        {game.rounds.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Round History
            </h2>

            <div className="space-y-4">
              {game.rounds
                .slice()
                .reverse()
                .map((round: Game["rounds"][0]) => (
                  <div
                    key={round.turnNumber}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-900">
                        Round {round.turnNumber}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {new Date(round.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {round.scores.map(
                        (score: { playerId: string; score: number }) => {
                          const player = game.players.find(
                            (p: Game["players"][0]) => p.id === score.playerId,
                          );
                          return (
                            <div key={score.playerId} className="text-sm">
                              <span className="text-gray-600">
                                {player?.name}:
                              </span>
                              <span className="ml-1 font-medium">
                                {score.score}
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
