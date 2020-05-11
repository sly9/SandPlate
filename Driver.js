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


}


export {Driver}