import {InstructionType, Plan} from './Plan.js'
import {SandPlate} from "./sand_plate.js";

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
        let planJson = JSON.parse(planString);
        this.plan_ = new Plan();
        this.plan_.parseJson(planJson);
    }

    async execute() {
        for (let i in this.plan_.instructions) {
            await this.executeInstruction(this.plan_.instructions[i]);
        }
    }

    async executeInstruction(instruction) {
        switch (instruction.type) {
            case InstructionType.LINE:
                await sandPlate.lineTo.apply(this, instruction.arguments);
                break;
            case InstructionType.PARK:
                await sandPlate.park();
                break;
            case InstructionType.GOTO:
                await sandPlate.gotoPos.apply(this, instruction.arguments);
                break;
            case InstructionType.ARC:
                await sandPlate.minorArcTo.apply(this, instruction.arguments);
                break;
            case InstructionType.ROTATE_ARM0:
                await sandPlate.rotateArm0.apply(this, instruction.arguments);
                break;
            case InstructionType.ROTATE_ARM1:
                await sandPlate.rotateArm1.apply(this, instruction.arguments);
                break;
            case InstructionType.ROTATE_BOTH_ARMS:
                await sandPlate.rotateBothArms().apply(this, instruction.arguments);
                break;
        }
    }

}


export {Driver}