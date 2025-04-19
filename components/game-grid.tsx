"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { Bomb } from "@/lib/types"

interface GameGridProps {
  bombs: Bomb[]
  gridSize: number
  selectedBomb: number | null
  explosionChain: number[]
  onCellClick: (x: number, y: number) => void
  placementMode: boolean
  manhattanVisualization: {
    from: number
    to: number
    distance: number
    canDetonate: boolean
  } | null
  graphVisualization: {
    connections: { from: number; to: number }[]
    currentConnection: { from: number; to: number } | null
  } | null
  dfsVisualization: {
    stack: number[]
    visited: number[]
    current: number | null
    neighbors: number[]
  } | null
}

export default function GameGrid({
  bombs,
  gridSize,
  selectedBomb,
  explosionChain,
  onCellClick,
  placementMode,
  manhattanVisualization,
  graphVisualization,
  dfsVisualization,
}: GameGridProps) {
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null)
  const [showRadius, setShowRadius] = useState<number | null>(null)

  // Map bombs to grid positions for quick lookup
  const bombsMap = new Map<string, { index: number; bomb: Bomb }>()
  bombs.forEach((bomb, index) => {
    const key = `${bomb.x},${bomb.y}`
    bombsMap.set(key, { index, bomb })
  })

  // Calculate cell size based on grid size
  const cellSize = Math.min(500, window.innerWidth - 40) / gridSize

  return (
    <div className="relative">
      <h2 className="text-xl font-bold mb-4">Game Grid {placementMode ? "(Placement Mode)" : "(Trigger Mode)"}</h2>
      <div
        className="grid border border-gray-300 bg-gray-50 mx-auto"
        style={{
          width: `${cellSize * gridSize}px`,
          height: `${cellSize * gridSize}px`,
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
          const x = idx % gridSize
          const y = Math.floor(idx / gridSize)
          const key = `${x},${y}`
          const bombData = bombsMap.get(key)

          const isHovered = hoverCell?.x === x && hoverCell?.y === y
          const showPlacementPreview = placementMode && isHovered && !bombData

          // Check if this cell is part of DFS visualization
          const isDfsCurrent =
            dfsVisualization !== null &&
            dfsVisualization.current !== null &&
            bombs[dfsVisualization.current] &&
            bombs[dfsVisualization.current].x === x &&
            bombs[dfsVisualization.current].y === y

          const isDfsNeighbor =
            dfsVisualization !== null &&
            dfsVisualization.neighbors &&
            dfsVisualization.neighbors.some((n) => bombs[n] && bombs[n].x === x && bombs[n].y === y)

          const isDfsStack =
            dfsVisualization !== null &&
            dfsVisualization.stack &&
            dfsVisualization.stack.some((n) => bombs[n] && bombs[n].x === x && bombs[n].y === y) &&
            !isDfsCurrent &&
            !isDfsNeighbor

          return (
            <div
              key={idx}
              className={`relative border border-gray-200 flex items-center justify-center ${
                placementMode ? "cursor-pointer" : bombData ? "cursor-pointer" : "cursor-default"
              }`}
              onMouseEnter={() => {
                setHoverCell({ x, y })
                if (bombData) setShowRadius(bombData.index)
              }}
              onMouseLeave={() => {
                setHoverCell(null)
                setShowRadius(null)
              }}
              onClick={() => onCellClick(x, y)}
            >
              {/* DFS visualization */}
              {isDfsCurrent && <div className="absolute inset-0 bg-green-200 opacity-40 z-10"></div>}
              {isDfsNeighbor && <div className="absolute inset-0 bg-blue-200 opacity-40 z-10"></div>}
              {isDfsStack && <div className="absolute inset-0 bg-yellow-200 opacity-40 z-10"></div>}

              {/* Manhattan distance visualization */}
              {manhattanVisualization &&
                (bombData?.index === manhattanVisualization.from || bombData?.index === manhattanVisualization.to) && (
                  <div
                    className={`absolute inset-0 ${
                      bombData?.index === manhattanVisualization.from ? "bg-blue-200" : "bg-green-200"
                    } opacity-40 z-10`}
                  ></div>
                )}

              {/* Manhattan distance line */}
              {manhattanVisualization &&
                bombData?.index === manhattanVisualization.from &&
                bombs[manhattanVisualization.to] && (
                  <div className="absolute z-20">
                    <svg
                      width={gridSize * cellSize}
                      height={gridSize * cellSize}
                      style={{
                        position: "absolute",
                        top: -y * cellSize,
                        left: -x * cellSize,
                        pointerEvents: "none",
                      }}
                    >
                      <line
                        x1={(x + 0.5) * cellSize}
                        y1={(y + 0.5) * cellSize}
                        x2={(bombs[manhattanVisualization.to].x + 0.5) * cellSize}
                        y2={(bombs[manhattanVisualization.to].y + 0.5) * cellSize}
                        stroke={manhattanVisualization.canDetonate ? "green" : "red"}
                        strokeWidth="2"
                        strokeDasharray="4"
                      />
                    </svg>
                  </div>
                )}

              {/* Graph visualization */}
              {graphVisualization && bombData && (
                <div className="absolute z-20">
                  <svg
                    width={gridSize * cellSize}
                    height={gridSize * cellSize}
                    style={{
                      position: "absolute",
                      top: -y * cellSize,
                      left: -x * cellSize,
                      pointerEvents: "none",
                    }}
                  >
                    {graphVisualization.connections
                      .filter((conn) => conn.from === bombData.index)
                      .map((conn, i) => (
                        <line
                          key={i}
                          x1={(x + 0.5) * cellSize}
                          y1={(y + 0.5) * cellSize}
                          x2={(bombs[conn.to].x + 0.5) * cellSize}
                          y2={(bombs[conn.to].y + 0.5) * cellSize}
                          stroke={
                            graphVisualization.currentConnection?.from === conn.from &&
                            graphVisualization.currentConnection?.to === conn.to
                              ? "purple"
                              : "rgba(0, 0, 255, 0.3)"
                          }
                          strokeWidth={
                            graphVisualization.currentConnection?.from === conn.from &&
                            graphVisualization.currentConnection?.to === conn.to
                              ? "3"
                              : "1"
                          }
                        />
                      ))}
                  </svg>
                </div>
              )}

              {/* Bomb visualization */}
              {bombData && (
                <div className="relative z-30">
                  {/* Show radius visualization on hover or when selected */}
                  {(showRadius === bombData.index || selectedBomb === bombData.index) && (
                    <div
                      className="absolute rounded-full bg-red-200 opacity-30"
                      style={{
                        width: `${bombData.bomb.radius * 2 * cellSize}px`,
                        height: `${bombData.bomb.radius * 2 * cellSize}px`,
                        top: `${-bombData.bomb.radius * cellSize + cellSize / 2}px`,
                        left: `${-bombData.bomb.radius * cellSize + cellSize / 2}px`,
                      }}
                    />
                  )}

                  {/* Bomb icon */}
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      selectedBomb === bombData.index
                        ? "bg-red-600"
                        : explosionChain.includes(bombData.index)
                          ? "bg-orange-500"
                          : isDfsCurrent
                            ? "bg-green-600"
                            : isDfsNeighbor
                              ? "bg-blue-600"
                              : isDfsStack
                                ? "bg-yellow-600"
                                : "bg-gray-800"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    animate={
                      explosionChain.includes(bombData.index)
                        ? {
                            scale: [1, 1.5, 1],
                            transition: { duration: 0.5 },
                          }
                        : {}
                    }
                  >
                    <span className="text-white text-xs font-bold">{bombData.bomb.radius}</span>
                  </motion.div>
                </div>
              )}

              {/* Placement preview */}
              {showPlacementPreview && (
                <div className="w-8 h-8 rounded-full bg-gray-400 opacity-50 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">+</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 text-sm">
        <p>
          Grid size: {gridSize}x{gridSize}
        </p>
        <p>Total bombs: {bombs.length}</p>
        {selectedBomb !== null && (
          <p>
            Selected bomb: #{selectedBomb} (Radius: {bombs[selectedBomb].radius})
          </p>
        )}
        {explosionChain.length > 0 && <p>Chain length: {explosionChain.length} bombs</p>}
        {manhattanVisualization && (
          <p
            className={
              manhattanVisualization.canDetonate ? "font-semibold text-green-600" : "font-semibold text-red-600"
            }
          >
            Manhattan distance: Bomb #{manhattanVisualization.from} to Bomb #{manhattanVisualization.to} ={" "}
            {manhattanVisualization.distance}
            {manhattanVisualization.canDetonate
              ? ` ≤ ${bombs[manhattanVisualization.from].radius} (can detonate)`
              : ` > ${bombs[manhattanVisualization.from].radius} (cannot detonate)`}
          </p>
        )}
        {dfsVisualization && (
          <div className="mt-2">
            <p className="font-semibold">DFS Visualization:</p>
            <p>Stack: [{dfsVisualization.stack.join(", ")}]</p>
            <p>Visited: [{dfsVisualization.visited.join(", ")}]</p>
            {dfsVisualization.current !== null && <p>Current: {dfsVisualization.current}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
