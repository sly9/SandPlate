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

    async executeInstruction(instruction, context) {
        switch (instruction.type) {
            case InstructionType.LINE:
                await sandPlate.lineTo.apply(sandPlate, instruction.arguments);
                break;
            case InstructionType.PARK:
                await sandPlate.park();
                break;
            case InstructionType.GOTO:
                await sandPlate.gotoPos.apply(sandPlate, instruction.arguments);
                break;
            case InstructionType.ARC:
                await sandPlate.arcTo.apply(sandPlate, instruction.arguments);
                break;
            case InstructionType.ROTATE_ARM0:
                await sandPlate.rotateArm0.apply(sandPlate, instruction.arguments);
                break;
            case InstructionType.ROTATE_ARM1:
                await sandPlate.rotateArm1.apply(sandPlate, instruction.arguments);
                break;
            case InstructionType.ROTATE_BOTH_ARMS:
                await sandPlate.rotateBothArms().apply(sandPlate, instruction.arguments);
                break;
            case InstructionType.LOOP: {
                let loopCount = parseInt(instruction.arguments[0]);
            }

        }
    }

    resolveArguments(instruction, context) {

    }

}


export {Driver}