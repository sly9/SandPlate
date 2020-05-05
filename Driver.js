import {Plan} from './Plan.js'
import {SandPlate} from "./sand_plate.js";

class Driver {
    constructor(props) {
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
        this.plate_ = null;
    }

    load = () => {

    }
}


export {Driver}