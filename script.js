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

window.addEventListener("load", (event) => {

    // Get a reference to the canvas
    let canvas = document.getElementById("mainCanvas")

    // Get the canvas interface (Context)
    let interface = canvas.getContext(`2d`)

    // Hold the recent mouse events
    let mouseEvents = []

    // Scale the canvas so that the accessible portion is always 720p
    canvas.width = 1280
    canvas.height = 720

    // Make lines rounded
    interface.lineCap = `round`
    interface.lineJoin = `round`

    // Lines are black
    interface.fillStyle = `rgb(0, 0, 0)`

    // MARK: Draw on the screen

    // This block intentionally left blank

    // MARK: Events

    canvas.addEventListener(`mouseup`, (ev) => {
        let rect = canvas.getBoundingClientRect(), // abs. size of element
            scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
            scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y
          
        let mouseCoords = new Coordinate((ev.clientX - rect.left) * scaleX,
                                         (ev.clientY - rect.top) * scaleY) 
        
        // Add mouse coordinates to the list
        mouseEvents.unshift(mouseCoords)

        // Remove last coordinate to limit length to 3
        if (mouseEvents.length > 3) mouseEvents.pop()        
    })

    window.addEventListener(`keydown`, (ev) => {
        if (ev.key == ` `) {
            if (mouseEvents.length == 3) {
                console.log(`Drawing curve.`)
                color = new Color(randomIn(255), randomIn(255), randomIn(255), Math.random())
                drawCurve(mouseEvents[0], mouseEvents[1], mouseEvents[2], randomIn(200), color)
            } else if (mouseEvents.length == 2) {
                console.log(`Drawing line.`)
                startColor = new Color(randomIn(255), randomIn(255), randomIn(255), Math.random())
                endColor = new Color(randomIn(255), randomIn(255), randomIn(255), Math.random())
                drawVShape(mouseEvents[0], mouseEvents[1], randomIn(800), 2, randomInRange(10, 30), 0, startColor, endColor)
            }
        }

        mouseEvents = []
    })

    // MARK: Functions

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

    function randomSpheres() {
        for (let i = 0; i < 70; i++) {
            // string function wtf
            interface.fillStyle = `rgba(${randomIn(255)}, ${randomIn(255)}, ${randomIn(255)}, 0.5)`
    
            let x = randomIn(canvas.width)
            let y = randomIn(canvas.height)
    
            interface.beginPath()
            interface.arc(x, y, randomIn(100), 0, Math.PI * 2)
            interface.fill()
        }
    }

})

function randomIn(x) {
    return Math.floor(Math.random() * (x + 1))
}

function randomInRange(y, x) {
    return Math.floor(Math.random() * ((x - y) + 1)) + y
}



// Mark: Code Graveyard

/*

startColor = new Color(255, 255, 0, 1)
endColor = new Color(255, 0, 255, 1)
drawVShape(0, 1350, 75, 75, 120, 2, 100, 0, startColor, endColor)

startColor = new Color(0, 0, 0, 1)
endColor = new Color(0, 255, 255, 1)
drawVShape(150, 1250, 300, 300, 300, 2, 200, 0, startColor, endColor)

startColor = new Color(0, 0, 0, 0)
endColor = new Color(0, 255, 255, 1)
drawVShape(150, 1250, 600, 600, 300, 2, 200, 0, startColor, endColor)

startColor = new Color(0, 255, 255, 1)
endColor = new Color(255, 0, 255, 1)
drawVShape(0, 1200, 700, 0, 1000, 1, 75, 20, startColor, endColor)

*/