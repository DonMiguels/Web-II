import { createEquipo } from "../method/createEquipo.js";
import { getEquipoById } from "../method/getEquipoById.js";
import { getEquipoByCodigo } from "../method/getEquipoByCodigo.js";
import { getAllEquipos } from "../method/getAllEquipos.js";
import { updateEquipo } from "../method/updateEquipo.js";
import { deleteEquipo } from "../method/deleteEquipo.js";

export class Equipo {
    constructor() {
        this.createEquipo = createEquipo;
        this.getEquipoById = getEquipoById;
        this.getEquipoByCodigo = getEquipoByCodigo;
        this.getAllEquipos = getAllEquipos;
        this.updateEquipo = updateEquipo;
        this.deleteEquipo = deleteEquipo;
    }
}
