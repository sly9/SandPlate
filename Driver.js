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

    async sleep_(milliseconds = 0) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    async executeInstruction(instruction, context) {
        let resolvedArguments = this.resolveArguments(instruction, context);
        console.log(`Executing instruction [${Symbol.keyFor(instruction.type)}] with Args:[${resolvedArguments}], context: [${JSON.stringify(context)}]`);
        switch (instruction.type) {
            case InstructionType.LET:
                window[resolvedArguments[0]]=resolvedArguments[1];
                break;
            case InstructionType.SLEEP:
                await this.sleep_(resolvedArguments[0])
                break;
            case InstructionType.LINE:
                await sandPlate.lineTo.apply(sandPlate, resolvedArguments);
                break;
            case InstructionType.PARK:
                await sandPlate.park();
                break;
            case InstructionType.GOTO:
                await sandPlate.gotoPos.apply(sandPlate, resolvedArguments);
                break;
            case InstructionType.ARC:
                await sandPlate.arcTo.apply(sandPlate, resolvedArguments);
                break;
            case InstructionType.ROTATE_ARM0:
                await sandPlate.rotateArm0.apply(sandPlate, resolvedArguments);
                break;
            case InstructionType.ROTATE_ARM1:
                await sandPlate.rotateArm1.apply(sandPlate, resolvedArguments);
                break;
            case InstructionType.ROTATE_BOTH_ARMS:
                await sandPlate.rotateBothArms().apply(sandPlate, resolvedArguments);
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

}


export {Driver}