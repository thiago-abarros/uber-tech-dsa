"use client"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Info, CheckCircle2 } from "lucide-react"
import type { Bomb } from "@/lib/types"
import type { DFSVisualizationStep } from "@/lib/dfs-visualizer"

interface SimplifiedDFSVisualizerProps {
  bombs: Bomb[]
  currentStep: DFSVisualizationStep | null
  currentStepIndex: number
  totalSteps: number
  selectedBomb: number | null
  explosionChain: number[]
}

export default function SimplifiedDFSVisualizer({
  bombs,
  currentStep,
  currentStepIndex,
  totalSteps,
  selectedBomb,
  explosionChain,
}: SimplifiedDFSVisualizerProps) {
  // Calculate progress percentage
  const progressPercentage = totalSteps > 0 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0

  // Helper function to render the appropriate content based on step type
  const renderStepContent = () => {
    if (!currentStep) return null

    switch (currentStep.type) {
      case "initialize":
        return (
          <div className="bg-secondary p-4 rounded-md border border-border">
            <h4 className="font-semibold flex items-center text-foreground">
              <Info className="w-5 h-5 mr-2 text-ada-green" />
              Initialization
            </h4>
            <p className="mt-2 text-foreground">
              The DFS algorithm will analyze all possible bomb chains starting from each bomb. We have{" "}
              {currentStep.data.bombCount} bombs to check.
            </p>
            <div className="mt-3 p-3 bg-background rounded-md border border-border">
              <p className="font-medium text-foreground">Algorithm Overview:</p>
              <ol className="list-decimal pl-5 mt-1 space-y-1 text-foreground">
                <li>Build a graph where bombs are connected if one can detonate another</li>
                <li>For each bomb as a starting point, run DFS to find the chain reaction</li>
                <li>Keep track of the maximum chain found</li>
                <li>Return the maximum chain as the result</li>
              </ol>
            </div>
          </div>
        )

      case "graph-building":
        return (
          <div className="bg-secondary p-4 rounded-md border border-border">
            <h4 className="font-semibold flex items-center text-foreground">
              <CheckCircle2 className="w-5 h-5 mr-2 text-ada-green" />
              Graph Building Complete
            </h4>
            <p className="mt-2 text-foreground">
              The bomb detonation graph has been built. Each bomb is connected to all bombs it can detonate.
            </p>
            <div className="mt-3 p-3 bg-background rounded-md border border-border">
              <p className="font-medium text-foreground">Connection Summary:</p>
              <p className="mt-1 text-foreground">Total connections: {currentStep.data.connections.length}</p>
            </div>
          </div>
        )

      case "dfs-process":
      case "dfs-visit":
      case "dfs-add-neighbors":
        const dfsData = currentStep.data
        return (
          <div className={`p-4 rounded-md border border-border bg-secondary`}>
            <h4 className="font-semibold flex items-center text-foreground">
              <Info className={`w-5 h-5 mr-2 text-ada-green`} />
              {currentStep.type === "dfs-visit" ? "Adding to Chain" : "Adding Neighbors"}
            </h4>
            <p className="mt-2 text-foreground">{currentStep.message}</p>
            <div className="mt-3 p-3 bg-background rounded-md border border-border">
              <p className="font-medium text-foreground">DFS State:</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <p className="font-semibold text-foreground">Current:</p>
                  <p className="text-foreground">
                    {dfsData.currentBomb !== null ? `Bomb #${dfsData.currentBomb}` : "No bomb being processed"}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Start Bomb:</p>
                  <p className="text-foreground">Bomb #{dfsData.startBomb}</p>
                </div>
              </div>
              <div className="mt-2">
                <p className="font-semibold text-foreground">Stack:</p>
                <div className="bg-card p-2 rounded border border-border mt-1 max-h-20 overflow-y-auto">
                  {dfsData.stack.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {dfsData.stack.map((bomb: number, idx: number) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="bg-yellow-500/20 text-foreground border-yellow-500"
                        >
                          #{bomb}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">Empty stack</p>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <p className="font-semibold text-foreground">Current Chain:</p>
                <div className="bg-card p-2 rounded border border-border mt-1 max-h-20 overflow-y-auto">
                  {dfsData.chain.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {dfsData.chain.map((bomb: number, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-ada-green/20 text-foreground border-ada-green">
                          #{bomb}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">Chain is empty</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case "max-chain-found":
        const maxChainData = currentStep.data
        return (
          <div className="bg-secondary p-4 rounded-md border border-border">
            <h4 className="font-semibold flex items-center text-foreground">
              <CheckCircle2 className="w-5 h-5 mr-2 text-ada-green" />
              Maximum Chain Found!
            </h4>
            <p className="mt-2 text-foreground">
              The maximum bomb chain starts from <strong>Bomb #{maxChainData.startBomb}</strong> and detonates{" "}
              <strong>{maxChainData.count} bombs</strong> in total.
            </p>
            <div className="mt-3 p-3 bg-background rounded-md border border-border">
              <p className="font-medium text-foreground">Chain Sequence:</p>
              <div className="bg-card p-2 rounded border border-border mt-1 max-h-32 overflow-y-auto">
                <div className="flex flex-wrap gap-1">
                  {maxChainData.chain.map((bomb: number, idx: number) => (
                    <Badge key={idx} variant="outline" className="bg-ada-green/20 text-foreground border-ada-green">
                      {idx === 0 ? "Start: " : "→"} #{bomb}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return <p className="text-foreground">Unknown step type: {currentStep.type}</p>
    }
  }

  return (
    <Card className="p-4 h-[500px] overflow-y-auto bg-card border-border">
      <h3 className="text-lg font-bold mb-3 text-foreground">DFS Algorithm Visualization</h3>

      {bombs.length === 0 ? (
        <div className="text-muted-foreground italic">Place some bombs on the grid to start.</div>
      ) : !currentStep ? (
        <div className="text-muted-foreground italic">
          Click "Visualize Maximum Chain" to see the DFS algorithm in action.
        </div>
      ) : (
        <div>
          {/* Progress bar for algorithm execution */}
          {totalSteps > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Step {currentStepIndex + 1}</span>
                <span>Total Steps: {totalSteps}</span>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-secondary" indicatorClassName="bg-ada-green" />
            </div>
          )}

          {/* Current step message */}
          <div className="mb-4 p-3 bg-secondary rounded-md border border-border">
            <p className="font-medium text-foreground">{currentStep.message}</p>
          </div>

          {renderStepContent()}
        </div>
      )}
    </Card>
  )
}
