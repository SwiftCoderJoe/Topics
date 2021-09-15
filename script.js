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

window.addEventListener("load", (event) => {

    // Get a reference to the canvas
    let canvas = document.getElementById("mainCanvas")

    // Get the canvas interface (Context)
    let interface = canvas.getContext(`2d`)

    // Scale the canvas so that the accessible portion is always 720p
    canvas.width = 1280
    canvas.height = 720

    // Make lines rounded
    interface.lineCap = `round`
    interface.lineJoin = `round`

    // Lines are black
    interface.fillStyle = `rgb(0, 0, 0)`


    // MARK: Fill the screen

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


    // MARK: Functions

    // This function signature is absolutely insane and should use more objects. javascriopt moment!!!
    function drawVShape(x1, x2, y1, y2, res, width, length, twistRate, startColor, endColor) {
        let xdiff = x2 - x1
        let ydiff = y2 - y1

        // Get slope and inverse slope to make the V-shapes
        let slope = -ydiff/xdiff
        let currentRad = Math.atan(slope)

        // Color differences
        let rdiff = endColor.r - startColor.r
        let gdiff = endColor.g - startColor.g
        let bdiff = endColor.b - startColor.b
        let adiff = endColor.a - startColor.a

        for (let i = 0; i < res; i++) {
            // Linear distribution
            let ratio = i/(res - 1)
    
            // The starting coordinates along the linear distribution
            x = x1 + ratio * xdiff
            y = y1 + ratio * ydiff

            // Modulate the angle that the angles come off the line (doesn't actually create realistic twists because of the angle)
            let rad = 5 * Math.PI/4 + (Math.sin(ratio * twistRate) * Math.PI / 4)

            // First offset point next to the current point along the linear distribution
            let offsetY1 = y - Math.cos(currentRad - rad) * length
            let offsetX1 = x - Math.sin(currentRad - rad) * length

            // Second set of coordinates
            let offsetX2 = x + Math.sin(currentRad + rad) * length
            let offsetY2 = y + Math.cos(currentRad + rad) * length

            interface.strokeStyle = new Color(startColor.r + ratio * rdiff, startColor.g + ratio * gdiff, startColor.b + ratio * bdiff, startColor.a + ratio * adiff).string
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
    return Math.floor(Math.random() * (x+ 1))
}