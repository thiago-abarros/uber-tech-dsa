"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Info, AlertCircle, CheckCircle2, Code, BookOpen, Zap } from "lucide-react"
import type { Bomb } from "@/lib/types"
import type { DFSVisualizationStep } from "@/lib/dfs-visualizer"

interface EnhancedDFSVisualizerProps {
  bombs: Bomb[]
  currentStep: DFSVisualizationStep | null
  currentStepIndex: number
  totalSteps: number
  selectedBomb: number | null
  explosionChain: number[]
}

export default function EnhancedDFSVisualizer({
  bombs,
  currentStep,
  currentStepIndex,
  totalSteps,
  selectedBomb,
  explosionChain,
}: EnhancedDFSVisualizerProps) {
  const [activeTab, setActiveTab] = useState("algorithm")

  // Calculate progress percentage
  const progressPercentage = totalSteps > 0 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0

  // Helper function to render the appropriate content based on step type
  const renderStepContent = () => {
    if (!currentStep) return null

    switch (currentStep.type) {
      case "initialize":
        return (
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="font-semibold flex items-center">
              <Info className="w-5 h-5 mr-2 text-blue-500" />
              Initialization
            </h4>
            <p className="mt-2">
              The DFS algorithm will analyze all possible bomb chains starting from each bomb. We have{" "}
              {currentStep.data.bombCount} bombs to check.
            </p>
            <div className="mt-3 p-3 bg-gray-100 rounded-md">
              <p className="font-medium">Algorithm Overview:</p>
              <ol className="list-decimal pl-5 mt-1 space-y-1">
                <li>Build a graph where bombs are connected if one can detonate another</li>
                <li>For each bomb as a starting point, run DFS to find the chain reaction</li>
                <li>Keep track of the maximum chain found</li>
                <li>Return the maximum chain as the result</li>
              </ol>
            </div>
          </div>
        )

      case "distance-check":
        const distanceData = currentStep.data
        return (
          <div className="bg-purple-50 p-4 rounded-md">
            <h4 className="font-semibold flex items-center">
              <Info className="w-5 h-5 mr-2 text-purple-500" />
              Distance Check
            </h4>
            <div className="mt-2 space-y-2">
              <p>
                Checking if <strong>Bomb #{distanceData.fromBomb}</strong> can detonate{" "}
                <strong>Bomb #{distanceData.toBomb}</strong>
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-gray-100 p-2 rounded-md">
                  <p className="font-medium">Bomb #{distanceData.fromBomb}:</p>
                  <p>
                    Position: ({bombs[distanceData.fromBomb].x}, {bombs[distanceData.fromBomb].y})
                  </p>
                  <p>Radius: {distanceData.radius}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded-md">
                  <p className="font-medium">Bomb #{distanceData.toBomb}:</p>
                  <p>
                    Position: ({bombs[distanceData.toBomb].x}, {bombs[distanceData.toBomb].y})
                  </p>
                </div>
              </div>
              <div className="mt-3 p-3 bg-gray-100 rounded-md">
                <p className="font-medium">Manhattan Distance Calculation:</p>
                <p className="mt-1">
                  |{bombs[distanceData.fromBomb].x} - {bombs[distanceData.toBomb].x}| + |
                  {bombs[distanceData.fromBomb].y} - {bombs[distanceData.toBomb].y}| = {distanceData.distance}
                </p>
                <p className={`mt-2 font-semibold ${distanceData.canDetonate ? "text-green-600" : "text-red-600"}`}>
                  {distanceData.distance} {distanceData.canDetonate ? "≤" : ">"} {distanceData.radius} (
                  {distanceData.canDetonate ? "CAN detonate" : "CANNOT detonate"})
                </p>
              </div>
            </div>
          </div>
        )

      case "graph-building":
        return (
          <div className="bg-green-50 p-4 rounded-md">
            <h4 className="font-semibold flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
              Graph Building Complete
            </h4>
            <p className="mt-2">
              The bomb detonation graph has been built. Each bomb is connected to all bombs it can detonate.
            </p>
            <div className="mt-3 p-3 bg-gray-100 rounded-md">
              <p className="font-medium">Connection Summary:</p>
              <p className="mt-1">Total connections: {currentStep.data.connections.length}</p>
              <div className="mt-2 max-h-32 overflow-y-auto">
                {currentStep.data.connections.length > 0 ? (
                  <ul className="text-sm space-y-1">
                    {currentStep.data.connections.slice(0, 10).map((conn: any, idx: number) => (
                      <li key={idx}>
                        Bomb #{conn.from} → Bomb #{conn.to}
                      </li>
                    ))}
                    {currentStep.data.connections.length > 10 && (
                      <li className="italic text-gray-500">
                        ...and {currentStep.data.connections.length - 10} more connections
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No connections found. No bomb can detonate another.</p>
                )}
              </div>
            </div>
          </div>
        )

      case "dfs-start":
        const dfsStartData = currentStep.data
        return (
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="font-semibold flex items-center">
              <Info className="w-5 h-5 mr-2 text-blue-500" />
              Starting DFS
            </h4>
            <p className="mt-2">
              Starting Depth-First Search from <strong>Bomb #{dfsStartData.startBomb}</strong> to find its chain
              reaction.
            </p>
            <div className="mt-3 p-3 bg-gray-100 rounded-md">
              <p className="font-medium">DFS State:</p>
              <p className="mt-1">
                <span className="font-semibold">Stack:</span> [{dfsStartData.stack.join(", ")}]
              </p>
              <p>
                <span className="font-semibold">Visited:</span>{" "}
                {dfsStartData.visited.length > 0 ? `[${dfsStartData.visited.join(", ")}]` : "[]"}
              </p>
              <p>
                <span className="font-semibold">Chain:</span>{" "}
                {dfsStartData.chain.length > 0 ? `[${dfsStartData.chain.join(", ")}]` : "[]"}
              </p>
            </div>
            <div className="mt-3 p-3 bg-yellow-50 rounded-md">
              <p className="font-medium">How DFS Works:</p>
              <p className="mt-1">
                DFS uses a stack to keep track of bombs to explore. It starts with the initial bomb, then explores as
                far as possible along each branch before backtracking.
              </p>
            </div>
          </div>
        )

      case "dfs-process":
      case "dfs-visit":
      case "dfs-add-neighbors":
      case "dfs-backtrack":
        const dfsData = currentStep.data
        return (
          <div
            className={`p-4 rounded-md ${
              currentStep.type === "dfs-backtrack"
                ? "bg-amber-50"
                : currentStep.type === "dfs-visit"
                  ? "bg-green-50"
                  : currentStep.type === "dfs-add-neighbors"
                    ? "bg-blue-50"
                    : "bg-purple-50"
            }`}
          >
            <h4 className="font-semibold flex items-center">
              <Info
                className={`w-5 h-5 mr-2 ${
                  currentStep.type === "dfs-backtrack"
                    ? "text-amber-500"
                    : currentStep.type === "dfs-visit"
                      ? "text-green-500"
                      : currentStep.type === "dfs-add-neighbors"
                        ? "text-blue-500"
                        : "text-purple-500"
                }`}
              />
              {currentStep.type === "dfs-process"
                ? "Processing Bomb"
                : currentStep.type === "dfs-visit"
                  ? "Adding to Chain"
                  : currentStep.type === "dfs-add-neighbors"
                    ? "Adding Neighbors"
                    : "Backtracking"}
            </h4>
            <p className="mt-2">{currentStep.message}</p>
            <div className="mt-3 p-3 bg-gray-100 rounded-md">
              <p className="font-medium">DFS State:</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <p className="font-semibold">Current:</p>
                  <p>{dfsData.currentBomb !== null ? `Bomb #${dfsData.currentBomb}` : "No bomb being processed"}</p>
                </div>
                <div>
                  <p className="font-semibold">Start Bomb:</p>
                  <p>Bomb #{dfsData.startBomb}</p>
                </div>
              </div>
              <div className="mt-2">
                <p className="font-semibold">Stack:</p>
                <div className="bg-white p-2 rounded border mt-1 max-h-20 overflow-y-auto">
                  {dfsData.stack.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {dfsData.stack.map((bomb: number, idx: number) => (
                        <Badge key={idx} variant="outline">
                          #{bomb}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Empty stack</p>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <p className="font-semibold">Visited:</p>
                <div className="bg-white p-2 rounded border mt-1 max-h-20 overflow-y-auto">
                  {dfsData.visited.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {dfsData.visited.map((bomb: number, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-gray-100">
                          #{bomb}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No bombs visited yet</p>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <p className="font-semibold">Current Chain:</p>
                <div className="bg-white p-2 rounded border mt-1 max-h-20 overflow-y-auto">
                  {dfsData.chain.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {dfsData.chain.map((bomb: number, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-green-100">
                          #{bomb}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Chain is empty</p>
                  )}
                </div>
              </div>
              {currentStep.type === "dfs-add-neighbors" && dfsData.neighbors.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold">Neighbors Added:</p>
                  <div className="bg-white p-2 rounded border mt-1">
                    <div className="flex flex-wrap gap-1">
                      {dfsData.neighbors.map((bomb: number, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-blue-100">
                          #{bomb}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {currentStep.type === "dfs-backtrack" && (
              <div className="mt-3 p-3 bg-amber-100 rounded-md">
                <p className="font-medium flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1 text-amber-600" />
                  Backtracking
                </p>
                <p className="mt-1">
                  {dfsData.backtracking
                    ? `Bomb #${dfsData.currentBomb} has already been visited or has no unvisited neighbors. The algorithm will backtrack to explore other paths.`
                    : "The algorithm has finished exploring this branch and will backtrack to explore other paths."}
                </p>
              </div>
            )}
          </div>
        )

      case "max-chain-found":
        const maxChainData = currentStep.data
        return (
          <div className="bg-green-50 p-4 rounded-md">
            <h4 className="font-semibold flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
              Maximum Chain Found!
            </h4>
            <p className="mt-2">
              The maximum bomb chain starts from <strong>Bomb #{maxChainData.startBomb}</strong> and detonates{" "}
              <strong>{maxChainData.count} bombs</strong> in total.
            </p>
            <div className="mt-3 p-3 bg-gray-100 rounded-md">
              <p className="font-medium">Chain Sequence:</p>
              <div className="bg-white p-2 rounded border mt-1 max-h-32 overflow-y-auto">
                <div className="flex flex-wrap gap-1">
                  {maxChainData.chain.map((bomb: number, idx: number) => (
                    <Badge key={idx} variant="outline" className="bg-green-100">
                      {idx === 0 ? "Start: " : "→"} #{bomb}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 p-3 bg-blue-100 rounded-md">
              <p className="font-medium">Chain Comparison:</p>
              <div className="mt-2 grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                {maxChainData.allTestedChains
                  .sort((a: any, b: any) => b.count - a.count)
                  .map((chain: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-2 rounded ${
                        chain.startBomb === maxChainData.startBomb ? "bg-green-200" : "bg-white"
                      }`}
                    >
                      <p className="font-medium">
                        Start Bomb #{chain.startBomb}: {chain.count} bombs
                        {chain.startBomb === maxChainData.startBomb && " (Maximum)"}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {chain.chain.slice(0, 5).map((bomb: number, i: number) => (
                          <Badge key={i} variant="outline" className="bg-gray-50">
                            #{bomb}
                          </Badge>
                        ))}
                        {chain.chain.length > 5 && <Badge variant="outline">+{chain.chain.length - 5} more</Badge>}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )

      default:
        return <p>Unknown step type: {currentStep.type}</p>
    }
  }

  // Render the algorithm explanation tab
  const renderAlgorithmExplanation = () => {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-md">
          <h4 className="font-semibold flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-500" />
            Depth-First Search (DFS) Algorithm
          </h4>
          <p className="mt-2">
            DFS is a graph traversal algorithm that explores as far as possible along each branch before backtracking.
            In the context of finding the maximum bomb chain:
          </p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>We build a graph where bombs are connected if one can detonate another</li>
            <li>For each bomb as a starting point, we run DFS to find all bombs that would detonate in a chain</li>
            <li>We keep track of the maximum chain found</li>
            <li>We return the maximum chain as the result</li>
          </ol>
        </div>

        <div className="bg-gray-100 p-4 rounded-md">
          <h4 className="font-semibold flex items-center">
            <Info className="w-5 h-5 mr-2 text-gray-700" />
            Key Concepts
          </h4>
          <div className="mt-2 space-y-3">
            <div>
              <p className="font-medium">Manhattan Distance:</p>
              <p>
                The distance between two bombs is calculated as the sum of the absolute differences of their
                coordinates: |x₁ - x₂| + |y₁ - y₂|
              </p>
            </div>
            <div>
              <p className="font-medium">Detonation Rule:</p>
              <p>
                A bomb can detonate another bomb if the Manhattan distance between them is less than or equal to the
                radius of the first bomb.
              </p>
            </div>
            <div>
              <p className="font-medium">DFS Components:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>
                  <strong>Stack:</strong> Keeps track of bombs to explore next
                </li>
                <li>
                  <strong>Visited Set:</strong> Keeps track of bombs that have already been processed
                </li>
                <li>
                  <strong>Chain:</strong> The sequence of bombs that detonate in the chain reaction
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-md">
          <h4 className="font-semibold flex items-center">
            <Zap className="w-5 h-5 mr-2 text-green-600" />
            Time and Space Complexity
          </h4>
          <div className="mt-2 space-y-2">
            <p>
              <strong>Time Complexity:</strong> O(n²) where n is the number of bombs. We need to check each bomb against
              every other bomb to build the graph, and then run DFS from each bomb.
            </p>
            <p>
              <strong>Space Complexity:</strong> O(n²) for the graph representation, plus O(n) for the DFS stack and
              visited set.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Render the code explanation tab
  const renderCodeExplanation = () => {
    return (
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded-md">
          <h4 className="font-semibold flex items-center">
            <Code className="w-5 h-5 mr-2 text-gray-700" />
            DFS Algorithm Implementation
          </h4>
          <div className="mt-3 bg-gray-900 text-gray-100 p-3 rounded-md text-sm font-mono overflow-x-auto">
            <pre>
              <code>
                {`// Calculate Manhattan distance between two bombs
function manhattanDistance(bombs, i, j) {
  return Math.abs(bombs[i].x - bombs[j].x) + 
         Math.abs(bombs[i].y - bombs[j].y);
}

// Build the graph of bomb detonations
function buildBombGraph(bombs) {
  const n = bombs.length;
  const graph = Array(n).fill(null).map(() => []);

  for (let i =   {
  const n = bombs.length;
  const graph = Array(n).fill(null).map(() => []);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        // Bomb i detonates bomb j if Manhattan distance <= R_i
        if (manhattanDistance(bombs, i, j) <= bombs[i].radius) {
          graph[i].push(j);
        }
      }
    }
  }

  return graph;
}

// DFS to find the chain of bomb detonations
function dfs(graph, start) {
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
}

// Find the maximum bomb chain
function findMaximumBombChain(bombs) {
  const graph = buildBombGraph(bombs);
  let maxChain = { count: 0, chain: [], startBomb: -1 };
  
  for (let i = 0; i < bombs.length; i++) {
    const result = dfs(graph, i);
    if (result.count > maxChain.count) {
      maxChain = { ...result, startBomb: i };
    }
  }
  
  return maxChain;
}`}
              </code>
            </pre>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="font-semibold">Graph Building</h4>
            <p className="mt-2">
              The algorithm first builds a graph where each bomb is connected to other bombs it can detonate:
            </p>
            <ol className="list-decimal pl-5 mt-1 space-y-1">
              <li>Calculate Manhattan distance between each pair of bombs</li>
              <li>If the distance is less than or equal to the radius of the first bomb, add a connection</li>
              <li>The result is a directed graph where edges represent detonation relationships</li>
            </ol>
          </div>

          <div className="bg-green-50 p-4 rounded-md">
            <h4 className="font-semibold">DFS Implementation</h4>
            <p className="mt-2">The DFS algorithm works as follows:</p>
            <ol className="list-decimal pl-5 mt-1 space-y-1">
              <li>Start with a bomb and push it onto the stack</li>
              <li>While the stack is not empty, pop a bomb and process it</li>
              <li>If the bomb hasn't been visited, mark it as visited and add it to the chain</li>
              <li>Push all unvisited neighbors onto the stack</li>
              <li>Repeat until the stack is empty</li>
            </ol>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-md">
          <h4 className="font-semibold">Finding the Maximum Chain</h4>
          <p className="mt-2">
            To find the maximum chain, we run DFS from each bomb as a starting point and keep track of the longest chain
            found:
          </p>
          <ol className="list-decimal pl-5 mt-1 space-y-1">
            <li>For each bomb i, run DFS starting from i</li>
            <li>Calculate the size of the resulting chain</li>
            <li>If this chain is longer than the current maximum, update the maximum</li>
            <li>Return the maximum chain found</li>
          </ol>
        </div>
      </div>
    )
  }

  return (
    <Card className="p-4 h-[500px] overflow-y-auto">
      <h3 className="text-lg font-bold mb-3">DFS Algorithm Visualization</h3>

      {bombs.length === 0 ? (
        <div className="text-gray-500 italic">Place some bombs on the grid to start.</div>
      ) : !currentStep ? (
        <div className="text-gray-500 italic">Click "Visualize Maximum Chain" to see the DFS algorithm in action.</div>
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
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="font-medium">{currentStep.message}</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="algorithm">Current Step</TabsTrigger>
              <TabsTrigger value="explanation">Algorithm Explanation</TabsTrigger>
              <TabsTrigger value="code">Code Explanation</TabsTrigger>
            </TabsList>

            <TabsContent value="algorithm">{renderStepContent()}</TabsContent>
            <TabsContent value="explanation">{renderAlgorithmExplanation()}</TabsContent>
            <TabsContent value="code">{renderCodeExplanation()}</TabsContent>
          </Tabs>
        </div>
      )}
    </Card>
  )
}
