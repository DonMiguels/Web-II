import {createReturn} from "../method/createReturn.js";
import {deleteReturn} from "../method/deleteReturn.js";
import {getAllReturns} from "../method/getAllReturns.js";
import {getReturnById} from "../method/getReturnById.js";
import {getReturnsByUser} from "../method/getReturnsByUser.js";
import {updateReturn} from "../method/updateReturn.js";
import {registerReturn} from "../method/registerReturn.js";

export class Return {
    constructor() {
        this.createReturn = createReturn;
        this.deleteReturn = deleteReturn;
        this.getAllReturns = getAllReturns;
        this.getReturnById = getReturnById;
        this.getReturnsByUser = getReturnsByUser;
        this.updateReturn = updateReturn;
        this.registerReturn = registerReturn;
    }
}
