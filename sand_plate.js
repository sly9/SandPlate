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
     * First version of goto(X,Y) from current location.
     * @param x The x coordinates. X==0 here means the center of the circle.
     * @param y The y coordinates. Y==0 here means the center of the circle.
     * @returns {Promise<void>}
     */
    gotoPos = async (x, y) => {
        let k = Math.sqrt(x * x + y * y) / 2;
        let alpha = Math.acos(k / this.radius * 2);
        let beta = Math.acos(x / (2 * k));
        let r0Candidate0 = -(alpha - beta) * 180 / Math.PI;
        let r1Candidate0 = alpha * 2 * 180 / Math.PI;
        // console.log('current r0: ' + this.arm0Rotation_);
        // console.log('current r1: ' + this.arm1Rotation_);
        //
        // console.log('r0Candidate0: ' + r0Candidate0);
        // console.log('r1Candidate0: ' + r1Candidate0);

        // another set of candidate is:
        let r0Candidate1 = (alpha + beta) * 180 / Math.PI;
        let r1Candidate1 = -alpha * 2 * 180 / Math.PI;
        // console.log('r0Candidate0: ' + r0Candidate1);
        // console.log('r1Candidate1: ' + r1Candidate1);

        // tweak pos/neg for Y... terrible math
        if (y < 0) {
            r0Candidate0 = -r0Candidate0;
            r1Candidate0 = -r1Candidate0;
            r0Candidate1 = -r0Candidate1;
            r1Candidate1 = -r1Candidate1;
        }

        // decide which is smaller, in terms of delta degrees for Arm 0
        let r0 = null, r1 = null;
        if (Math.abs((this.arm0Position - r0Candidate0) % 360) >
            Math.abs((this.arm0Position - r0Candidate1) % 360)) {
            r0 = r0Candidate1;
            r1 = r1Candidate1;
        } else {
            r0 = r0Candidate0;
            r1 = r1Candidate0;
        }

        r0 = (r0 + 360) % 360;
        r1 = (r1 + 360) % 360;

        let arm0DegreeDelta = (Math.abs(r0 - this.arm0Position) % 360);
        let arm1DegreeDelta = (Math.abs(r1 - this.arm1Position) % 360);

        // let promise0 = null;
        // if (arm0DegreeDelta > 180) {
        //     promise0 = this.rotateArm0((360-arm0DegreeDelta ) / SandPlate.DEGREES_PER_STEP, r0 < this.arm0Rotation_, false);
        // } else {
        //     promise0 = this.rotateArm0(arm0DegreeDelta / SandPlate.DEGREES_PER_STEP, r0 > this.arm0Rotation_, false);
        // }

        // let promise1 = null;
        // if (arm1DegreeDelta > 180) {
        //     promise1 = this.rotateArm1((360-arm1DegreeDelta ) / SandPlate.DEGREES_PER_STEP, r1 < this.arm1Rotation_);
        // } else {
        //     promise1 = this.rotateArm1(arm1DegreeDelta / SandPlate.DEGREES_PER_STEP, r1 > this.arm1Rotation_);
        // }


        let promise0 = this.rotateArm0(arm0DegreeDelta / SandPlate.DEGREES_PER_STEP, r0 > this.arm0Position, false);
        let promise1 = this.rotateArm1(arm1DegreeDelta / SandPlate.DEGREES_PER_STEP, r1 > this.arm1Position);

        await Promise.all([promise0, promise1]);
        this.drawBigDot(x, y);
    }

    /**
     * Second version of goto(X,Y) from current location.
     * @param x The x coordinates. X==0 here means the center of the circle.
     * @param y The y coordinates. Y==0 here means the center of the circle.
     * @returns {Promise<void>}
     */
    gotoPos2 = async (x, y) => {
        let eps = 1.0;
        console.log("gotoPos2 " + x + " " + y);

        let a0 = this.arm0Position;
        let a1 = this.arm1Position;

        // console.log("arg : " + a0 + "  " + a1);

        // initial position
        let x0 = this.armLength * Math.cos(a0 * Math.PI / 180) + this.armLength * Math.cos((a0 + a1) * Math.PI / 180);
        let y0 = this.armLength * Math.sin(a0 * Math.PI / 180) + this.armLength * Math.sin((a0 + a1) * Math.PI / 180);
        let r0 = x0 * x0 + y0 * y0;

        let r = x * x + y * y;

        // arm 1
        let j = 0;

        let j1 = j;
        let mindist = Math.abs(r - r0);

        let x1;
        let y1;
        let r1;
        for (j = 0; j < SandPlate.STEPS_PER_ROUND; ++j) {
            x1 = this.armLength * Math.cos(a0 * Math.PI / 180) + this.armLength * Math.cos((a0 + a1 + j * SandPlate.DEGREES_PER_STEP) * Math.PI / 180);
            y1 = this.armLength * Math.sin(a0 * Math.PI / 180) + this.armLength * Math.sin((a0 + a1 + j * SandPlate.DEGREES_PER_STEP) * Math.PI / 180);
            r1 = x1 * x1 + y1 * y1;

            if (Math.abs(r - r1) < mindist) {
                mindist = Math.abs(r - r1);
                j1 = j;
            }

            if (mindist < eps) {
                break;
            }
        }

        // console.log("j1 " + j1);

        a1 += j1 * SandPlate.DEGREES_PER_STEP;

        // console.log("arg : " + a0 + "  " + a1);

        // current position x1, y1
        x1 = this.armLength * Math.cos(a0 * Math.PI / 180) + this.armLength * Math.cos((a0 + a1) * Math.PI / 180);
        y1 = this.armLength * Math.sin(a0 * Math.PI / 180) + this.armLength * Math.sin((a0 + a1) * Math.PI / 180);

        // console.log("x1 y1 " + x1 + " " + y1);

        // arm 0
        j = 0;

        let j0 = j;
        mindist = (x1 - x) * (x1 - x) + (y1 - y) * (y1 - y);

        // console.log("dist " + mindist);

        for (j = 0; j < SandPlate.STEPS_PER_ROUND; ++j) {
            x1 = this.armLength * Math.cos((a0 + j * SandPlate.DEGREES_PER_STEP) * Math.PI / 180) + this.armLength * Math.cos((a0 + a1 + j * SandPlate.DEGREES_PER_STEP) * Math.PI / 180);
            y1 = this.armLength * Math.sin((a0 + j * SandPlate.DEGREES_PER_STEP) * Math.PI / 180) + this.armLength * Math.sin((a0 + a1 + j * SandPlate.DEGREES_PER_STEP) * Math.PI / 180);

            let dist = (x1 - x) * (x1 - x) + (y1 - y) * (y1 - y);

            // console.log("dist " + j + "  " + x1 + "  " + y1 + "  " +  dist);
            if (dist < mindist) {
                mindist = dist;
                j0 = j;
            }

            if (mindist < eps) {
                break;
            }
        }

        // console.log("j " + j0 + "  " + j1);

        a0 += j0 * SandPlate.DEGREES_PER_STEP;
        a1 += j0 * SandPlate.DEGREES_PER_STEP;

        // console.log("arg : " + a0 + "  " + a1);

        let act0;
        if (j0 <= SandPlate.STEPS_PER_ROUND / 2) {
            act0 = this.rotateArm0(j0, true);
        } else {
            act0 = this.rotateArm0(SandPlate.STEPS_PER_ROUND - j0, false);
        }

        let act1;
        if (j1 <= SandPlate.STEPS_PER_ROUND / 2) {
            act1 = this.rotateArm1(j1, true);
        } else {
            act1 = this.rotateArm1(SandPlate.STEPS_PER_ROUND - j1, false);
        }

        await Promise.all([act0, act1]);
        this.drawBigDot(x, y)
    }

    /**
     * Third version of goto(X,Y) from current location.
     * @param x0 The x coordinates. X==0 here means the center of the circle.
     * @param y0 The y coordinates. Y==0 here means the center of the circle.
     * @returns {Promise<void>}
     */
    gotoPos3 = async (x0, y0) => {
        console.log("gotoPos3 " + x0 + " " + y0);

        let eps = 1.0;

        let r = this.armLength;
        let r0 = Math.sqrt(x0 * x0 + y0 * y0);

        // x0 * x + y0 * y = 1/2 * r_0^2
        // x^2 + y^2 = r^2

        let x1, x2, y1, y2;
        let act0, act1;
        let a0 = this.arm0Position;
        let a1 = this.arm1Position;

        // quick return
        if (x0 == 0 && y0 == 0) {
            if (a1 <= 180) {
                act1 = this.rotateArm1((180 - a1) / SandPlate.DEGREES_PER_STEP);
            } else {
                act1 = this.rotateArm1((a1 - 180) / SandPlate.DEGREES_PER_STEP, false);
            }

            console.log("steps " + 0 + Math.abs(180 - a1) / SandPlate.DEGREES_PER_STEP);

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

        let xcur = r * Math.cos(a0 * Math.PI / 180);
        let ycur = r * Math.sin(a0 * Math.PI / 180);

        let r1 = (xcur - x1) * (xcur - x1) + (ycur - y1) * (ycur - y1);
        let r2 = (xcur - x2) * (xcur - x2) + (ycur - y2) * (ycur - y2);

        let xt, yt;

        if (r1 <= r2) {
            xt = x1;
            yt = y1;
        } else {
            xt = x2;
            yt = y2;
        }

        let j0 = 0;
        let mindist = 8 * r * r;
        for (let j = 0; j < SandPlate.STEPS_PER_ROUND; ++j) {
            xcur = r * Math.cos((a0 + j * SandPlate.DEGREES_PER_STEP) * Math.PI / 180);
            ycur = r * Math.sin((a0 + j * SandPlate.DEGREES_PER_STEP) * Math.PI / 180);

            let dist = (xcur - xt) * (xcur - xt) + (ycur - yt) * (ycur - yt);
            // console.log("j0 " + j + "  " + dist);
            if (dist < mindist) {
                j0 = j;
                mindist = dist;
            }
        }

        a0 += j0 * SandPlate.DEGREES_PER_STEP;

        let j1 = 0;
        mindist = 8 * r * r;
        for (let j = 0; j < SandPlate.STEPS_PER_ROUND; ++j) {
            xcur = r * Math.cos(a0 * Math.PI / 180) + r * Math.cos((a0 + a1 + j * SandPlate.DEGREES_PER_STEP) * Math.PI / 180);
            ycur = r * Math.sin(a0 * Math.PI / 180) + r * Math.sin((a0 + a1 + j * SandPlate.DEGREES_PER_STEP) * Math.PI / 180);

            let dist = (xcur - x0) * (xcur - x0) + (ycur - y0) * (ycur - y0);
            // console.log("j1 " + j + "  " + dist);
            if (dist < mindist) {
                j1 = j;
                mindist = dist;
            }
        }

        a1 += j1 * SandPlate.DEGREES_PER_STEP;

        let arm0Steps,arm0Clockwise, arm1Steps,arm1Clockwise;
        if (j0 <= SandPlate.STEPS_PER_ROUND / 2) {
            arm0Steps=j0;
            arm0Clockwise=true;
        } else {
            arm0Steps=SandPlate.STEPS_PER_ROUND - j0;
            arm0Clockwise=false;
        }

        if (j1 <= SandPlate.STEPS_PER_ROUND / 2) {
            arm1Steps = j1;
            arm1Clockwise = true;
        } else {
            arm1Steps = SandPlate.STEPS_PER_ROUND - j1;
            arm1Clockwise = false;
        }
        await this.rotateBothArms(arm0Steps,arm0Clockwise,arm1Steps,arm1Clockwise,true);

        console.log("steps " + j0 + " " + j1);

        this.drawBigDot(x0, y0);
    }

}