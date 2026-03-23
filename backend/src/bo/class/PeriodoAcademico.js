import { createPeriodoAcademico } from "../method/createPeriodoAcademico.js";
import { getPeriodoAcademicoById } from "../method/getPeriodoAcademicoById.js";
import { getAllPeriodosAcademicos } from "../method/getAllPeriodosAcademicos.js";
import { getPeriodosAcademicosActivos } from "../method/getPeriodosAcademicosActivos.js";
import { updatePeriodoAcademico } from "../method/updatePeriodoAcademico.js";
import { deletePeriodoAcademico } from "../method/deletePeriodoAcademico.js";

export class PeriodoAcademico {
    static async create(data) {
        return await createPeriodoAcademico(data);
    }

    static async getById(id) {
        return await getPeriodoAcademicoById({ id });
    }

    static async getAll() {
        return await getAllPeriodosAcademicos();
    }

    static async getActivos() {
        return await getPeriodosAcademicosActivos();
    }

    static async update(id, data) {
        return await updatePeriodoAcademico({ id, ...data });
    }

    static async delete(id) {
        return await deletePeriodoAcademico({ id });
    }
}
