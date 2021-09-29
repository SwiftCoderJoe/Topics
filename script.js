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

window.addEventListener("load", () => {

    // Get a reference to the canvas
    let canvas = document.getElementById("canvas")

    // Get the p html object that should show what tool is currently selected
    let currentSelectionParagraph = document.getElementById("current-selection-p")

    // Get every list element from the left side of the screen
    let selectionParagraphs = getSelectionParagraphs()

    // Get the clear button (C: Clear Screen)
    let clearButton = document.getElementById(`Clear`)

    // Get the canvas interface (Context)
    let interface = canvas.getContext(`2d`)

    // Hold the recent mouse position
    let mousePos = new Coordinate(0, 0)
    let lastMousePos = new Coordinate(0, 0)

    // Hold recent clicks, of type [Coordinate]
    let mouseEvents = []

    // If the mouse is pressed
    let mousePressed = false

    // If the screen should be slowly cleared by repeatedly drawing a transparent background
    let slowClearScreenOn = false

    // Drawing mode, of type DrawingMode (line or curve)
    let drawingMode = DrawingMode.disabled
    currentSelectionParagraph.textContent = drawingMode

    // Scale the canvas so that the accessible portion is always 720p
    canvas.width = 1280
    canvas.height = 720

    // Make lines rounded
    interface.lineCap = `round`
    interface.lineJoin = `round`

    // Lines are black
    interface.strokeStyle = `rgb(0, 0, 0)`
    interface.fillStyle = `rgb(0, 0, 0)`

    // Start updating the screen
    setInterval(update, 1000/60)

    // MARK: Events

    // Gloval events

    window.addEventListener(`mouseup`, (ev) => {
        mousePressed = false

        for (element of document.getElementsByClassName("pressed")) {
            element.classList.remove(`pressed`)
        }
        
    })

    window.addEventListener(`mousedown`, (ev) => {
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
            interface.beginPath()
            interface.moveTo(previousMousePos.x, previousMousePos.y)
            interface.lineTo(mousePos.x, mousePos.y)
            interface.stroke()
        }
    })

    window.addEventListener(`keydown`, (ev) => {
        switch (ev.key) {
            case `s`:
                // Removed because of ugly trails
                // slowClearScreenOn = !slowClearScreenOn
                break

            case `c`:
                interface.fillStyle = new Color(224, 224, 224, 1).string
                interface.fillRect(0, 0, canvas.width, canvas.height)
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
            drawVShape(mouseEvents[0], mouseEvents[1], randomIn(800), 2, randomInRange(10, 30), 0, startColor, endColor)

            mouseEvents = []

        // If the user has clicked 3 times and has curves enableddraw a curve
        } else if (drawingMode == DrawingMode.curves && mouseEvents.length == 3) {

            color = new Color(randomIn(255), randomIn(255), randomIn(255), Math.random())
            drawCurve(mouseEvents[0], mouseEvents[1], mouseEvents[2], randomIn(200), color)

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
        
        interface.fillStyle = new Color(224, 224, 224, 1).string
        interface.fillRect(0, 0, canvas.width, canvas.height)
    })

    // MARK: Functions

    function update() {

        if (slowClearScreenOn) {
            slowClearScreen()
        }
        
    }

    function slowClearScreen() {
        interface.fillStyle = new Color(224, 224, 224, 0.02).string
        interface.fillRect(0, 0, canvas.width, canvas.height)
    }

    function drawCurve(corner1, middle, corner2, res, color) {

        // Account for vertical lines that make the shape seem like it should have 2 more lines
        res = res + 2

        side1Diff = new Coordinate(corner1.x - middle.x, corner1.y - middle.y)
        side2Diff = new Coordinate(corner2.x - middle.x, corner2.y - middle.y)

        for (let i = 0; i < res; i++) {
            let ratio = i/(res - 1)

            lineStartCoordinate = new Coordinate(corner1.x - (ratio * side1Diff.x), corner1.y - (ratio * side1Diff.y))
            lineEndCoordinate = new Coordinate(middle.x + (ratio * side2Diff.x), middle.y + (ratio * side2Diff.y))

            interface.strokeStyle = color.string

            interface.beginPath()
            interface.moveTo(lineStartCoordinate.x, lineStartCoordinate.y)
            interface.lineTo(lineEndCoordinate.x, lineEndCoordinate.y)
            interface.stroke()
        }
    }

    // This function signature is absolutely insane and should use more objects. javascriopt moment!!!
    function drawVShape(startCoord, endCoord, res, width, length, twistRate, startColor, endColor) {

        let diff = new Coordinate(endCoord.x - startCoord.x, endCoord.y - startCoord.y)

        // Get angle in radians to make the V-shapes
        let currentRad = Math.atan2(diff.y, diff.x) - (0.5 * Math.PI)

        // Color differences
        let colorDiff = new Color(endColor.r - startColor.r, endColor.g - startColor.g, endColor.b - startColor.b, endColor.a - startColor.a)

        for (let i = 0; i < res; i++) {
            // Linear distribution
            let ratio = i/(res - 1)
    
            // The starting coordinates along the linear distribution
            x = startCoord.x + ratio * diff.x
            y = startCoord.y + ratio * diff.y

            // Modulate the angle that the angles come off the line (doesn't actually create realistic twists because of the angle)
            let rad = 1 * Math.PI/4 + (Math.sin(ratio * twistRate) * Math.PI / 4)

            // First offset point next to the current point along the linear distribution
            let offsetY1 = y - Math.sin(currentRad - rad) * length
            let offsetX1 = x - Math.cos(currentRad - rad) * length

            // Second set of coordinates
            let offsetY2 = y + Math.sin(currentRad + rad) * length
            let offsetX2 = x + Math.cos(currentRad + rad) * length
            
            interface.strokeStyle = new Color(startColor.r + ratio * colorDiff.r, startColor.g + ratio * colorDiff.g, startColor.b + ratio * colorDiff.b, startColor.a + ratio * colorDiff.a).string
            interface.lineWidth = width

            // Draw the V
            interface.beginPath()
            interface.moveTo(offsetX1, offsetY1)
            interface.lineTo(x, y)
            interface.lineTo(offsetX2, offsetY2)
            interface.stroke()
        }
    }

    function drawCircle(start, edge, strokeColor, fillColor) {
        radius = distance(start, edge)

        interface.strokeStyle = strokeColor.string
        interface.fillStyle = fillColor.string

        // Draw a circle
        interface.beginPath()
        interface.arc(start.x, start.y, radius, 0, 360)
        interface.stroke()
        interface.fill()

    }

    function updateLabels() {
        currentSelectionParagraph.textContent = drawingMode

        // Remove the selection from the first (only) element that is selected
        document.getElementsByClassName("selected")[0].classList.remove("selected")

        // Select the new element
        selectionParagraphs[drawingMode].classList.add("selected")
    }

    // Use this so you don't forget to clear mouse events and do selection-specific code
    function setDrawingMode(mode) {
        drawingMode = mode
        mouseEvents = []

        // Selection-specific code
        switch (mode) {
            case DrawingMode.pencil:
                interface.strokeStyle = randomColor().string
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
