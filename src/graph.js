class Vertex {
    constructor(name='') {
        this.name = name
        this.graph = null
    }

    setGraph(graph) {
        this.graph = graph
    }

    delete() {
        if (this.graph == null) return

        return this.graph.deleteVertex(this)
    }

    getNeighbors() {
        return this.graph.edges.getNeighbors(this)
    }
}

class Edge {
    constructor(v1, v2, name='') {
        this.v1 = v1
        this.v2 = v2
        this.name = name
    }
}

// A simple set wrapper that allows some operations in O(1)
class EdgeSet {
    constructor() {
        this.set = new Set()
        this.edgesIndexer = new Map()
    }

    has(edge) {
        // Case 1 where edge is already the edge object
        if (this.set.has(edge)) return true

        // Case 2 where edge is passed as a 2-tuple
        if (!this.edgesIndexer.get(edge[0])) {
            return false
        }
        return this.edgesIndexer.get(edge[0]).has(edge[1])
    }

    get(edge) {
        if (!this.has(edge)) {
            return null
        }

        return this.edgesIndexer.get(edge[0]).get(edge[1])
    }

    add(edge, name='') {
        if (this.has(edge)) {
            return false
        }
        
        // Indexing
        if (!this.edgesIndexer.get(edge[0])) {
            this.edgesIndexer.set(edge[0], new Map())
        }
        if (!this.edgesIndexer.get(edge[1])) {
            this.edgesIndexer.set(edge[1], new Map())
        }

        let newEdge = new Edge(edge[0], edge[1], name)
        this.set.add(newEdge)
        
        this.edgesIndexer.get(edge[0]).set(edge[1], newEdge)
        this.edgesIndexer.get(edge[1]).set(edge[0], newEdge)

        return newEdge
    }

    delete(edge) {
        if (!this.has(edge)) {
            return false
        }

        this.set.delete(edge)

        // Indexing
        this.edgesIndexer.get(edge.v1).delete(edge.v2)
        this.edgesIndexer.get(edge.v2).delete(edge.v1)
        
        return true
    }

    getNeighbors(vertex) {
        if (!this.edgesIndexer.get(vertex)) {
            return []
        }
        return [...this.edgesIndexer.get(vertex).keys()]
    }

    *[Symbol.iterator]() {
        yield* this.set;
    }
}

class Graph {
    constructor(vertices=[], edges=[]) {
        this.vertices = new Set()
        this.edges = new EdgeSet()
        
        for (let vertex of vertices) {
            this.addVertex(vertex)
        }
        
        for (let edge of edges) {
            this.addEdge([edge[0], edge[1]], edge[2] || '')
        }
    }
    
    addVertex(vertex) {
        if (this.vertices.has(vertex)) return false
        this.vertices.add(vertex)
        vertex.setGraph(this)
        return true
    }
    
    deleteVertex(vertex) {
        if (!this.vertices.has(vertex)) return false
        this.vertices.delete(vertex)
        vertex.setGraph(null)
        return true
    }

    hasEdge(edge) {
        return this.edges.has(edge)
    }
    
    addEdge(edge, name='') {
        if (!this.vertices.has(edge[0]) || !this.vertices.has(edge[1])) {
            throw 'Vertex is not added yet'
        }
        
        return this.edges.add(edge, name)
    }
    
    deleteEdge(edge) {
        return this.edges.delete(edge)
    }
}

class GraphManager {
    constructor(graph, graphRender, vertexDiv, edgeDiv, vertexPropertyDiv, edgePropertyDiv) {
        this.graph = graph
        this.graphRender = graphRender
        this.state = graphRender.state
        this.vertexDiv = vertexDiv
        this.edgeDiv = edgeDiv
        this.vertexElem = new Map()
        this.edgeElem = new Map()

        for (let vertex of graph.vertices) {
            this.createVertexElem(vertex)
        }

        for (let edge of graph.edges) {
            this.createEdgeElem(edge)
        }

        this.vertexPropertyDiv = vertexPropertyDiv
        this.edgePropertyDiv = edgePropertyDiv

        // Handle vertex name change
        this.vertexPropertyDiv.querySelector('#namaTitik').addEventListener('input', (e) => {
            let vertex = this.state.vertexBeingSelected
            this.graphRender.renameVertex(vertex, e.target.value)
        })

        this.edgePropertyDiv.querySelector('#namaSisi').addEventListener('input', (e) => {
            let edge = this.state.edgeBeingSelected
            this.graphRender.renameEdge(edge, e.target.value)
        })

        this.vertexPropertyDiv.querySelector('#hapusTitik').addEventListener('click', () => {
            let vertex = this.state.vertexBeingSelected
            this.graphRender.deleteVertex(vertex)
            this.graphRender.changeSelectedVertex(null)
        })

        this.edgePropertyDiv.querySelector('#hapusSisi').addEventListener('click', () => {
            let edge = this.state.edgeBeingSelected
            this.graphRender.deleteEdge(edge)
            this.state.edgeBeingSelected = null
            this.graphRender.changeSelectedEdge(null)
        })
    }

    createVertexElem(vertex) {
        let elem = document.createElement('div')
        elem.innerText = vertex.name || 'Unnamed vertex'
        elem.addEventListener('click', () => {
            this.graphRender.changeSelectedVertex(vertex)
        })
        this.vertexDiv.append(elem)
        this.vertexElem.set(vertex, elem)
    }

    updateVertexElem(vertex) {
        this.vertexElem.get(vertex).innerText = vertex.name
    }

    deleteVertexElem(vertex) {
        let elem = this.vertexElem.get(vertex)
        this.vertexElem.delete(vertex)
        elem.remove()
    }

    createEdgeElem(edge) {
        let elem = document.createElement('div')
        elem.innerText = `${edge.v1.name || '?'}-${edge.v2.name || '?'}` + (edge.name ? ` [${edge.name}]` : '')
        elem.addEventListener('click', () => {
            this.graphRender.changeSelectedEdge(edge)
        })
        this.edgeDiv.append(elem)
        this.edgeElem.set(edge, elem)
    }

    updateEdgeElem(edge) {
        this.edgeElem.get(edge).innerText = `${edge.v1.name || '?'}-${edge.v2.name || '?'}` + (edge.name ? ` [${edge.name}]` : '')
    }

    deleteEdgeElem(edge) {
        let elem = this.edgeElem.get(edge)
        this.edgeElem.delete(elem)
        elem.remove()
    }

    hideVertexPropertyDiv() {
        this.vertexPropertyDiv.classList.add('hidden')
    }

    showVertexPropertyDiv() {
        this.vertexPropertyDiv.classList.remove('hidden')
    }

    focusVertexPropertyDiv() {
        this.vertexPropertyDiv.querySelector('#namaTitik').focus()
    }

    hideEdgePropertyDiv() {
        this.edgePropertyDiv.classList.add('hidden')
    }

    showEdgePropertyDiv() {
        this.edgePropertyDiv.classList.remove('hidden')
    }

    focusEdgePropertyDiv() {
        this.edgePropertyDiv.querySelector('#namaSisi').focus()
    }

    update() {
        for (let vertex of graph.vertices) {
            let elem = this.vertexElem.get(vertex)
            if (this.state.vertexBeingSelected == vertex) {
                elem.classList.add('selected')
            } else {
                elem.classList.remove('selected')
            }
        }

        for (let edge of graph.edges) {
            let elem = this.edgeElem.get(edge)
            if (this.state.edgeBeingSelected == edge) {
                elem.classList.add('selected')
            } else {
                elem.classList.remove('selected')
            }
        }

        if (this.state.vertexBeingSelected) {
            this.showVertexPropertyDiv()
            this.vertexPropertyDiv.querySelector('#namaTitik').value = this.state.vertexBeingSelected?.name || ''
        } else {
            this.hideVertexPropertyDiv()
        }

        if (this.state.edgeBeingSelected) {
            this.showEdgePropertyDiv()
            this.edgePropertyDiv.querySelector('#namaSisi').value = this.state.edgeBeingSelected?.name || ''
        } else {
            this.hideEdgePropertyDiv()
        }
    }
}

class GraphRender {
    constructor(graph, positions, canvas, vertexDiv, edgeDiv, vertexPropertyDiv, edgePropertyDiv) {
        this.graph = graph
        this.positions = positions
        this.canvas = canvas
        this.w = canvas.width
        this.h = canvas.height
        this.ctx = canvas.getContext('2d')

        this.state = {
            mode: 'select',
            vertexBeingSelected: null,
            edgeBeingSelected: null,
            isDragging: false,
            mouseX: 0,
            mouseY: 0
        }

        this.graphManager = new GraphManager(graph, this, vertexDiv, edgeDiv, vertexPropertyDiv, edgePropertyDiv)
        
        canvas.addEventListener('mousedown', (e) => {
            this.state.isDragging = true

            switch (this.state.mode) {
                case 'select':
                case 'connect': {
                    this.changeSelectedVertex(this.getVertexTheMouseIsOn())

                    if (this.state.vertexBeingSelected) break
                    this.changeSelectedEdge(this.getEdgeTheMouseIsOn())

                    break
                }
                case 'delete': {
                    let vertexTheMouseIsOn = this.getVertexTheMouseIsOn()
                    if (vertexTheMouseIsOn) {
                        this.deleteVertex(vertexTheMouseIsOn)
                        break
                    }

                    let edgeTheMouseIsOn = this.getEdgeTheMouseIsOn()
                    if (edgeTheMouseIsOn) {
                        this.deleteEdge(edgeTheMouseIsOn)
                        break
                    }
                    
                    break
                }
            }
            
            this.draw()
        })
        canvas.addEventListener('mouseup', (e) => {
            let [x, y] = [this.state.mouseX, this.state.mouseY]

            switch (this.state.mode) {
                case 'select': {
                    if (this.state.vertexBeingSelected) {
                        this.graphManager.focusVertexPropertyDiv()
                    }

                    if (this.state.edgeBeingSelected) {
                        this.graphManager.focusEdgePropertyDiv()
                    }

                    break
                }
                case 'add': {
                    if (this.state.isDragging) {
                        let newVertex = this.addVertex('', this.state.mouseX, this.state.mouseY)
                        this.changeSelectedVertex(newVertex)
                        this.graphManager.focusVertexPropertyDiv()
                    }

                    break
                }
                case 'connect': {
                    if (this.state.isDragging && this.state.vertexBeingSelected) {
                        for (let vertex of this.graph.vertices) {
                            if (vertex == this.state.vertexBeingSelected) {
                                continue
                            }
                            let [x2, y2] = this.positions.get(vertex)
                            if (
                                x2 - 20 <= x &&
                                x2 + 20 >= x &&
                                y2 - 20 <= y &&
                                y2 + 20 >= y
                            ) {
                                let edge = this.addEdge(this.state.vertexBeingSelected, vertex)
                                if (edge) {
                                    this.changeSelectedEdge(edge)
                                    this.graphManager.focusEdgePropertyDiv()
                                }
                                break
                            }
                        }

                        break
                    }
                }
            }

            this.state.isDragging = false
            
            this.draw()
        })
        canvas.addEventListener('mousemove', (e) => {
            this.state.mouseX = e.offsetX
            this.state.mouseY = e.offsetY
            let [x, y] = [e.offsetX, e.offsetY]

            switch (this.state.mode) {
                case 'select': {
                    if (this.state.isDragging && this.state.vertexBeingSelected) {
                        this.positions.set(this.state.vertexBeingSelected, [x, y])
                    }

                    break
                }
            }

            this.draw()
        })
    }

    getVertexTheMouseIsOn() {
        let [x, y] = [this.state.mouseX, this.state.mouseY]

        for (let vertex of this.graph.vertices) {
            let [x2, y2] = this.positions.get(vertex)
            if (
                x2 - 20 <= x &&
                x2 + 20 >= x &&
                y2 - 20 <= y &&
                y2 + 20 >= y
            ) {
                return vertex
            }
        }

        return null
    }

    getEdgeTheMouseIsOn() {
        let [x, y] = [this.state.mouseX, this.state.mouseY]
        for (let edge of this.graph.edges) {
            let [x1, y1] = this.positions.get(edge.v1)
            let [x2, y2] = this.positions.get(edge.v2)

            const MAX_DISTANCE = 5

            if (Math.abs(x1 - x2) > 2*MAX_DISTANCE) {
                if (x > Math.max(x1, x2) || x < Math.min(x1, x2)) continue
            }

            if (Math.abs(y1 - y2) > 2*MAX_DISTANCE) {
                if (y > Math.max(y1, y2) || y < Math.min(y1, y2)) continue
            }

            let numerator = Math.abs((x2 - x1)*(y1 - y) - (x1 - x)*(y2 - y1))
            let denominator = Math.hypot(x2 - x1, y2 - y1)
            let distance = denominator == 0 ? 0 : numerator/denominator

            if (distance <= MAX_DISTANCE) {
                return edge
            }
        }

        return null
    }

    addVertex(name='', x, y) {
        let newVertex = new Vertex(name)
        this.graph.addVertex(newVertex)
        this.positions.set(newVertex, [x, y])
        this.graphManager.createVertexElem(newVertex)
        this.graphManager.update()
        return newVertex
    }

    renameVertex(vertex, name) {
        vertex.name = name
        // this.graphManager.update()
        this.graphManager.updateVertexElem(vertex)

        let v1 = vertex
        for (let v2 of v1.getNeighbors()) {
            let edge = this.graph.edges.get([v1, v2])
            this.graphManager.updateEdgeElem(edge)
        }
        this.draw()
    }

    deleteVertex(vertex) {
        let v1 = vertex
        for (let v2 of v1.getNeighbors()) {
            let edge = this.graph.edges.get([v1, v2])
            this.deleteEdge(edge)
        }

        if (vertex == this.state.vertexBeingSelected) {
            this.changeSelectedVertex(null)
        }
        this.graphManager.deleteVertexElem(vertex)
        this.graph.deleteVertex(vertex)
        this.draw()
    }

    addEdge(v1, v2) {
        let edge = this.graph.addEdge([v1, v2])
        if (!edge) return // Avoiding duplicated edge
        this.graphManager.createEdgeElem(edge)
        this.graphManager.update()
        return edge
    }

    renameEdge(edge, name) {
        edge.name = name
        // this.graphManager.update()
        this.graphManager.updateEdgeElem(edge)
        this.draw()
    }

    deleteEdge(edge) {
        if (edge == this.state.edgeBeingSelected) {
            this.changeSelectedEdge(null)
        }

        this.graphManager.deleteEdgeElem(edge)
        this.graph.deleteEdge(edge)
        this.draw()
    }

    changeSelectedVertex(vertex) {
        this.state.vertexBeingSelected = vertex
        this.state.edgeBeingSelected = null
        this.graphManager.update()
        this.draw()
    }

    changeSelectedEdge(edge) {
        this.state.edgeBeingSelected = edge
        this.state.vertexBeingSelected = null
        this.graphManager.update()
        this.draw()
    }

    draw() {
        this.ctx.clearRect(0, 0, this.w, this.h)

        for (let edge of this.graph.edges) {
            let { v1, v2 } = edge;
            let [x1, y1] = this.positions.get(v1)
            let [x2, y2] = this.positions.get(v2)
            this.ctx.strokeStyle = this.state.edgeBeingSelected == edge ? 'blue' : 'black'
            this.ctx.lineWidth = 1
            this.ctx.beginPath()
            this.ctx.moveTo(x1, y1)
            this.ctx.lineTo(x2, y2)
            this.ctx.stroke()

            this.ctx.fillStyle = this.ctx.strokeStyle
            this.ctx.font = "14px Arial";
            this.ctx.textAlign = "center"
            let x = Math.min(x1, x2) + Math.abs(x1-x2)/2
            let y = Math.min(y1, y2) + Math.abs(y1-y2)/2
            this.ctx.fillText(edge.name, x, y)
        }

        if (this.state.isDragging && this.state.vertexBeingSelected && this.state.mode == 'connect') {
            let [vertexX, vertexY] = this.positions.get(this.state.vertexBeingSelected)
            let { mouseX, mouseY } = this.state
            this.ctx.strokeStyle = 'black'
            this.ctx.lineWidth = 1
            this.ctx.beginPath()
            this.ctx.moveTo(vertexX, vertexY)
            this.ctx.lineTo(mouseX, mouseY)
            this.ctx.stroke()
        }

        for (let vertex of this.graph.vertices) {
            let [x, y] = this.positions.get(vertex)
            this.ctx.lineWidth = 2
            this.ctx.strokeStyle = this.state.vertexBeingSelected == vertex ? 'blue' : 'black'
            this.ctx.fillStyle = 'white'
            this.ctx.beginPath()
            this.ctx.arc(x, y, 20, 0, 2 * Math.PI)
            this.ctx.stroke()
            this.ctx.fill()

            this.ctx.fillStyle = this.ctx.strokeStyle
            this.ctx.font = "14px Arial";
            this.ctx.textAlign = "center"
            this.ctx.fillText(vertex.name, x, y+14/4)
        }

    }
}


let vertices = [
    // new Vertex(),
    // new Vertex(),
    // new Vertex(),
    // new Vertex(),
    // new Vertex(),
    // new Vertex(),
    // new Vertex(),
    // new Vertex(),
    // new Vertex(),
    // new Vertex(),
    // new Vertex(),
    // new Vertex(),
    // new Vertex(),
    // new Vertex(),
    // new Vertex(),
    // new Vertex()
]

let positions = new Map()
// positions.set(vertices[0], [243, 123])
// positions.set(vertices[1], [779, 282])
// positions.set(vertices[2], [600, 350])
// positions.set(vertices[3], [339, 280])
// positions.set(vertices[4], [642, 48])
// positions.set(vertices[5], [257, 376])
// positions.set(vertices[6], [487, 156])
// positions.set(vertices[7], [553, 88])
// positions.set(vertices[8], [793, 380])
// positions.set(vertices[9], [429, 445])
// positions.set(vertices[10], [142, 308])
// positions.set(vertices[11], [185, 203])
// positions.set(vertices[12], [281, 48])
// positions.set(vertices[13], [805, 144])
// positions.set(vertices[14], [902, 302])
// positions.set(vertices[15], [932, 127])

let edges = [
    // [vertices[0], vertices[1]],
    // [vertices[0], vertices[2]],
    // [vertices[0], vertices[3]],
    // [vertices[0], vertices[4]],
    // [vertices[0], vertices[5]],
    // [vertices[0], vertices[6]],
    // [vertices[0], vertices[7]],
    // [vertices[0], vertices[9]],
    // [vertices[0], vertices[12]],
    // [vertices[0], vertices[14]],
    // [vertices[0], vertices[15]],
    // [vertices[1], vertices[2]],
    // [vertices[1], vertices[4]],
    // [vertices[1], vertices[6]],
    // [vertices[1], vertices[8]],
    // [vertices[1], vertices[11]],
    // [vertices[1], vertices[12]],
    // [vertices[1], vertices[13]],
    // [vertices[2], vertices[3]],
    // [vertices[2], vertices[5]],
    // [vertices[2], vertices[8]],
    // [vertices[2], vertices[10]],
    // [vertices[2], vertices[14]],
]

let graph = new Graph(vertices, edges)
let $ = x => document.querySelector(x)
let graphRender = new GraphRender(
    graph,
    positions,
    $('#graf'),
    $('#titik'),
    $('#sisi'),
    $('#propertiTitik'),
    $('#propertiSisi')
)
graphRender.draw()

function callSolverAsynchronously(generator) {
    function process() {
        for (let _ = 0; _ < 100; _++) {
            let next = generator.next()
            done = next.done
            if (done) {
                return
            }
        }
        
        // this unfreezes the browser for a while
        setTimeout(process, 0)
    }

    process()
}