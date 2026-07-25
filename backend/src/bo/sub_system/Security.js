import {Person} from "../class/Person.js";
import {Profile} from "../class/Profile.js";
import {User} from "../class/User.js";


/**
 * Subsistema de seguridad e identidad (Person, User, Profile).
 * Agrupa las clases BO descubiertas por el method_registry.
 *
 * @class
 */
export class Security {
    /** Registra las operaciones expuestas por esta entidad. */
  constructor() {
        this.person = Person;
        this.profile = Profile;
        this.user = User;
    }
}
