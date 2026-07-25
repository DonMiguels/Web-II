import path from "path";
import { fileURLToPath } from "url";
import Utils from "../../utils/utils.js";
import Config from "../../config/config.js";
import DBMS from "../dbms/dbms.js";
import resolveExecutable from "../bo/method_resolver.js";

/**
 * @file Capa de seguridad: permisos, perfiles y ejecución autorizada.
 * @description Sincroniza permisos (CSV/BD), perfiles de usuario y rutas de transacción.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @class Security
 * @description Singleton de autorización y ejecución de métodos de negocio permitidos.
 */
export default class Security {
  static instance;

  /**
   * @description Crea o reutiliza la instancia con mapas de permisos, perfiles y transacciones.
   * @returns {Security} Instancia única de seguridad.
   */
  constructor() {
    if (Security.instance) return Security.instance;

    this.permissions = new Map();
    this.userProfiles = new Map();
    this.transactions = new Map();
    this.utils = new Utils();
    this.config = new Config();
    this.dbms = new DBMS();
    this.dbmsReady = this.dbms.init();
    this.reflect = Reflect;
    Security.instance = this;
  }

  /**
   * @description Normaliza un objeto de permiso a claves canónicas (`sub_system`, `class`, `method`, `profile`).
   * @param {Object} [permission={}] - Permiso con posibles alias de campos.
   * @returns {{sub_system: string, class: string, method: string, profile: string, parameter: *}} Permiso normalizado.
   */
  normalizePermission(permission = {}) {
    const normalize = (value) => String(value ?? "").trim();

    return {
      sub_system: normalize(permission.sub_system ?? permission.subsystem),
      class: normalize(permission.class ?? permission.class_name),
      method: normalize(permission.method ?? permission.method_name),
      profile: normalize(permission.profile ?? permission.profile_name),
      parameter: permission.parameter,
    };
  }

  /**
   * @description Construye la clave única de un permiso (`subsystem::class::method::profile`).
   * @param {Object} [permission={}] - Permiso a indexar.
   * @returns {string} Clave en minúsculas unida por `::`.
   */
  buildPermissionKey(permission = {}) {
    const normalized = this.normalizePermission(permission);
    return [
      normalized.sub_system.toLowerCase(),
      normalized.class.toLowerCase(),
      normalized.method.toLowerCase(),
      normalized.profile.toLowerCase(),
    ].join("::");
  }

  /**
   * @description Sincroniza permisos desde CSV hacia la BD y recarga el mapa en memoria; también sincroniza perfiles.
   * @returns {Promise<Map<string, Object>>} Mapa de permisos actualizado.
   */
  async syncPermissions() {
    await this.dbmsReady;
    await this.dbms.executeNamedQuery({
      nameQuery: "ensureTransactionSerial",
    });

    const csvPermissions = await this.getPermissionsFile();
    const dbPermissions = await this.getPermissionsDB();

    for (const [key, csvPermission] of csvPermissions) {
      if (dbPermissions.has(key)) continue;

      await this.dbms.executeNamedQuery({
        nameQuery: "insertPermission",
        params: {
          subsystem: csvPermission.sub_system ?? csvPermission.subsystem,
          class_name: csvPermission.class,
          method_name: csvPermission.method,
          profile_name: csvPermission.profile,
        },
      });

      dbPermissions.set(key, csvPermission);
    }

    this.permissions = new Map(dbPermissions);

    await this.syncUserProfiles();

    return this.permissions;
  }

  /**
   * @description Lee y normaliza permisos desde `config/permission.csv`.
   * @returns {Promise<Map<string, Object>>} Mapa de permisos del archivo.
   */
  async getPermissionsFile() {
    const csvPath = path.resolve(__dirname, "../../config/permission.csv");
    const csvMap = await this.utils.readCSV(csvPath);
    const permissions = new Map();

    for (const row of csvMap.values()) {
      const normalized = this.normalizePermission(row);
      const key = this.buildPermissionKey(normalized);
      permissions.set(key, normalized);
    }

    return permissions;
  }

  /**
   * @description Obtiene y normaliza permisos desde la base de datos.
   * @returns {Promise<Map<string, Object>>} Mapa de permisos en BD.
   */
  async getPermissionsDB() {
    await this.dbmsReady;
    const res = await this.dbms.executeNamedQuery({
      nameQuery: "getPermissions",
    });

    const permissions = new Map();
    for (const row of res?.rows ?? []) {
      const normalized = this.normalizePermission(row);
      const key = this.buildPermissionKey(normalized);
      permissions.set(key, normalized);
    }

    return permissions;
  }

  /**
   * @description Comprueba si un permiso existe en el mapa en memoria.
   * @param {Object} permission - Permiso a verificar.
   * @returns {boolean} `true` si el permiso está autorizado.
   */
  hasPermission(permission) {
    const key = this.buildPermissionKey(permission);
    return this.permissions.has(key);
  }

  /**
   * @description Inserta un permiso en BD y lo añade al mapa en memoria.
   * @param {Object} permission - Permiso a registrar.
   * @returns {Promise<void>}
   */
  async setPermission(permission) {
    await this.dbmsReady;
    await this.dbms.executeNamedQuery({
      nameQuery: "ensureTransactionSerial",
    });

    const normalized = this.normalizePermission(permission);

    await this.dbms.executeNamedQuery({
      nameQuery: "insertPermission",
      params: {
        subsystem: normalized.sub_system,
        class_name: normalized.class,
        method_name: normalized.method,
        profile_name: normalized.profile,
      },
    });

    this.permissions.set(this.buildPermissionKey(normalized), normalized);
  }

  /**
   * @description Sincroniza el mapa de perfiles asignados a usuarios desde la BD.
   * @returns {Promise<Map<string, Set<string>>>} Mapa `userId` → conjunto de perfiles.
   */
  async syncUserProfiles() {
    await this.dbmsReady;
    const res = await this.dbms.executeNamedQuery({
      nameQuery: "getUsersProfiles",
    });

    const profiles = new Map();
    for (const row of res?.rows ?? []) {
      const userId = String(row.user_id || row.username)
        .trim()
        .toLowerCase();
      const profileName = String(row.profile_name || row.profile)
        .trim()
        .toLowerCase();

      if (!profiles.has(userId)) {
        profiles.set(userId, new Set());
      }
      profiles.get(userId).add(profileName);
    }

    this.userProfiles = profiles;
    return this.userProfiles;
  }

  /**
   * @description Indica si un usuario tiene asignado un perfil concreto.
   * @param {string|number} userId - Identificador del usuario.
   * @param {string} profile - Nombre del perfil.
   * @returns {boolean} `true` si el perfil está asignado al usuario.
   */
  hasUserProfile(userId, profile) {
    const normalizedUserId = String(userId).trim().toLowerCase();
    const normalizedProfile = String(profile).trim().toLowerCase();

    const userProfiles = this.userProfiles.get(normalizedUserId);
    return userProfiles ? userProfiles.has(normalizedProfile) : false;
  }

  /**
   * @description Asigna un perfil a un usuario en BD y en el mapa en memoria.
   * @param {string|number} userId - Identificador del usuario.
   * @param {string} profile - Nombre del perfil.
   * @returns {Promise<void>}
   */
  async setUserProfile(userId, profile) {
    await this.dbmsReady;
    await this.dbms.executeNamedQuery({
      nameQuery: "ensureTransactionSerial",
    });

    const normalizedUserId = String(userId).trim().toLowerCase();
    const normalizedProfile = String(profile).trim().toLowerCase();

    await this.dbms.executeNamedQuery({
      nameQuery: "insertUserProfile",
      params: {
        user_id: userId,
        profile_name: profile,
      },
    });

    if (!this.userProfiles.has(normalizedUserId)) {
      this.userProfiles.set(normalizedUserId, new Set());
    }
    this.userProfiles.get(normalizedUserId).add(normalizedProfile);
  }

  /**
   * @description Carga las rutas de transacción desde BD (`getTransactionRoutes` o fallback `getTransactions`).
   * @returns {Promise<Map<string, Object>>} Mapa `transactionId` → ruta (`sub_system`, `class`, `method`).
   */
  async syncTransactions() {
    await this.dbmsReady;

    let res;
    try {
      res = await this.dbms.executeNamedQuery({
        nameQuery: "getTransactionRoutes",
      });
    } catch {
      res = await this.dbms.executeNamedQuery({ nameQuery: "getTransactions" });
    }

    this.transactions.clear();

    for (const row of res?.rows ?? []) {
      this.transactions.set(String(row.id ?? row.transaction_id), {
        sub_system: row.sub_system ?? row.subsystem,
        class: row.class_name,
        method: row.method_name,
      });
    }

    return this.transactions;
  }

  /**
   * @description Resuelve la ruta de ejecución asociada a un ID de transacción.
   * @param {string|number} transactionId - Identificador de la transacción.
   * @returns {Object|undefined} Ruta (`sub_system`, `class`, `method`) o `undefined`.
   */
  resolveTransaction(transactionId) {
    return this.transactions.get(String(transactionId));
  }

  /**
   * @description Resuelve e invoca el método de negocio autorizado con el cuerpo de la petición.
   * @param {Object} permission - Permiso/ruta con `sub_system`, `class` y `method`.
   * @param {Object} [reqBody={}] - Parámetros a pasar al método.
   * @param {string} [lang] - Idioma para el mensaje de éxito.
   * @returns {Promise<{statusCode: number, data: *, message: string}>} Resultado de la ejecución.
   * @throws {Error} Si falla la resolución o la invocación del método.
   */
  async execute(permission, reqBody = {}, lang) {
    try {
      const {
        sub_system,
        class: className,
        method,
      } = this.normalizePermission(permission);

      const actionInstance = await resolveExecutable({
        subsystem: sub_system,
        className: className,
        method: method,
      });

      const result = await Reflect.apply(
        actionInstance[method],
        actionInstance,
        [reqBody],
      );

      return {
        statusCode: 200,
        data: result,
        message: this.config.getMessage(lang, 'execution_success'),
      };
    } catch (error) {
      console.error(`Error en executeAuthorized:`, error);
      throw error;
    }
  }
}
