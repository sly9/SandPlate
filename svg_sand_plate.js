import {SandPlate} from './sand_plate.js'

class SvgSandPlate extends SandPlate {
    /**
     * Constructor
     * @param {Element} canvas
     * @param {Element} svgCanvas
     * @param {number} radius Radius of the whole plate.
     */
    constructor(canvas, svgCanvas, radius) {
        super(radius);

        /**
         * The canvas for drawing trials of the ball.
         * @type {Element}
         * @private
         */
        this.canvas_ = canvas;

        /**
         * D3 selection of the SVG canvas. Arms and circles are drawn there.
         * @type {Selection}
         * @private
         */
        this.svgCanvas_ = d3.select(svgCanvas);

        /**
         * The selection representing arm0.
         * @type {Selection}
         * @private
         */
        this.arm0_ = null;

        /**
         * The selection representing arm1.
         * @type {Selection}
         * @private
         */
        this.arm1_ = null;

        this.drawArms_();

        /**
         * Arm 0 rotated angle in degrees, from parking position.
         * @type {number}
         * @private
         */
        this.arm0Rotation = 0;

        /**
         * Arm 1 rotated angle in degrees, from parking position.
         * @type {number}
         * @private
         */
        this.arm1Rotation = 0;

    }

    /**
     * Draws two arms for use.
     * @private
     */
    drawArms_ = () => {
        let x0 = this.radius, y0 = this.radius;
        // Actually the 'arm0' is the group of both arm0 and arm1.
        this.arm0_ = this.svgCanvas_.append('g');

        /**
         * The real selection representing the arm0. You shouldn't care about this details.
         * @type {Selection}
         */
        this.realArm0_ = this.arm0_.append('line').attr('x1', x0).attr('x2', x0 * 1.5).attr('y1', y0).attr('y2', y0)
            .attr('stroke', 'blue').attr('stroke-width', '5');
        this.arm1_ = this.arm0_.append('line').attr('x1', x0 * 2).attr('x2', x0 * 1.5).attr('y1', y0).attr('y2', y0)
            .attr('stroke', 'brown').attr('stroke-width', '5');
    }

    /**
     * @override
     * @param steps
     * @param clockwise
     * @param drawDotAfterRotation
     * @returns {Promise<void>}
     */
    rotateArm0 = async (steps = 1, clockwise = true, drawDotAfterRotation = true, extraSleepTime = 0) => {
        if (steps < 0) {
            console.warn('Why on earth would you move negative steps? Change your direction!');
        }

        let timeSlept = 0;
        while (steps > 0) {
            steps = steps - 1;
            await this.rotateArm0_(1, clockwise, true, extraSleepTime / steps);
            timeSlept += extraSleepTime / steps;
        }
        if (timeSlept < extraSleepTime) {
            await this.sleep_(extraSleepTime - timeSlept);
        }
    }

    /**
     * Real implementation of rotating arm0 for SVG canvas.
     * @param steps
     * @param clockwise
     * @param drawDotAfterRotation
     * @return {Promise<void>}
     * @private
     */
    rotateArm0_ = async (steps = 1, clockwise = true, drawDotAfterRotation = true, extraSleepTime = 0) => {
        this.arm0Rotation += SandPlate.DEGREES_PER_STEP * steps * (clockwise ? 1 : -1);
        await this.sleep_(SandPlate.timeNeededForSteps(steps) + extraSleepTime)
        this.arm0_.attr('transform', 'rotate(' + this.arm0Rotation + ',400,400)');
        if (drawDotAfterRotation) this.drawDot_();
    }


    rotateArm1 = async (steps = 1, clockwise = true, drawDotAfterRotation = true, extraSleepTime = 0) => {
        if (steps < 0) {
            console.warn('Why on earth would you move negative steps? Change your direction!');
        }

        let timeSlept = 0;
        while (steps > 0) {
            steps = steps - 1;
            await this.rotateArm1_(1, clockwise, true, extraSleepTime / steps);
            timeSlept += extraSleepTime / steps;
        }
        if (timeSlept < extraSleepTime) {
            await this.sleep_(extraSleepTime - timeSlept);
        }
    }

    /**
     * Real implementation of rotating arm1 for SVG canvas.
     * @param steps
     * @param clockwise
     * @param drawDotAfterRotation
     * @return {Promise<void>}
     * @private
     */
    rotateArm1_ = async (steps = 1, clockwise = true, drawDotAfterRotation = true, extraSleepTime = 0) => {
        this.arm1Rotation += SandPlate.DEGREES_PER_STEP * steps * (clockwise ? 1 : -1);
        await this.sleep_(SandPlate.timeNeededForSteps(steps) + extraSleepTime)
        this.arm1_.attr('transform', 'rotate(' + this.arm1Rotation + ',600,400)');
        if (drawDotAfterRotation) this.drawDot_();
    }

    /**
     * Draw a short line to show the trail of the ball.
     * @private
     */
    drawDot_ = () => {
        let r = this.radius / 2;
        let x0 = this.radius, y0 = this.radius;
        let x1 = x0 + r * Math.cos(this.arm0Rotation * Math.PI / 180);
        let y1 = y0 + r * Math.sin(this.arm0Rotation * Math.PI / 180);
        let x2 = x1 + r * Math.cos((this.arm0Rotation + this.arm1Rotation) * Math.PI / 180);
        let y2 = y1 + r * Math.sin((this.arm0Rotation + this.arm1Rotation) * Math.PI / 180);

        let context = this.canvas_.getContext('2d');
        context.beginPath();
        context.moveTo(this.lastDrawnX0_, this.lastDrawnY0_);
        context.lineTo(x2, y2);
        this.lastDrawnX0_ = x2;
        this.lastDrawnY0_ = y2;
        context.stroke();
    }

    sleep_ = async (milliseconds) => {
        if (milliseconds > 2000) {
            //debugger
        }
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    drawBigDot = (x, y) => {
        // console.log('draw big dot at' +x+', '+y)
        let context = this.canvas_.getContext('2d');
        context.beginPath();
        context.strokeStyle = "#ff0000";
        context.arc(x + 400, y + 400, 3, 0, 2 * Math.PI, true);
        context.stroke();
        context.strokeStyle = "#000000";
    }

    /**
     * Return angle in degree.
     * @private
     */
    trig2Angle = (c, s) => {
        const eps = 1e-12;
        if (Math.abs(s) < eps) {
            return c > 0 ? 0 : 180;
        }
        if (Math.abs(c) < eps) {
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

}

export {SvgSandPlate}