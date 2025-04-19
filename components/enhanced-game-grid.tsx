"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { Bomb } from "@/lib/types"
import type { DFSVisualizationStep } from "@/lib/dfs-visualizer"

interface EnhancedGameGridProps {
  bombs: Bomb[]
  gridSize: number
  selectedBomb: number | null
  explosionChain: number[]
  onCellClick: (x: number, y: number) => void
  placementMode: boolean
  currentStep: DFSVisualizationStep | null
}

export default function EnhancedGameGrid({
  bombs,
  gridSize,
  selectedBomb,
  explosionChain,
  onCellClick,
  placementMode,
  currentStep,
}: EnhancedGameGridProps) {
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

  // Extract visualization data from current step
  const getVisualizationData = () => {
    if (!currentStep) return null

    switch (currentStep.type) {
      case "distance-check":
        return {
          distanceCheck: currentStep.data,
        }
      case "graph-building":
        return {
          connections: currentStep.data.connections,
          currentConnection: currentStep.data.currentConnection,
        }
      case "dfs-start":
      case "dfs-process":
      case "dfs-visit":
      case "dfs-add-neighbors":
      case "dfs-backtrack":
        return {
          dfsData: currentStep.data,
        }
      case "max-chain-found":
        return {
          maxChain: currentStep.data,
        }
      default:
        return null
    }
  }

  const visualizationData = getVisualizationData()

  // Helper functions to determine bomb state for visualization
  const isBombInStack = (bombIndex: number) => {
    if (!visualizationData?.dfsData) return false
    return visualizationData.dfsData.stack.includes(bombIndex)
  }

  const isBombVisited = (bombIndex: number) => {
    if (!visualizationData?.dfsData) return false
    return visualizationData.dfsData.visited.includes(bombIndex)
  }

  const isBombInChain = (bombIndex: number) => {
    if (!visualizationData?.dfsData) return false
    return visualizationData.dfsData.chain.includes(bombIndex)
  }

  const isBombCurrentlyProcessed = (bombIndex: number) => {
    if (!visualizationData?.dfsData || visualizationData.dfsData.currentBomb === null) return false
    return visualizationData.dfsData.currentBomb === bombIndex
  }

  const isBombNeighbor = (bombIndex: number) => {
    if (!visualizationData?.dfsData) return false
    return visualizationData.dfsData.neighbors?.includes(bombIndex) || false
  }

  const isBombInMaxChain = (bombIndex: number) => {
    if (!visualizationData?.maxChain) return false
    return visualizationData.maxChain.chain.includes(bombIndex)
  }

  const isBombMaxChainStart = (bombIndex: number) => {
    if (!visualizationData?.maxChain) return false
    return visualizationData.maxChain.startBomb === bombIndex
  }

  // Determine if we should show a distance line
  const shouldShowDistanceLine = () => {
    return visualizationData?.distanceCheck !== undefined
  }

  // Get bomb color based on its state in the visualization
  const getBombColor = (bombIndex: number) => {
    if (selectedBomb === bombIndex) return "bg-red-600"
    if (explosionChain.includes(bombIndex)) return "bg-orange-500"

    if (currentStep) {
      if (isBombMaxChainStart(bombIndex)) return "bg-purple-600"
      if (isBombInMaxChain(bombIndex)) return "bg-purple-500"
      if (isBombCurrentlyProcessed(bombIndex)) return "bg-green-600"
      if (isBombNeighbor(bombIndex)) return "bg-blue-600"
      if (isBombInChain(bombIndex)) return "bg-green-500"
      if (isBombInStack(bombIndex)) return "bg-yellow-500"
      if (isBombVisited(bombIndex)) return "bg-gray-500"
    }

    return "bg-gray-800"
  }

  // Get the position of a bomb in the chain (for path visualization)
  const getBombPositionInChain = (bombIndex: number) => {
    if (!visualizationData?.dfsData) return -1
    return visualizationData.dfsData.chain.indexOf(bombIndex)
  }

  // Get the position of a bomb in the max chain (for path visualization)
  const getBombPositionInMaxChain = (bombIndex: number) => {
    if (!visualizationData?.maxChain) return -1
    return visualizationData.maxChain.chain.indexOf(bombIndex)
  }

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
              {/* Distance visualization */}
              {shouldShowDistanceLine() &&
                bombData &&
                (bombData.index === visualizationData?.distanceCheck?.fromBomb ||
                  bombData.index === visualizationData?.distanceCheck?.toBomb) && (
                  <div
                    className={`absolute inset-0 ${
                      bombData.index === visualizationData?.distanceCheck?.fromBomb ? "bg-blue-200" : "bg-green-200"
                    } opacity-40 z-10`}
                  ></div>
                )}

              {/* Distance line */}
              {shouldShowDistanceLine() &&
                bombData?.index === visualizationData?.distanceCheck?.fromBomb &&
                bombs[visualizationData?.distanceCheck?.toBomb] && (
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
                        x2={(bombs[visualizationData?.distanceCheck?.toBomb].x + 0.5) * cellSize}
                        y2={(bombs[visualizationData?.distanceCheck?.toBomb].y + 0.5) * cellSize}
                        stroke={visualizationData?.distanceCheck?.canDetonate ? "green" : "red"}
                        strokeWidth="2"
                        strokeDasharray="4"
                      />
                      {/* Distance label */}
                      <text
                        x={((x + bombs[visualizationData?.distanceCheck?.toBomb].x) / 2 + 0.5) * cellSize}
                        y={((y + bombs[visualizationData?.distanceCheck?.toBomb].y) / 2 + 0.5) * cellSize - 5}
                        textAnchor="middle"
                        fill={visualizationData?.distanceCheck?.canDetonate ? "green" : "red"}
                        fontSize="12"
                        fontWeight="bold"
                        stroke="white"
                        strokeWidth="3"
                        paintOrder="stroke"
                      >
                        {visualizationData?.distanceCheck?.distance}
                      </text>
                    </svg>
                  </div>
                )}

              {/* Graph connections visualization */}
              {visualizationData?.connections && bombData && (
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
                    {visualizationData.connections
                      .filter((conn) => conn.from === bombData.index)
                      .map((conn, i) => (
                        <line
                          key={i}
                          x1={(x + 0.5) * cellSize}
                          y1={(y + 0.5) * cellSize}
                          x2={(bombs[conn.to].x + 0.5) * cellSize}
                          y2={(bombs[conn.to].y + 0.5) * cellSize}
                          stroke={
                            visualizationData.currentConnection?.from === conn.from &&
                            visualizationData.currentConnection?.to === conn.to
                              ? "purple"
                              : "rgba(0, 0, 255, 0.3)"
                          }
                          strokeWidth={
                            visualizationData.currentConnection?.from === conn.from &&
                            visualizationData.currentConnection?.to === conn.to
                              ? "3"
                              : "1"
                          }
                          markerEnd="url(#arrowhead)"
                        />
                      ))}
                  </svg>
                </div>
              )}

              {/* DFS chain visualization */}
              {visualizationData?.dfsData && bombData && isBombInChain(bombData.index) && (
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
                    {/* Define arrowhead marker */}
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="rgba(0, 128, 0, 0.7)" />
                      </marker>
                    </defs>

                    {getBombPositionInChain(bombData.index) > 0 && (
                      <line
                        x1={(x + 0.5) * cellSize}
                        y1={(y + 0.5) * cellSize}
                        x2={
                          (bombs[visualizationData.dfsData.chain[getBombPositionInChain(bombData.index) - 1]].x + 0.5) *
                          cellSize
                        }
                        y2={
                          (bombs[visualizationData.dfsData.chain[getBombPositionInChain(bombData.index) - 1]].y + 0.5) *
                          cellSize
                        }
                        stroke="rgba(0, 128, 0, 0.5)"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                    )}
                  </svg>
                </div>
              )}

              {/* Max chain visualization */}
              {visualizationData?.maxChain && bombData && isBombInMaxChain(bombData.index) && (
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
                    {/* Define arrowhead marker for max chain */}
                    <defs>
                      <marker id="max-arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="rgba(128, 0, 128, 0.7)" />
                      </marker>
                    </defs>

                    {getBombPositionInMaxChain(bombData.index) > 0 && (
                      <line
                        x1={(x + 0.5) * cellSize}
                        y1={(y + 0.5) * cellSize}
                        x2={
                          (bombs[visualizationData.maxChain.chain[getBombPositionInMaxChain(bombData.index) - 1]].x +
                            0.5) *
                          cellSize
                        }
                        y2={
                          (bombs[visualizationData.maxChain.chain[getBombPositionInMaxChain(bombData.index) - 1]].y +
                            0.5) *
                          cellSize
                        }
                        stroke="rgba(128, 0, 128, 0.7)"
                        strokeWidth="3"
                        markerEnd="url(#max-arrowhead)"
                      />
                    )}

                    {/* Add sequence number */}
                    <text
                      x={(x + 0.5) * cellSize + 12}
                      y={(y + 0.5) * cellSize - 12}
                      textAnchor="middle"
                      fill="purple"
                      fontSize="12"
                      fontWeight="bold"
                      stroke="white"
                      strokeWidth="3"
                      paintOrder="stroke"
                    >
                      {getBombPositionInMaxChain(bombData.index) + 1}
                    </text>
                  </svg>
                </div>
              )}

              {/* Bomb visualization */}
              {bombData && (
                <div className="relative z-30">
                  {/* Show radius visualization on hover or when selected */}
                  {(showRadius === bombData.index ||
                    selectedBomb === bombData.index ||
                    visualizationData?.distanceCheck?.fromBomb === bombData.index) && (
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${getBombColor(bombData.index)}`}
                    whileHover={{ scale: 1.1 }}
                    animate={
                      explosionChain.includes(bombData.index) || isBombCurrentlyProcessed(bombData.index)
                        ? {
                            scale: [1, 1.2, 1],
                            transition: { duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" },
                          }
                        : {}
                    }
                  >
                    <span className="text-white text-xs font-bold">{bombData.bomb.radius}</span>
                  </motion.div>

                  {/* Bomb index label */}
                  <div className="absolute -top-4 -right-4 bg-gray-800 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {bombData.index}
                  </div>
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
      </div>

      {/* Legend */}
      {currentStep && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md">
          <h3 className="font-semibold mb-2">Visualization Legend:</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-gray-800 mr-2"></div>
              <span>Inactive Bomb</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-600 mr-2"></div>
              <span>Selected Bomb</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-600 mr-2"></div>
              <span>Current Bomb</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
              <span>In Stack</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-600 mr-2"></div>
              <span>Neighbor</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-gray-500 mr-2"></div>
              <span>Visited</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
              <span>In Chain</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-purple-600 mr-2"></div>
              <span>Max Chain</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
