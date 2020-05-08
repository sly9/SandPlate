import {SvgSandPlate} from './svg_sand_plate.js'
import {Driver} from "./Driver.js";

let init = () => {
    console.log('Initializing...');
    /** @type {Element} */
    let svgCanvas = document.getElementById('svg');
    /** @type {Element} */
    let canvas = document.getElementById('canvas');

    document.getElementById('draw1').addEventListener('click', drawSpiral);
    document.getElementById('draw3').addEventListener('click', drawNestedSpiral);
    document.getElementById('draw4').addEventListener('click', drawSquare);
    document.getElementById('drawTiltedSquare').addEventListener('click', drawTiltedSquare);
    document.getElementById('draw5').addEventListener('click', sanityTest);
    document.getElementById('drawStrange').addEventListener('click', drawStrange);
    document.getElementById('drawArcs').addEventListener('click', drawArcs);
    document.getElementById('drawFun').addEventListener('click', drawFun);
    document.getElementById('drawFun2').addEventListener('click', drawFun2);
    document.getElementById('drawFun3').addEventListener('click', drawFun3);
    document.getElementById('runInstructions').addEventListener('click', runInstructions);
    document.getElementById('reset').addEventListener('click', reset);

    sandPlate = new SvgSandPlate(canvas, svgCanvas, RADIUS);
    window.sandPlate = sandPlate;
    driver = new Driver(sandPlate);
    window.driver = driver;
    instructionTextArea = mdc.textField.MDCTextField.attachTo(document.querySelector('#instructionTextareaWrapper'));
    let buttons = document.querySelectorAll('.mdc-button--raised');
    for (let i = 0; i < buttons.length; i++) {
        new mdc.ripple.MDCRipple(buttons[i]);
    }


};

const CANVAS_WIDTH = 800;
const RADIUS = 400;


/**
 *
 * @type {SandPlate}
 */
let sandPlate = null;

/**
 *
 * @type {Driver}
 */
let driver = null;

let instructionTextArea = null;

let drawSpiral = async () => {
    console.log('Draw a spiral');
    for (let i = 0; i < 10000; i++) {
        if (i % 3 == 0) {
            let a0 = sandPlate.rotateArm0(10);
            let a1 = sandPlate.rotateArm1(1);
            await Promise.all([a0, a1]);
        } else {
            await sandPlate.rotateArm0(10);
        }
    }
};

let drawGear = async () => {
    console.log('Draw a gear like spiral');
    await sandPlate.gotoPos(0, 0);
    for (let i = 0; i < 10000; i++) {
        if (i % 3 == 0) {
            let a0 = sandPlate.rotateArm0(10);
            let a1 = sandPlate.rotateArm1(1);
            await Promise.all([a0, a1]);
        } else {
            let a0 = sandPlate.rotateArm0(10);
            let a1 = sandPlate.rotateArm1(i % 6 - 3 > 0 ? 1 : -1);
            await Promise.all([a0, a1]);
        }
    }
};

let drawNestedSpiral = async () => {
    console.log('Draw a spiral');
    await sandPlate.gotoPos(0, 0);
    for (let i = 0; i < 10000; i++) {
        if (i % 3 == 0) {
            let a0 = sandPlate.rotateArm0(1);
            let a1 = sandPlate.rotateArm1(10);
            await Promise.all([a0, a1]);
        } else {
            await sandPlate.rotateArm1(10);
        }
    }
};

let drawSquare = async () => {
    console.log('Draw a square');

    for (let i = 0; i < 100; ++i) {
        await sandPlate.gotoPos(400 - i * 4, i * 4);
    }
    for (let i = 0; i < 100; ++i) {
        await sandPlate.gotoPos(-i * 4, 400 - i * 4);
    }
    for (let i = 0; i < 100; ++i) {
        await sandPlate.gotoPos(-400 + i * 4, -i * 4);
    }
    for (let i = 0; i < 100; ++i) {
        await sandPlate.gotoPos(i * 4, -400 + i * 4);
    }
};

let drawTiltedSquare = async () => {
    console.log('Draw a tilted square');

    await sandPlate.gotoPos(200, 300);

    for (let i = 0; i < 100; ++i) {
        await sandPlate.gotoPos(200 - i * 5, 300 - i);
    }
    for (let i = 0; i < 100; ++i) {
        await sandPlate.gotoPos(-300 + i, 200 - i * 5);
    }
    for (let i = 0; i < 100; ++i) {
        await sandPlate.gotoPos(-200 + i * 5, -300 + i);
    }
    for (let i = 0; i < 100; ++i) {
        await sandPlate.gotoPos(300 - i, -200 + i * 5);
    }

};

let sanityTest = async () => {
    console.log('Sanity test');

    await sandPlate.gotoPos(400, 0);

    for (let i = 399; i > -400; --i) {
        await sandPlate.gotoPos(i, 1);
        await sandPlate.gotoPos(i, 0);
        await sandPlate.gotoPos(i, -1);
    }

    await sandPlate.gotoPos(0, 400);

    for (let i = 399; i > -400; --i) {
        await sandPlate.gotoPos(1, i);
        await sandPlate.gotoPos(0, i);
        await sandPlate.gotoPos(-1, i);
    }

    await sandPlate.gotoPos(400, 0);
}


let drawStrange = async () => {
    console.log('draw strange graph... terrible name...');

    let sectionCount = 10;
    let stepSize = sandPlate.radius / sectionCount / 2;

    let firstAxisValue = 0;
    let secondAxisValue = 0;

    let getX = (first, second, quadrant) => {
        switch (quadrant) {
            case 1:
                return first;
            case 2:
                return -second;
            case 3:
                return -first;
            case 4:
                return second;
        }
    };
    let getY = (first, second, quadrant) => {
        switch (quadrant) {
            case 1:
                return second;
            case 2:
                return first;
            case 3:
                return -second;
            case 4:
                return -first;
        }

    };
    for (let q = 1; q <= 4; q++) {
        for (let i = 0; i < sectionCount; i++) {
            firstAxisValue = sandPlate.radius - stepSize * 2 * i;
            secondAxisValue = 0;
            await sandPlate.lineTo(getX(firstAxisValue, secondAxisValue, q), getY(firstAxisValue, secondAxisValue, q));

            firstAxisValue = sandPlate.radius - stepSize * 2 * i - stepSize;
            secondAxisValue = 0;
            await sandPlate.lineTo(getX(firstAxisValue, secondAxisValue, q), getY(firstAxisValue, secondAxisValue, q));

            firstAxisValue = sandPlate.radius - stepSize * 2 * i - stepSize;
            secondAxisValue = 2 * stepSize * (i + 1);
            await sandPlate.lineTo(getX(firstAxisValue, secondAxisValue, q), getY(firstAxisValue, secondAxisValue, q));

            firstAxisValue = sandPlate.radius - stepSize * 2 * i - stepSize * 2;
            secondAxisValue = 2 * stepSize * (i + 1);
            await sandPlate.lineTo(getX(firstAxisValue, secondAxisValue, q), getY(firstAxisValue, secondAxisValue, q));
        }
    }
}

let drawArcs = async () => {
    console.log('Draw arcs');

    await sandPlate.gotoPos(100, -100);

    await sandPlate.arcTo(-100, 100, 200, false);
    await sandPlate.arcTo(100, -100, 200, false);

    await sandPlate.arcTo(-100, 100, 200, false, false);
    await sandPlate.arcTo(100, -100, 200, false, false);
}

let drawFun = async () => {
    console.log('Draw fun stuff');

    const alpha = 30;
    const sectionCount = 20;
    // First row
    await sandPlate.gotoPos(0, 0);

    let radius = sandPlate.radius;
    let startingDegree = 0;
    let currentlyOnFirstArm = true;
    for (let j = 0; j < 360 / 30; j++) {
        for (let i = 0; i < sectionCount; i++) {
            let x0 = i * radius / sectionCount * Math.cos(startingDegree * Math.PI / 180);
            let y0 = i * radius / sectionCount * Math.sin(startingDegree * Math.PI / 180);
            let x1 = i * radius / sectionCount * Math.cos((startingDegree + alpha) * Math.PI / 180);
            let y1 = i * radius / sectionCount * Math.sin((startingDegree + alpha) * Math.PI / 180);
            if (currentlyOnFirstArm) {
                await sandPlate.arcTo(x1, y1, i * radius / sectionCount * 1, true);
                currentlyOnFirstArm = false;
            } else {
                await sandPlate.arcTo(x0, y0, i * radius / sectionCount * 1, false);
                currentlyOnFirstArm = true;
            }
        }
        startingDegree = startingDegree + alpha;
    }

}

let drawFun2 = async () => {
    console.log('Fun2');

    const n = 8;
    const dr = 3;
    const scale = 0.4;

    let r = 0;
    let i = 0;

    await sandPlate.gotoPos(0, 0);

    while (r + dr <= 400) {
        r += dr;
        i++;
        await sandPlate.arcTo(r * Math.cos(i * 2 * Math.PI / n), r * Math.sin(i * 2 * Math.PI / n), r * scale);
    }
}

let drawFun3 = async () => {
    instructionTextArea.value = await loadURL('plans/plan01');
};

async function loadURL(url) {
    let lines = [];
    for await (let line of makeTextFileLineIterator(url)) {
        lines.push(line);
    }
    return lines.join('\n');
}


async function* makeTextFileLineIterator(fileURL) {
    const utf8Decoder = new TextDecoder('utf-8');
    const response = await fetch(fileURL);
    const reader = response.body.getReader();
    let {value: chunk, done: readerDone} = await reader.read();
    chunk = chunk ? utf8Decoder.decode(chunk) : '';

    const re = /\n/gm;
    let startIndex = 0;
    let result;

    for (; ;) {
        let result = re.exec(chunk);
        if (!result) {
            if (readerDone) {
                break;
            }
            let remainder = chunk.substr(startIndex);
            ({value: chunk, done: readerDone} = await reader.read());
            chunk = remainder + (chunk ? utf8Decoder.decode(chunk) : '');
            startIndex = re.lastIndex = 0;
            continue;
        }
        yield chunk.substring(startIndex, result.index);
        startIndex = re.lastIndex;
    }
    if (startIndex < chunk.length) {
        // last line didn't end in a newline char
        yield chunk.substr(startIndex);
    }
}

let reset = () => {
    try {
        sandPlate.canvas_ = null;
        sandPlate.svgCanvas_.selectAll("*").remove();

        /** @type {Element} */
        let svgCanvas = document.getElementById('svg');
        /** @type {Element} */
        let canvas = document.getElementById('canvas');
        let context = canvas.getContext('2d');
        context.clearRect(0, 0, 800, 800);

        sandPlate = new SvgSandPlate(canvas, svgCanvas, RADIUS);
        window.sandPlate = sandPlate;
        driver = new Driver(sandPlate);
        window.driver = driver;
    } catch (e) {

    }
};

let runInstructions = async () => {
    console.log('Run instructions!');
    let instructionStrings = instructionTextArea.value;
    driver.loadFromString(instructionStrings);
    await driver.execute();
}

document.addEventListener("DOMContentLoaded", init);

