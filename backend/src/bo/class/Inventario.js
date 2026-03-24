import { createInventario } from "../method/createInventario.js";
import { getInventarioById } from "../method/getInventarioById.js";
import { getInventarioByUbicacion } from "../method/getInventarioByUbicacion.js";
import { getInventarioByItem } from "../method/getInventarioByItem.js";
import { getAllInventario } from "../method/getAllInventario.js";
import { updateInventario } from "../method/updateInventario.js";
import { deleteInventario } from "../method/deleteInventario.js";

export class Inventario {
    static async create(data) {
        return await createInventario(data);
    }

    static async getById(id) {
        return await getInventarioById({ id });
    }

    static async getByUbicacion(ubicacion_id) {
        return await getInventarioByUbicacion({ ubicacion_id });
    }

    static async getByItem(item_id) {
        return await getInventarioByItem({ item_id });
    }

    static async getAll() {
        return await getAllInventario();
    }

    static async update(id, data) {
        return await updateInventario({ id, ...data });
    }

    static async delete(id) {
        return await deleteInventario({ id });
    }
}
