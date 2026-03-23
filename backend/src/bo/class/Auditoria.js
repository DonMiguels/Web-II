import { createAuditoria } from "../method/createAuditoria.js";
import { getAuditoriaById } from "../method/getAuditoriaById.js";
import { getAuditoriaByUsuario } from "../method/getAuditoriaByUsuario.js";
import { getAllAuditorias } from "../method/getAllAuditorias.js";
import { deleteAuditoria } from "../method/deleteAuditoria.js";

export class Auditoria {
    static async create(data) {
        return await createAuditoria(data);
    }

    static async getById(id) {
        return await getAuditoriaById({ id });
    }

    static async getByUsuario(usuario_id) {
        return await getAuditoriaByUsuario({ usuario_id });
    }

    static async getAll() {
        return await getAllAuditorias();
    }

    static async delete(id) {
        return await deleteAuditoria({ id });
    }
}
