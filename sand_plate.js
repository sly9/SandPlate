/**
 * Class for a controllable sand plate.
 */
class SandPlate {
    /**
     * Constructor
     * @type {number} radius The radius unit of the whole plate. (E.g. pixel for SVGSandPlate).
     */
    constructor(radius) {
        /**
         * Radius
         * @type {number}
         * @private
         */
        this.radius_ = radius;

        this.arm0Position_ = 0;
        this.arm1Position_ = 0;
    }

    static get DEGREES_PER_STEP() {
        return 360 / SandPlate.STEPS_PER_ROUND;
    }

    static get STEPS_PER_ROUND() {
        return 1024;
    }

    /**
     * Radius of the plate
     * @returns {number}
     */
    get radius() {
        return this.radius_;
    }

    /**
     * Length of one arm.
     * @returns {number}
     */
    get armLength() {
        return this.radius / 2;
    }

    /**
     * Arm0 rotated degree from pointing to the right. Range is [0, 360].
     * @return {number} The angle in degree.
     */
    get arm0Position() {
        return (this.arm0Position_ % 360 + 360) % 360;
    }

    set arm0Position(position) {
        this.arm0Position_ = position;
    }

    /**
     * Arm0 rotated degree from pointing to the right. Range is [0, 360].
     * @return {number} The angle in degree.
     */
    get arm1Position() {
        return (this.arm1Position_ % 360 + 360) % 360;
    }

    set arm1Position(position) {
        this.arm1Position_ = position;
    }

    /**
     * Returns the time in milliseconds needed to rotate given steps.
     * @param steps
     * @returns {number}
     */
    static timeNeededForSteps = (steps) => {
        // 1024 step == 1 round
        // 1 round == 3 sec
        // 1 step = 3/1024 * 1000 milli second
        // 3 is good enough and fast
        return 3 * steps;
    }

    /**
     * Rotates the arm (A0) connected to the center.
     * @param steps How many steps
     * @param {boolean} clockwise Whether this steps should be moving
     * @param {boolean} drawDotAfterRotation Whether a dot should be drawn after move. Noop for real sand plate.
     * @param {number} Extra time in milliseconds to sleep, after rotation, before reporting complete.
     */
    rotateArm0 = async (steps = 1, clockwise = true, drawDotAfterRotation = true, extraSleepTime = 0) => {
        if (steps < 0) {
            console.warn('Why on earth would you move negative steps? Change your direction!');
        }
    }

    /**
     * Rotates the arm (A1) connected to the A0 arm.
     * @param steps How many steps
     * @param {boolean} clockwise Whether this steps should be moving
     * @param {boolean} drawDotAfterRotation Whether a dot should be drawn after move. Noop for real sand plate.
     * @param {number} Extra time in milliseconds to sleep, after rotation, before reporting complete.
     */
    rotateArm1 = async (steps = 1, clockwise = true, drawDotAfterRotation = true, extraSleepTime = 0) => {
        if (steps < 0) {
            console.warn('Why on earth would you move negative steps? Change your direction!');
        }
    }

    /**
     * Rotates both arms at the same time. Both arms should finish rotation at a relatively close time.
     * @param arm0Steps Number of steps to rotate for arm0. Should be always positive.
     * @param arm0Clockwise Whether arm0 should rotate clockwise or not. True for clockwise.
     * @param arm1Steps Number of steps to rotate for arm1. Should be always positive.
     * @param arm1Clockwise Whether arm1 should rotate clockwise or not. True for clockwise.
     * @param drawDotAfterRotation Whether a red dot should be drawn after move. Noop for real sand plate.
     * @returns {Promise<void>}
     */
    rotateBothArms = async (arm0Steps = 1, arm0Clockwise = true, arm1Steps = 1, arm1Clockwise = true, drawDotAfterRotation = true) => {
        let rotateLargerSteps = arm0Steps > arm1Steps ? this.rotateArm0 : this.rotateArm1;
        let rotateSmallerSteps = arm0Steps > arm1Steps ? this.rotateArm1 : this.rotateArm0;
        let largerSteps = arm0Steps > arm1Steps ? arm0Steps : arm1Steps;
        let smallerSteps = arm0Steps > arm1Steps ? arm1Steps : arm0Steps;
        let largerClockwise = arm0Steps > arm1Steps ? arm0Clockwise : arm1Clockwise;
        let smallerClockwise = arm0Steps > arm1Steps ? arm1Clockwise : arm0Clockwise;

        let timeNeededForLargerSteps = SandPlate.timeNeededForSteps(largerSteps);
        let timeNeededForSmallerSteps = SandPlate.timeNeededForSteps(smallerSteps);

        let timeNeededForSmallerStepsToWait = timeNeededForLargerSteps - timeNeededForSmallerSteps;

        let promise0 = rotateLargerSteps(largerSteps, largerClockwise, drawDotAfterRotation);
        let promise1 = rotateSmallerSteps(smallerSteps, smallerClockwise, drawDotAfterRotation, timeNeededForSmallerStepsToWait);
        await Promise.all([promise0, promise1]);
    }

    // Draw a dot, noop for SVG
    drawBigDot = (x, y) => {

    }

    /**
     * Move end point of Arm1 to (x0, y0) from current location.
     * @param x0 The x coordinates. X==0 here means the center of the circle.
     * @param y0 The y coordinates. Y==0 here means the center of the circle.
     * @returns {Promise<void>}
     */
    gotoPos = async (x0, y0) => {
        console.log('gotoPos ' + x0 + " " + y0);

        let r = this.armLength;
        let r0 = Math.sqrt(x0 * x0 + y0 * y0);

        if (r0 > this.radius_) {
            console.warn('Out of range.');
        }

        /**
         * In order to move Arm1 to (x0, y0), first we need find where to move Arm0.
         * For any given (x0, y0) except when x0 = y0 = 0, there are two possible
         * positions for Arm0: the solution (x_i, y_i) (i = 1 or 2) of the following
         * quadratic equations
         *              x^2    +     y^2    = r^2
         *          (x - x0)^2 + (y - y0)^2 = r^2
         * or, equivalently,
         *            x^2  +   y^2  = r^2
         *          x0 * x + y0 * y = r0^2 / 2
         * where r0^2 = x0^2 + y0^2.
         */
        let x1, x2, y1, y2;
        let act0, act1;
        let a0 = this.arm0Position;
        let a1 = this.arm1Position;

        if (x0 == 0 && y0 == 0) {
            /**
             * When target is x0 = y0 = 0, simply move arm1Position to 180 and
             * no need to move Arm0.
             */
            if (a1 <= 180) {
                act1 = this.rotateArm1((180 - a1) / SandPlate.DEGREES_PER_STEP);
            } else {
                act1 = this.rotateArm1((a1 - 180) / SandPlate.DEGREES_PER_STEP, false);
            }

            console.log("steps " + 0 + " " + Math.floor(Math.abs((180 - a1) / SandPlate.DEGREES_PER_STEP)));

            await Promise.all([act1]);
            this.drawBigDot(x0, y0);

            return;
        } else if (x0 == 0) {
            y1 = Math.pow(r0, 2) / 2 / y0;
            y2 = y1;

            x1 = Math.sqrt(Math.pow(r, 2) - Math.pow(y1, 2));
            x2 = -1 * Math.sqrt(Math.pow(r, 2) - Math.pow(y2, 2));
        } else if (y0 == 0) {
            x1 = Math.pow(r0, 2) / 2 / x0;
            x2 = x1;

            y1 = Math.sqrt(Math.pow(r, 2) - Math.pow(x1, 2));
            y2 = -1 * Math.sqrt(Math.pow(r, 2) - Math.pow(x2, 2));
        } else {
            let a = 4 * Math.pow(r0, 2);
            let b = -4 * Math.pow(r0, 2) * y0;
            let c = Math.pow(r0, 4) - 4 * Math.pow(r, 2) * Math.pow(x0, 2);

            if (b >= 0) {
                y1 = (-1 * b - Math.sqrt(b * b - 4 * a * c)) / a / 2;
                y2 = 2 * c / (-1 * b - Math.sqrt(b * b - 4 * a * c));
            } else {
                y1 = 2 * c / (-1 * b + Math.sqrt(b * b - 4 * a * c));
                y2 = (-1 * b + Math.sqrt(b * b - 4 * a * c)) / a / 2;
            }

            x1 = (r0 * r0 / 2 - y0 * y1) / x0;
            x2 = (r0 * r0 / 2 - y0 * y2) / x0;
        }

        /**
         * Compute the current position of Arm0 and move it to the closer
         * one in (x1, y1) and (x2, y2) to "minimize" movement.
         */
        let xcur = r * Math.cos(a0 * Math.PI / 180);
        let ycur = r * Math.sin(a0 * Math.PI / 180);

        let r1 = (xcur - x1) * (xcur - x1) + (ycur - y1) * (ycur - y1);
        let r2 = (xcur - x2) * (xcur - x2) + (ycur - y2) * (ycur - y2);

        let xt = r1 <= r2 ? x1 : x2;
        let yt = r1 <= r2 ? y1 : y2;

        /**
         * Now (xt, yt) is the target position for Arm0, find alpha in [0, 2*PI) so that
         * (r * cos(alpha), r * sin(alpha)) is as close as possible to (xt, yt), the exact
         * solution is
         *      cos(alpha) = xt / r
         *      sin(alpha) = yt / r
         */
        let alpha = this.trig2Angle(xt / r, yt / r);
        let delta = alpha - a0;
        while (delta < 0) {
            delta += 360;
        }

        let j0 = Math.floor(delta / SandPlate.DEGREES_PER_STEP);
        a0 += j0 * SandPlate.DEGREES_PER_STEP;
        while (a0 >= 360) {
            a0 -= 360;
        }

        xt = r * Math.cos(a0 * Math.PI / 180);
        yt = r * Math.sin(a0 * Math.PI / 180);

        /**
         * Now Arm0 is done, move Arm1 to (x0, y0) by finding beta where
         *      cos(beta) = (x0 - xt) / rt
         *      sin(beta) = (y0 - yt) / rt
         * where rt^2 = (x0 - xt)^2 + (y0 - yt)^2.
         * Note: the distance between (xt, yt) and (x0, y0) is not exactly r.
         */
        let rt = Math.sqrt((x0 - xt) * (x0 - xt) + (y0 - yt) * (y0 - yt));
        let beta = this.trig2Angle((x0 - xt) / rt, (y0 - yt) / rt);
        delta = beta - a0 - a1;
        while (delta < 0) {
            delta += 360;
        }

        let j1 = Math.floor(delta / SandPlate.DEGREES_PER_STEP);

        console.log("steps " + j0 + " " + j1);

        /**
         * Rotate Arm0 and Arm1 clockwise by j0 and j1 steps synchronously
         */
        let arm0Steps, arm0Clockwise, arm1Steps, arm1Clockwise;
        if (j0 <= SandPlate.STEPS_PER_ROUND / 2) {
            arm0Steps = j0;
            arm0Clockwise = true;
        } else {
            arm0Steps = SandPlate.STEPS_PER_ROUND - j0;
            arm0Clockwise = false;
        }

        if (j1 <= SandPlate.STEPS_PER_ROUND / 2) {
            arm1Steps = j1;
            arm1Clockwise = true;
        } else {
            arm1Steps = SandPlate.STEPS_PER_ROUND - j1;
            arm1Clockwise = false;
        }
        await this.rotateBothArms(arm0Steps, arm0Clockwise, arm1Steps, arm1Clockwise, true);

        this.drawBigDot(x0, y0);
    }

}

export {SandPlate}