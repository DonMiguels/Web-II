import Utils from '../utils/utils.js';
import Config from '../../config/config.js';
import MethodRegistry from './method_registry.js';

// Resuelve dinamicamente la clase ejecutable para una ruta subsystem/class/method.
// 1) Verifica que el metodo exista en el registro.
// 2) Carga el modulo del subsistema por import dinamico.
// 3) Ubica la clase interna solicitada e instancia la clase final a ejecutar.
export default async function resolveExecutable({
  subsystem,
  className,
  method,
}) {
  // Dependencias utilitarias para errores estandarizados y codigos HTTP.
  const utils = new Utils();
  const config = new Config();
  // Registro singleton que indexa metodos disponibles por subsistema y clase.
  const registry = new MethodRegistry();
  const STATUS_CODES = config.STATUS_CODES;

  // Inicializa el mapa solo cuando aun no se ha construido.
  if (Object.keys(registry.getMap() || {}).length === 0) {
    await registry.init();
  }

  // Corta temprano cuando la combinacion subsystem/class/method no existe.
  if (!registry.hasMethod(subsystem, className, method)) {
    return utils.handleError({
      message: `Ruta inválida: Método '${method}' no existe en '${subsystem}' -> '${className}'`,
      statusCode: STATUS_CODES.NOT_FOUND,
    });
  }

  try {
    // Ruta relativa del archivo de subsistema a cargar dinamicamente.
    const modulePath = `./subsystem/${subsystem}.js`;

    const module = await import(modulePath);

    // Estrategia flexible para encontrar la clase exportada del subsistema.
    // Prioriza export nombrado, luego default y por ultimo primer export disponible.
    const capitalizedSubsystem =
      subsystem.charAt(0).toUpperCase() + subsystem.slice(1);
    const SubSystemClass =
      module[capitalizedSubsystem] ||
      module.default ||
      Object.values(module)[0];

    // Si el modulo carga pero no expone clase valida, se trata como error interno.
    if (!SubSystemClass) {
      throw new Error(
        `Módulo '${subsystem}' cargado, pero no exporta una clase válida.`,
      );
    }

    // Instancia del subsistema que contiene referencias a clases internas.
    const subSystemInstance = new SubSystemClass();

    // Busca la clase interna ignorando mayusculas/minusculas en la clave.
    const classPropKey = Object.keys(subSystemInstance).find(
      (key) => key.toLowerCase() === className.toLowerCase(),
    );
    const InnerClassRef = subSystemInstance[classPropKey];

    // Si la clase no fue registrada en el subsistema, responde 404 funcional.
    if (!InnerClassRef) {
      return utils.handleError({
        message: `La clase '${className}' no está registrada en el constructor de '${subsystem}'`,
        statusCode: STATUS_CODES.NOT_FOUND,
      });
    }

    // Devuelve la instancia lista para invocar el metodo solicitado aguas abajo.
    const classInstance = new InnerClassRef();
    return classInstance;
  } catch (error) {
    // Cualquier error de carga/resolucion dinamica cae en 500 controlado.
    console.error('Error crítico en resolveExecutable:', error);
    return utils.handleError({
      message: `Error interno al cargar la ruta de ejecución: ${error.message}`,
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
}
