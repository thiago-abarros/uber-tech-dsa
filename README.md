# DFS Algorithm Visualization

## Description

This project visualizes the Depth-First Search (DFS) algorithm for finding maximum bomb chains. It allows users to place bombs on a grid, trigger explosions, and visualize the DFS algorithm in action. Live demo at [dfs-algorithm-visualization](https://dfs-algorithm-visualization.vercel.app/).

## Technologies Used

<div style="display: flex; flex-wrap: wrap; gap: 5px;">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Lucide_React-7289DA?style=for-the-badge&logo=lucide&logoColor=white" alt="Lucide React"/>
</div>

## Features

*   Interactive game grid for bomb placement
*   Visualization of bomb explosion chains
*   DFS algorithm visualization
*   Adjustable grid size and bomb radius
*   Random bomb generation

## How It Works

The application uses a Depth-First Search (DFS) algorithm to find the maximum chain of bomb detonations. The algorithm builds a graph where bombs are connected if one can detonate another based on their Manhattan distance and radius. DFS is then used to find the longest chain of detonations.


## Python Solution

```python
def detonation(bombs):
    n = len(bombs)

    # calculate the distance between two bombs using manhattan distance
    def manhattan(i, j):
        return abs(bombs[i][0] - bombs[j][0]) + abs(bombs[i][1] - bombs[j][1])

    # for each bomb i, we have j bombs that can be detonated.
    graph = [[] for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j:
                # Chain Propagation
                if manhattan(i, j) <= bombs[i][2]:
                    graph[i].append(j)

    # function that, from an initial bomb, counts how many bombs explode
    # in the chain reaction using DFS (each bomb can only explode once).
    def dfs(start):
        visited = set()
        stack = [start]
        count = 0
        while stack:
            node = stack.pop()
            if node in visited:
                continue
            visited.add(node)
            count += 1
            for neighbor in graph[node]:
                if neighbor not in visited:
                    stack.append(neighbor)
        return count

    max_chain = 0
    for i in range(n):
        max_chain = max(max_chain, dfs(i))

    return max_chain

bombs = [[0, 0, 3], [2, 1, 2], [4, 1, 3], [9, 3, 2]]
print(detonation(bombs))
```

## Instructions

1.  Place bombs on the grid in "Place Bombs" mode.
2.  Switch to "Trigger Bombs" mode to trigger explosions.
3.  Click "Find Maximum Chain" to find the maximum bomb chain.
4.  Click "Visualize Maximum Chain" to see the DFS algorithm in action.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
