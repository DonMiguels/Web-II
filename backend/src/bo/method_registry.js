import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Singleton que descubre subsistemas/clases/metodos y los guarda en un mapa
// para validar rutas antes de intentar una ejecucion dinamica.
export default class Method_registry {
  static instance;

  constructor() {
    // Garantiza una unica instancia compartida durante todo el ciclo de vida.
    if (Method_registry.instance) return Method_registry.instance;

    // Calcula la ruta base del modulo BO de forma segura para ES modules.
    const filename = path.dirname(fileURLToPath(import.meta.url));
    this.rootPath = path.resolve(filename, '../bo');

    // Estructura esperada:
    // {
    //   subsystem: {
    //     className: {
    //       methodName: true
    //     }
    //   }
    // }
    this.mapFiles = {};
    Method_registry.instance = this;
  }

  // Recorre bo/<Subsystem>/<Subsystem>.js, carga cada modulo y construye el indice.
  async initialize() {
    let subsystemDirs = [];

    try {
      // Lee carpetas de primer nivel y filtra potenciales subsistemas.
      subsystemDirs = fs
        .readdirSync(this.rootPath, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .filter((name) => !['class', 'method', 'subsystem'].includes(name));
    } catch (err) {
      console.error(`Error leyendo la carpeta BO en ${this.rootPath}`, err);
      return;
    }

    for (const subSystemName of subsystemDirs) {
      const subsystemModulePath = path.join(
        this.rootPath,
        subSystemName,
        `${subSystemName}.js`,
      );
      if (!fs.existsSync(subsystemModulePath)) continue;

      this.mapFiles[subSystemName] = {};

      try {
        // Carga dinamica del archivo de subsistema.
        const module = await import(`file://${subsystemModulePath}`);

        // Espera export nombrado con el mismo nombre del archivo.
        const SubSystemClass = module[subSystemName];
        if (!SubSystemClass) continue;

        // Instancia el subsistema para inspeccionar sus referencias de clases.
        const subSystemInstance = new SubSystemClass();

        for (const [classNameKey, ClassRef] of Object.entries(
          subSystemInstance,
        )) {
          this.mapFiles[subSystemName][classNameKey] = {};

          // Si la referencia de clase es construible, se instancia e inspecciona.
          if (typeof ClassRef === 'function') {
            const classInstance = new ClassRef();

            // Registra metodos propios disponibles de la instancia.
            for (const methodName of Object.keys(classInstance)) {
              this.mapFiles[subSystemName][classNameKey][methodName] = true;
            }
          }
        }
      } catch (err) {
        console.error(
          `Error procesando el mapa para el subsistema ${subSystemName}:`,
          err,
        );
      }
    }
  }

  // Fachada publica para inicializar el mapa.
  async init() {
    await this.initialize();
  }

  // Busca una clave ignorando mayusculas/minusculas para tolerar variaciones.
  findKeyIgnoreCase(target, requestedKey) {
    if (!target || typeof requestedKey !== 'string') return undefined;
    return Object.keys(target).find(
      (key) => key.toLowerCase() === requestedKey.toLowerCase(),
    );
  }

  // Verifica si existe la ruta completa subsystem -> class -> method.
  hasMethod(subSystem, className, functionName) {
    const subsystemKey = this.findKeyIgnoreCase(this.mapFiles, subSystem);
    const classMap = subsystemKey ? this.mapFiles[subsystemKey] : undefined;

    const classKey = this.findKeyIgnoreCase(classMap, className);
    const methodMap = classKey ? classMap[classKey] : undefined;

    const methodKey = this.findKeyIgnoreCase(methodMap, functionName);
    return !!methodKey;
  }

  // Expone el mapa interno para validaciones y diagnostico.
  getMap() {
    return this.mapFiles;
  }
}
