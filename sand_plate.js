/**
 * Class for a controllable sand plate.
 */
class SandPlate {
    static get DEGREES_PER_STEP() {
        return 360 / 1024;
    }

    /**
     * Constructor
     */
    constructor() {
    }

    /**
     * Rotates the arm (A0) connected to the center.
     * @param steps
     * @param clockwise
     */
    rotateArm0(steps=1,clockwise=true, drawDotAfterRotation = true) {

    }

    /**
     * Rotates the arm (A1) connected to the A0 arm.
     * @param steps
     * @param clockwise
     */
    rotateArm1(steps=1,clockwise=true, drawDotAfterRotation = true) {

    }
    gotoPos = async (x, y) => {}

}