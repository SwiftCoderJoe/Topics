// Forward: normally I would add a ton of documentation comments but since DocC isn't standard (and this is javascript so types are literally meaningless) I won't.
// Just regular comments for now.

window.addEventListener("load", (event) => {

    // Get a reference to the canvas
    let canvas = document.getElementById("mainCanvas")

    console.log(canvas.width)

    // Get the canvas interface (Context)
    let interface = canvas.getContext(`2d`)

    // Scale the canvas so that the accessible portion is always 800x600
    canvas.width = 1280
    canvas.height = 720

    interface.lineCap = `round`
    interface.lineJoin = `round`

    interface.fillStyle = `rgba(0, 0, 0, 0.5)`
    drawCurve(0, 100, 0, 0, 100, 0, interface)

    
})

function randomIn(x) {
    return Math.floor(Math.random() * (x+ 1))
}

function drawCurve(x1, x2, y1, y2, res, width, interface) {
    for (let i = 0; i < res; i++) {
        let ratio = i/(res - 1)

        x = x1 + ratio*(x1-x2)

        console.log(`h`)
        interface.fillRect(x, x, 10, 10)
    }
}

/*
for (let i = 0; i < 70; i++) {
        // string function wtf
        interface.fillStyle = `rgba(${randomIn(255)}, ${randomIn(255)}, ${randomIn(255)}, 0.5)`

        let x = randomIn(canvas.width)
        let y = randomIn(canvas.height)

        interface.beginPath()
        interface.arc(x, y, randomIn(100), 0, Math.PI * 2)
        interface.fill()
    }
*/