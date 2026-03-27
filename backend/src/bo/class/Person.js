import {createPerson} from "../method/createPerson.js";
import {getPersons} from "../method/getPersons.js";

export class Person {
    constructor() {
        this.createPerson = createPerson;
        this.getPersons = getPersons;
    }
}