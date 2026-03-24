import { createUsuario } from "../method/createUsuario.js";
import { getUsuarioById } from "../method/getUsuarioById.js";
import { getUsuarioByEmail } from "../method/getUsuarioByEmail.js";
import { getAllUsuarios } from "../method/getAllUsuarios.js";
import { updateUsuario } from "../method/updateUsuario.js";
import { deleteUsuario } from "../method/deleteUsuario.js";

export class Usuario {
    static async create(data) {
        return await createUsuario(data);
    }

    static async getById(id) {
        return await getUsuarioById({ id });
    }

    static async getByEmail(email) {
        return await getUsuarioByEmail({ email });
    }

    static async getAll() {
        return await getAllUsuarios();
    }

    static async update(id, data) {
        return await updateUsuario({ id, ...data });
    }

    static async delete(id) {
        return await deleteUsuario({ id });
    }
}
