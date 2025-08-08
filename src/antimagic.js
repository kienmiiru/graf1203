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
        if (weights.has(weight)) {
            return false
        }
        weights.add(weight)
    }
    return true
    // return weights.size == graph.vertices.size
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

window.findAntimagicLabeling = function* (all) {
    let edges = [...graph.edges]
    let edgePermutations = generatePermutations(edges, edges.length)
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
