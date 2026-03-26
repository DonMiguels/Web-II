import path from 'path';
import { fileURLToPath } from 'url';
import Utils from '../utils/utils.js';
import DBMS from '../dbms/dbms.js';
import resolveExecutable from '../bo/method_resolver.js';
import { DOMAIN_ERROR_CODES } from '../bo/_shared/domainError.js';
import {
  buildProcessMetadata,
  startProcessContext,
} from '../bo/_shared/processObservability.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class Security {
  static instance;

  constructor() {
    if (Security.instance) return Security.instance;

    this.permissions = new Map();
    this.userProfiles = new Map();
    this.transactionRoutes = new Map();
    this.utils = new Utils();
    this.dbms = new DBMS();
    this.dbmsReady = this.dbms.init();
    this.reflect = Reflect;
    Security.instance = this;
  }

  parseStructuredError(error) {
    const fallback = {
      statusCode: 500,
      code: DOMAIN_ERROR_CODES.UNEXPECTED_ERROR,
      message: error?.message || 'Error interno',
      details: {
        original_message: error?.message || null,
      },
    };

    if (!error || typeof error.message !== 'string') return fallback;

    try {
      const parsed = JSON.parse(error.message);
      const parsedStatusCode = Number(parsed?.statusCode) || 500;

      let normalizedCode = parsed?.code;
      if (!normalizedCode) {
        if (parsedStatusCode === 404)
          normalizedCode = DOMAIN_ERROR_CODES.NOT_FOUND;
        else if (parsedStatusCode === 409)
          normalizedCode = DOMAIN_ERROR_CODES.CONFLICT;
        else if (parsedStatusCode === 422)
          normalizedCode = DOMAIN_ERROR_CODES.VALIDATION_ERROR;
        else normalizedCode = DOMAIN_ERROR_CODES.UNEXPECTED_ERROR;
      }

      return {
        statusCode: parsedStatusCode,
        code: normalizedCode,
        message: parsed?.message || fallback.message,
        details: parsed?.details || parsed?.error || null,
      };
    } catch {
      return fallback;
    }
  }

  async syncTransactionRoutes() {
    await this.dbmsReady;
    const res = await this.dbms.executeNamedQuery({
      nameQuery: 'getTransactionRoutes',
    });

    const routes = new Map();
    for (const row of res?.rows ?? []) {
      routes.set(String(row.transaction_id), {
        subsystem: String(row.subsystem || '').trim(),
        class: String(row.class_name || '').trim(),
        method: String(row.method_name || '').trim(),
      });
    }

    this.transactionRoutes = routes;
    return this.transactionRoutes;
  }

  resolveTransaction(transactionId) {
    if (transactionId === null || transactionId === undefined) return null;
    return this.transactionRoutes.get(String(transactionId)) || null;
  }

  normalizePermission(permission = {}) {
    const normalize = (value) => String(value ?? '').trim();

    return {
      subsystem: normalize(permission.subsystem),
      class: normalize(permission.class ?? permission.class_name),
      method: normalize(permission.method ?? permission.method_name),
      profile: normalize(permission.profile ?? permission.profile_name),
      parameter: permission.parameter,
    };
  }

  buildPermissionKey(permission = {}) {
    const normalized = this.normalizePermission(permission);
    return [
      normalized.subsystem.toLowerCase(),
      normalized.class.toLowerCase(),
      normalized.method.toLowerCase(),
      normalized.profile.toLowerCase(),
    ].join('::');
  }

  async syncPermissions() {
    await this.dbmsReady;
    await this.dbms.executeNamedQuery({
      nameQuery: 'normalizeLegacyBoNaming',
    });
    await this.dbms.executeNamedQuery({
      nameQuery: 'ensureTransactionSerial',
    });

    const csvPermissions = await this.getPermissionsFile();
    const dbPermissions = await this.getPermissionsDB();

    for (const [key, csvPermission] of csvPermissions) {
      if (dbPermissions.has(key)) continue;

      await this.dbms.executeNamedQuery({
        nameQuery: 'insertPermission',
        params: {
          subsystem: csvPermission.subsystem,
          class_name: csvPermission.class,
          method_name: csvPermission.method,
          profile_name: csvPermission.profile,
        },
      });

      dbPermissions.set(key, csvPermission);
    }

    this.permissions = new Map(dbPermissions);

    // Sincronizar perfiles de usuario
    await this.syncUserProfiles();
    await this.syncTransactionRoutes();

    return this.permissions;
  }

  async getPermissionsFile() {
    const csvPath = path.resolve(__dirname, '../../config/permission.csv');
    const csvMap = await this.utils.readCSV(csvPath);
    const permissions = new Map();

    for (const row of csvMap.values()) {
      const normalized = this.normalizePermission(row);
      const key = this.buildPermissionKey(normalized);
      permissions.set(key, normalized);
    }

    return permissions;
  }

  async getPermissionsDB() {
    await this.dbmsReady;
    const res = await this.dbms.executeNamedQuery({
      nameQuery: 'getPermissions',
    });

    const permissions = new Map();
    for (const row of res?.rows ?? []) {
      const normalized = this.normalizePermission(row);
      const key = this.buildPermissionKey(normalized);
      permissions.set(key, normalized);
    }

    return permissions;
  }

  hasPermission(permission) {
    const key = this.buildPermissionKey(permission);
    return this.permissions.has(key);
  }

  async setPermission(permission) {
    await this.dbmsReady;
    await this.dbms.executeNamedQuery({
      nameQuery: 'ensureTransactionSerial',
    });

    const normalized = this.normalizePermission(permission);

    await this.dbms.executeNamedQuery({
      nameQuery: 'insertPermission',
      params: {
        subsystem: normalized.subsystem,
        class_name: normalized.class,
        method_name: normalized.method,
        profile_name: normalized.profile,
      },
    });

    this.permissions.set(this.buildPermissionKey(normalized), normalized);
    await this.syncTransactionRoutes();
  }

  async syncUserProfiles() {
    await this.dbmsReady;
    const res = await this.dbms.executeNamedQuery({
      nameQuery: 'getUsersProfiles',
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

  hasUserProfile(userId, profile) {
    const normalizedUserId = String(userId).trim().toLowerCase();
    const normalizedProfile = String(profile).trim().toLowerCase();

    const userProfiles = this.userProfiles.get(normalizedUserId);
    return userProfiles ? userProfiles.has(normalizedProfile) : false;
  }

  async setUserProfile(userId, profile) {
    await this.dbmsReady;
    await this.dbms.executeNamedQuery({
      nameQuery: 'ensureTransactionSerial',
    });

    const normalizedUserId = String(userId).trim().toLowerCase();
    const normalizedProfile = String(profile).trim().toLowerCase();

    await this.dbms.executeNamedQuery({
      nameQuery: 'insertUserProfile',
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

  async execute(permission, reqBody = {}) {
    const {
      subsystem,
      class: className,
      method,
    } = this.normalizePermission(permission);
    const processContext = startProcessContext(
      `dispatcher:${subsystem}.${className}.${method}`,
    );

    try {
      const actionInstance = await resolveExecutable({
        subsystem,
        className,
        method,
      });

      if (!actionInstance || typeof actionInstance[method] !== 'function') {
        return {
          statusCode: 404,
          code: DOMAIN_ERROR_CODES.NOT_FOUND,
          message: `Metodo no disponible: ${subsystem}.${className}.${method}`,
          observability: buildProcessMetadata(processContext, 404),
        };
      }

      const result = await this.reflect.apply(
        actionInstance[method],
        actionInstance,
        [reqBody],
      );

      const resultObservability =
        result && typeof result === 'object' ? result.observability : null;

      return {
        statusCode: 200,
        data: result,
        message: 'Ejecutado exitosamente',
        observability:
          resultObservability || buildProcessMetadata(processContext, 200),
        execution: {
          engine: 'bo',
          subsystem,
          className,
          method,
        },
      };
    } catch (error) {
      const parsedExecutionError = this.parseStructuredError(error);
      return {
        statusCode: parsedExecutionError.statusCode,
        code: parsedExecutionError.code,
        message: parsedExecutionError.message,
        error: {
          code: parsedExecutionError.code,
          details: parsedExecutionError.details,
        },
        observability: buildProcessMetadata(
          processContext,
          parsedExecutionError.statusCode,
        ),
      };
    }
  }
}
