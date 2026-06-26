"use client";

import React, { useState, useRef } from "react";
import { Game, Player } from "../types/game";

interface ScoreChartProps {
  game: Game;
}

const PLAYER_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald Green
  "#EF4444", // Red
  "#F59E0B", // Amber/Yellow
  "#8B5CF6", // Violet/Purple
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#6366F1", // Indigo
];

export default function ScoreChart({ game }: ScoreChartProps) {
  const [hiddenPlayerIds, setHiddenPlayerIds] = useState<string[]>([]);
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);
  const [hoveredRound, setHoveredRound] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    round: number;
    x: number;
    y: number;
  }>({
    visible: false,
    round: 0,
    x: 0,
    y: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const N = game.rounds.length;

  // We need at least one round to display a progression line chart (Round 0 to Round N)
  if (N === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Score Progression Chart</h2>
        <p className="text-gray-500">Play at least one round to see the progression chart.</p>
      </div>
    );
  }

  // Get color for player based on their index in the original list
  const getPlayerColor = (playerId: string) => {
    const idx = game.players.findIndex((p) => p.id === playerId);
    return PLAYER_COLORS[idx % PLAYER_COLORS.length];
  };

  // Reconstruct score history for all players
  const playerProgressions = game.players.map((player) => {
    // 1. Calculate sum of scores in all recorded rounds
    const roundScores = game.rounds.map((round) => {
      const match = round.scores.find((s) => s.playerId === player.id);
      return match ? match.score : undefined;
    });

    const sumOfRoundScores = roundScores.reduce<number>(
      (sum, score) => sum + (score || 0),
      0
    );

    // 2. Derive starting score: totalScore = startingScore + sumOfRoundScores
    const startingScore = player.totalScore - sumOfRoundScores;

    // 3. Find first round index where player has a recorded score
    const firstActiveRoundIndex = game.rounds.findIndex((round) =>
      round.scores.some((s) => s.playerId === player.id)
    );
    const activeStart = firstActiveRoundIndex === -1 ? N : firstActiveRoundIndex;

    // 4. Fill history array: [0..N]
    const scores: (number | undefined)[] = new Array(N + 1).fill(undefined);
    scores[activeStart] = startingScore;

    for (let r = activeStart + 1; r <= N; r++) {
      const roundScore =
        game.rounds[r - 1].scores.find((s) => s.playerId === player.id)?.score || 0;
      scores[r] = (scores[r - 1] as number) + roundScore;
    }

    return {
      player,
      scores,
      activeStart,
      color: getPlayerColor(player.id),
    };
  });

  // Filter based on active (visible) players
  const visibleProgressions = playerProgressions.filter(
    (p) => !hiddenPlayerIds.includes(p.player.id)
  );

  // Find min/max scores for visible lines to scale Y-axis
  let allVisibleScores: number[] = [];
  visibleProgressions.forEach((p) => {
    p.scores.forEach((score) => {
      if (score !== undefined) {
        allVisibleScores.push(score);
      }
    });
  });

  if (allVisibleScores.length === 0) {
    allVisibleScores = [0, 100];
  }

  const rawMin = Math.min(...allVisibleScores);
  const rawMax = Math.max(...allVisibleScores);
  const range = rawMax - rawMin;
  const paddingPercent = range === 0 ? 20 : Math.ceil(range * 0.1);
  const yMinVal = rawMin < 0 ? rawMin - paddingPercent : Math.max(0, rawMin - paddingPercent);
  const yMaxVal = rawMax + paddingPercent;

  // ViewBox layout details
  const viewBoxWidth = 600;
  const viewBoxHeight = 350;
  const paddingTop = 30;
  const paddingRight = 30;
  const paddingBottom = 40;
  const paddingLeft = 50;

  const plotWidth = viewBoxWidth - paddingLeft - paddingRight;
  const plotHeight = viewBoxHeight - paddingTop - paddingBottom;

  // Coordinate mapping functions
  const getX = (r: number) => paddingLeft + (r / N) * plotWidth;
  const getY = (val: number) => {
    if (yMaxVal === yMinVal) return paddingTop + plotHeight / 2;
    return viewBoxHeight - paddingBottom - ((val - yMinVal) / (yMaxVal - yMinVal)) * plotHeight;
  };

  // Generate unique grid line values
  const gridLines = Array.from(
    new Set(
      Array.from({ length: 5 }, (_, i) => {
        const val = yMinVal + (i / 4) * (yMaxVal - yMinVal);
        return Math.round(val);
      })
    )
  ).sort((a, b) => a - b);

  // Legend toggle handlers
  const togglePlayerVisibility = (playerId: string) => {
    setHiddenPlayerIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  // Mouse interactivity handlers
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Map mouseX back to viewBox coordinate system
    const relativeX = (mouseX / rect.width) * viewBoxWidth;

    // Calculate nearest round
    const r = Math.round(((relativeX - paddingLeft) / plotWidth) * N);
    const clampedRound = Math.max(0, Math.min(N, r));

    // Get position in container coordinates for HTML Tooltip positioning
    const containerRect = containerRef.current.getBoundingClientRect();
    const tooltipX = e.clientX - containerRect.left;
    const tooltipY = e.clientY - containerRect.top;

    setHoveredRound(clampedRound);
    setTooltip({
      visible: true,
      round: clampedRound,
      x: tooltipX,
      y: tooltipY,
    });
  };

  const handleMouseLeave = () => {
    setHoveredRound(null);
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  // Prepare data for the tooltip leaderboard list
  const getTooltipData = () => {
    if (hoveredRound === null) return [];
    
    return playerProgressions
      .map((prog) => {
        const score = prog.scores[hoveredRound];
        // Calculate points gained in this round
        let roundDiff = 0;
        if (hoveredRound > 0 && score !== undefined) {
          const prevScore = prog.scores[hoveredRound - 1];
          if (prevScore !== undefined) {
            roundDiff = score - prevScore;
          } else {
            // Joined this round
            roundDiff = score - (prog.scores[prog.activeStart] || 0);
          }
        }
        return {
          player: prog.player,
          score,
          diff: roundDiff,
          color: prog.color,
          visible: !hiddenPlayerIds.includes(prog.player.id),
        };
      })
      .filter((p) => p.score !== undefined) // Only show active players at this round
      .sort((a, b) => (b.score as number) - (a.score as number));
  };

  // SVG drawing logic for player lines
  const drawLinePath = (scores: (number | undefined)[]) => {
    let path = "";
    let isDrawing = false;

    scores.forEach((score, r) => {
      if (score !== undefined) {
        const x = getX(r);
        const y = getY(score);
        if (!isDrawing) {
          path += `M ${x} ${y}`;
          isDrawing = true;
        } else {
          path += ` L ${x} ${y}`;
        }
      }
    });

    return path;
  };

  const tooltipData = getTooltipData();
  const labelInterval = N > 12 ? Math.ceil(N / 6) : 1;

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-lg shadow-md p-6 mb-8 relative select-none"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Score Progression Chart</h2>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6" data-testid="chart-legend">
        {playerProgressions.map((prog) => {
          const isHidden = hiddenPlayerIds.includes(prog.player.id);
          const isDimmed =
            hoveredPlayerId !== null && hoveredPlayerId !== prog.player.id;

          return (
            <button
              key={prog.player.id}
              onClick={() => togglePlayerVisibility(prog.player.id)}
              onMouseEnter={() => setHoveredPlayerId(prog.player.id)}
              onMouseLeave={() => setHoveredPlayerId(null)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                isHidden
                  ? "bg-gray-50 text-gray-400 border-gray-200 line-through"
                  : "bg-white border-gray-300 text-gray-700"
              } ${isDimmed ? "opacity-40" : "opacity-100"}`}
              style={{
                borderColor: isHidden ? undefined : prog.color,
                boxShadow: isHidden
                  ? undefined
                  : `0 1px 2px 0 ${prog.color}15`,
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: isHidden ? "#9CA3AF" : prog.color,
                }}
              />
              <span>{prog.player.name}</span>
            </button>
          );
        })}
      </div>

      {visibleProgressions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-500 text-sm">Select at least one player in the legend to display the chart.</p>
        </div>
      ) : (
        <div className="relative">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            width="100%"
            height="auto"
            className="overflow-visible animate-fade-in"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            data-testid="score-progression-svg"
          >
            {/* Horizontal Grid Lines */}
            <g className="grid-lines">
              {gridLines.map((val) => (
                <g key={val}>
                  <line
                    x1={paddingLeft}
                    y1={getY(val)}
                    x2={viewBoxWidth - paddingRight}
                    y2={getY(val)}
                    stroke="#F3F4F6"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingLeft - 10}
                    y={getY(val) + 4}
                    textAnchor="end"
                    className="text-[10px] fill-gray-400 font-medium font-sans"
                  >
                    {val}
                  </text>
                </g>
              ))}
            </g>

            {/* X-axis Labels */}
            <g className="x-axis-labels">
              {Array.from({ length: N + 1 }).map((_, r) => {
                if (r % labelInterval !== 0) return null;
                const label = r === 0 ? "Start" : `R${r}`;
                return (
                  <text
                    key={r}
                    x={getX(r)}
                    y={viewBoxHeight - paddingBottom + 18}
                    textAnchor="middle"
                    className="text-[10px] fill-gray-400 font-medium font-sans"
                  >
                    {label}
                  </text>
                );
              })}
            </g>

            {/* Vertical Cursor Line */}
            {hoveredRound !== null && (
              <line
                x1={getX(hoveredRound)}
                y1={paddingTop}
                x2={getX(hoveredRound)}
                y2={viewBoxHeight - paddingBottom}
                stroke="#9CA3AF"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                className="pointer-events-none"
              />
            )}

            {/* Player Lines */}
            {visibleProgressions.map((prog) => {
              const isHovered = hoveredPlayerId === prog.player.id;
              const isAnyHovered = hoveredPlayerId !== null;
              const opacity = isHovered ? 1 : isAnyHovered ? 0.15 : 0.85;
              const strokeWidth = isHovered ? 3.5 : 2;

              return (
                <path
                  key={prog.player.id}
                  d={drawLinePath(prog.scores)}
                  fill="none"
                  stroke={prog.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity, transition: "stroke-width 0.2s, opacity 0.2s" }}
                  data-testid={`player-line-${prog.player.id}`}
                />
              );
            })}

            {/* Data Points */}
            {visibleProgressions.map((prog) => {
              const isHovered = hoveredPlayerId === prog.player.id;
              const isAnyHovered = hoveredPlayerId !== null;
              const opacity = isHovered ? 1 : isAnyHovered ? 0.15 : 0.9;

              return (
                <g
                  key={prog.player.id}
                  style={{ opacity, transition: "opacity 0.2s" }}
                  data-testid={`player-dots-${prog.player.id}`}
                >
                  {prog.scores.map((score, r) => {
                    if (score === undefined) return null;
                    const isDotHovered = hoveredRound === r;

                    return (
                      <circle
                        key={r}
                        cx={getX(r)}
                        cy={getY(score)}
                        r={isDotHovered ? 5 : 3.5}
                        fill="#FFFFFF"
                        stroke={prog.color}
                        strokeWidth={isDotHovered ? 2.5 : 1.5}
                        className="transition-all duration-150 ease-out cursor-pointer"
                        onMouseEnter={() => setHoveredPlayerId(prog.player.id)}
                        onMouseLeave={() => setHoveredPlayerId(null)}
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip (HTML overlay) */}
          {tooltip.visible && hoveredRound !== null && (
            <div
              className="absolute pointer-events-none bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-xl p-3 z-30 flex flex-col gap-2 min-w-44 text-xs font-sans transition-all duration-75"
              style={{
                left: `${tooltip.x + 15}px`,
                top: `${tooltip.y - 40}px`,
                transform: `translateY(-50%)`,
              }}
              data-testid="chart-tooltip"
            >
              <div className="font-semibold text-gray-900 border-b border-gray-100 pb-1 mb-1">
                {tooltip.round === 0 ? "Start of Game" : `Round ${tooltip.round}`}
              </div>
              <div className="flex flex-col gap-1.5">
                {tooltipData.map((item) => (
                  <div
                    key={item.player.id}
                    className={`flex items-center justify-between gap-4 ${
                      item.visible ? "opacity-100" : "opacity-40"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-gray-700">
                        {item.player.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-gray-900">
                      <span>{item.score}</span>
                      {tooltip.round > 0 && item.diff !== 0 && (
                        <span className="text-[10px] font-normal text-gray-400">
                          ({item.diff > 0 ? `+${item.diff}` : item.diff})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
