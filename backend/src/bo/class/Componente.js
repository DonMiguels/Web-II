import { createComponente } from "../method/createComponente.js";
import { getComponenteById } from "../method/getComponenteById.js";
import { getComponenteByCodigo } from "../method/getComponenteByCodigo.js";
import { getAllComponentes } from "../method/getAllComponentes.js";
import { getComponentesByCategoria } from "../method/getComponentesByCategoria.js";
import { updateComponente } from "../method/updateComponente.js";
import { deleteComponente } from "../method/deleteComponente.js";

export class Componente {
    static async create(data) {
        return await createComponente(data);
    }

    static async getById(id) {
        return await getComponenteById({ id });
    }

    static async getByCodigo(codigo) {
        return await getComponenteByCodigo({ codigo });
    }

    static async getAll() {
        return await getAllComponentes();
    }

    static async getByCategoria(category_id) {
        return await getComponentesByCategoria({ category_id });
    }

    static async update(id, data) {
        return await updateComponente({ id, ...data });
    }

    static async delete(id) {
        return await deleteComponente({ id });
    }
}
