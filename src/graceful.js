(() => {
function calculateWeight(e) {
    return Math.abs(e.v1.name - e.v2.name)
}

function isGracefulLabeling() {
    let weights = new Set()
    for (let edge of graph.edges) {
        let weight = calculateWeight(edge)
        graphRender.renameEdge(edge, weight)
        if (weights.has(weight)) {
            return false
        }
        weights.add(weight)
    }
    return true
    // return weights.size == graph.edges.set.size
}

function* generatePermutations(arr, k) {
    const n = arr.length;
    if (k < 0 || k > n) {
        return; // Invalid k
    }

    // Base case: if k is 0, yield an empty array
    if (k === 0) {
        yield [];
        return;
    }

    // Recursive step: iterate through each element in the array
    for (let i = 0; i < n; i++) {
        const currentElement = arr[i];
        // Create a new array excluding the current element for the recursive call
        const remainingElements = arr.slice(0, i).concat(arr.slice(i + 1));

        // Recursively generate permutations of length k-1 from the remaining elements
        for (const perm of generatePermutations(remainingElements, k - 1)) {
            yield [currentElement, ...perm]; // Prepend the current element to each sub-permutation
        }
    }
}

function factorial(n) {
    let res = 1
    for (let i = 1; i <= n; i++) res *= i
    return res
}

function permutations(n, r) {
  return factorial(n) / factorial(n - r)
}

window.findGracefulLabeling = function* (all) {
    let vertices = [...graph.vertices]
    let codomain = [...Array(graph.edges.set.size + 1).keys()]
    let labelPermutations = generatePermutations(codomain, vertices.length)

    let attempt = 0
    let found = 0
    let total = permutations(codomain.length, vertices.length)

    let progressBar = document.querySelector('#computation progress')
    let resultSpan = document.querySelector('#computation span')
    progressBar.max = total

    for (let label of labelPermutations) {
        attempt++
        
        for (let i = 0; i < label.length; i++) {
            graphRender.renameVertex(vertices[i], label[i])
        }
        
        if (isGracefulLabeling(graph)) {
            found++
            if (!all) {
                resultSpan.innerText = 'A graceful labeling was found'
                break
            }
        }

        progressBar.value = attempt

        yield
    }

    if (all) {
        resultSpan.innerText = `${found} out of ${attempt} (${found/attempt}) are graceful`
    } else if (!all && found == 0) {
        resultSpan.innerHTML = 'No graceful labeling was found'
    }
}
})()
