import { Equipo } from "../class/Equipo.js";
import { Ubicacion } from "../class/Ubicacion.js";
import { EstadoEquipo } from "../class/EstadoEquipo.js";

export class Inventory {
    constructor() {
        this.Equipo = Equipo;
        this.Ubicacion = Ubicacion;
        this.EstadoEquipo = EstadoEquipo;
    }
}
