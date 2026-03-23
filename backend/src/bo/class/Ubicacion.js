import { createUbicacion } from "../method/createUbicacion.js";
import { getUbicacionById } from "../method/getUbicacionById.js";
import { getUbicacionByNombre } from "../method/getUbicacionByNombre.js";
import { getAllUbicaciones } from "../method/getAllUbicaciones.js";
import { updateUbicacion } from "../method/updateUbicacion.js";
import { deleteUbicacion } from "../method/deleteUbicacion.js";

export class Ubicacion {
    constructor() {
        this.createUbicacion = createUbicacion;
        this.getUbicacionById = getUbicacionById;
        this.getUbicacionByNombre = getUbicacionByNombre;
        this.getAllUbicaciones = getAllUbicaciones;
        this.updateUbicacion = updateUbicacion;
        this.deleteUbicacion = deleteUbicacion;
    }
}
