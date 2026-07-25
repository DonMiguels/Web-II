import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

/**
 * @file Registro de métodos de negocio por subsistema.
 * @description Escanea `sub_system` y construye un mapa de métodos disponibles.
 */

/**
 * @class Method_registry
 * @description Singleton que indexa subsistemas → clases → métodos para resolución dinámica.
 */
export default class Method_registry {
  static instance;

  /**
   * @description Crea o reutiliza la instancia con la ruta raíz de `bo`.
   * @returns {Method_registry} Instancia única del registro.
   */
  constructor() {
    if (Method_registry.instance) return Method_registry.instance;
    const filename = path.dirname(fileURLToPath(import.meta.url));
    this.rootPath = path.resolve(filename, '../bo');
    this.mapFiles = {};
    Method_registry.instance = this;
  }

  /**
   * @description Escanea la carpeta `sub_system` e indexa clases y métodos de cada módulo.
   * @returns {Promise<void>}
   */
  async initialize() {
    const subSystemsPath = path.join(this.rootPath, 'sub_system');
    let subSystemFiles = [];

    try {
      subSystemFiles = fs.readdirSync(subSystemsPath);
    } catch (err) {
      console.error(`Error leyendo la carpeta de subsistemas en ${subSystemsPath}`, err);
      return;
    }

    for (const file of subSystemFiles) {
      if (!file.endsWith('.js')) continue;

      const subSystemName = path.basename(file, '.js');
      this.mapFiles[subSystemName] = {};

      try {
        const module = await import(`file://${path.join(subSystemsPath, file)}`);

        const SubSystemClass = module[subSystemName];
        if (!SubSystemClass) continue;

        const subSystemInstance = new SubSystemClass();

        for (const [classNameKey, ClassRef] of Object.entries(subSystemInstance)) {
          this.mapFiles[subSystemName][classNameKey] = {};

          if (typeof ClassRef === 'function') {
            const classInstance = new ClassRef();

            for (const methodName of Object.keys(classInstance)) {
              this.mapFiles[subSystemName][classNameKey][methodName] = true;
            }
          }
        }
      } catch (err) {
        console.error(`Error procesando el mapa para el subsistema ${file}:`, err);
      }
    }
  }

  /**
   * @description Alias de `initialize` para inicializar el registro.
   * @returns {Promise<void>}
   */
  async init() {
    await this.initialize();
  }

  /**
   * @description Busca una clave en un objeto ignorando mayúsculas/minúsculas.
   * @param {Object} target - Objeto donde buscar.
   * @param {string} requestedKey - Clave solicitada.
   * @returns {string|undefined} Clave real encontrada o `undefined`.
   */
  findKeyIgnoreCase(target, requestedKey) {
    if (!target || typeof requestedKey !== 'string') return undefined;
    return Object.keys(target).find(
      (key) => key.toLowerCase() === requestedKey.toLowerCase()
    );
  }

  /**
   * @description Indica si existe un método en el mapa para el subsistema y clase dados.
   * @param {string} subSystem - Nombre del subsistema.
   * @param {string} className - Nombre de la clase.
   * @param {string} functionName - Nombre del método.
   * @returns {boolean} `true` si el método está registrado.
   */
  hasMethod(subSystem, className, functionName) {
    const subsystemKey = this.findKeyIgnoreCase(this.mapFiles, subSystem);
    const classMap = subsystemKey ? this.mapFiles[subsystemKey] : undefined;

    const classKey = this.findKeyIgnoreCase(classMap, className);
    const methodMap = classKey ? classMap[classKey] : undefined;

    const methodKey = this.findKeyIgnoreCase(methodMap, functionName);
    return !!methodKey;
  }

  /**
   * @description Devuelve el mapa completo de métodos indexados.
   * @returns {Object} Mapa `subsistema` → `clase` → `método` → `true`.
   */
  getMap() {
    return this.mapFiles;
  }
}
