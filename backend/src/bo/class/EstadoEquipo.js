import { createEstadoEquipo } from "../method/createEstadoEquipo.js";
import { getEstadoEquipoById } from "../method/getEstadoEquipoById.js";
import { getEstadoEquipoByNombre } from "../method/getEstadoEquipoByNombre.js";
import { getAllEstadosEquipo } from "../method/getAllEstadosEquipo.js";
import { updateEstadoEquipo } from "../method/updateEstadoEquipo.js";
import { deleteEstadoEquipo } from "../method/deleteEstadoEquipo.js";

export class EstadoEquipo {
    constructor() {
        this.createEstadoEquipo = createEstadoEquipo;
        this.getEstadoEquipoById = getEstadoEquipoById;
        this.getEstadoEquipoByNombre = getEstadoEquipoByNombre;
        this.getAllEstadosEquipo = getAllEstadosEquipo;
        this.updateEstadoEquipo = updateEstadoEquipo;
        this.deleteEstadoEquipo = deleteEstadoEquipo;
    }
}
