import { checkEmailInUse, checkUsernameInUse } from '../src/dbms/db-validations.js';
import Config from '../config/config.js';
import z from 'zod';
import { msg } from './messages.js';

/**
 * @file Validador basado en Zod con tipos personalizados y unicidad en BD.
 * @description Singleton que valida campos de usuario, entidades y estructuras de datos.
 */

/**
 * @class Validator
 * @description Validador de esquemas con Zod, reglas de `validations.json` y comprobaciones en base de datos.
 */
export default class Validator {
  /**
   * @description Crea o reutiliza la instancia singleton; permite inyectar DBMS si aún no existe.
   * @param {Object|null} [dbmsInstance=null] - Instancia de DBMS para validaciones de unicidad.
   * @returns {Validator} Instancia única del validador.
   */
  constructor(dbmsInstance = null) {
    if (Validator.instance && dbmsInstance && !Validator.instance.dbms) {
      Validator.instance.dbms = dbmsInstance;
      return Validator.instance;
    }

    this.dbms = dbmsInstance;
    this.config = new Config();

    const customTypes =
      this.config && typeof this.config.getCustomTypes === 'function'
        ? this.config.getCustomTypes()
        : {};

    if (!Validator.instance) {
      this.types = {
        array: z.array(z.any()),
        int: z.number().int(),
        float: z
          .number()
          .refine((v) => !Number.isInteger(v), { message: msg('field_must_be_float') }),
        string: z.string(),
        boolean: z.boolean(),
        date: z.date(),
        object: z.object({}).passthrough(),
        strings_array: z.array(z.string()),
        object_of_strings: z.record(z.string()),
        object_of_strings_array: z.record(z.array(z.string())),
        array_of_objects: z.array(z.object({}).passthrough()),
        object_of_arrays: z.record(z.array(z.any())),
        ...customTypes,
      };

      this.validationValues =
        this.config && typeof this.config.getValidationValues === 'function'
          ? this.config.getValidationValues()
          : {
              user: {
                username: { min: 3, max: 32 },
                email: { max: 254 },
                password: { min: 8, max: 128 },
              },
            };

      Validator.instance = this;
    }
    return Validator.instance;
  }

  /**
   * @description Valida un nombre de usuario con Zod y comprueba que no esté en uso en BD.
   * @param {string} value - Nombre de usuario a validar.
   * @returns {Promise<string>} Mensaje de error o cadena vacía si es válido.
   */
  async validateUsername(value) {
    const { min, max } = this.validationValues.user.username;

    const usernameSchema = z
      .string()
      .min(min, `El nombre de usuario debe tener al menos ${min} caracteres.`)
      .max(
        max,
        `El nombre de usuario no puede tener más de ${max} caracteres.`,
      );

    try {
      usernameSchema.parse(value);
    } catch (err) {
      return err.errors[0].message;
    }

    const usernameInUse = await checkUsernameInUse(value, this.dbms);
    return usernameInUse || '';
  }

  /**
   * @description Valida un nombre de usuario para login (longitud y caracteres permitidos).
   * @param {string} value - Nombre de usuario a validar.
   * @returns {Promise<string>} Mensaje de error o cadena vacía si es válido.
   */
  async validateUsernameLogin(value) {
    const { min, max } = this.validationValues.user.username;

    const usernameSchema = z
      .string()
      .min(min, `El nombre de usuario debe tener al menos ${min} caracteres.`)
      .max(max, `El nombre de usuario no puede tener más de ${max} caracteres.`)
      .regex(/^[A-Za-z0-9.,$*]+$/, 'Solo letras, números y . , $ *');

    try {
      usernameSchema.parse(value);
    } catch (err) {
      return err.errors[0].message;
    }
    return '';
  }

  /**
   * @description Valida un email con Zod y comprueba que no esté en uso en BD.
   * @param {string} email - Correo electrónico a validar.
   * @returns {Promise<string>} Mensaje de error o cadena vacía si es válido.
   */
  async validateEmail(email) {
    const { max } = this.validationValues.user.email;

    const emailSchema = z
      .string()
      .max(max, `El email no puede tener más de ${max} caracteres`)
      .refine(
        (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        msg('email_invalid'),
      );

    try {
      emailSchema.parse(email);
    } catch (err) {
      return err.errors[0].message;
    }

    const emailInUse = await checkEmailInUse(email, this.dbms);
    return emailInUse || '';
  }

  /**
   * @description Valida una contraseña según longitud y requisitos de fortaleza.
   * @param {string} text - Contraseña a validar.
   * @returns {string} Mensaje de error o cadena vacía si es válida.
   */
  validatePassword(text) {
    const { min, max } = this.validationValues.user.password;

    const passwordSchema = z
      .string()
      .min(min, `La contraseña debe tener al menos ${min} caracteres`)
      .max(max, `La contraseña no puede tener más de ${max} caracteres`)
      .refine(
        (val) => /[A-Z]/.test(val),
        msg('password_needs_upper'),
      )
      .refine(
        (val) => /[a-z]/.test(val),
        msg('password_needs_lower'),
      )
      .refine(
        (val) => /[0-9]/.test(val),
        msg('password_needs_number'),
      )
      .refine(
        (val) =>
          /[-:+_º·$/[\]}{|~€|@#~€¬`«»%()?¿¡;.'"!@#\$//%\^,&\*]/.test(val),
        msg('password_needs_symbol'),
      );

    try {
      passwordSchema.parse(text);
      return '';
    } catch (err) {
      return err.errors[0].message;
    }
  }

  /**
   * @description Comprueba que la confirmación de contraseña coincida con la original.
   * @param {string} pass - Contraseña original.
   * @param {string} confirmPass - Confirmación de la contraseña.
   * @returns {string} Mensaje de error o cadena vacía si coinciden.
   */
  validateConfirmPassword(pass, confirmPass) {
    const confirmSchema = z
      .string()
      .refine((val) => val === pass, 'Las contraseñas no coinciden');

    try {
      confirmSchema.parse(confirmPass);
      return '';
    } catch (err) {
      return err.errors[0].message;
    }
  }

  /**
   * @description Obtiene las reglas de validación de un campo para una entidad.
   * @param {string} entity - Nombre de la entidad (p. ej. `user`).
   * @param {string} field - Nombre del campo.
   * @returns {Object} Reglas (`min`, `max`, etc.) del campo.
   */
  getValidationValues(entity, field) {
    return this.validationValues[entity][field];
  }

  /**
   * @description Valida el nombre de una entidad según min/max configurados.
   * @param {string} value - Nombre a validar.
   * @param {string} entity - Entidad asociada (para mensajes y reglas).
   * @returns {string} Mensaje de error o cadena vacía si es válido.
   */
  validateName(value, entity) {
    const { min, max } = this.getValidationValues(entity, 'name');

    const nameSchema = z
      .string()
      .min(min, `El nombre de ${entity} debe tener al menos ${min} caracteres.`)
      .max(
        max,
        `El nombre de ${entity} no puede tener más de ${max} caracteres.`,
      );

    try {
      nameSchema.parse(value);
      return '';
    } catch (err) {
      return err.errors[0].message;
    }
  }

  /**
   * @description Valida la descripción de una entidad (opcional, con máximo de caracteres).
   * @param {string|undefined} value - Descripción a validar.
   * @param {string} entity - Entidad asociada (para mensajes y reglas).
   * @returns {string} Mensaje de error o cadena vacía si es válida.
   */
  validateDescription(value, entity) {
    const { max } = this.getValidationValues(entity, 'description');

    const descSchema = z
      .string()
      .max(
        max,
        `La descripción de ${entity} no puede tener más de ${max} caracteres.`,
      )
      .optional();

    try {
      descSchema.parse(value || '');
      return '';
    } catch (err) {
      return err.errors[0].message;
    }
  }

  /**
   * @description Valida datos contra una estructura declarativa (tipos, objetos anidados, `root`).
   * @param {*} data - Datos a validar.
   * @param {string|Object} structure - Estructura esperada (tipo string, objeto o `{ root }`).
   * @returns {string[]} Lista de mensajes de error; vacía si es válida.
   */
  validateStructuredData(data, structure) {
    const errors = [];

    const buildSchema = (struct) => {
      if (typeof struct === 'string') {
        switch (struct) {
          case 'string':
            return z.string();
          case 'number':
          case 'int':
            return z.number();
          case 'boolean':
            return z.boolean();
          case 'array':
            return z.array(z.any());
          case 'object':
            return z.object({});
          case 'date':
            return z.date();
          default:
            return z.custom((val) => this.validateField(val, struct) === true);
        }
      } else if (struct.root) {
        return buildSchema(struct.root);
      } else if (typeof struct === 'object') {
        const shape = {};
        for (const key in struct) {
          shape[key] = buildSchema(struct[key]);
        }
        return z.object(shape);
      }

      return z.any();
    };

    const schema = buildSchema(structure);

    try {
      schema.parse(data);
    } catch (err) {
      if (err.errors) {
        err.errors.forEach((e) => errors.push(e.message));
      } else {
        errors.push(err?.message || msg('structure_unknown_error'));
      }
    }

    return errors;
  }

  /**
   * @description Valida un valor contra un tipo registrado en `this.types`.
   * @param {*} value - Valor a validar.
   * @param {string} type - Nombre del tipo (clave en `this.types`).
   * @returns {boolean} `true` si el valor cumple el esquema del tipo.
   */
  validateField(value, type) {
    const schema = this.types[type];
    if (!schema) return false;

    try {
      schema.parse(value);
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * @description Valida y normaliza una fecha (instancia `Date` o string ISO).
   * @param {Date|string} value - Fecha a validar.
   * @returns {Date|string} Instancia `Date` si es válida, o mensaje de error.
   */
  validateDate(value) {
    try {
      if (value instanceof Date) {
        if (isNaN(value.getTime())) return 'Fecha inválida';
        return value;
      }

      const dateSchema = z.string().transform((val) => new Date(val));
      const parsed = dateSchema.parse(value);

      if (isNaN(parsed.getTime())) {
        return 'Fecha inválida';
      }

      return parsed;
    } catch (err) {
      return err?.errors?.[0]?.message ?? 'Fecha inválida';
    }
  }

  /**
   * @description Valida un número flotante (acepta enteros, decimales y strings numéricos).
   * Usa `validationValues[entity][field]` para min/max si se pasan `entity` y `field`.
   * @param {*|number|string} value - Valor numérico a validar.
   * @param {string|null} [entity=null] - Entidad para reglas min/max.
   * @param {string|null} [field=null] - Campo para reglas min/max.
   * @returns {string} Mensaje de error o cadena vacía si es válido.
   */
  validateFloat(value, entity = null, field = null) {
    if (value === undefined || value === null || value === '') {
      return 'Valor numérico requerido';
    }

    const num = Number(value);
    if (!isFinite(num)) {
      return 'No es un número válido';
    }

    if (entity && field) {
      const cfg = this.validationValues?.[entity]?.[field];
      if (cfg) {
        const { min, max } = cfg;
        if (typeof min !== 'undefined' && num < min) {
          return `${field} debe ser >= ${min}`;
        }
        if (typeof max !== 'undefined' && num > max) {
          return `${field} debe ser <= ${max}`;
        }
        return '';
      }
      if (this.validationValues?.[entity]) {
        return `No hay reglas de validación para ${entity}.${field}`;
      }
    }

    try {
      const schema = z.number();
      schema.parse(num);
      return '';
    } catch (err) {
      return err?.errors?.[0]?.message ?? 'Valor numérico inválido';
    }
  }

  /**
   * @description Valida un entero (p. ej. capacidad), con min/max opcionales por entidad/campo.
   * @param {*|number|string} value - Valor entero a validar.
   * @param {string|null} [entity=null] - Entidad para reglas min/max.
   * @param {string|null} [field=null] - Campo para reglas min/max.
   * @returns {string} Mensaje de error o cadena vacía si es válido.
   */
  validateInteger(value, entity = null, field = null) {
    if (value === undefined || value === null || value === '') {
      return 'Valor entero requerido';
    }

    const num = Number(value);
    if (!Number.isInteger(num)) {
      return msg('must_be_integer');
    }

    if (entity && field) {
      const cfg = this.validationValues?.[entity]?.[field];
      if (cfg) {
        const { min, max } = cfg;
        if (typeof min !== 'undefined' && num < min) {
          return `${field} debe ser >= ${min}`;
        }
        if (typeof max !== 'undefined' && num > max) {
          return `${field} debe ser <= ${max}`;
        }
      } else if (this.validationValues?.[entity]) {
        return `No hay reglas de validación para ${entity}.${field}`;
      }
    }

    return '';
  }
}
