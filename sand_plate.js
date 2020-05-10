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

        /**
         * Rotated degrees, comparing to the starting position
         * @type {number}
         * @private
         */
        this.arm0Rotation_ = 0;
        this.arm1Rotation_ = 0;

        /**
         * The 'logo' turtle facing direction. Not all operations needs this, not all operations updates this.
         * @type {number}
         * @private
         */
        this.LOGODirectionInDegrees_ = 0;
    }

    /**
     * Static getters.
     */

    /**
     *
     * @return {number}
     * @constructor
     */
    static get DEGREES_PER_STEP() {
        return 360 / SandPlate.STEPS_PER_ROUND;
    }

    static get STEPS_PER_ROUND() {
        return 1024;
    }

    static get EPS() {
        return 1e-2;
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
    get arm0Rotation() {
        return (this.arm0Rotation_ % 360 + 360) % 360;
    }

    /**
     * Getter and Setters
     */

    set arm0Rotation(position) {
        this.arm0Rotation_ = position;
    }

    /**
     * Arm0 rotated degree from pointing to the right. Range is [0, 360].
     * @return {number} The angle in degree.
     */
    get arm1Rotation() {
        return (this.arm1Rotation_ % 360 + 360) % 360;
    }

    set arm1Rotation(position) {
        this.arm1Rotation_ = position;
    }

    /**
     * X coordinate of the ball. Range: [-RADIUS,RADIUS]
     * @return {number}
     */
    get currentX() {
        let r = this.radius / 2;
        let x1 = r * Math.cos(this.arm0Rotation * Math.PI / 180);
        let x2 = x1 + r * Math.cos((this.arm0Rotation + this.arm1Rotation) * Math.PI / 180);
        return x2;
    }

    /**
     * Y coordinate of the ball. Range: [-RADIUS,RADIUS]
     * @return {number}
     */
    get currentY() {
        let r = this.radius / 2;
        let y1 = r * Math.sin(this.arm0Rotation * Math.PI / 180);
        let y2 = y1 + r * Math.sin((this.arm0Rotation + this.arm1Rotation) * Math.PI / 180);
        return y2;
    }

    get currentLogoDirection() {
        return this.LOGODirectionInDegrees_;
    }

    set currentLogoDirection(directionInDegrees) {
        this.LOGODirectionInDegrees_ = (directionInDegrees % 360 + 360) % 360;
    }

    /**
     * Static helper methods.
     */

    /**
     * Returns a new position after reverse 'rotating' the canvas by given degrees.
     * @param x
     * @param y
     * @param rotation
     * @return {number[]}
     */
    static rotatedPosition(x = 0, y = 0, rotation = 0) {
        rotation = (rotation % 360 + 360) % 360;
        if (rotation >= SandPlate.EPS && rotation <= 360 - SandPlate.EPS) {
            let c = Math.cos(Math.PI * rotation / 180);
            let s = Math.sin(Math.PI * rotation / 180);

            return [x * c - y * s, x * s + y * c];
        }
        return [x, y];
    }

    /**
     * Returns angle in degree.
     */
    static trig2Angle(c, s) {
        if (Math.abs(s) < SandPlate.EPS) {
            return c > 0 ? 0 : 180;
        }
        if (Math.abs(c) < SandPlate.EPS) {
            return s > 0 ? 90 : 270;
        }

        let alpha = Math.asin(s) * 180 / Math.PI; // [-90, 90]
        if (c < 0) {
            alpha = 180 - alpha;
        } else if (s < 0) {
            alpha += 360;
        }

        return alpha;
    }

    /**
     * Returns the time in milliseconds needed to rotate given steps.
     * @param steps
     * @returns {number}
     */
    static timeNeededForSteps(steps) {
        // 1024 step == 1 round
        // 1 round == 3 sec
        // 1 step = 3/1024 * 1000 milli second
        // 3 is good enough and fast
        return 3 * steps;
    }


    /**
     * Basic methods.
     */

    /**
     * Goes back to original state.
     * @return {Promise<void>}
     */
    async park() {
        await this.rotateBothArms(this.arm0Rotation / SandPlate.DEGREES_PER_STEP, false,
            (this.arm1Rotation + 180) / SandPlate.DEGREES_PER_STEP, false);
    }

    /**
     * Rotates the arm (A0) connected to the center.
     * @param steps How many steps
     * @param {boolean} clockwise Whether this steps should be moving
     * @param {boolean} drawDotAfterRotation Whether a dot should be drawn after move. Noop for real sand plate.
     * @param {number} Extra time in milliseconds to sleep, after rotation, before reporting complete.
     */
    async rotateArm0(steps = 1, clockwise = true, drawDotAfterRotation = true, extraSleepTime = 0) {
        if (steps < 0) {
            console.warn('Why on earth would you move negative steps? I\'m kind enough to fix this for you, don\'t do it again, promise me!', arguments);
        }
    }

    /**
     * Rotates the arm (A1) connected to the A0 arm.
     * @param steps How many steps
     * @param {boolean} clockwise Whether this steps should be moving
     * @param {boolean} drawDotAfterRotation Whether a dot should be drawn after move. Noop for real sand plate.
     * @param {number} Extra time in milliseconds to sleep, after rotation, before reporting complete.
     */
    async rotateArm1(steps = 1, clockwise = true, drawDotAfterRotation = true, extraSleepTime = 0) {
        if (steps < 0) {
            console.warn('Why on earth would you move negative steps? I\'m kind enough to fix this for you, don\'t do it again, promise me!', arguments);
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
    async rotateBothArms(arm0Steps = 1, arm0Clockwise = true, arm1Steps = 1, arm1Clockwise = true, drawDotAfterRotation = true) {
        let rotateLargerSteps = arm0Steps > arm1Steps ? this.rotateArm0.bind(this) : this.rotateArm1.bind(this);
        let rotateSmallerSteps = arm0Steps > arm1Steps ? this.rotateArm1.bind(this) : this.rotateArm0.bind(this);
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
    drawBigDot(x, y) {

    }

    /**
     * Moves end point of Arm1 to (x0, y0) after rotation from current location.
     * @param x0 The x coordinates. X==0 here means the center of the circle. Range: [-RADIUS,RADIUS]
     * @param y0 The y coordinates. Y==0 here means the center of the circle. Range: [-RADIUS,RADIUS]
     * @returns {Promise<void>}
     */
    async gotoPos(x0, y0) {
        const gotoMaxStepLength = 10;

        let r = this.armLength;
        let r0 = Math.sqrt(x0 * x0 + y0 * y0);

        if (r0 > this.radius) {
            console.warn(`{${x0}, ${y0}} is out of range!`);
            x0 = x0 * this.radius / r0;
            y0 = y0 * this.radius / r0;
            r0 = this.radius;
            console.warn(`Going to nearest possible {${x0.toFixed(2)}, ${y0.toFixed(2)}} instead!`);
        }

        let dist = Math.sqrt((this.currentX - x0) * (this.currentX - x0) + (this.currentY - y0) * (this.currentY - y0));
        if (dist >= gotoMaxStepLength) {
            console.warn(`Moving distance ${dist} is too large.`);
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
        let a0 = this.arm0Rotation;
        let a1 = this.arm1Rotation;

        if (Math.abs(x0) < SandPlate.EPS && Math.abs(y0) < SandPlate.EPS) {
            /**
             * When target is x0 = y0 = 0, simply move arm1Rotation to 180 and
             * no need to move Arm0.
             */
            if (a1 <= 180) {
                act1 = this.rotateArm1((180 - a1) / SandPlate.DEGREES_PER_STEP);
            } else {
                act1 = this.rotateArm1((a1 - 180) / SandPlate.DEGREES_PER_STEP, false);
            }

            // console.log('steps ' + 0 + ' ' + Math.floor(Math.abs((180 - a1) / SandPlate.DEGREES_PER_STEP)));

            await Promise.all([act1]);
            this.drawBigDot(x0, y0);

            return;
        } else if (Math.abs(x0) < SandPlate.EPS) {
            y1 = r0 * r0 / 2 / y0;
            y2 = y1;

            x1 = Math.sqrt(Math.pow(r, 2) - Math.pow(y1, 2));
            x2 = -1 * Math.sqrt(Math.pow(r, 2) - Math.pow(y2, 2));
        } else if (Math.abs(y0) < SandPlate.EPS) {
            x1 = r0 * r0 / 2 / x0;
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
         * one in (x1, y1) and (x2, y2) to 'minimize' movement.
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
        let alpha = SandPlate.trig2Angle(xt / r, yt / r);
        let delta = alpha - a0;
        delta = (delta % 360 + 360) % 360

        let j0 = Math.floor(delta / SandPlate.DEGREES_PER_STEP);
        a0 += j0 * SandPlate.DEGREES_PER_STEP;
        a0 = (a0 % 360 + 360) % 360

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
        let beta = SandPlate.trig2Angle((x0 - xt) / rt, (y0 - yt) / rt);
        delta = beta - a0 - a1;
        delta = (delta % 360 + 360) % 360

        let j1 = Math.floor(delta / SandPlate.DEGREES_PER_STEP);

        /**
         * Grid search to further increase precision in a small neighborhood
         * of (j0, j1), the search width is controlled by the constant gridSearchWidth
         */
        const gridSearchWidth = 5;

        let j0s = j0, j1s = j1;
        let mindist = this.radius * this.radius * 4 + 1;
        for (let i = j0 - gridSearchWidth; i <= j0 + gridSearchWidth; ++i) {
            for (let j = j1 - gridSearchWidth; j <= j1 + gridSearchWidth; ++j) {
                xt = r * Math.cos((this.arm0Rotation + i * SandPlate.DEGREES_PER_STEP) * Math.PI / 180);
                xt += r * Math.cos((this.arm0Rotation + this.arm1Rotation + (i + j) * SandPlate.DEGREES_PER_STEP) * Math.PI / 180);
                yt = r * Math.sin((this.arm0Rotation + i * SandPlate.DEGREES_PER_STEP) * Math.PI / 180);
                yt += r * Math.sin((this.arm0Rotation + this.arm1Rotation + (i + j) * SandPlate.DEGREES_PER_STEP) * Math.PI / 180);

                let dist = (xt - x0) * (xt - x0) + (yt - y0) * (yt - y0);
                if (dist < mindist) {
                    mindist = dist;
                    j0s = i;
                    j1s = j;
                }
            }
        }

        j0s = (j0s % SandPlate.STEPS_PER_ROUND + SandPlate.STEPS_PER_ROUND) % SandPlate.STEPS_PER_ROUND;
        j1s = (j1s % SandPlate.STEPS_PER_ROUND + SandPlate.STEPS_PER_ROUND) % SandPlate.STEPS_PER_ROUND;

        /**
         * Rotate Arm0 and Arm1 clockwise by j0 and j1 steps synchronously
         */
        let arm0Steps, arm0Clockwise, arm1Steps, arm1Clockwise;
        if (j0s <= SandPlate.STEPS_PER_ROUND / 2) {
            arm0Steps = j0s;
            arm0Clockwise = true;
        } else {
            arm0Steps = SandPlate.STEPS_PER_ROUND - j0s;
            arm0Clockwise = false;
        }

        if (j1s <= SandPlate.STEPS_PER_ROUND / 2) {
            arm1Steps = j1s;
            arm1Clockwise = true;
        } else {
            arm1Steps = SandPlate.STEPS_PER_ROUND - j1s;
            arm1Clockwise = false;
        }
        await this.rotateBothArms(arm0Steps, arm0Clockwise, arm1Steps, arm1Clockwise, true);

        // console.log(`actual pos {${this.currentX}, ${this.currentY}}`);
        this.drawBigDot(this.currentX, this.currentY);
    }

    /**
     * Tries its best to draw a (relatively) straight line to (x,y) after rotation from current position.
     * @param x
     * @param y
     * @return {Promise<void>}
     */
    async lineTo(x, y) {
        //TODO: Update this.LOGODirection as well.
        const lineToMaxStepLength = 3;

        let x0 = x, y0 = y;

        // console.log(`Line to {${x0}, ${y0}} ${rotation0}`);

        let startX = this.currentX;
        let startY = this.currentY;

        let dX = x0 - startX;
        let dY = y0 - startY;

        let steps = Math.ceil(Math.sqrt(dX * dX + dY * dY) / lineToMaxStepLength);

        let xStepSize = dX / steps;
        let yStepSize = dY / steps;

        for (let i = 1; i < steps; i++) {
            await this.gotoPos(i * xStepSize + startX, i * yStepSize + startY);
        }

        await this.gotoPos(x0, y0);
    }

    /**
     * Draws an arc from current position to (x, y) with radius r
     * @param x
     * @param y
     * @param radius Radius of the arc.
     * @param rightHandSide Decides which side is the arc relative to the vector (current position) --> (x0, y0).
     * @param drawMinorArc
     * @return {Promise<void>}
     */
    async arcTo(x, y, radius, rightHandSide = true, drawMinorArc = true) {
        // TODO: Update logo direction as well.
        const arcToMaxStepLength = 3;

        console.log(`Arc to {${x}, ${y}}`);

        let curX = this.currentX;
        let curY = this.currentY;

        let dist = Math.sqrt((curX - x) * (curX - x) + (curY - y) * (curY - y));
        if (dist > 2 * radius) {
            console.warn(`WTF, this is impossible!`);
            console.warn(`Go to {${x}, ${y}} in a line instead.`);
            await this.lineTo(x, y);
            return;
        }

        // find center of the arc
        let t = Math.sqrt(radius * radius / dist / dist - 0.25);
        let x0 = rightHandSide == drawMinorArc ? (curX + x) / 2 - (y - curY) * t : (curX + x) / 2 + (y - curY) * t;
        let y0 = rightHandSide == drawMinorArc ? (curY + y) / 2 + (x - curX) * t : (curY + y) / 2 - (x - curX) * t;

        // v0 * exp(i * theta) = v1
        // v0 = (curX - x0, curY - y0) & v1 = (x - x0, y - y0)
        let v00 = curX - x0;
        let v01 = curY - y0;
        let v10 = x - x0;
        let v11 = y - y0;

        let c = (v10 * v00 + v11 * v01) / (v00 * v00 + v01 * v01);
        let s = (v11 * v00 - v10 * v01) / (v00 * v00 + v01 * v01);

        let theta = rightHandSide ? Math.acos(c) : -1 * Math.acos(c);
        theta *= 180 / Math.PI;

        if (!drawMinorArc) {
            theta = rightHandSide ? 360 - theta : -360 - theta;
        }

        let steps = Math.ceil(radius * Math.abs(theta) * Math.PI / 180 / arcToMaxStepLength);

        c = Math.cos(theta / steps * Math.PI / 180);
        s = Math.sin(theta / steps * Math.PI / 180);

        let nextX, nextY;
        for (let j = 0; j < steps - 1; ++j) {
            nextX = x0 + (curX - x0) * c - (curY - y0) * s;
            nextY = y0 + (curY - y0) * c + (curX - x0) * s;

            await this.gotoPos(nextX, nextY);

            curX = nextX;
            curY = nextY;
        }

        await this.gotoPos(x, y);
    }

    /**
     * Fancy methods based on basic methods above.
     */

    async forward(steps = 0, direction = -9999999) {
        if (direction == -9999999) {
            // magic number, use current direction.
            direction = this.currentLogoDirection;
        } else {
            this.currentLogoDirection = direction;
        }
        let x0 = this.currentX;
        let y0 = this.currentY;
        let x1 = this.currentX + Math.cos(direction / 180 * Math.PI) * steps;
        let y1 = this.currentY + Math.sin(direction / 180 * Math.PI) * steps;
        //console.log(`Forward from  {${x0},${y0}} to {${x1},${y1}}`);
        await this.lineTo(x1, y1);
    }

    async weird(level) {
        // How many levels to occupy the whole plate.
        let r0 = 151;
        let r = r0;
        for (let i = 0; i < level; i++) {
            r = r / Math.sqrt(7);
        }
        let x0 = r0, y0 = 0;

        await this.gotoPos(x0, y0);
        this.currentLogoDirection = 90;
        for (let i = 0; i < 3; i++) {
            await this.weird_(level, r0, true);
        }
    }

    async weird_(remainingLevel, radius, rightHanded) {
        if (remainingLevel == 0) {
            //this.currentLogoDirection += (rightHanded ? 120 : -120);
            await this.arc(radius, 120, rightHanded);
        } else {
            const rotateDegreePerLevel = -127.5 - Math.asin(1 / 2 / Math.sqrt(7)) / Math.PI * 180;
            this.currentLogoDirection +=  rotateDegreePerLevel;
            //let seq = [true, true, false, true, true, false, false];
            let seq = rightHanded ? [true, true, false, true, true, false, false] : [true, true, false, false, true, false, false];
            for (let j = 0; j < 7; j++) {
                await this.weird_(remainingLevel - 1, radius / Math.sqrt(7), seq[j]);
            }
            this.currentLogoDirection -= rotateDegreePerLevel;
        }
    }



    async arc(radius, degrees, rightHanded = true, direction = -9999999) {
        //
        rightHanded = !rightHanded;
        if (degrees <= 0 || degrees >= 360) {
            console.warn(`Degrees must be between 0 and 360 (exclusive).`);
            return;
        }

        if (direction == -9999999) {
            // magic number, use current direction.
            direction = this.currentLogoDirection;
        } else {
            this.currentLogoDirection = direction;
        }

        let x1 = this.currentX;
        let y1 = this.currentY;

        let c = Math.cos(direction * Math.PI / 180);
        let s = Math.sin(direction * Math.PI / 180);

        // center of the arc
        let x0 = rightHanded ? x1 + s * radius : x1 - s * radius;
        let y0 = rightHanded ? y1 - c * radius : y1 + c * radius;

        let x2 = rightHanded ? x0 + radius * Math.cos((direction + 90 - degrees) * Math.PI / 180) : x0 + radius * Math.cos((direction - 90 + degrees) * Math.PI / 180);
        let y2 = rightHanded ? y0 + radius * Math.sin((direction + 90 - degrees) * Math.PI / 180) : y0 + radius * Math.sin((direction - 90 + degrees) * Math.PI / 180);

        if (degrees <= 180 && rightHanded) {
            await this.arcTo(x2, y2, radius + SandPlate.EPS, false, true);
        } else if (degrees > 180 && rightHanded) {
            await this.arcTo(x2, y2, radius + SandPlate.EPS, false, false);
        } else if (degrees <= 180 && !rightHanded) {
            await this.arcTo(x2, y2, radius + SandPlate.EPS, true, true);
        } else {
            await this.arcTo(x2, y2, radius + SandPlate.EPS, true, false);
        }

        this.currentLogoDirection += rightHanded ? -degrees : degrees;
    }


    /**
     * Draws a space-filling Hilbert curve
     * @param depth Depth of the Hilbert curve
     * @param rotation
     * @return {Promise<void>}
     */
    async hilbertCurve(depth, rotation = 0) {
        console.log(`Draw Hilbert curve of depth ${depth}.`);

        if (depth <= 0) {
            console.warn(`Depth must be a positive integer.`);
            return;
        }

        let productionRules = [];
        productionRules['A'] = ['D', 'A', 'A', 'B'];
        productionRules['B'] = ['C', 'B', 'B', 'A'];
        productionRules['C'] = ['B', 'C', 'C', 'D'];
        productionRules['D'] = ['A', 'D', 'D', 'C'];

        let dx = [];
        dx['A'] = [-1, -1, 1, 1];
        dx['B'] = [1, -1, -1, 1];
        dx['C'] = [1, 1, -1, -1];
        dx['D'] = [-1, 1, 1, -1];

        let dy = [];
        dy['A'] = [-1, 1, 1, -1];
        dy['B'] = [1, 1, -1, -1];
        dy['C'] = [1, -1, -1, 1];
        dy['D'] = [-1, -1, 1, 1];

        let pattern = [];
        let x = [], y = [];

        let r = this.radius * Math.sqrt(2) - 0.1;
        let n = 1;

        for (let i = 1; i <= depth; ++i) {
            n *= 4;
            r /= 2;

            if (i == 1) {
                pattern[0] = 'C';

                x[0] = r / 2;
                y[0] = r / 2;

                x[1] = r / 2;
                y[1] = -r / 2;

                x[2] = -r / 2;
                y[2] = -r / 2;

                x[3] = -r / 2;
                y[3] = r / 2;
            } else {
                // pattern is of length n/4
                // pattern[i] ==> patter[4 * i  :4 * i + 3] for i in [0, n/16 - 1]
                for (let i = n / 16 - 1; i >= 0; --i) {
                    let pi = pattern[i];
                    for (let j = 0; j < 4; ++j) {
                        pattern[4 * i + j] = productionRules[pi][j];
                    }
                }

                // x, y are of length n
                // x[i] ==> x[4 * i  :4 * i + 3] for i in [0, n/4 - 1]
                for (let i = n / 4 - 1; i >= 0; --i) {
                    let xi = x[i], yi = y[i];
                    let pi = pattern[i];

                    for (let j = 0; j < 4; ++j) {
                        x[4 * i + j] = xi + r * dx[pi][j] / 2;
                        y[4 * i + j] = yi + r * dy[pi][j] / 2;
                    }
                }
            }
        }

        for (let i = 0; i < n; ++i) {
            let [rotatedX, rotatedY] = SandPlate.rotatedPosition(x[i], y[i], rotation);
            await this.lineTo(rotatedX, rotatedY);
        }

    }
}

export {SandPlate}