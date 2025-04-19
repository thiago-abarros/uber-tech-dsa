"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import type { Bomb } from "@/lib/types"
import type { DFSVisualizationStep } from "@/lib/dfs-visualizer"

interface SimplifiedGameGridProps {
  bombs: Bomb[]
  gridSize: number
  selectedBomb: number | null
  explosionChain: number[]
  onCellClick: (x: number, y: number) => void
  placementMode: boolean
  currentStep: DFSVisualizationStep | null
}

export default function SimplifiedGameGrid({
  bombs,
  gridSize,
  selectedBomb,
  explosionChain,
  onCellClick,
  placementMode,
  currentStep,
}: SimplifiedGameGridProps) {
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null)
  const [showRadius, setShowRadius] = useState<number | null>(null)
  const [cellSize, setCellSize] = useState(500 / gridSize)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Map bombs to grid positions for quick lookup
  const bombsMap = new Map<string, { index: number; bomb: Bomb }>()
  bombs.forEach((bomb, index) => {
    const key = `${bomb.x},${bomb.y}`
    bombsMap.set(key, { index, bomb })
  })

  // Add a useEffect to update cellSize when window is available
  useEffect(() => {
    const updateCellSize = () => {
      setCellSize(Math.min(500, window.innerWidth - 40) / gridSize)
    }

    // Initial calculation
    updateCellSize()

    // Update on resize
    window.addEventListener("resize", updateCellSize)

    // Cleanup
    return () => window.removeEventListener("resize", updateCellSize)
  }, [gridSize])

  // Add mouse move handler to track hover state globally
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!gridRef.current) return

      // Get grid bounds
      const gridRect = gridRef.current.getBoundingClientRect()

      // Check if mouse is outside the grid area
      if (
        e.clientX < gridRect.left ||
        e.clientX > gridRect.right ||
        e.clientY < gridRect.top ||
        e.clientY > gridRect.bottom
      ) {
        // Mouse is outside grid, clear hover state
        setHoverCell(null)
        setShowRadius(null)
        return
      }

      // Mouse is inside grid, calculate cell position
      const x = Math.floor((e.clientX - gridRect.left) / cellSize)
      const y = Math.floor((e.clientY - gridRect.top) / cellSize)

      // Only update if within grid bounds
      if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        setHoverCell({ x, y })

        // Check if there's a bomb at this position
        const key = `${x},${y}`
        const bombData = bombsMap.get(key)

        if (bombData) {
          setShowRadius(bombData.index)
        } else {
          // No bomb at this position, but keep showing radius if we're near a bomb with radius
          let foundNearbyBomb = false

          // Check if we're within any bomb's radius
          for (const [_, { index, bomb }] of bombsMap.entries()) {
            const dx = Math.abs(x - bomb.x)
            const dy = Math.abs(y - bomb.y)
            const distance = dx + dy // Manhattan distance

            if (distance <= bomb.radius) {
              setShowRadius(index)
              foundNearbyBomb = true
              break
            }
          }

          if (!foundNearbyBomb) {
            setShowRadius(null)
          }
        }
      }
    }

    // Add mouse move listener to document
    document.addEventListener("mousemove", handleMouseMove)

    // Cleanup
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
    }
  }, [bombsMap, cellSize, gridSize])

  // Extract visualization data from current step
  const getVisualizationData = () => {
    if (!currentStep) return null

    switch (currentStep.type) {
      case "graph-building":
        return {
          connections: currentStep.data.connections,
        }
      case "dfs-process":
      case "dfs-visit":
      case "dfs-add-neighbors":
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

  // Get bomb color based on its state in the visualization
  const getBombColor = (bombIndex: number) => {
    if (selectedBomb === bombIndex) return "bg-red-600"
    if (explosionChain.includes(bombIndex)) return "bg-orange-500"

    if (currentStep) {
      if (isBombMaxChainStart(bombIndex)) return "bg-purple-600"
      if (isBombInMaxChain(bombIndex)) return "bg-purple-500"
      if (isBombCurrentlyProcessed(bombIndex)) return "bg-ada-green"
      if (isBombNeighbor(bombIndex)) return "bg-blue-600"
      if (isBombInChain(bombIndex)) return "bg-green-500"
      if (isBombInStack(bombIndex)) return "bg-yellow-500"
    }

    // Default bomb color - using a bright cyan color to stand out from the grid
    return "bg-cyan-500"
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

  // Function to determine cell background color for checkerboard pattern
  const getCellBackgroundColor = (x: number, y: number) => {
    // Create a checkerboard pattern
    return (x + y) % 2 === 0 ? "bg-gray-700" : "bg-gray-800"
  }

  // Handle cell click
  const handleCellClick = (x: number, y: number) => {
    onCellClick(x, y)
  }

  return (
    <div className="relative">
      <h2 className="text-xl font-bold mb-4 text-foreground">
        Game Grid {placementMode ? "(Placement Mode)" : "(Trigger Mode)"}
      </h2>

      {/* Main grid container */}
      <div
        ref={gridRef}
        className="relative"
        style={{ width: `${cellSize * gridSize}px`, height: `${cellSize * gridSize}px` }}
      >
        {/* Radius Visualization Layer - Positioned absolutely to avoid clipping */}
        {bombs.map(
          (bomb, index) =>
            (showRadius === index || selectedBomb === index) && (
              <div
                key={`radius-${index}`}
                className="absolute z-10 pointer-events-none"
                style={{
                  left: `${bomb.x * cellSize + cellSize / 2}px`,
                  top: `${bomb.y * cellSize + cellSize / 2}px`,
                }}
              >
                <div
                  className="absolute rounded-full bg-ada-green/30 transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    width: `${bomb.radius * 2 * cellSize}px`,
                    height: `${bomb.radius * 2 * cellSize}px`,
                  }}
                />
              </div>
            ),
        )}

        {/* Grid Layer */}
        <div
          className="grid border border-gray-600 mx-auto rounded-md absolute top-0 left-0"
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
                className={`relative flex items-center justify-center ${getCellBackgroundColor(x, y)} ${
                  placementMode ? "cursor-pointer" : bombData ? "cursor-pointer" : "cursor-default"
                } hover:opacity-80 transition-opacity`}
                onClick={() => handleCellClick(x, y)}
              >
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
                            stroke="rgba(166, 247, 80, 0.5)"
                            strokeWidth="1.5"
                          />
                        ))}
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
                          stroke="rgba(166, 247, 80, 0.8)"
                          strokeWidth="3"
                        />
                      )}

                      {/* Add sequence number */}
                      <text
                        x={(x + 0.5) * cellSize + 12}
                        y={(y + 0.5) * cellSize - 12}
                        textAnchor="middle"
                        fill="#A6F750"
                        fontSize="12"
                        fontWeight="bold"
                        stroke="#111"
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
                    {/* Bomb icon with shadow for better visibility */}
                    <motion.div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${getBombColor(
                        bombData.index,
                      )} shadow-lg shadow-black/50 border-2 border-gray-900`}
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
                    <div className="absolute -top-4 -right-4 bg-ada-green text-black text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                      {bombData.index}
                    </div>
                  </div>
                )}

                {/* Placement preview */}
                {showPlacementPreview && (
                  <div className="w-8 h-8 rounded-full bg-ada-green/70 flex items-center justify-center shadow-lg shadow-black/30 border-2 border-gray-900">
                    <span className="text-black text-xs font-bold">+</span>
                  </div>
                )}

                {/* Cell coordinates (optional, for debugging) */}
                {/* <div className="absolute bottom-0 right-0 text-[8px] text-gray-400 opacity-50">
                  {x},{y}
                </div> */}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-4 text-sm text-foreground">
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
        <div className="mt-4 p-3 bg-secondary rounded-md border border-border">
          <h3 className="font-semibold mb-2 text-foreground">Visualization Legend:</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-cyan-500 mr-2 border border-gray-900"></div>
              <span className="text-foreground">Inactive Bomb</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-600 mr-2 border border-gray-900"></div>
              <span className="text-foreground">Selected Bomb</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-ada-green mr-2 border border-gray-900"></div>
              <span className="text-foreground">Current Bomb</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2 border border-gray-900"></div>
              <span className="text-foreground">In Stack</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-600 mr-2 border border-gray-900"></div>
              <span className="text-foreground">Neighbor</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2 border border-gray-900"></div>
              <span className="text-foreground">In Chain</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-purple-600 mr-2 border border-gray-900"></div>
              <span className="text-foreground">Max Chain</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
