"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Dice1Icon as Dice, Info } from "lucide-react"
import SimplifiedGameGrid from "@/components/simplified-game-grid"
import SimplifiedDFSVisualizer from "@/components/simplified-dfs-visualizer"
import { findMaximumBombChain, buildBombGraph, dfs } from "@/lib/bomb-algorithm"
import { generateDFSVisualizationSteps } from "@/lib/dfs-visualizer"
import type { Bomb } from "@/lib/types"
import type { DFSVisualizationStep } from "@/lib/dfs-visualizer"

export default function Home() {
  const [gridSize, setGridSize] = useState(10)
  const [bombs, setBombs] = useState<Bomb[]>([])
  const [selectedBomb, setSelectedBomb] = useState<number | null>(null)
  const [explosionChain, setExplosionChain] = useState<number[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [placementMode, setPlacementMode] = useState(true)
  const [currentRadius, setCurrentRadius] = useState(2) // Default radius set to 2
  const [maxChainResult, setMaxChainResult] = useState<{
    startBomb: number
    chain: number[]
    count: number
  } | null>(null)

  // Enhanced DFS visualization
  const [dfsVisualizationSteps, setDfsVisualizationSteps] = useState<DFSVisualizationStep[]>([])
  const [currentDfsStepIndex, setCurrentDfsStepIndex] = useState(0)
  const [isDfsAnimating, setIsDfsAnimating] = useState(false)

  // References for intervals
  const dfsIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Clear any running intervals when component unmounts
  useEffect(() => {
    return () => {
      if (dfsIntervalRef.current) {
        clearInterval(dfsIntervalRef.current)
      }
    }
  }, [])

  const clearBoard = () => {
    setBombs([])
    setSelectedBomb(null)
    setExplosionChain([])
    setMaxChainResult(null)
    setDfsVisualizationSteps([])
    setCurrentDfsStepIndex(0)
    if (dfsIntervalRef.current) {
      clearInterval(dfsIntervalRef.current)
      dfsIntervalRef.current = null
    }
  }

  const generateRandomBombs = () => {
    if (isAnimating) return

    const newBombs: Bomb[] = []
    const positions = new Set<string>()
    const count = Math.min(Math.floor(gridSize * gridSize * 0.2), 25) // 20% of grid or max 25 bombs

    while (newBombs.length < count) {
      const x = Math.floor(Math.random() * gridSize)
      const y = Math.floor(Math.random() * gridSize)
      const posKey = `${x},${y}`

      // Ensure no duplicate positions
      if (!positions.has(posKey)) {
        positions.add(posKey)
        // Use the currentRadius value for all randomly generated bombs
        newBombs.push({ x, y, radius: currentRadius })
      }
    }

    setBombs(newBombs)
    setSelectedBomb(null)
    setExplosionChain([])
    setMaxChainResult(null)
    setDfsVisualizationSteps([])
    setCurrentDfsStepIndex(0)
  }

  // Add a new function to generate bombs with random radii if needed
  const generateRandomBombsWithRandomRadii = () => {
    if (isAnimating) return

    const newBombs: Bomb[] = []
    const positions = new Set<string>()
    const count = Math.min(Math.floor(gridSize * gridSize * 0.2), 25) // 20% of grid or max 25 bombs

    while (newBombs.length < count) {
      const x = Math.floor(Math.random() * gridSize)
      const y = Math.floor(Math.random() * gridSize)
      const posKey = `${x},${y}`

      // Ensure no duplicate positions
      if (!positions.has(posKey)) {
        positions.add(posKey)
        const radius = Math.floor(Math.random() * 3) + 1 // Random radius between 1-3
        newBombs.push({ x, y, radius })
      }
    }

    setBombs(newBombs)
    setSelectedBomb(null)
    setExplosionChain([])
    setMaxChainResult(null)
    setDfsVisualizationSteps([])
    setCurrentDfsStepIndex(0)
  }

  const handleCellClick = (x: number, y: number) => {
    if (isAnimating) return

    if (placementMode) {
      // Check if there's already a bomb at this position
      const existingBombIndex = bombs.findIndex((bomb) => bomb.x === x && bomb.y === y)

      if (existingBombIndex !== -1) {
        // Remove the bomb if it exists
        const newBombs = [...bombs]
        newBombs.splice(existingBombIndex, 1)
        setBombs(newBombs)

        // Reset selections if the removed bomb was selected
        if (selectedBomb === existingBombIndex) {
          setSelectedBomb(null)
          setExplosionChain([])
        }
      } else {
        // Add a new bomb
        const newBomb: Bomb = { x, y, radius: currentRadius }
        setBombs([...bombs, newBomb])
      }

      setMaxChainResult(null)
    } else {
      // Find if there's a bomb at this position
      const bombIndex = bombs.findIndex((bomb) => bomb.x === x && bomb.y === y)
      if (bombIndex !== -1) {
        handleBombClick(bombIndex)
      }
    }
  }

  const handleBombClick = (index: number) => {
    if (isAnimating || placementMode) return

    setSelectedBomb(index)
    setMaxChainResult(null)

    const graph = buildBombGraph(bombs)
    const { chain } = dfs(graph, index)
    setExplosionChain([])

    // Animate the explosion chain
    setIsAnimating(true)
    const currentChain: number[] = []

    const animateExplosion = (idx: number) => {
      if (idx >= chain.length) {
        setIsAnimating(false)
        return
      }

      currentChain.push(chain[idx])
      setExplosionChain([...currentChain])

      setTimeout(() => {
        animateExplosion(idx + 1)
      }, 300)
    }

    animateExplosion(0)
  }

  const findMaximumChain = () => {
    if (isAnimating || bombs.length === 0) return

    setIsAnimating(true)
    setExplosionChain([])
    setSelectedBomb(null)

    const result = findMaximumBombChain(bombs)
    setMaxChainResult(null)

    // Animate the maximum chain
    const currentChain: number[] = []

    const animateMaxChain = (idx: number) => {
      if (idx >= result.chain.length) {
        setIsAnimating(false)
        setMaxChainResult(result)
        return
      }

      if (idx === 0) {
        setSelectedBomb(result.startBomb)
      }

      currentChain.push(result.chain[idx])
      setExplosionChain([...currentChain])

      setTimeout(() => {
        animateMaxChain(idx + 1)
      }, 300)
    }

    animateMaxChain(0)
  }

  // Enhanced DFS visualization function
  const visualizeMaximumChainDFS = () => {
    if (isDfsAnimating || bombs.length === 0) return

    setPlacementMode(false)
    setIsDfsAnimating(true)
    setExplosionChain([])
    setMaxChainResult(null)

    // Generate all DFS visualization steps
    const steps = generateDFSVisualizationSteps(bombs)
    setDfsVisualizationSteps(steps)
    setCurrentDfsStepIndex(0)

    // Start automatic execution
    let stepIndex = 0

    const runDfsStep = () => {
      if (stepIndex >= steps.length) {
        setIsDfsAnimating(false)
        return
      }

      setCurrentDfsStepIndex(stepIndex)

      // If this is the final step showing the maximum chain, update the UI
      if (steps[stepIndex].type === "max-chain-found") {
        const maxChainData = steps[stepIndex].data
        setSelectedBomb(maxChainData.startBomb)
        setExplosionChain(maxChainData.chain)
        setMaxChainResult({
          startBomb: maxChainData.startBomb,
          chain: maxChainData.chain,
          count: maxChainData.count,
        })
      }

      stepIndex++
      dfsIntervalRef.current = setTimeout(runDfsStep, 1000) // Slower speed for better visualization
    }

    dfsIntervalRef.current = setTimeout(runDfsStep, 1000)
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-background">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-foreground">
        DFS Algorithm Visualization for Maximum Bomb Chain
      </h1>

      <div className="w-full max-w-6xl bg-card rounded-lg shadow-lg p-4 md:p-6 mb-6 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Grid Size: {gridSize}x{gridSize}
            </label>
            <Slider
              value={[gridSize]}
              min={5}
              max={20}
              step={1}
              onValueChange={(value) => setGridSize(value[0])}
              className="mb-4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Bomb Radius: {currentRadius}
              <span className="text-xs text-muted-foreground ml-1">
                (Used for manual placement and random generation)
              </span>
            </label>
            <Slider
              value={[currentRadius]}
              min={1}
              max={5}
              step={1}
              onValueChange={(value) => setCurrentRadius(value[0])}
              className="mb-4"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <Button
            onClick={() => setPlacementMode(true)}
            variant={placementMode ? "default" : "outline"}
            className="bg-ada-green text-primary-foreground hover:bg-ada-green/90"
          >
            Place Bombs
          </Button>
          <Button
            onClick={() => setPlacementMode(false)}
            variant={!placementMode ? "default" : "outline"}
            disabled={bombs.length === 0}
            className={!placementMode ? "bg-ada-green text-primary-foreground hover:bg-ada-green/90" : ""}
          >
            Trigger Bombs
          </Button>
          <Button onClick={clearBoard} variant="outline">
            Clear Board
          </Button>
          <Button onClick={generateRandomBombs} variant="outline" disabled={isAnimating || isDfsAnimating}>
            <Dice className="w-4 h-4 mr-2" />
            Random Bombs (Radius: {currentRadius})
          </Button>
          <Button
            onClick={generateRandomBombsWithRandomRadii}
            variant="outline"
            disabled={isAnimating || isDfsAnimating}
          >
            <Dice className="w-4 h-4 mr-2" />
            Random Bombs (Varied Radius)
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <Button
            onClick={findMaximumChain}
            disabled={isAnimating || bombs.length === 0}
            className="bg-ada-green text-primary-foreground hover:bg-ada-green/90"
          >
            Find Maximum Chain
          </Button>
          <Button
            onClick={visualizeMaximumChainDFS}
            disabled={isDfsAnimating || bombs.length === 0}
            variant="secondary"
            className="bg-secondary hover:bg-secondary/90"
          >
            Visualize Maximum Chain
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SimplifiedGameGrid
              bombs={bombs}
              gridSize={gridSize}
              selectedBomb={selectedBomb}
              explosionChain={explosionChain}
              onCellClick={handleCellClick}
              placementMode={placementMode}
              currentStep={dfsVisualizationSteps[currentDfsStepIndex] || null}
            />
          </div>

          <div className="flex-1">
            <SimplifiedDFSVisualizer
              bombs={bombs}
              currentStep={dfsVisualizationSteps[currentDfsStepIndex] || null}
              currentStepIndex={currentDfsStepIndex}
              totalSteps={dfsVisualizationSteps.length}
              selectedBomb={selectedBomb}
              explosionChain={explosionChain}
            />
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl bg-card rounded-lg shadow-lg p-4 md:p-6 border border-border">
        <h2 className="text-xl font-bold mb-4 text-foreground">How It Works</h2>
        <p className="mb-4 text-foreground">
          This visualizer demonstrates a Depth-First Search (DFS) algorithm to find the maximum chain of bomb
          detonations in a Bomberman-like game.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Bomb Chain Logic</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground">
              <li>Each bomb has a position (x, y) and a radius (R).</li>
              <li>
                A bomb can detonate another bomb if the Manhattan distance between them is less than or equal to the
                radius of the first bomb.
              </li>
              <li>Manhattan distance is calculated as |x1 - x2| + |y1 - y2|.</li>
              <li>The algorithm builds a graph where bombs are connected if one can detonate another.</li>
              <li>DFS is used to find all bombs that would detonate in a chain reaction from each starting bomb.</li>
              <li>The maximum chain is the longest chain found across all possible starting bombs.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">DFS Algorithm</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground">
              <li>DFS uses a stack data structure to keep track of nodes to visit.</li>
              <li>It explores as far as possible along each branch before backtracking.</li>
              <li>The algorithm marks each bomb as visited to avoid cycles.</li>
              <li>For each bomb, it adds all unvisited neighbors (bombs it can detonate) to the stack.</li>
              <li>The process continues until the stack is empty, meaning all reachable bombs have been explored.</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-3 bg-secondary rounded-md">
          <div className="flex items-start">
            <Info className="w-5 h-5 mr-2 text-ada-green mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground">Instructions:</h3>
              <ol className="list-decimal pl-6 mt-2 space-y-1 text-foreground">
                <li>Place bombs on the grid by clicking in "Place Bombs" mode</li>
                <li>Click "Visualize Maximum Chain" to see the DFS algorithm in action</li>
                <li>Watch as the algorithm finds the maximum possible chain reaction</li>
                <li>The final result will highlight the maximum chain in purple</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
