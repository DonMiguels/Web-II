import {createPerson} from "../method/createPerson.js";
import {getPersons} from "../method/getPersons.js";

/**
 * Fachada BO de persona (identidad).
 * Expone los métodos de negocio registrados en el constructor.
 *
 * @class
 */
export class Person {
    /** Registra las operaciones expuestas por esta entidad. */
  constructor() {
        this.createPerson = createPerson;
        this.getPersons = getPersons;
    }
}
