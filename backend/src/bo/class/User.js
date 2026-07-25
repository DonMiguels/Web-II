import { createUser } from "../method/createUser.js";

/**
 * Fachada BO de usuario de acceso.
 * Expone los métodos de negocio registrados en el constructor.
 *
 * @class
 */
export class User {
    /** Registra las operaciones expuestas por esta entidad. */
  constructor() {
        this.createUser = createUser;
    }
}
