import { createPrestamo } from "../method/createPrestamo.js";
import { getPrestamoById } from "../method/getPrestamoById.js";
import { getPrestamosByUsuario } from "../method/getPrestamosByUsuario.js";
import { getPrestamosByEquipo } from "../method/getPrestamosByEquipo.js";
import { getAllPrestamos } from "../method/getAllPrestamos.js";
import { getPrestamosActivos } from "../method/getPrestamosActivos.js";
import { updatePrestamo } from "../method/updatePrestamo.js";
import { deletePrestamo } from "../method/deletePrestamo.js";

export class Prestamo {
    constructor() {
        this.createPrestamo = createPrestamo;
        this.getPrestamoById = getPrestamoById;
        this.getPrestamosByUsuario = getPrestamosByUsuario;
        this.getPrestamosByEquipo = getPrestamosByEquipo;
        this.getAllPrestamos = getAllPrestamos;
        this.getPrestamosActivos = getPrestamosActivos;
        this.updatePrestamo = updatePrestamo;
        this.deletePrestamo = deletePrestamo;
    }
}
