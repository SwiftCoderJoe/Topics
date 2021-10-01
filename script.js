// Forward: normally I would add a ton of documentation comments but since DocC isn't standard (and this is javascript so types are literally meaningless) I won't.
// Just regular comments for now.

// why are classes not hoisted smh ! also this should definitely be a struct but js has no structs!!1! ! js is a very good and well thought out language
class Color {
    constructor(r, g, b, a) {
        this.r = r
        this.g = g
        this.b = b
        this.a = a
        this.string = `rgba(${r}, ${g}, ${b}, ${a})`
    }
}

class Coordinate {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}

class Line {
    constructor(start, end, resolution, width, length, twistRate, startColor, endColor) {
        this.start = start
        this.end = end
        this.resolution = resolution
        this.width = width
        this.length = length
        this.twistRate = twistRate
        this.startColor = startColor
        this.endColor = endColor
    }

    draw(context) {

        let diff = new Coordinate(this.end.x - this.start.x, this.end.y - this.start.y)

        // Get angle in radians to make the V-shapes
        let currentRad = Math.atan2(diff.y, diff.x) - (0.5 * Math.PI)

        // Color differences
        let colorDiff = new Color(this.endColor.r - this.startColor.r, this.endColor.g - this.startColor.g, this.endColor.b - this.startColor.b, this.endColor.a - this.startColor.a)

        for (let i = 0; i < this.resolution; i++) {
            // Linear distribution
            let ratio = i/(this.resolution - 1)
    
            // The starting coordinates along the linear distribution
            let x = this.start.x + ratio * diff.x
            let y = this.start.y + ratio * diff.y

            // Modulate the angle that the angles come off the line (doesn't actually create realistic twists because of the angle)
            let rad = 1 * Math.PI/4 + (Math.sin(ratio * this.twistRate) * Math.PI / 4)

            // First offset point next to the current point along the linear distribution
            let offsetY1 = y - Math.sin(currentRad - rad) * this.length
            let offsetX1 = x - Math.cos(currentRad - rad) * this.length

            // Second set of coordinates
            let offsetY2 = y + Math.sin(currentRad + rad) * this.length
            let offsetX2 = x + Math.cos(currentRad + rad) * this.length
            
            context.strokeStyle = new Color(this.startColor.r + ratio * colorDiff.r, this.startColor.g + ratio * colorDiff.g, this.startColor.b + ratio * colorDiff.b, this.startColor.a + ratio * colorDiff.a).string
            context.lineWidth = this.width

            // Draw the V
            context.beginPath()
            context.moveTo(offsetX1, offsetY1)
            context.lineTo(x, y)
            context.lineTo(offsetX2, offsetY2)
            context.stroke()
        }
    }

}

class Curve {

    constructor(corner1, middle, corner2, res, color) {
        this.corner1 = corner1
        this.middle = middle
        this.corner2 = corner2
        this.res = res
        this.color = color
    }

    draw(context) {

        // Account for vertical lines that make the shape seem like it should have 2 more lines
        let res = this.res + 2

        let side1Diff = new Coordinate(this.corner1.x - this.middle.x, this.corner1.y - this.middle.y)
        let side2Diff = new Coordinate(this.corner2.x - this.middle.x, this.corner2.y - this.middle.y)

        for (let i = 0; i < this.res; i++) {
            let ratio = i/(this.res - 1)

            let lineStartCoordinate = new Coordinate(this.corner1.x - (ratio * side1Diff.x), this.corner1.y - (ratio * side1Diff.y))
            let lineEndCoordinate = new Coordinate(this.middle.x + (ratio * side2Diff.x), this.middle.y + (ratio * side2Diff.y))

            context.strokeStyle = this.color.string

            context.beginPath()
            context.moveTo(lineStartCoordinate.x, lineStartCoordinate.y)
            context.lineTo(lineEndCoordinate.x, lineEndCoordinate.y)
            context.stroke()
        }
    }
}

// Not completed
class Stroke {

    constructor() {
        this.points = []
    }

    draw(context) {
        let startLocation = this.points[0]

        console.log(this.points)

        context.strokeStyle = new Color(0, 0, 0, 1).string

        context.beginPath()
        context.moveTo(startLocation.x, startLocation.y)

        for (let i = 1; i < this.points.length; i++) {
            context.lineTo(this.points[i].x, this.points[i].y)
        }

        context.stroke()
    }

}

class Particle {
    constructor() {
        
    }
}

window.addEventListener("load", () => {

    // Get a reference to the canvas
    let canvas = document.getElementById("canvas")

    // Get the p html object that should show what tool is currently selected
    let currentSelectionParagraph = document.getElementById("current-selection-p")

    // Get every list element from the left side of the screen
    let selectionParagraphs = getSelectionParagraphs()

    // Get the clear button (C: Clear Screen)
    let clearButton = document.getElementById(`Clear`)

    // Get the screen refresh toggle (R: Refresh Screen)
    let screenRefreshToggle = document.getElementById(`RefreshEnabled`)

    // If the screen should be continually refreshed
    let screenRefreshEnabled = false

    // Get the canvas interface (Context)
    let context = canvas.getContext(`2d`)

    // Hold the recent mouse position
    let mousePos = new Coordinate(0, 0)
    let lastMousePos = new Coordinate(0, 0)

    // Hold recent clicks, of type [Coordinate]
    let mouseEvents = []

    // Hold the current stroke that is in progress
    let currentStroke

    // If the mouse is pressed
    let mousePressed = false

    // If the screen should be slowly cleared by repeatedly drawing a transparent background
    let slowClearScreenOn = false

    // Array filled with objects of everything drawn on the screen
    let drawnObjects = []

    // Drawing mode, of type DrawingMode (line or curve)
    let drawingMode = DrawingMode.disabled
    currentSelectionParagraph.textContent = drawingMode

    // Scale the canvas so that the accessible portion is always 720p
    canvas.width = 1280
    canvas.height = 720

    // Make lines rounded
    context.lineCap = `round`
    context.lineJoin = `round`

    // Lines are black
    context.strokeStyle = `rgb(0, 0, 0)`
    context.fillStyle = `rgb(0, 0, 0)`

    // Start updating the screen
    setInterval(update, 1000/60)

    // MARK: Events

    // Gloval events

    window.addEventListener(`mouseup`, (ev) => {
        mousePressed = false

        // If the mode is pencil and it's drawable we should commit the in-progress Stroke
        if (drawingMode == DrawingMode.pencil && .points.length <= 2) {
            console.log(`Joe`)
            drawnObjects.pop()
        }

        for (element of document.getElementsByClassName("pressed")) {
            element.classList.remove(`pressed`)
        }
        
    })

    window.addEventListener(`mousedown`, (ev) => {
        // If pencil is enabled we should start a Stroke
        if (drawingMode == DrawingMode.pencil) {
            drawnObjects.push(new Stroke())
        }

        mousePressed = true
    })

    window.addEventListener(`mousemove`, (ev) => {
        let rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y
      
        previousMousePos = mousePos
        mousePos = new Coordinate((ev.clientX - rect.left) * scaleX,
                                  (ev.clientY - rect.top) * scaleY) 

        if (drawingMode == DrawingMode.pencil && mousePressed) {
            drawnObjects.points.push(mousePos)
        }
    })

    window.addEventListener(`keydown`, (ev) => {
        switch (ev.key) {
            case `s`:
                // Removed because of ugly trails
                // slowClearScreenOn = !slowClearScreenOn
                break

            case `c`:
                clearScreen()
                break

            case `1`:
                setDrawingMode(DrawingMode.disabled)
                break

            case `2`:
                setDrawingMode(DrawingMode.pencil)
                break

            case `3`:
                setDrawingMode(DrawingMode.lines)
                break

            case `4`:
                setDrawingMode(DrawingMode.curves)
                break
            
            case `5`:
                setDrawingMode(DrawingMode.circles)
                break

            case `r`:
                screenRefreshEnabled = !screenRefreshEnabled

            default:
                break
        }
        updateLabels()
    })

    // Element events

    canvas.addEventListener(`mouseup`, (ev) => {
        let rect = canvas.getBoundingClientRect(), // abs. size of element
            scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
            scaleY = canvas.height / rect.height   // relationship bitmap vs. element for Y
          
        let mouseCoords = new Coordinate((ev.clientX - rect.left) * scaleX,
                                         (ev.clientY - rect.top) * scaleY) 
        
        // Add mouse coordinates to the list
        mouseEvents.unshift(mouseCoords)

        // If the user has clicked twice and has lines enabled draw a line
        if (drawingMode == DrawingMode.lines && mouseEvents.length == 2) {

            startColor = new Color(randomIn(255), randomIn(255), randomIn(255), Math.random())
            endColor = new Color(randomIn(255), randomIn(255), randomIn(255), Math.random())
            drawnObjects.push( new Line(mouseEvents[0], mouseEvents[1], randomIn(800), 2, randomInRange(10, 30), 0, startColor, endColor) )

            mouseEvents = []

        // If the user has clicked 3 times and has curves enableddraw a curve
        } else if (drawingMode == DrawingMode.curves && mouseEvents.length == 3) {

            color = new Color(randomIn(255), randomIn(255), randomIn(255), Math.random())
            drawnObjects.push( new Curve(mouseEvents[0], mouseEvents[1], mouseEvents[2], randomIn(200), color) )

            mouseEvents = []

        } else if (drawingMode == DrawingMode.circles && mouseEvents.length == 2) {
        
            strokeColor = new Color(randomIn(255), randomIn(255), randomIn(255), Math.random())
            fillColor = new Color(randomIn(255), randomIn(255), randomIn(255), Math.random())

            drawCircle(mouseEvents[1], mouseEvents[0], strokeColor, fillColor)

            mouseEvents = []

        } else {
            // If the user has clicked only once or hasn't clicked, don't clear the recent clicks
            return
        }


    })

    // Add a click up and down event to every mode selector
    for (button in selectionParagraphs) {
        selectionParagraphs[button].addEventListener("mousedown", (ev) => {
            ev.target.classList.add("pressed")

            // I don't need to use the DrawingMode enum here, because the enum is actually just a few differrent string literals that match the IDs, so this is more convinient.
            setDrawingMode(ev.target.id)
            updateLabels()
        })
    }

    // Get and add a click event to the clear screen button
    clearButton.addEventListener(`mousedown`, (ev) => {
        ev.target.classList.add("pressed")
        
        clearScreen()
    })

    screenRefreshToggle.addEventListener(`mousedown`, (ev) => {
        ev.target.classList.add("pressed")

        screenRefreshEnabled = !screenRefreshEnabled

        updateLabels()
    })

    // MARK: Functions

    function update() {

        if (screenRefreshEnabled) {
            clearScreen()

            /*if (slowClearScreenOn) {
                slowClearScreen()
            }*/

            drawObjects()
        }
        
    }

    function drawObjects() {
        for (object of drawnObjects) {
            object.draw(context)
        } 
    }

    function slowClearScreen() {
        context.fillStyle = new Color(224, 224, 224, 0.02).string
        context.fillRect(0, 0, canvas.width, canvas.height)
    }

    function clearScreen() {
        context.fillStyle = new Color(224, 224, 224, 1).string
        context.fillRect(0, 0, canvas.width, canvas.height)
    }

    function drawCircle(start, edge, strokeColor, fillColor) {
        radius = distance(start, edge)

        context.strokeStyle = strokeColor.string
        context.fillStyle = fillColor.string

        // Draw a circle
        context.beginPath()
        context.arc(start.x, start.y, radius, 0, 360)
        context.stroke()
        context.fill()

    }

    function updateLabels() {
        currentSelectionParagraph.textContent = drawingMode

        // Remove the selection from the first (only) element that is selected
        document.getElementsByClassName("selected")[0].classList.remove("selected")

        // Select the new element
        selectionParagraphs[drawingMode].classList.add("selected")

        if (screenRefreshEnabled) {
            screenRefreshToggle.classList.add("enabled")
        } else {
            screenRefreshToggle.classList.remove("enabled")
        }
    }

    // Use this so you don't forget to clear mouse events and do selection-specific code
    function setDrawingMode(mode) {
        drawingMode = mode
        mouseEvents = []

        // Selection-specific code
        switch (mode) {
            case DrawingMode.pencil:
                // FIXME
                context.strokeStyle = randomColor().string
                break;
        }
    }

})

function randomIn(x) {
    return Math.floor(Math.random() * (x + 1))
}

// should not be diff name smh, this is a true javascript moment (how could you possibly have convinience initializers without???)
function randomInRange(y, x) {
    return Math.floor(Math.random() * ((x - y) + 1)) + y
}

function distance(start, end) {
    return Math.sqrt( Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2))
}

function randomColor() {
    return new Color(randomIn(255), randomIn(255), randomIn(255), Math.random())
}

function getSelectionParagraphs() {
    let disabled = document.getElementById(`None`)
    let pencil = document.getElementById(`Pencil`)
    let lines = document.getElementById(`Line`)
    let curves = document.getElementById(`Curve`)
    let circles = document.getElementById(`Circle`)

    return {
        "None" : disabled,
        "Pencil" : pencil,
        "Line" : lines,
        "Curve" : curves,
        "Circle" : circles
    }
}

// This is a javascript enum moment!
const DrawingMode = {
    disabled: `None`,
    pencil: `Pencil`,
    lines: `Line`,
    curves: `Curve`,
    circles: `Circle`
}


// Mark: Code Graveyard