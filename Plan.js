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
        for (let i = 0; i < planJson.length; i++) {
            let instruction = new Instruction(planJson[i]);
            this.instructions.push(instruction);
        }
    }
}

export {Instruction, InstructionType, Plan}