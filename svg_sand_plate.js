class SvgSandPlate extends SandPlate {
    /**
     * Constructor
     * @param {Element} canvas
     * @param {Element} svgCanvas
     * @param {number} radius Radius of the whole plate.
     */
    constructor(canvas, svgCanvas, radius) {
        super();
        this.canvas_ = canvas;
        this.svgCanvas_ = d3.select(svgCanvas);
        this.radius_ = radius;


        this.arm0_ = null;
        this.arm1_ = null;
        this.drawArms_();
        // Arm 0 rotated angle in degrees, from parking position.
        this.arm0Rotation_ = 0;
        // Arm 1 rotated angle in degrees, from parking position.
        this.arm1Rotation_ = 0;

        let context = canvas.getContext('2d');
        this.canvasData_ = context.getImageData(0, 0, radius * 2, radius * 2);

        this.lastDrawnX0_ = 400;
        this.lastDrawnY0_ = 400;
        this.rotateArm1(512, true, false);

    }

    timeNeededForSteps = (steps) => {
        // 1024 step == 1 round
        // 1 round == 3 sec
        // 1 step = 3/1024 * 1000 milli second
        // 3 is good enough and fast
        return 3 * steps;
    }

    /**
     * Draw two arms for use.
     * @private
     */
    drawArms_ = () => {
        let x0 = this.radius_, y0 = this.radius_;
        // Actually the 'arm0' is the group of both arm0 and arm1.
        this.arm0_ = this.svgCanvas_.append('g');

        this.realArm0_ = this.arm0_.append('line').attr('x1', x0).attr('x2', x0 * 1.5).attr('y1', y0).attr('y2', y0).attr('stroke', 'black');
        this.arm1_ = this.arm0_.append('line').attr('x1', x0 * 2).attr('x2', x0 * 1.5).attr('y1', y0).attr('y2', y0).attr('stroke', 'red');
    }

    rotateArm0 = async (steps = 1, clockwise = true, drawDotAfterRotation = true) => {
        while  (true) {
            if (steps < 5) {
                await this.rotateArm0_(steps, clockwise, true);
                return;
            }
            steps = steps - 5;
            await this.rotateArm0_(5, clockwise, true);
        }
    }

    rotateArm0_ = async (steps = 1, clockwise = true, drawDotAfterRotation = true) => {
        this.arm0Rotation_ += SandPlate.DEGREES_PER_STEP * steps * (clockwise ? 1 : -1);
        await this.sleep_(this.timeNeededForSteps(steps))
        this.arm0_.attr('transform', 'rotate(' + this.arm0Rotation_ + ',400,400)');
        if (drawDotAfterRotation) this.drawDot_();
    }


    rotateArm1 = async (steps = 1, clockwise = true, drawDotAfterRotation = true) => {
        while  (true) {
            if (steps < 5) {
                await this.rotateArm1_(steps, clockwise, true);
                return;
            }
            steps = steps - 5;
            await this.rotateArm1_(5, clockwise, true);
        }
    }


    rotateArm1_ = async (steps = 1, clockwise = true, drawDotAfterRotation = true) => {
        this.arm1Rotation_ += SandPlate.DEGREES_PER_STEP * steps * (clockwise ? 1 : -1);
        await this.sleep_(this.timeNeededForSteps(steps))
        this.arm1_.attr('transform', 'rotate(' + this.arm1Rotation_ + ',600,400)');
        if (drawDotAfterRotation) this.drawDot_();
    }

    drawDot_ = () => {
        let r = this.radius_ / 2;
        let x0 = this.radius_, y0 = this.radius_;
        let x1 = x0 + r * Math.cos(this.arm0Rotation_ * Math.PI / 180);
        let y1 = y0 + r * Math.sin(this.arm0Rotation_ * Math.PI / 180);
        let x2 = x1 + r * Math.cos((this.arm0Rotation_ + this.arm1Rotation_) * Math.PI / 180);
        let y2 = y1 + r * Math.sin((this.arm0Rotation_ + this.arm1Rotation_) * Math.PI / 180);

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

    gotoPos = async (x, y) => {
        let k = Math.sqrt(x * x + y * y) / 2;
        let alpha = Math.acos(k / this.radius_ * 2);
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
        if (Math.abs((this.arm0Rotation_ - r0Candidate0) % 360) >
            Math.abs((this.arm0Rotation_ - r0Candidate1) % 360)) {
            r0 = r0Candidate1;
            r1 = r1Candidate1;
        } else {
            r0 = r0Candidate0;
            r1 = r1Candidate0;
        }

        r0 = (r0 + 360) % 360;
        r1 = (r1 + 360) % 360;

        let arm0DegreeDelta = (Math.abs(r0 - this.arm0Rotation_) % 360);
        let arm1DegreeDelta = (Math.abs(r1 - this.arm1Rotation_) % 360);

        let promise0 = null;
        if (arm0DegreeDelta > 180) {
            promise0 = this.rotateArm0((360-arm0DegreeDelta ) / SandPlate.DEGREES_PER_STEP, r0 < this.arm0Rotation_, false);
        } else {
            promise0 = this.rotateArm0(arm0DegreeDelta / SandPlate.DEGREES_PER_STEP, r0 > this.arm0Rotation_, false);
        }

        let promise1 = null;
        if (arm1DegreeDelta > 180) {
            promise1 = this.rotateArm1((360-arm1DegreeDelta ) / SandPlate.DEGREES_PER_STEP, r1 < this.arm1Rotation_);
        } else {
            promise1 = this.rotateArm1(arm1DegreeDelta / SandPlate.DEGREES_PER_STEP, r1 > this.arm1Rotation_);
        }


        //let promise0 = this.rotateArm0(arm0DegreeDelta / SandPlate.DEGREES_PER_STEP, r0 > this.arm0Rotation_, false);
        //let promise1 = this.rotateArm1(arm1DegreeDelta/ SandPlate.DEGREES_PER_STEP, r1 > this.arm1Rotation_);

        await Promise.all([promise0, promise1]);

    }


}