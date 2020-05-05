class Step {

}


/**
 * Simple class representing a plan. Provides methods to serialize/deserialize a plan.
 * Plan can be used by a 'Driver' to control the SandPlate.
 */
class Plan {
    constructor() {
        /**
         *
         * @type {Step[]}
         * @private
         */
        this.steps_ = [];
    }
}

export {Step, Plan}