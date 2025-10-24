import React from "react";
import Link from "next/link";
import { Game } from "../types/game";
import Button from "./Button";

interface GameCardProps {
  game: Game;
  onDelete?: (gameId: string) => void;
}

export default function GameCard({ game, onDelete }: GameCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getTotalRounds = () => game.rounds.length;

  const getWinner = () => {
    if (!game.players.length) return null;
    return game.players.reduce((prev, current) =>
      prev.totalScore < current.totalScore ? prev : current
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Game #{game.id.slice(-6)}
          </h3>
          <p className="text-sm text-gray-500">{formatDate(game.createdAt)}</p>
        </div>

        <div className="flex items-center gap-2">
          {game.isActive ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Finished
            </span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          <strong>{game.players.length}</strong> players •{" "}
          <strong>{getTotalRounds()}</strong> rounds
        </p>

        <div className="space-y-1">
          {game.players.map((player) => (
            <div key={player.id} className="flex justify-between text-sm">
              <span className="text-gray-700">{player.name}</span>
              <span className="font-medium text-gray-900">
                {player.totalScore}
              </span>
            </div>
          ))}
        </div>
      </div>

      {!game.isActive && getWinner() && (
        <div data-testid="winner-container" className="mb-4 p-3 bg-yellow-50 rounded-md">
          <p className="text-sm text-yellow-800">
            🏆 Winner: <strong>{getWinner()?.name}</strong> (
            {getWinner()?.totalScore} points)
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Link href={`/games/${game.id}`} className="flex-1">
          <Button variant="primary" className="w-full">
            {game.isActive ? "Continue Game" : "View Game"}
          </Button>
        </Link>

        {onDelete && (
          <Button variant="danger" size="sm" onClick={() => onDelete(game.id)}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
