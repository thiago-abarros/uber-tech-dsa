"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code } from "lucide-react"
import type { Bomb } from "@/lib/types"

interface CodeVisualizerProps {
  bombs: Bomb[]
  selectedBomb: number | null
  explosionChain: number[]
  algorithmStep: number
  manhattanVisualization: {
    from: number
    to: number
    distance: number
    canDetonate: boolean
  } | null
  dfsVisualization: {
    stack: number[]
    visited: number[]
    current: number | null
    neighbors: number[]
  } | null
}

export default function CodeVisualizer({
  bombs,
  selectedBomb,
  explosionChain,
  algorithmStep,
  manhattanVisualization,
  dfsVisualization,
}: CodeVisualizerProps) {
  const [activeTab, setActiveTab] = useState("full")

  // Determine which parts of the code to highlight based on the current algorithm step
  const getHighlightClass = (section: string) => {
    if (algorithmStep === -1) return ""

    if (algorithmStep === 0 && section === "manhattan") {
      return "bg-yellow-100 border-l-4 border-yellow-500 pl-2"
    }

    if (algorithmStep === 0 && section === "buildGraph") {
      return "bg-blue-100 border-l-4 border-blue-500 pl-2"
    }

    if (algorithmStep === 1 && section === "dfs") {
      return "bg-green-100 border-l-4 border-green-500 pl-2"
    }

    if (algorithmStep === 1 && section === "findMax") {
      return "bg-purple-100 border-l-4 border-purple-500 pl-2"
    }

    return ""
  }

  // Get specific line highlight based on DFS visualization state
  const getDfsLineHighlight = (lineNumber: number) => {
    if (!dfsVisualization || algorithmStep !== 1) return ""

    // Highlight different parts of the DFS algorithm based on current state
    if (dfsVisualization.current !== null) {
      // Processing a node
      if (lineNumber === 7) return "bg-green-200"
    }

    if (dfsVisualization.stack && dfsVisualization.stack.length > 0) {
      // Stack operations
      if (lineNumber === 3) return "bg-yellow-200"
    }

    if (dfsVisualization.visited && dfsVisualization.visited.length > 0) {
      // Visited operations
      if (lineNumber === 10) return "bg-blue-200"
      if (lineNumber === 11) return "bg-blue-200"
    }

    if (dfsVisualization.neighbors && dfsVisualization.neighbors.length > 0) {
      // Adding neighbors to stack
      if (lineNumber === 14) return "bg-purple-200"
    }

    return ""
  }

  return (
    <Card className="p-4 h-[500px] overflow-hidden">
      <div className="flex items-center mb-3">
        <Code className="mr-2" />
        <h3 className="text-lg font-bold">Algorithm Code</h3>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="full">Full Algorithm</TabsTrigger>
          <TabsTrigger value="manhattan">Manhattan Distance</TabsTrigger>
          <TabsTrigger value="dfs">DFS Implementation</TabsTrigger>
        </TabsList>

        <TabsContent value="full" className="h-[400px] overflow-y-auto">
          <div className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm font-mono">
            <pre>
              <code>
                {`function maximumBombChain(bombs) {
  const n = bombs.length;
  
  // Calculate Manhattan distance between two bombs
  ${manhattanVisualization ? "→ " : ""}function manhattan(i, j) {
    return Math.abs(bombs[i].x - bombs[j].x) + 
           Math.abs(bombs[i].y - bombs[j].y);
  }
  
  // Build the graph: for each bomb i, create a list of bombs j that can be detonated
  ${algorithmStep === 0 ? "→ " : ""}function buildGraph() {
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
    return graph;
  }
  
  // DFS function to count bombs in chain reaction
  ${algorithmStep === 1 ? "→ " : ""}function dfs(graph, start) {
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
  
  // Find maximum chain by trying each bomb as starting point
  ${algorithmStep === 1 ? "→ " : ""}function findMaximumChain() {
    const graph = buildGraph();
    let maxChain = { count: 0, chain: [], startBomb: -1 };
    
    for (let i = 0; i < n; i++) {
      const result = dfs(graph, i);
      if (result.count > maxChain.count) {
        maxChain = { ...result, startBomb: i };
      }
    }
    
    return maxChain;
  }
  
  // If a specific starting bomb is provided, just return its chain
  if (arguments.length > 1 && arguments[1] !== undefined) {
    const startBomb = arguments[1];
    const graph = buildGraph();
    const result = dfs(graph, startBomb);
    return { startBomb, ...result };
  }
  
  // Otherwise find the maximum chain
  return findMaximumChain();
}`}
              </code>
            </pre>
          </div>
        </TabsContent>

        <TabsContent value="manhattan" className="h-[400px] overflow-y-auto">
          <div className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm font-mono">
            <pre>
              <code className={getHighlightClass("manhattan")}>
                {`// Calculate Manhattan distance between two bombs
function manhattan(i, j) {
  // Manhattan distance is the sum of the absolute differences of their Cartesian coordinates
  return Math.abs(bombs[i].x - bombs[j].x) + Math.abs(bombs[i].y - bombs[j].y);
}

${
  manhattanVisualization
    ? `
// Example calculation:
// Bomb #${manhattanVisualization.from}: [x:${bombs[manhattanVisualization.from]?.x}, y:${bombs[manhattanVisualization.from]?.y}, r:${bombs[manhattanVisualization.from]?.radius}]
// Bomb #${manhattanVisualization.to}: [x:${bombs[manhattanVisualization.to]?.x}, y:${bombs[manhattanVisualization.to]?.y}]
// |${bombs[manhattanVisualization.from]?.x} - ${bombs[manhattanVisualization.to]?.x}| + |${bombs[manhattanVisualization.from]?.y} - ${bombs[manhattanVisualization.to]?.y}| = ${manhattanVisualization.distance}
// ${manhattanVisualization.canDetonate ? `${manhattanVisualization.distance} <= ${bombs[manhattanVisualization.from]?.radius} (CAN detonate)` : `${manhattanVisualization.distance} > ${bombs[manhattanVisualization.from]?.radius} (CANNOT detonate)`}
`
    : ""
}`}
              </code>
            </pre>
          </div>

          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h4 className="font-semibold mb-2">Manhattan Distance Explained</h4>
            <p>
              Manhattan distance (also known as taxicab or city block distance) is the distance between two points
              measured along axes at right angles. It is named after the grid layout of streets in Manhattan.
            </p>
            <p className="mt-2">For two points (x₁, y₁) and (x₂, y₂), the Manhattan distance is:</p>
            <p className="mt-1 font-mono text-center">|x₁ - x₂| + |y₁ - y₂|</p>
            <p className="mt-2">
              In our bomb game, a bomb can detonate another bomb if the Manhattan distance between them is less than or
              equal to the radius of the first bomb.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="dfs" className="h-[400px] overflow-y-auto">
          <div className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm font-mono">
            <pre>
              <code className={getHighlightClass("dfs")}>
                {`// DFS function to count bombs in chain reaction
function dfs(graph, start) {
  const visited = new Set();  // Track visited bombs${getDfsLineHighlight(3)}
  const stack = [start];      // Stack for DFS traversal
  const chain = [];           // Store the explosion sequence
  
  while (stack.length > 0) {
    const node = stack.pop();  // Get the next bomb to process${getDfsLineHighlight(7)}
    if (visited.has(node)) continue;  // Skip if already visited
    
    visited.add(node);  // Mark as visited${getDfsLineHighlight(10)}
    chain.push(node);   // Add to explosion chain${getDfsLineHighlight(11)}
    
    // Add all neighbors (bombs that can be detonated) to the stack
    for (const neighbor of graph[node]) {${getDfsLineHighlight(14)}
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

          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h4 className="font-semibold mb-2">Depth-First Search (DFS) Explained</h4>
            <p>
              DFS is an algorithm for traversing or searching tree or graph data structures. It starts at a selected
              node (in our case, a bomb) and explores as far as possible along each branch before backtracking.
            </p>
            <p className="mt-2">In our bomb chain reaction:</p>
            <ol className="list-decimal pl-5 mt-1">
              <li>We start with a bomb and mark it as visited</li>
              <li>We add it to our explosion chain</li>
              <li>We explore all bombs that can be detonated by this bomb</li>
              <li>For each of those bombs, we repeat the process</li>
              <li>We continue until no more bombs can be detonated</li>
            </ol>
            <p className="mt-2">This allows us to find the complete chain reaction from any starting bomb.</p>

            {dfsVisualization && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                <p className="font-medium">Current DFS State:</p>
                <p>Stack: [{dfsVisualization.stack.join(", ")}]</p>
                <p>Visited: [{dfsVisualization.visited.join(", ")}]</p>
                <p>Chain: [{explosionChain.join(", ")}]</p>
                {dfsVisualization.current !== null && <p>Currently processing: Bomb #{dfsVisualization.current}</p>}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
