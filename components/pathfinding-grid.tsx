"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { Bomb } from "@/lib/types"
import type { PathfindingState } from "@/lib/pathfinding"

interface PathfindingGridProps {
  bombs: Bomb[]
  gridSize: number
  onCellClick: (x: number, y: number) => void
  startPoint: { x: number; y: number } | null
  endPoint: { x: number; y: number } | null
  pathfindingState: PathfindingState | null
  placementMode: "start" | "end" | "obstacle" | "none"
}

export default function PathfindingGrid({
  bombs,
  gridSize,
  onCellClick,
  startPoint,
  endPoint,
  pathfindingState,
  placementMode,
}: PathfindingGridProps) {
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null)

  // Map bombs to grid positions for quick lookup
  const bombsMap = new Map<string, { index: number; bomb: Bomb }>()
  bombs.forEach((bomb, index) => {
    const key = `${bomb.x},${bomb.y}`
    bombsMap.set(key, { index, bomb })
  })

  // Calculate cell size based on grid size
  const cellSize = Math.min(500, window.innerWidth - 40) / gridSize

  // Helper function to check if a cell is in the path
  const isInPath = (x: number, y: number): boolean => {
    if (!pathfindingState?.path) return false
    return pathfindingState.path.some((cell) => cell.x === x && cell.y === y)
  }

  // Helper function to check if a cell is the current cell being explored
  const isCurrentCell = (x: number, y: number): boolean => {
    if (!pathfindingState?.current) return false
    return pathfindingState.current.x === x && pathfindingState.current.y === y
  }

  // Helper function to check if a cell is in the stack
  const isInStack = (x: number, y: number): boolean => {
    if (!pathfindingState?.stack) return false
    return pathfindingState.stack.some((cell) => cell.x === x && cell.y === y)
  }

  // Helper function to check if a cell has been visited
  const isVisited = (x: number, y: number): boolean => {
    if (!pathfindingState?.visited) return false
    return pathfindingState.visited.has(`${x},${y}`)
  }

  // Helper function to check if a cell is a neighbor of the current cell
  const isNeighbor = (x: number, y: number): boolean => {
    if (!pathfindingState?.neighbors) return false
    return pathfindingState.neighbors.some((cell) => cell.x === x && cell.y === y)
  }

  return (
    <div className="relative">
      <h2 className="text-xl font-bold mb-4">
        Pathfinding Grid{" "}
        {placementMode !== "none" && (
          <span className="text-sm font-normal text-gray-500">
            (
            {placementMode === "start"
              ? "Set Start Point"
              : placementMode === "end"
                ? "Set End Point"
                : "Add Obstacles"}
            )
          </span>
        )}
      </h2>
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

          const isStart = startPoint?.x === x && startPoint?.y === y
          const isEnd = endPoint?.x === x && endPoint?.y === y
          const isHovered = hoverCell?.x === x && hoverCell?.y === y
          const showPlacementPreview = placementMode !== "none" && isHovered && !bombData && !isStart && !isEnd

          // Determine cell styling based on its state
          let cellClassName = "relative border border-gray-200 flex items-center justify-center"
          if (isStart) {
            cellClassName += " bg-green-200"
          } else if (isEnd) {
            cellClassName += " bg-red-200"
          } else if (isInPath(x, y)) {
            cellClassName += " bg-purple-200"
          } else if (isCurrentCell(x, y)) {
            cellClassName += " bg-green-300"
          } else if (isNeighbor(x, y)) {
            cellClassName += " bg-blue-200"
          } else if (isInStack(x, y)) {
            cellClassName += " bg-yellow-200"
          } else if (isVisited(x, y)) {
            cellClassName += " bg-gray-200"
          }

          return (
            <div
              key={idx}
              className={cellClassName}
              onMouseEnter={() => setHoverCell({ x, y })}
              onMouseLeave={() => setHoverCell(null)}
              onClick={() => onCellClick(x, y)}
            >
              {/* Path visualization */}
              {isInPath(x, y) && !isStart && !isEnd && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                </div>
              )}

              {/* Start point */}
              {isStart && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">S</span>
                  </div>
                </div>
              )}

              {/* End point */}
              {isEnd && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">E</span>
                  </div>
                </div>
              )}

              {/* Bomb visualization */}
              {bombData && (
                <div className="relative z-30">
                  {/* Bomb icon */}
                  <motion.div
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-800"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-white text-xs font-bold">{bombData.bomb.radius}</span>
                  </motion.div>
                </div>
              )}

              {/* Placement preview */}
              {showPlacementPreview && (
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    placementMode === "start"
                      ? "bg-green-400 opacity-70"
                      : placementMode === "end"
                        ? "bg-red-400 opacity-70"
                        : "bg-gray-400 opacity-50"
                  }`}
                >
                  <span className="text-white text-xs font-bold">
                    {placementMode === "start" ? "S" : placementMode === "end" ? "E" : "+"}
                  </span>
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
        <p>Obstacles: {bombs.length} bombs</p>
        {startPoint && (
          <p>
            Start point: ({startPoint.x}, {startPoint.y})
          </p>
        )}
        {endPoint && (
          <p>
            End point: ({endPoint.x}, {endPoint.y})
          </p>
        )}
        {pathfindingState && (
          <div className="mt-2">
            <p>Cells in stack: {pathfindingState.stack.length}</p>
            <p>Cells visited: {pathfindingState.visitedOrder.length}</p>
            {pathfindingState.path.length > 0 && <p>Path length: {pathfindingState.path.length} cells</p>}
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <h3 className="font-semibold mb-2">Legend:</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-200 mr-2"></div>
            <span>Start Point</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-200 mr-2"></div>
            <span>End Point</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-800 rounded-full mr-2"></div>
            <span>Obstacle (Bomb)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-300 mr-2"></div>
            <span>Current Cell</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-200 mr-2"></div>
            <span>In Stack</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-200 mr-2"></div>
            <span>Neighbors</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 mr-2"></div>
            <span>Visited</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-200 mr-2"></div>
            <span>Path</span>
          </div>
        </div>
      </div>
    </div>
  )
}
