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
        this.arm0Position = 0;

        /**
         * Arm 1 rotated angle in degrees, from parking position.
         * @type {number}
         * @private
         */
        this.arm1Position = 0;

        /**
         * Handy memory of the last X coordinate of the ball.
         * @type {number}
         * @private
         */
        this.lastDrawnX0_ = 400;
        /**
         * Handy memory of the last Y coordinate of the ball.
         * @type {number}
         * @private
         */
        this.lastDrawnY0_ = 400;
    }

    /**
     * Returns the time in milliseconds needed to rotate given steps.
     * @param steps
     * @returns {number}
     */
    timeNeededForSteps = (steps) => {
        // 1024 step == 1 round
        // 1 round == 3 sec
        // 1 step = 3/1024 * 1000 milli second
        // 3 is good enough and fast
        return 3 * steps;
    }

    /**
     * Draws two arms for use.
     * @private
     */
    drawArms_ = () => {
        let x0 = this.radius_, y0 = this.radius_;
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
    rotateArm0 = async (steps = 1, clockwise = true, drawDotAfterRotation = true) => {
        if (steps < 0) {
            console.warn('Why on earth would you move negative steps? Change your direction!');
        }

        while (true) {
            if (steps < 3) {
                await this.rotateArm0_(steps, clockwise, true);
                return;
            }
            steps = steps - 3;
            await this.rotateArm0_(3, clockwise, true);
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
    rotateArm0_ = async (steps = 1, clockwise = true, drawDotAfterRotation = true) => {
        this.arm0Position += SandPlate.DEGREES_PER_STEP * steps * (clockwise ? 1 : -1);
        await this.sleep_(this.timeNeededForSteps(steps))
        this.arm0_.attr('transform', 'rotate(' + this.arm0Position + ',400,400)');
        if (drawDotAfterRotation) this.drawDot_();
    }


    rotateArm1 = async (steps = 1, clockwise = true, drawDotAfterRotation = true) => {
        if (steps < 0) {
            console.warn('Why on earth would you move negative steps? Change your direction!');
        }

        while (true) {
            if (steps < 3) {
                await this.rotateArm1_(steps, clockwise, true);
                return;
            }
            steps = steps - 3;
            await this.rotateArm1_(3, clockwise, true);
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
    rotateArm1_ = async (steps = 1, clockwise = true, drawDotAfterRotation = true) => {
        this.arm1Position += SandPlate.DEGREES_PER_STEP * steps * (clockwise ? 1 : -1);
        await this.sleep_(this.timeNeededForSteps(steps))
        this.arm1_.attr('transform', 'rotate(' + this.arm1Position + ',600,400)');
        if (drawDotAfterRotation) this.drawDot_();
    }

    /**
     * Draw a short line to show the trail of the ball.
     * @private
     */
    drawDot_ = () => {
        let r = this.radius / 2;
        let x0 = this.radius, y0 = this.radius;
        let x1 = x0 + r * Math.cos(this.arm0Position * Math.PI / 180);
        let y1 = y0 + r * Math.sin(this.arm0Position * Math.PI / 180);
        let x2 = x1 + r * Math.cos((this.arm0Position + this.arm1Position) * Math.PI / 180);
        let y2 = y1 + r * Math.sin((this.arm0Position + this.arm1Position) * Math.PI / 180);

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
        context.arc(x + 400, y + 400, 5, 0, 2 * Math.PI, true);
        context.stroke();
        context.strokeStyle = "#000000";
    }

}