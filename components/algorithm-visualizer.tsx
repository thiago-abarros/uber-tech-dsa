"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Bomb } from "@/lib/types"

interface AlgorithmVisualizerProps {
  bombs: Bomb[]
  selectedBomb: number | null
  explosionChain: number[]
  maxChainResult: {
    startBomb: number
    chain: number[]
    count: number
  } | null
  algorithmStep: number
  manhattanVisualization: {
    from: number
    to: number
    distance: number
    canDetonate: boolean
  } | null
  currentStepIndex?: number
  totalSteps?: number
  dfsVisualization: {
    stack: number[]
    visited: number[]
    current: number | null
    neighbors: number[]
  } | null
  currentStep?: {
    type: string
    data: any
  }
}

export default function AlgorithmVisualizer({
  bombs,
  selectedBomb,
  explosionChain,
  maxChainResult,
  algorithmStep,
  manhattanVisualization,
  currentStepIndex = 0,
  totalSteps = 0,
  dfsVisualization,
  currentStep,
}: AlgorithmVisualizerProps) {
  // Calculate progress percentage for the progress bar
  const progressPercentage = totalSteps > 0 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0

  return (
    <Card className="p-4 h-[500px] overflow-y-auto">
      <h3 className="text-lg font-bold mb-3">Algorithm Execution</h3>

      {bombs.length === 0 ? (
        <div className="text-gray-500 italic">Place some bombs on the grid to start.</div>
      ) : algorithmStep === -1 && selectedBomb === null && explosionChain.length === 0 ? (
        <div className="text-gray-500 italic">
          Click on a bomb to see the explosion chain, use "Find Maximum Chain", or "Visualize Algorithm" to see the
          algorithm in action.
        </div>
      ) : (
        <div>
          {/* Progress bar for algorithm execution */}
          {totalSteps > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Step {currentStepIndex + 1}</span>
                <span>Total Steps: {totalSteps}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          {/* Current step message */}
          {currentStep && currentStep.data && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="font-medium">{currentStep.data.message || "Executing algorithm..."}</p>
            </div>
          )}

          {algorithmStep === 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-blue-600">Step 1: Building the Graph</h4>
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <p>
                  The algorithm first builds a graph where each bomb is connected to other bombs it can detonate. A bomb
                  can detonate another if the Manhattan distance between them is less than or equal to the radius of the
                  first bomb.
                </p>

                <div className="mt-3 bg-gray-900 text-gray-100 p-3 rounded-md text-sm font-mono">
                  <pre>
                    <code>
                      {`function buildGraph() {
  const graph = Array(n).fill().map(() => []);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        // Bomb i detonates bomb j if Manhattan distance <= R_i
        if (manhattan(i, j) <= bombs[i].radius) {
          graph[i].push(j);
        }
      }
    }
  }
  return graph;}`}
                    </code>
                  </pre>
                </div>
              </div>

              {manhattanVisualization && (
                <div className="bg-purple-50 p-3 rounded-md">
                  <h5 className="font-medium mb-1">Manhattan Distance Calculation:</h5>
                  <p>
                    Bomb #{manhattanVisualization.from} [x:{bombs[manhattanVisualization.from].x}, y:
                    {bombs[manhattanVisualization.from].y}, r:{bombs[manhattanVisualization.from].radius}]
                  </p>
                  <p>
                    Bomb #{manhattanVisualization.to} [x:{bombs[manhattanVisualization.to].x}, y:
                    {bombs[manhattanVisualization.to].y}, r:{bombs[manhattanVisualization.to].radius}]
                  </p>
                  <p className="font-semibold mt-1">
                    Manhattan distance = |x₁ - x₂| + |y₁ - y₂| = |{bombs[manhattanVisualization.from].x} -{" "}
                    {bombs[manhattanVisualization.to].x}| + |{bombs[manhattanVisualization.from].y} -{" "}
                    {bombs[manhattanVisualization.to].y}| = {manhattanVisualization.distance}
                  </p>

                  <div className="mt-3 bg-gray-900 text-gray-100 p-3 rounded-md text-sm font-mono">
                    <pre>
                      <code>
                        {`// Calculate Manhattan distance between two bombs
function manhattan(i, j) {
  return Math.abs(bombs[i].x - bombs[j].x) + 
         Math.abs(bombs[i].y - bombs[j].y);
}`}
                      </code>
                    </pre>
                  </div>

                  <p className="mt-3">
                    {manhattanVisualization.canDetonate ? (
                      <span className="text-green-600">
                        Bomb #{manhattanVisualization.from} CAN detonate Bomb #{manhattanVisualization.to} (distance
                        {manhattanVisualization.distance} &le; radius {bombs[manhattanVisualization.from].radius})
                      </span>
                    ) : (
                      <span className="text-red-600">
                        Bomb #{manhattanVisualization.from} CANNOT detonate Bomb #{manhattanVisualization.to} (distance
                        {manhattanVisualization.distance} &gt; radius {bombs[manhattanVisualization.from].radius})
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {algorithmStep === 1 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-green-600">Step 2: Running DFS</h4>
              <div className="bg-green-50 p-3 rounded-md">
                <p>
                  The algorithm uses Depth-First Search (DFS) to find all bombs that can be detonated in a chain
                  reaction, starting from each bomb as a potential first detonation.
                </p>
                <p className="mt-2">Starting from Bomb #{selectedBomb !== null ? selectedBomb : "?"}</p>

                <div className="mt-3 bg-gray-900 text-gray-100 p-3 rounded-md text-sm font-mono">
                  <pre>
                    <code>
                      {`function dfs(graph, start) {
  const visited = new Set();
  const stack = [start];
  const chain = [];
  
  while (stack.length > 0) {
    const node = stack.pop();
    if (visited.has(node)) continue;
    
    visited.add(node);
    chain.push(node);
    
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }
  
  return { count: visited.size, chain };
}`}
                    </code>
                  </pre>
                </div>

                {dfsVisualization && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                    <p className="font-medium">Current DFS Execution:</p>
                    <p>Stack: [{dfsVisualization.stack.join(", ")}]</p>
                    <p>Visited: [{dfsVisualization.visited.join(", ")}]</p>
                    <p>Chain: [{explosionChain.join(", ")}]</p>
                    {dfsVisualization.current !== null && (
                      <>
                        <p className="mt-2 font-medium">Processing Bomb #{dfsVisualization.current}:</p>
                        {dfsVisualization.neighbors.length > 0 ? (
                          <p>Adding neighbors to stack: [{dfsVisualization.neighbors.join(", ")}]</p>
                        ) : (
                          <p>No unvisited neighbors to add to stack</p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mb-4">
            <h4 className="font-semibold mb-2">
              {maxChainResult ? "Maximum Chain Reaction" : "Current Chain Reaction"}
            </h4>
            <div className="bg-gray-100 p-3 rounded-md">
              <p>Starting bomb: #{selectedBomb !== null ? selectedBomb : "None"}</p>
              <p>Chain length: {explosionChain.length} bombs</p>
              {maxChainResult && (
                <>
                  <p className="font-bold text-green-600">This is the maximum possible chain!</p>
                  <div className="mt-3 bg-gray-900 text-gray-100 p-3 rounded-md text-sm font-mono">
                    <pre>
                      <code>
                        {`// Find maximum chain by trying each bomb as starting point
function findMaximumChain() {
  const graph = buildGraph();
  let maxChain = { count: 0, chain: [], startBomb: -1 };
  
  for (let i = 0; i < n; i++) {
    const result = dfs(graph, i);
    if (result.count > maxChain.count) {
      maxChain = { ...result, startBomb: i };
    }
  }
  
  return maxChain;}`}
                      </code>
                    </pre>
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Explosion Sequence:</h4>
            <div className="bg-gray-100 p-3 rounded-md max-h-60 overflow-y-auto">
              {explosionChain.length > 0 ? (
                <ol className="list-decimal pl-5">
                  {explosionChain.map((bombIndex, idx) => (
                    <li key={idx} className="mb-1">
                      Bomb #{bombIndex} [x:{bombs[bombIndex].x}, y:{bombs[bombIndex].y}, r:{bombs[bombIndex].radius}]
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-gray-500 italic">No explosions yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
