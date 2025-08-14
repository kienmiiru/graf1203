(() => {
function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

// Diadaptasi dari https://stackoverflow.com/a/14618505
window.generateRandomTree = function (order) {
    let vertices = []

    for (let i = 0; i < order; i++) {
        let vertex = graphRender.addVertex('', getRandomInt(20, 1000-20), getRandomInt(20, 500-20))
        vertices.push(vertex)
    }

    let s = new Set(vertices)
    let t = new Set()

    let currentVertex = Array.from(s)[getRandomInt(0, s.size)]
    s.delete(currentVertex)
    t.add(currentVertex)

    let step = 0

    while (s.size) {
        step++
        let neighbor = vertices[getRandomInt(0, order)]
        if (!t.has(neighbor)) {
            graphRender.addEdge(currentVertex, neighbor)
            s.delete(neighbor)
            t.add(neighbor)
        }
        currentVertex = neighbor
    }

    console.log(`Cover time is ${step}`)
}
})()