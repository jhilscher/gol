const game = (() => {

    let ctx;
    let canvas;
    const size = 50;
    const cellSize = 15;
    let loopInterval;
    let tableau = [];

    const initCtx = () => {
        canvas = document.getElementById('canvas');
        canvas.setAttribute('height', size * cellSize);
        canvas.setAttribute('width', size * cellSize);
        ctx = canvas.getContext("2d");
    };

    const initControls = () => {

        let mouseDown = false;
        let latestFlip;

        const pause = () => {
            clearInterval(loopInterval);
        };
        const start = () => {
            pause();
            gameLoop();
        };
        const clear = () => {
            randomFillTableau();
            drawTableau();
        };

        
        const clickHandler = (event) => {
            latestFlip = getCellCords(event);
            flipCell(latestFlip.xIdx, latestFlip.yIdx);
        };

        document.getElementById('start').addEventListener("click", start);
        document.getElementById('pause').addEventListener("click", pause);
        document.getElementById('clear').addEventListener("click", clear);

        canvas.addEventListener('mousedown', (event) => {
            mouseDown = true;
            clickHandler(event);
        });
        window.addEventListener('mouseup', (event) => {
            mouseDown = false;
        });
        
        canvas.addEventListener('mousemove', (event) => {
            if (!mouseDown)
                return;
            
            const newCords = getCellCords(event);

            if (newCords.xIdx === latestFlip.xIdx && newCords.yIdx === latestFlip.yIdx)
                return;
            
            latestFlip = newCords;
            
            flipCell(latestFlip.xIdx, latestFlip.yIdx);
        });
    };

    const getCellCords = (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const xIdx = ~~(x / cellSize);
        const yIdx = ~~(y / cellSize);
        return {xIdx, yIdx};
    };

    const flipCell = (xIdx, yIdx) => {
        tableau[yIdx][xIdx] = !tableau[yIdx][xIdx];
        drawTableau();
    }; 

    const drawCell = (x, y, live) => {
        ctx.fillStyle = live ? "#333" : "#eee";
        ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
    };

    const randomFillTableau = () => {
        for (let i = 0; i < size; i++) {
            tableau[i] = Array.from({ length: size }, () => false);//() => !!~~(Math.random() * 1.5));
        }
    };

    const drawTableau = () => {
        window.requestAnimationFrame(() => {
            tableau.forEach((rows, rowIndex) => rows.forEach((cellValue, cellIndex) => {
                drawCell(cellIndex * cellSize, rowIndex * cellSize, cellValue);
            }));
        });
    };

    const calcNextGeneration = () => {

        let newGenTableau = [];

        tableau.forEach((rows, rowIndex) => rows.forEach((cellValue, cellIndex) => {

            const prevRow = rowIndex > 0 ? tableau[rowIndex - 1] : tableau[tableau.length - 1];
            const nextRow = rowIndex < tableau.length - 1 ? tableau[rowIndex + 1] : tableau[0];
            const prevIndex = cellIndex > 0 ? cellIndex - 1 : rows.length - 1;
            const nextIndex = cellIndex < rows.length - 1 ? cellIndex + 1 : 0;

            let count = prevRow[prevIndex] +
                        prevRow[cellIndex] +
                        prevRow[nextIndex] + 
                        rows[prevIndex] +
                        rows[nextIndex] +
                        nextRow[prevIndex] +
                        nextRow[cellIndex] +
                        nextRow[nextIndex];

            let newValue = (count == 2 && cellValue) || count == 3;

            if (cellIndex === 0)
                newGenTableau[rowIndex] = [];

            newGenTableau[rowIndex][cellIndex] = newValue;

            if (newValue != cellValue)
                drawCell(cellIndex * cellSize, rowIndex * cellSize, newValue);
        }));

        tableau = newGenTableau;
    };

    const gameLoop = () => {
        loopInterval = setInterval(() => {
            window.requestAnimationFrame(calcNextGeneration);
        }, 200);
    }

    return {
        run: () => {
            initCtx();

            initControls();

            randomFillTableau();

            drawTableau();
        },
        load: (rle) => {
            let ident;
            let headerParsed = false;
            let header = {};

            rle.split('\n')
                .filter(x => !!x.indexOf('#')) // header info ausfiltern
                .forEach((line, i) => {
                    if (!headerParsed) {

                        if ((/^x\s*=\s*\d+,\s*y\s*=\s*\d+.*/).test(line)) {
                            
                            line.split(',').forEach(h => {
                                if (h.indexOf('x') >= 0) {
                                    header.x = +(/\d+/g.exec(h));
                                } else if (h.indexOf('y') >= 0) {
                                    header.y = +(/\d+/g.exec(h));
                                }
                            });
                            headerParsed = true;
                        }
                    } else {

                    }
                });
        }
    };
})();