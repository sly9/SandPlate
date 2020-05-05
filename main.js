import {SvgSandPlate} from './svg_sand_plate.js'
import {Driver} from "./Driver.js";

let init = () => {
    console.log('Initializing...');
    /** @type {Element} */
    let svgCanvas = document.getElementById('svg');
    /** @type {Element} */
    let canvas = document.getElementById('canvas');

    sandPlate = new SvgSandPlate(canvas, svgCanvas, RADIUS);
    document.getElementById('draw1').addEventListener('click', drawSpiral);
    document.getElementById('draw2').addEventListener('click', drawGear);
    document.getElementById('draw3').addEventListener('click', drawNestedSpiral);
    document.getElementById('draw4').addEventListener('click', drawSquare);
    document.getElementById('drawCross').addEventListener('click', drawCross);
    document.getElementById('draw5').addEventListener('click', sanityTest);
    document.getElementById('drawStrange').addEventListener('click', drawStrange);
    document.getElementById('drawArcs').addEventListener('click', drawArcs);
    window.sandPlate = sandPlate;
};

const CANVAS_WIDTH = 800;
const RADIUS = 400;


/**
 *
 * @type {SandPlate}
 */
let sandPlate = null;

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

let drawCross = async () => {
    console.log('Draw a square');

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

let drawStrange = async() => {
    console.log('draw strange graph... terrible name...');

    for (let i = 0; i < 10 ;i++) {
        await sandPlate.lineTo(400 - 40 * i, 0);
        await sandPlate.lineTo(400 - 40 * i, 40 * i+1);
        await sandPlate.lineTo(400 - 40 * i - 20, 40 * i+1);
        await sandPlate.lineTo(400 - 40 * i - 20, 0);
    }

}

let drawArcs = async() => {
    console.log('Draw arcs');

    for (let i = 0; i < 10; ++i) {
        let a = Math.random() * Math.PI * 2;
        let r = Math.random() * 400;
        let r1 = Math.random() * 400;
        let rhs = Math.random() > 0.5 ? true : false;

        await sandPlate.arcTo(r * Math.cos(a), r * Math.sin(a), r1, rhs);
    }

}

document.addEventListener("DOMContentLoaded", init);
