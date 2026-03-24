import { createNotificacion } from "../method/createNotificacion.js";
import { getNotificacionById } from "../method/getNotificacionById.js";
import { getNotificacionesByUsuario } from "../method/getNotificacionesByUsuario.js";
import { getAllNotificaciones } from "../method/getAllNotificaciones.js";
import { updateNotificacion } from "../method/updateNotificacion.js";
import { markNotificacionAsRead } from "../method/markNotificacionAsRead.js";
import { deleteNotificacion } from "../method/deleteNotificacion.js";

export class Notificacion {
    static async create(titulo, mensaje, sent_at, is_read, usuario_id, tipo_id) {
        return await createNotificacion(titulo, mensaje, sent_at, is_read, usuario_id, tipo_id);
    }

    static async getById(id) {
        return await getNotificacionById({ id });
    }

    static async getByUsuario(usuario_id) {
        return await getNotificacionesByUsuario({ usuario_id });
    }

    static async getAll() {
        return await getAllNotificaciones();
    }

    static async update(id, data) {
        return await updateNotificacion({ id, ...data });
    }

    static async markAsRead(id) {
        return await markNotificacionAsRead({ id });
    }

    static async delete(id) {
        return await deleteNotificacion({ id });
    }
}
