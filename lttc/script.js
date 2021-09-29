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

window.addEventListener(`load`, () => {
    // Get a reference to the canvas
    let canvas = document.getElementById("canvas")

    // Get a reference to the slider
    let slider = document.getElementById(`resolution`)

    // Get the canvas interface (Context)
    let interface = canvas.getContext(`2d`)

    // Scale the canvas so that the accessible portion is always 720p
    canvas.width = 1280
    canvas.height = 720

    // Make lines rounded
    interface.lineCap = `round`
    interface.lineJoin = `round`

    // Lines are black
    interface.strokeStyle = `rgb(0, 0, 0)`
    interface.fillStyle = `rgb(0, 0, 0)`

    // Set the default mouse coordinate to the center
    mouseCoordinates = new Coordinate(canvas.width / 2, canvas.height / 2)

    // Start updating the screen
    setInterval(update, 1000/60)

    // MARK: Events
    
    window.addEventListener(`mousemove`, (ev) => {
        box = canvas.getBoundingClientRect()

        let scaleX = canvas.width / box.width
        let scaleY = canvas.height / box.height

        let unscaledX = ev.clientX - box.left
        let unscaledY = ev.clientY - box.top

        let scaledX = unscaledX * scaleX
        let scaledY = unscaledY * scaleY

        mouseCoordinates = new Coordinate(scaledX, scaledY)
    })

    // MARK: Functions

    function update() {
        clearScreen()
        drawLines(slider.value)
    }

    function clearScreen() {
        interface.fillStyle = new Color(224, 224, 224, 1).string
        interface.fillRect(0, 0, canvas.width, canvas.height)
    }

    function drawLines(resolution) {
        interface.fillStyle = new Color(0, 255, 255, 1).string
        for (let i = 0; i < resolution; i++) {
            let ratio = i / (resolution - 1)
            xpoint = ratio * canvas.width
            ypoint = ratio * canvas.height

            drawLine(new Coordinate(xpoint, 0), mouseCoordinates)
            drawLine(new Coordinate(xpoint, canvas.height), mouseCoordinates)

            drawLine(new Coordinate(0, ypoint), mouseCoordinates)
            drawLine(new Coordinate(canvas.width, ypoint), mouseCoordinates)
        }
    }

    function drawLine(start, end) {
        interface.beginPath()
        interface.moveTo(start.x, start.y)
        interface.lineTo(end.x, end.y)
        interface.stroke()
    }
})