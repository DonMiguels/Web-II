import Config from '../config/config.js';
import { msg } from './messages.js';

/**
 * @file Validador genérico de campos basado en reglas de configuración.
 * @description Valida tipos, longitudes, patrones y reglas de seguridad (XSS/SQLi).
 */

/**
 * @class Validator
 * @description Validador de datos de entrada según `validations.json` y reglas de seguridad.
 */
class Validator {
  /**
   * @description Inicializa el validador cargando las reglas desde la configuración.
   */
  constructor() {
    this.config = new Config();
    this.validationRules = this.config.getValidationValues();
  }

  /**
   * @description Método de validación genérico por tipo, categoría y opciones.
   * @param {*} value - Valor a validar.
   * @param {string} type - Tipo de dato (`string`, `number`, `email`).
   * @param {string} category - Categoría del campo (`username`, `email`, `password`, etc.).
   * @param {Object} [options={}] - Opciones adicionales (`required`, mensajes personalizados, etc.).
   * @returns {{isValid: boolean, message: string}} Resultado de la validación.
   */
  validate(value, type, category, options = {}) {
    try {
      if (!this.validateType(value, type)) {
        return {
          isValid: false,
          message: msg('field_type_invalid', { category, type }),
        };
      }

      if (options.required && (!value || value.toString().trim() === '')) {
        return {
          isValid: false,
          message: msg('field_required', { category }),
        };
      }

      if (!value && !options.required) {
        return { isValid: true, message: '' };
      }

      const categoryValidation = this.validateCategory(
        value,
        category,
        options,
      );
      if (!categoryValidation.isValid) {
        return categoryValidation;
      }

      const securityValidation = this.validateSecurity(value, category);
      if (!securityValidation.isValid) {
        return securityValidation;
      }

      return { isValid: true, message: '' };
    } catch (error) {
      return {
        isValid: false,
        message: msg('field_validation_error', {
          category,
          detail: error.message,
        }),
      };
    }
  }

  /**
   * @description Valida el tipo de dato básico del valor.
   * @param {*} value - Valor a comprobar.
   * @param {string} type - Tipo esperado (`string`, `number`, `email`).
   * @returns {boolean} `true` si el tipo es válido o no se especifica tipo.
   */
  validateType(value, type) {
    switch (type) {
      case 'string':
        return typeof value === 'string' || value instanceof String;
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'email':
        return this.isValidEmail(value);
      default:
        return true;
    }
  }

  /**
   * @description Valida el valor según las reglas de longitud y categoría de `validations.json`.
   * @param {*} value - Valor a validar.
   * @param {string} category - Categoría del campo.
   * @param {Object} [options={}] - Mensajes u opciones personalizadas.
   * @returns {{isValid: boolean, message: string}} Resultado de la validación por categoría.
   */
  validateCategory(value, category, options = {}) {
    const stringValue = value.toString().trim();
    const rules = this.getCategoryRules(category);

    if (!rules) {
      return { isValid: true, message: '' };
    }

    if (rules.min && stringValue.length < rules.min) {
      return {
        isValid: false,
        message:
          options.minMessage ||
          `El campo ${category} debe tener al menos ${rules.min} caracteres`,
      };
    }

    if (rules.max && stringValue.length > rules.max) {
      return {
        isValid: false,
        message:
          options.maxMessage ||
          `El campo ${category} no puede exceder ${rules.max} caracteres`,
      };
    }

    switch (category) {
      case 'username':
        return this.validateUsername(stringValue, options);
      case 'email':
        return this.validateEmail(stringValue, options);
      case 'password':
        return this.validatePassword(stringValue, options);
      default:
        return { isValid: true, message: '' };
    }
  }

  /**
   * @description Obtiene las reglas de validación para una categoría en todas las secciones.
   * @param {string} category - Nombre de la categoría.
   * @returns {Object|null} Reglas encontradas o `null` si no existen.
   */
  getCategoryRules(category) {
    for (const section of Object.keys(this.validationRules)) {
      if (this.validationRules[section][category]) {
        return this.validationRules[section][category];
      }
    }
    return null;
  }

  /**
   * @description Validación específica para nombre de usuario (letras, números, puntos y guiones bajos).
   * @param {string} username - Nombre de usuario a validar.
   * @param {Object} [options={}] - Opciones con mensajes personalizados.
   * @returns {{isValid: boolean, message: string}} Resultado de la validación.
   */
  validateUsername(username, options = {}) {
    const usernameRegex = /^[a-zA-Z0-9._]+$/;

    if (!usernameRegex.test(username)) {
      return {
        isValid: false,
        message:
          options.patternMessage ||
          'El usuario solo puede contener letras, números, puntos y guiones bajos',
      };
    }

    return { isValid: true, message: '' };
  }

  /**
   * @description Validación específica para correo electrónico.
   * @param {string} email - Correo a validar.
   * @param {Object} [options={}] - Opciones con mensajes personalizados.
   * @returns {{isValid: boolean, message: string}} Resultado de la validación.
   */
  validateEmail(email, options = {}) {
    if (!this.isValidEmail(email)) {
      return {
        isValid: false,
        message:
          options.emailMessage ||
          'El formato del correo electrónico no es válido',
      };
    }

    return { isValid: true, message: '' };
  }

  /**
   * @description Validación específica para contraseña (mínimo 8 caracteres y fortaleza opcional).
   * @param {string} password - Contraseña a validar.
   * @param {Object} [options={}] - Opciones (`requireSpecialChars`, mensajes personalizados).
   * @returns {{isValid: boolean, message: string}} Resultado de la validación.
   */
  validatePassword(password, options = {}) {
    if (password.length < 8) {
      return {
        isValid: false,
        message:
          options.passwordMinMessage ||
          'La contraseña debe tener al menos 8 caracteres',
      };
    }

    if (options.requireSpecialChars !== false) {
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        return {
          isValid: false,
          message:
            options.passwordStrengthMessage ||
            'La contraseña debe contener mayúsculas, minúsculas y números',
        };
      }
    }

    return { isValid: true, message: '' };
  }

  /**
   * @description Validaciones de seguridad contra patrones XSS y SQL Injection básicos.
   * @param {*} value - Valor a inspeccionar.
   * @param {string} category - Nombre del campo (para el mensaje de error).
   * @returns {{isValid: boolean, message: string}} Resultado de la validación de seguridad.
   */
  validateSecurity(value, category) {
    const stringValue = value.toString();

    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<[^>]*>/g,
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(stringValue)) {
        return {
          isValid: false,
          message: msg('field_security_chars', { category }),
        };
      }
    }

    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /(--|\*|;|'|")/g,
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(stringValue)) {
        return {
          isValid: false,
          message: msg('field_suspicious_chars', { category }),
        };
      }
    }

    return { isValid: true, message: '' };
  }

  /**
   * @description Comprueba si un valor tiene formato de correo electrónico válido.
   * @param {string} email - Correo a comprobar.
   * @returns {boolean} `true` si el formato es válido.
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * @description Valida un objeto completo con múltiples campos según un schema.
   * @param {Object} data - Objeto con datos a validar.
   * @param {Object} schema - Schema de validación por campo (`type`, `options`).
   * @returns {{isValid: boolean, errors: Object}} Resultado global y errores por campo.
   */
  validateObject(data, schema) {
    const safeData = data || {};
    const errors = {};
    let isValid = true;

    for (const [field, rules] of Object.entries(schema)) {
      const value = safeData[field];
      const validation = this.validate(
        value,
        rules.type,
        field,
        rules.options || {},
      );

      if (!validation.isValid) {
        errors[field] = validation.message;
        isValid = false;
      }
    }

    return { isValid, errors };
  }
}

export default Validator;
