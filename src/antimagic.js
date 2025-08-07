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

function isAntimagicLabeling() {
    let weights = new Set()
    for (let vertex of graph.vertices) {
        let weight = calculateWeight(vertex)
        graphRender.renameVertex(vertex, weight)
        weights.add(weight)
    }
    return weights.size == graph.vertices.size
}

function* generatePermutations(arr) {
  const n = arr.length;

  // Base case: if the array has 0 or 1 element, it's already a permutation
  if (n <= 1) {
    yield arr;
    return;
  }

  // Recursive step: iterate through each element
  for (let i = 0; i < n; i++) {
    // Create a new array by removing the current element
    const remainingElements = [...arr.slice(0, i), ...arr.slice(i + 1)];

    // Recursively generate permutations of the remaining elements
    for (const subPermutation of generatePermutations(remainingElements)) {
      // Yield the current element prepended to each sub-permutation
      yield [arr[i], ...subPermutation];
    }
  }
}

function factorial(n) {
    let res = 1
    for (let i = 1; i <= n; i++) res *= i
    return res
}

window.findAntimagicLabeling = function* (all) {
    let edges = [...graph.edges]
    let edgePermutations = generatePermutations(edges)
    let attempt = 0
    let found = 0
    let total = factorial(edges.length)

    let progressBar = document.querySelector('#computation progress')
    let resultSpan = document.querySelector('#computation span')
    progressBar.max = total

    for (let perm of edgePermutations) {
        attempt++
        
        for (let i = 0; i < perm.length; i++) {
            graphRender.renameEdge(perm[i], i + 1)
        }
        
        if (isAntimagicLabeling(graph)) {
            found++
            if (!all) {
                resultSpan.innerText = 'An antimagic labeling was found'
                break
            }
        }

        progressBar.value = attempt

        yield
    }

    if (all) {
        resultSpan.innerText = `${found} out of ${attempt} (${found/attempt}) are antimagic`
    } else if (!all && found == 0) {
        resultSpan.innerHTML = 'No antimagic labeling was found'
    }
}
})()
