import { createDevolucion } from "../method/createDevolucion.js";
import { getDevolucionById } from "../method/getDevolucionById.js";
import { getDevolucionesByUsuario } from "../method/getDevolucionesByUsuario.js";
import { getAllDevoluciones } from "../method/getAllDevoluciones.js";
import { updateDevolucion } from "../method/updateDevolucion.js";
import { deleteDevolucion } from "../method/deleteDevolucion.js";

export class Devolucion {
    static async create(data) {
        return await createDevolucion(data);
    }

    static async getById(id) {
        return await getDevolucionById({ id });
    }

    static async getByUsuario(usuario_id) {
        return await getDevolucionesByUsuario({ usuario_id });
    }

    static async getAll() {
        return await getAllDevoluciones();
    }

    static async update(id, data) {
        return await updateDevolucion({ id, ...data });
    }

    static async delete(id) {
        return await deleteDevolucion({ id });
    }
}
