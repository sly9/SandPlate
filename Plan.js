const InstructionType = Object.freeze({
    LINE: Symbol.for('line'),
    PARK: Symbol.for('park'),
    ARC: Symbol.for('arc'),
    GOTO: Symbol.for('goto'),
    ROTATE_ARM0: Symbol.for('rotateArm0'),
    ROTATE_ARM1: Symbol.for('rotateArm1'),
    ROTATE_BOTH_ARMS: Symbol.for('rotateBothArms'),
    LOOP_START: Symbol.for('loopStart'),
    LOOP_END: Symbol.for('loopEnd'),
    LOOP: Symbol.for('loop'),
    SLEEP:Symbol.for('sleep'),
    LET:Symbol.for('let'),
});

class Instruction {

    /**
     *
     * @param {Array<number|string>} instructionJson An json array representing one instruction
     */
    constructor(instructionJson = []) {
        /**
         *
         * @type {[]}
         */
        this.json = instructionJson;

        /**
         * The type of this step
         * @type {Symbol}
         */
        this.type = Symbol.for(/**@type{string}*/(instructionJson[0]));

        this.arguments = instructionJson.slice(1);

        // All instructions within this for loop.
        this.childrenInstruction = [];
    }

}


/**
 * Simple class representing a plan. Provides methods to serialize/deserialize a plan.
 * Plan can be used by a 'Driver' to control the SandPlate.
 */
class Plan {
    constructor() {
        /**
         *
         * @type {Instruction[]}
         * @public
         */
        this.instructions = [];


    }

    /**
     *
     * @param planJson
     */
    parseJson(planJson = []) {
        try {
            let [i, instructions] = this.parseJson_(planJson);
            this.instructions = instructions;
        } catch (e) {
            alert('Parsing plan failed..');
            debugger
        }
    }

    /**
     *
     * @param planJson
     * @param startIndex
     * @private
     */
    parseJson_(planJson = [], startIndex = 0) {
        let instructions = []
        for (let i = startIndex; i < planJson.length; i++) {
            let instruction = new Instruction(planJson[i]);
            if (instruction.type == InstructionType.LOOP_END) {
                //happy! found a matching end.
                return [i, instructions];
            } else if (instruction.type == InstructionType.LOOP_START) {
                let [nextInstructionIndex, childrenInstructions] = this.parseJson_(planJson, i + 1);
                instruction.childrenInstruction = childrenInstructions;
                i = nextInstructionIndex;
                instruction.type = InstructionType.LOOP;
                instructions.push(instruction);
            } else {
                instructions.push(instruction);
            }
        }
        return [-1, instructions];
    }

}

export {InstructionType, Instruction, Plan}