import { createCompensacion } from "../method/createCompensacion.js";
import { getCompensacionById } from "../method/getCompensacionById.js";
import { getCompensacionesByUsuario } from "../method/getCompensacionesByUsuario.js";
import { getAllCompensaciones } from "../method/getAllCompensaciones.js";
import { updateCompensacion } from "../method/updateCompensacion.js";
import { deleteCompensacion } from "../method/deleteCompensacion.js";

export class Compensacion {
    static async create(data) {
        return await createCompensacion(data);
    }

    static async getById(id) {
        return await getCompensacionById({ id });
    }

    static async getByUsuario(usuario_id) {
        return await getCompensacionesByUsuario({ usuario_id });
    }

    static async getAll() {
        return await getAllCompensaciones();
    }

    static async update(id, data) {
        return await updateCompensacion({ id, ...data });
    }

    static async delete(id) {
        return await deleteCompensacion({ id });
    }
}
