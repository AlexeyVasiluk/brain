function DCanvas(el) {
    const ctx = el.getContext('2d');
    const pixel = 20;//width one cell
    let is_mouse_down = false;
    canvas.width = 500;
    canvas.height = 500;

    //Drawing Line
    this.drawLine = function (x1, y1, x2, y2, color = 'gray') {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineJoin = 'miter';
        ctx.lineWidth = 1;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    };

    //Drawing Cell
    this.drawCell = function (x, y, w, h) {
        ctx.fillStyle = 'blue';
        ctx.strokeStyle = 'blue';
        ctx.lineJoin = 'miter';
        ctx.lineWidth = 1;
        ctx.rect(x, y, w, h);
        ctx.fill();
    };

    //Clear drawing box
    this.clear = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    //Create cell grid #
    this.drawGrid = function () {
        const w = canvas.width;
        const h = canvas.height;
        const p = w / pixel;
        const xStep = w / p;
        const yStep = h / p;

        for (let x = 0; x < w; x += xStep) {
            this.drawLine(x, 0, x, h);
        }

        for (let y = 0; y < h; y += yStep) {
            this.drawLine(0, y, w, y);
        }
    };

    // Calculate 0 or 1 in our Grid
    this.calculate = function (draw = false) {
        const w = canvas.width;
        const h = canvas.height;
        const p = w / pixel;

        const xStep = w / p;
        const yStep = h / p;

        const vector = [];
        let __draw = [];

        for (let x = 0; x < w; x += xStep) { //
            for (let y = 0; y < h; y += yStep) {
                const data = ctx.getImageData(x, y, xStep, yStep); //Say empty or full cell

                let nonEmptyPixelsCount = 0;
                for (i = 0; i < data.data.length; i += 10) {
                    const isEmpty = data.data[i] === 0;

                    if (!isEmpty) {
                        nonEmptyPixelsCount += 1;
                    }
                }

                if (nonEmptyPixelsCount > 1 && draw) {
                    __draw.push([x, y, xStep, yStep]);
                }

                vector.push(nonEmptyPixelsCount > 1 ? 1 : 0);//Add info to vector data array
            }
        }

        if (draw) {
            this.clear();
            this.drawGrid();
            for (_d in __draw) {
                this.drawCell(__draw[_d][0], __draw[_d][1], __draw[_d][2], __draw[_d][3]);
            }
        }

        return vector;
    };

    el.addEventListener('mousedown', function (e) {
        is_mouse_down = true;
        ctx.beginPath();
    });

    el.addEventListener('mouseup', function (e) {
        is_mouse_down = false;
    });

    el.addEventListener('mousemove', function (e) {
        if (is_mouse_down) {
            ctx.fillStyle = 'red';
            ctx.strokeStyle = 'red';
            ctx.lineWidth = pixel;

            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(e.offsetX, e.offsetY, pixel / 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(e.offsetX, e.offsetY);
        }
    })
}

let vector = [];
let net = null;//Neural Net object
let train_data = [];// Array of our collected training data

const d = new DCanvas(document.getElementById('canvas'));

document.addEventListener('click', function (e) {
    //Clear our grid
    if (e.target.id === 'clear') {
        d.clear();
    }

    // Learn our Neural net
    if (e.target.id === 'vector') {
        vector = d.calculate(true);
        if (confirm('Positive?')) {
            train_data.push({
                input: vector,
                output: {positive: 1}
            });
        } else {
            train_data.push({
                input: vector,
                output: {negative: 1}

            });
        }
        // d.clear();
    }

    // Recognize image by Neural net
    if (e.target.id === 'recognize') {
        net = new brain.NeuralNetwork();
        net.train(train_data, {log: true}); // send training data
        const result = brain.likely(d.calculate(), net); // which object was draw?
        alert(result);
        // d.clear();
    }
});
