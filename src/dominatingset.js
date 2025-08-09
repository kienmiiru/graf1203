(() => {
function calculateWeight(v) {
    let v1 = v
    let sum = 0
    for (let v2 of v.getNeighbors()) {
        let edge = v.graph.edges.get([v1, v2])
        sum += parseInt(edge.name)
    }
    return sum
}

function isDominatingSet() {
    for (let vertex of graph.vertices) {
        if (vertex.name) continue // A vertex dominates itself

        let dominated = false
        for (let neighbor of vertex.getNeighbors()) {
            if (neighbor.name) {
                dominated = true
                break
            }
        }
        if (!dominated) return false
    }
    return true
}

function* generateCombinations(arr, k) {
    const n = arr.length;
    if (k < 0 || k > n) {
        return; // Invalid k
    }
    if (k === 0) {
        yield []; // Only one combination of 0 elements: an empty array
        return;
    }
    if (k === n) {
        yield [...arr]; // Only one combination of n elements: the array itself
        return;
    }

    function* generate(start, currentCombination) {
        if (currentCombination.length === k) {
            yield [...currentCombination];
            return;
        }
        for (let i = start; i < n; i++) {
            currentCombination.push(arr[i]);
            yield* generate(i + 1, currentCombination);
            currentCombination.pop(); // Backtrack
        }
    }

    yield* generate(0, []);
}

function factorial(n) {
    let res = 1
    for (let i = 1; i <= n; i++) res *= i
    return res
}

function combinations(n, k) {
  if (k < 0 || k > n) {
    return 0
  }
  if (k === 0 || k === n) {
    return 1
  }
  if (k > n / 2) {
    k = n - k
  }

  const numerator = factorial(n)
  const denominator = factorial(k) * factorial(n - k)
  return numerator / denominator
}

window.findDominatingSet = function* (cardinality, all) {
    let vertices = [...graph.vertices]
    let vertexPermutations = generateCombinations(vertices, cardinality)
    
    let attempt = 0
    let found = 0
    let total = combinations(vertices.length, cardinality)

    let progressBar = document.querySelector('#computation progress')
    let resultSpan = document.querySelector('#computation span')
    progressBar.max = total

    for (let vertex of vertices) {
        vertex.name = ''
    }

    for (let perm of vertexPermutations) {
        attempt++
        
        for (let vertex of perm) {
            graphRender.renameVertex(vertex, 'o')
        }
        
        if (isDominatingSet(graph)) {
            found++
            if (!all) {
                resultSpan.innerText = 'A dominating set was found'
                break
            }
        }

        for (let vertex of perm) {
            graphRender.renameVertex(vertex, '')
        }

        progressBar.value = attempt

        yield
    }

    if (all) {
        resultSpan.innerText = `${found} out of ${attempt} (${found/attempt}) are dominating sets`
    } else if (!all && found == 0) {
        resultSpan.innerHTML = `No dominating sets with cardinality ${cardinality} was found`
    }
}
})()
