"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface BombGridProps {
  bombs: [number, number, number][]
  gridSize: number
  selectedBomb: number | null
  explosionChain: number[]
  onBombClick: (index: number) => void
}

export default function BombGrid({ bombs, gridSize, selectedBomb, explosionChain, onBombClick }: BombGridProps) {
  const [showRadius, setShowRadius] = useState<number | null>(null)

  // Create a grid of cells
  const grid = Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => null))

  // Map bombs to grid positions
  const bombsMap = new Map<string, { index: number; radius: number }>()
  bombs.forEach(([x, y, radius], index) => {
    const key = `${x},${y}`
    bombsMap.set(key, { index, radius })
  })

  // Calculate cell size based on grid size
  const cellSize = 500 / gridSize

  return (
    <div className="relative">
      <h2 className="text-xl font-bold mb-4">Bomb Grid</h2>
      <div
        className="grid border border-gray-300 bg-gray-50"
        style={{
          width: "500px",
          height: "500px",
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
          const x = idx % gridSize
          const y = Math.floor(idx / gridSize)
          const key = `${x},${y}`
          const bomb = bombsMap.get(key)

          return (
            <div
              key={idx}
              className="relative border border-gray-200 flex items-center justify-center"
              onMouseEnter={() => bomb && setShowRadius(bomb.index)}
              onMouseLeave={() => setShowRadius(null)}
              onClick={() => bomb && onBombClick(bomb.index)}
            >
              {bomb && (
                <div className="relative">
                  {/* Show radius visualization on hover or when selected */}
                  {(showRadius === bomb.index || selectedBomb === bomb.index) && (
                    <div
                      className="absolute rounded-full bg-red-200 opacity-30"
                      style={{
                        width: `${bomb.radius * 2 * cellSize}px`,
                        height: `${bomb.radius * 2 * cellSize}px`,
                        top: `${-bomb.radius * cellSize + cellSize / 2}px`,
                        left: `${-bomb.radius * cellSize + cellSize / 2}px`,
                      }}
                    />
                  )}

                  {/* Bomb icon */}
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                      selectedBomb === bomb.index
                        ? "bg-red-600"
                        : explosionChain.includes(bomb.index)
                          ? "bg-orange-500"
                          : "bg-gray-800"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    animate={
                      explosionChain.includes(bomb.index)
                        ? {
                            scale: [1, 1.5, 1],
                            transition: { duration: 0.5 },
                          }
                        : {}
                    }
                  >
                    <span className="text-white text-xs font-bold">{bomb.radius}</span>
                  </motion.div>
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
            Selected bomb: #{selectedBomb} (Radius: {bombs[selectedBomb][2]})
          </p>
        )}
        {explosionChain.length > 0 && <p>Chain length: {explosionChain.length} bombs</p>}
      </div>
    </div>
  )
}
