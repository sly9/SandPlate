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
        if (i % 3 ==0) {
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
    for (let i = 0; i < 10000; i++) {
        if (i % 3 ==0) {
            let a0 = sandPlate.rotateArm0(10);
            let a1 = sandPlate.rotateArm1(1);
            await Promise.all([a0, a1]);
        } else {
            let a0= sandPlate.rotateArm0(10);
            let a1 = sandPlate.rotateArm1(i%6 - 3 >0 ? 1:-1);
            await Promise.all([a0, a1]);
        }
    }
};

let drawNestedSpiral = async () => {
    console.log('Draw a spiral');
    sandPlate.rotateArm1(512);
    for (let i = 0; i < 10000; i++) {
        if (i % 3 ==0) {
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

    await sandPlate.gotoPos3(0, 0);

    // for (let i = 0; i < 100; ++i) {
    //     await sandPlate.gotoPos3(400 - i * 4, i * 4);
    // }
    // for (let i = 0; i < 100; ++i) {
    //     await sandPlate.gotoPos3(- i * 4, 400 - i * 4);
    // }
    // for (let i = 0; i < 100; ++i) {
    //     await sandPlate.gotoPos3(-400 + i * 4, - i * 4);
    // }
    // for (let i = 0; i < 100; ++i) {
    //     await sandPlate.gotoPos3(i * 4, -400 + i * 4);
    // }
    
};


document.addEventListener("DOMContentLoaded", init);