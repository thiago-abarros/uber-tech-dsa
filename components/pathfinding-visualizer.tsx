"use client"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { PathfindingState } from "@/lib/pathfinding"
import type { Bomb } from "@/lib/types"

interface PathfindingVisualizerProps {
  gridSize: number
  bombs: Bomb[]
  pathfindingState: PathfindingState | null
  startPoint: { x: number; y: number } | null
  endPoint: { x: number; y: number } | null
  currentStepIndex: number
  totalSteps: number
}

export default function PathfindingVisualizer({
  gridSize,
  bombs,
  pathfindingState,
  startPoint,
  endPoint,
  currentStepIndex,
  totalSteps,
}: PathfindingVisualizerProps) {
  // Calculate progress percentage for the progress bar
  const progressPercentage = totalSteps > 0 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0

  return (
    <Card className="p-4 h-[500px] overflow-y-auto">
      <h3 className="text-lg font-bold mb-3">DFS Pathfinding Algorithm</h3>

      {!startPoint || !endPoint ? (
        <div className="text-gray-500 italic">Please set start and end points on the grid to begin pathfinding.</div>
      ) : !pathfindingState ? (
        <div className="text-gray-500 italic">Click "Start DFS" to begin the pathfinding visualization.</div>
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
            <p className="font-medium">{pathfindingState.message || "Executing DFS algorithm..."}</p>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-2 text-blue-600">DFS Algorithm State</h4>
            <div className="bg-blue-50 p-3 rounded-md mb-3">
              <p>
                DFS uses a <strong>stack</strong> data structure to keep track of cells to visit. It explores as far as
                possible along each branch before backtracking.
              </p>

              <div className="mt-3 bg-gray-900 text-gray-100 p-3 rounded-md text-sm font-mono">
                <pre>
                  <code>
                    {`function dfs(start, end) {
  const stack = [start];
  const visited = new Set();
  
  while (stack.length > 0) {
    const current = stack.pop();
    if (visited.has(current)) continue;
    
    visited.add(current);
    if (current === end) return path;
    
    // Add all unvisited neighbors to stack
    for (const neighbor of getNeighbors(current)) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }
  
  return null; // No path found
}`}
                  </code>
                </pre>
              </div>
            </div>

            <div className="mt-3 p-3 bg-yellow-50 rounded-md">
              <p className="font-medium">Current DFS Execution:</p>
              <p>
                <span className="font-semibold">Stack:</span>{" "}
                {pathfindingState.stack.length > 0
                  ? pathfindingState.stack
                      .map((cell) => `(${cell.x},${cell.y})`)
                      .reverse()
                      .join(", ")
                  : "Empty"}
              </p>
              <p>
                <span className="font-semibold">Visited:</span>{" "}
                {pathfindingState.visitedOrder.length > 0
                  ? pathfindingState.visitedOrder.map((cell) => `(${cell.x},${cell.y})`).join(", ")
                  : "None"}
              </p>
              {pathfindingState.current && (
                <p className="font-semibold mt-2">
                  Currently exploring: ({pathfindingState.current.x},{pathfindingState.current.y})
                </p>
              )}
              {pathfindingState.neighbors.length > 0 && (
                <p>
                  <span className="font-semibold">Neighbors added to stack:</span>{" "}
                  {pathfindingState.neighbors.map((cell) => `(${cell.x},${cell.y})`).join(", ")}
                </p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">DFS vs BFS Comparison</h4>
            <div className="bg-gray-100 p-3 rounded-md">
              <p className="mb-2">
                <span className="font-semibold">DFS (Depth-First Search):</span> Explores as far as possible along each
                branch before backtracking. Uses a <strong>stack</strong> data structure.
              </p>
              <p className="mb-2">
                <span className="font-semibold">BFS (Breadth-First Search):</span> Explores all neighbors at the present
                depth before moving to nodes at the next depth level. Uses a <strong>queue</strong> data structure.
              </p>
              <p className="mb-2">
                <span className="font-semibold">Key Differences:</span>
              </p>
              <ul className="list-disc pl-5">
                <li>DFS may not find the shortest path, while BFS always finds the shortest path.</li>
                <li>DFS uses less memory than BFS for deep graphs.</li>
                <li>DFS is better for decision trees and maze generation.</li>
                <li>BFS is better for finding the shortest path and level-order traversal.</li>
              </ul>
            </div>
          </div>

          {pathfindingState.endReached && (
            <div>
              <h4 className="font-semibold mb-2 text-green-600">Path Found!</h4>
              <div className="bg-green-50 p-3 rounded-md">
                <p>
                  A path from ({startPoint.x},{startPoint.y}) to ({endPoint.x},{endPoint.y}) has been found with{" "}
                  {pathfindingState.path.length} steps.
                </p>
                <p className="mt-2 font-semibold">Path:</p>
                <p>{pathfindingState.path.map((cell) => `(${cell.x},${cell.y})`).join(" → ")}</p>
              </div>
            </div>
          )}

          {pathfindingState.stack.length === 0 && !pathfindingState.endReached && (
            <div>
              <h4 className="font-semibold mb-2 text-red-600">No Path Found</h4>
              <div className="bg-red-50 p-3 rounded-md">
                <p>
                  DFS has explored all possible paths but could not find a route from ({startPoint.x},{startPoint.y}) to
                  ({endPoint.x},{endPoint.y}).
                </p>
                <p className="mt-2">
                  This may be because the end point is surrounded by obstacles or is unreachable from the start point.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
