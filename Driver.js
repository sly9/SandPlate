import {InstructionType, Plan} from './Plan.js'
import {SandPlate} from "./sand_plate.js";

const HilbertFacing = Object.freeze({
    UP: Symbol.for('up'),
    DOWN: Symbol.for('down'),
    LEFT: Symbol.for('left'),
    RIGHT: Symbol.for('right'),
});

class Driver {
    constructor(plate) {
        /**
         *
         * @type {Plan}
         * @private
         */
        this.plan_ = null;

        /**
         *
         * @type {SandPlate}
         * @private
         */
        this.plate_ = plate;
    }

    loadFromString(planString) {
        let planJson;
        try {
            planJson = JSON.parse(planString);
        } catch (e) {

        }

        if (!planJson) {
            // This must be a plain text plan
            this.loadPlainTextPlan(planString);
            return;
        }
        this.plan_ = new Plan();
        this.plan_.parseJson(planJson);
    }

    loadPlainTextPlan(planString) {
        let planJson = [];
        let instructionRows = planString.split('\n');
        for (let i = 0; i < instructionRows.length; i++) {
            let instructionParts = instructionRows[i].split(',');
            let planRow = [];
            for (let j = 0; j < instructionParts.length; j++) {
                let fragment = instructionParts[j].trim();
                planRow.push(fragment);
            }
            planJson.push(planRow);
        }

        this.plan_ = new Plan();
        this.plan_.parseJson(planJson);
    }

    async execute() {
        let context = {loopLevel: 0};
        for (let i in this.plan_.instructions) {
            await this.executeInstruction(this.plan_.instructions[i], context);
        }
    }

    async sleep_(milliseconds = 0) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    async executeInstruction(instruction, context) {
        let resolvedArguments = this.resolveArguments(instruction, context);
        console.log(`Executing instruction [${Symbol.keyFor(instruction.type)}] with Args:[${resolvedArguments}], context: [${JSON.stringify(context)}]`);
        switch (instruction.type) {
            case InstructionType.LET:
                window[resolvedArguments[0]] = resolvedArguments[1];
                break;
            case InstructionType.SLEEP:
                await this.sleep_(resolvedArguments[0])
                break;
            case InstructionType.LINE:
                await this.plate_.lineTo.apply(this.plate_, resolvedArguments);
                break;
            case InstructionType.PARK:
                await this.plate_.park();
                break;
            case InstructionType.GOTO:
                await this.plate_.gotoPos.apply(this.plate_, resolvedArguments);
                break;
            case InstructionType.ARC:
                await this.plate_.arcTo.apply(this.plate_, resolvedArguments);
                break;
            case InstructionType.ROTATE_ARM0:
                await this.plate_.rotateArm0.apply(this.plate_, resolvedArguments);
                break;
            case InstructionType.ROTATE_ARM1:
                await this.plate_.rotateArm1.apply(this.plate_, resolvedArguments);
                break;
            case InstructionType.ROTATE_BOTH_ARMS:
                await this.plate_.rotateBothArms().apply(this.plate_, resolvedArguments);
                break;
            case InstructionType.HILBERT:
                await this.plate_.hilbertCurve.apply(this.plate_, resolvedArguments);
                break;
            case InstructionType.LOOP: {
                let loopCount = parseInt(resolvedArguments[0]);
                context['loopLevel'] = context['loopLevel'] + 1;
                for (let i = 0; i < loopCount; i++) {
                    context['i' + (context['loopLevel'] - 1)] = i;
                    for (let j = 0; j < instruction.childrenInstruction.length; j++) {
                        await this.executeInstruction(instruction.childrenInstruction[j], context);
                    }
                }
                context['loopLevel'] = context['loopLevel'] - 1;
                break;
            }

        }
    }

    resolveArguments(instruction, context) {
        let resolvedArguments = [];
        for (let key in context) {
            eval(`window.${key} = ${context[key]};`);
        }
        for (let i = 0; i < instruction.arguments.length; i++) {
            let value = instruction.arguments[i];
            if (instruction.type == InstructionType.LET && i == 0) {
                resolvedArguments.push(value);
            } else {
                resolvedArguments.push(eval(instruction.arguments[i]));
            }
        }
        return resolvedArguments;
    }

    async hilbert(level) {
        const MAX_LENGTH = this.plate_.radius * Math.sqrt(2);
        await this.hilbert_(level, 0, 0, MAX_LENGTH, HilbertFacing.UP);
    }

    /**
     *
     * @param level
     * @param centerX
     * @param centerY
     * @param size
     * @param facing Which way is this curve facing. |_| is down, for example.
     * @return {Promise<void>}
     * @private
     */
    async hilbert_(level, centerX, centerY, size, facing = HilbertFacing.UP) {
        if (level == 0) {
            let [rotatedX, rotatedY] = SandPlate.rotatedPosition(centerX, centerY, -135);
            await this.plate_.lineTo(rotatedX, rotatedY);
            return;
        }

        // up => a
        // right => d
        // left => b
        // down => c

        let facingSequence = {
            'up': [HilbertFacing.RIGHT, HilbertFacing.UP, HilbertFacing.UP, HilbertFacing.LEFT],
            'down': [HilbertFacing.LEFT, HilbertFacing.DOWN, HilbertFacing.DOWN, HilbertFacing.RIGHT],
            'left': [HilbertFacing.DOWN, HilbertFacing.LEFT, HilbertFacing.LEFT, HilbertFacing.UP],
            'right': [HilbertFacing.UP, HilbertFacing.RIGHT, HilbertFacing.RIGHT, HilbertFacing.DOWN],
        }

        let deltas = {
            'up': [[-1, 1], [-1, -1], [1, -1], [1, 1]],
            'right': [[-1, 1], [1, 1], [1, -1], [-1, -1]],
            'left': [[1, -1], [-1, -1], [-1, 1], [1, 1]],
            'down': [[1, -1], [1, 1], [-1, 1], [-1, -1]]

        }

        for (let i = 0; i < 4; i++) {
            let [dx, dy] = deltas[Symbol.keyFor(facing)][i];
            await this.hilbert_(level - 1, centerX + dx * size / 4, centerY + dy * size / 4, size / 2, facingSequence[Symbol.keyFor(facing)][i]);
        }

    }

    async octagon(level) {
        console.log(`octagon of level ${level}`);

        let n = Math.pow(2, level) - 1 + Math.pow(2, level) * Math.sqrt(2);
        let r = this.plate_.radius * Math.sqrt(2);
        let r0 = r / n - 0.1;

        let u = (1 + Math.sqrt(2)) / 2;
        let x = [u * r0, n / 2 * r0, (n / 2 - 1 / Math.sqrt(2)) * r0, 0.5 * r0];
        let y = [0.5 * r0, (n / 2 - 1 / Math.sqrt(2)) * r0, n / 2 * r0, u * r0];

        await this.plate_.gotoPos(x[0], y[0]);

        for (let i = 1; i <= 16; ++i) {
            if (i % 2 == 1) {
                await this.octagon_(x[(i-1) % 4], y[(i-1) % 4], x[i % 4], y[i % 4], level);
            } else {
                await this.plate_.lineTo(x[i % 4], y[i % 4]);
            }
            [x[(i-1) % 4], y[(i-1) % 4]] = SandPlate.rotatedPosition(x[(i-1) % 4], y[(i-1) % 4], 90);
        }
    }

    async octagon_(x0, y0, x1, y1, level) {
        if (level == 1) {
            await this.plate_.lineTo(x1, y1);
            return;
        }

        let n = (Math.pow(2, level) - 1) / Math.sqrt(2) + Math.pow(2, level - 1) - 1;
        let dx = (x1 - x0) / n;
        let dy = (y1 - y0) / n;

        let drx = ((x1 - x0) - (1 + 1 / Math.sqrt(2)) * dx) / 2;
        let dry = ((y1 - y0) - (1 + 1 / Math.sqrt(2)) * dy) / 2;

        await this.octagon_(x0, y0, x0 + drx, y0 + dry, level - 1);
        if ((x1 - x0) * (y1 - y0) > 0) {
            await this.plate_.lineTo(x0 + drx + dx, y0 + dry);
            await this.octagon_(x0 + drx + dx, y0 + dry, x0 + 2 * drx + dx, y0, level - 1);
            await this.plate_.lineTo(x1, y1 - 2 * dry - dy);
            await this.octagon_(x1, y1 - 2 * dry - dy, x1 - drx, y1 - dry - dy, level - 1);
        } else {
            await this.plate_.lineTo(x0 + drx, y0 + dry + dy);
            await this.octagon_(x0 + drx, y0 + dry + dy, x0, y0 + 2 * dry + dy, level - 1);
            await this.plate_.lineTo(x1 - 2 * drx - dx, y1);
            await this.octagon_(x1 - 2 * drx - dx, y1, x1 - drx - dx, y1 - dry, level - 1);
        }
        await this.plate_.lineTo(x1 - drx, y1 - dry);
        await this.octagon_(x1 - drx, y1 - dry, x1, y1, level - 1);
    }

}

export {Driver}