import {Person} from "../class/Person.js";
import {Profile} from "../class/Profile.js";


export class Security {
    constructor() {
        this.person = Person;
        this.profile = Profile;
    }
}