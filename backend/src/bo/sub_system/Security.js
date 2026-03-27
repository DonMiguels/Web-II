import {Person} from "../class/Person.js";
import {Profile} from "../class/Profile.js";
import {User} from "../class/User.js";


export class Security {
    constructor() {
        this.person = Person;
        this.profile = Profile;
        this.user = User;
    }
}