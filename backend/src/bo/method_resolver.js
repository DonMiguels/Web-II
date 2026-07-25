import Utils from '../../utils/utils.js';
import Config from '../../config/config.js';
import MethodRegistry from './method_registry.js';
import { msg } from '../../utils/messages.js';

/**
 * @file Resolución dinámica de instancias ejecutables de negocio.
 * @description Valida la ruta en el registro e importa el módulo del subsistema para instanciar la clase.
 */

/**
 * @description Resuelve e instancia la clase de negocio asociada a un método de un subsistema.
 * @param {Object} route - Ruta de ejecución.
 * @param {string} route.subsystem - Nombre del subsistema.
 * @param {string} route.className - Nombre de la clase de negocio.
 * @param {string} route.method - Nombre del método a ejecutar.
 * @returns {Promise<Object>} Instancia de la clase de negocio lista para invocar el método.
 * @throws {Error} Si la ruta es inválida o falla la carga del módulo (vía `utils.handleError`).
 */
export default async function resolveExecutable({ subsystem, className, method }) {
    const utils = new Utils();
    const config = new Config();
    const registry = new MethodRegistry();
    const STATUS_CODES = config.STATUS_CODES;

    if (Object.keys(registry.getMap() || {}).length === 0) {
        await registry.init();
    }

    if (!registry.hasMethod(subsystem, className, method)) {
        return utils.handleError({
            message: msg('method_route_invalid', { method, subsystem, className }),
            statusCode: STATUS_CODES.NOT_FOUND,
        });
    }

    try {
        const modulePath = `./sub_system/${subsystem}.js`;

        const module = await import(modulePath);

        const capitalizedSubsystem = subsystem.charAt(0).toUpperCase() + subsystem.slice(1);
        const SubSystemClass = module[capitalizedSubsystem] || module.default || Object.values(module)[0];

        if (!SubSystemClass) {
            throw new Error(msg('subsystem_class_missing', { subsystem }));
        }

        const subSystemInstance = new SubSystemClass();

        const classPropKey = Object.keys(subSystemInstance).find(
            key => key.toLowerCase() === className.toLowerCase()
        );
        const InnerClassRef = subSystemInstance[classPropKey];

        if (!InnerClassRef) {
            return utils.handleError({
                message: msg('class_not_registered', { className, subsystem }),
                statusCode: STATUS_CODES.NOT_FOUND,
            });
        }

        const classInstance = new InnerClassRef();
        return classInstance;

    } catch (error) {
        console.error("Error crítico en resolveExecutable:", error);
        return utils.handleError({
            message: msg('method_load_error', { detail: error.message }),
            statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
        });
    }
}
