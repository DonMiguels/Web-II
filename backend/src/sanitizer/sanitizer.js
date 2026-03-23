import sanitizeRules from '../../config/sanitizer/sanitize-rules.js';
import sanitizeRegexCatalog from '../../config/sanitizer/sanitize-regex.js';

const isPlainObject = (value) => {
  return Object.prototype.toString.call(value) === '[object Object]';
};

const normalizeSpaces = (value) => value.replace(/\s+/g, ' ').trim();

const stripHtml = (value) => value.replace(/<[^>]*>/g, '');

const cloneDeep = (value) => {
  if (Array.isArray(value)) return value.map((entry) => cloneDeep(entry));
  if (isPlainObject(value)) {
    const out = {};
    for (const [key, entry] of Object.entries(value)) {
      out[key] = cloneDeep(entry);
    }
    return out;
  }
  return value;
};

const toPathParts = (pathValue) =>
  String(pathValue)
    .split('.')
    .map((part) => part.trim())
    .filter(Boolean);

const hasPath = (source, pathValue) => {
  const parts = toPathParts(pathValue);
  let current = source;

  for (const part of parts) {
    if (!isPlainObject(current) && !Array.isArray(current)) return false;
    if (!(part in current)) return false;
    current = current[part];
  }

  return true;
};

const getPath = (source, pathValue) => {
  const parts = toPathParts(pathValue);
  let current = source;

  for (const part of parts) {
    if (!isPlainObject(current) && !Array.isArray(current)) return undefined;
    if (!(part in current)) return undefined;
    current = current[part];
  }

  return current;
};

const setPath = (target, pathValue, newValue) => {
  const parts = toPathParts(pathValue);
  if (parts.length === 0) return;

  let current = target;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    if (!isPlainObject(current[part])) {
      current[part] = {};
    }
    current = current[part];
  }

  current[parts[parts.length - 1]] = newValue;
};

const shouldApplyStringDefaults = (rules) => {
  if (!rules) return false;
  return (
    rules.trim ||
    rules.normalizeSpaces ||
    rules.stripHtml ||
    rules.toLowerCase ||
    rules.toUpperCase
  );
};

export const createSanitizer = () => {
  const regexMap = new Map(
    sanitizeRegexCatalog.map((entry) => [
      entry.key,
      {
        ...entry,
        compiled: new RegExp(entry.pattern, entry.flags || ''),
      },
    ]),
  );

  const getRouteRules = (routeKey) => sanitizeRules.routeMaps[routeKey] || {};

  const evaluateRegexKeys = ({ regexKeys, targetValue, fieldPath, deniedMatches }) => {
    const ruleKeysTriggered = [];
    for (const ruleKey of regexKeys || []) {
      const rule = regexMap.get(ruleKey);
      if (!rule) continue;
      if (typeof targetValue !== 'string') continue;
      if (rule.mode !== 'deny') continue;
      if (rule.compiled.test(targetValue)) {
        deniedMatches.push({
          field: fieldPath,
          ruleKey,
          description: rule.description,
        });
        ruleKeysTriggered.push(ruleKey);
      }
    }
    return ruleKeysTriggered;
  };

  const isSensitiveByPropertyName = (propertyName) => {
    for (const key of sanitizeRules.sensitivePropertyPolicy.propertyNameRuleKeys) {
      const rule = regexMap.get(key);
      if (!rule || rule.mode !== 'detect') continue;
      if (rule.target !== 'property') continue;
      if (rule.compiled.test(propertyName)) {
        return key;
      }
    }
    return null;
  };

  const isSensitiveByValue = (value) => {
    if (typeof value !== 'string') return null;

    for (const key of sanitizeRules.sensitivePropertyPolicy.valueHeuristicRuleKeys) {
      const rule = regexMap.get(key);
      if (!rule || rule.mode !== 'detect') continue;
      if (rule.target !== 'value') continue;
      if (rule.compiled.test(value)) {
        return key;
      }
    }

    return null;
  };

  const applyStringTransforms = (value, rules) => {
    let next = value;

    if (rules.trim) next = next.trim();
    if (rules.normalizeSpaces) next = normalizeSpaces(next);
    if (rules.stripHtml) next = stripHtml(next);
    if (rules.toLowerCase) next = next.toLowerCase();
    if (rules.toUpperCase) next = next.toUpperCase();

    if (next.length > sanitizeRules.behavior.maxStringLength) {
      next = next.slice(0, sanitizeRules.behavior.maxStringLength);
    }

    return next;
  };

  const applyForceIncludePaths = ({ sourcePayload, targetPayload, forceIncludePaths, forcedIncluded }) => {
    for (const pathValue of forceIncludePaths || []) {
      if (!hasPath(sourcePayload, pathValue)) continue;
      setPath(targetPayload, pathValue, cloneDeep(getPath(sourcePayload, pathValue)));
      forcedIncluded.push(pathValue);
    }
  };

  const sanitizePayload = (payload, options = {}) => {
    const routeKey = options.routeKey || 'dispatcher.root';
    const routeRules = getRouteRules(routeKey);
    const forceIncludePaths = [
      ...(routeRules.forceIncludePaths || []),
      ...(options.forceIncludePaths || []),
    ];

    const changedFields = [];
    const deniedMatches = [];
    const forcedIncluded = [];
    const sanitizedAfterForce = [];

    const sourcePayload = isPlainObject(payload) ? payload : {};
    const workingPayload = cloneDeep(sourcePayload);

    // Paso 1: forzar inclusión de campos solicitados.
    applyForceIncludePaths({
      sourcePayload,
      targetPayload: workingPayload,
      forceIncludePaths,
      forcedIncluded,
    });

    const allowedSensitivePaths = new Set(
      sanitizeRules.sensitivePropertyPolicy.allowSensitivePathsByRoute[routeKey] || [],
    );

    const walk = (currentValue, fieldPath, depth) => {
      if (depth > sanitizeRules.behavior.maxDepth) {
        deniedMatches.push({
          field: fieldPath || '$',
          ruleKey: 'max_depth_exceeded',
          description: 'Payload excede profundidad permitida',
        });
        return currentValue;
      }

      if (Array.isArray(currentValue)) {
        return currentValue.map((entry, index) =>
          walk(entry, fieldPath ? `${fieldPath}.${index}` : String(index), depth + 1),
        );
      }

      if (isPlainObject(currentValue)) {
        const out = {};
        for (const [key, value] of Object.entries(currentValue)) {
          const nextPath = fieldPath ? `${fieldPath}.${key}` : key;
          out[key] = walk(value, nextPath, depth + 1);
        }
        return out;
      }

      if (typeof currentValue !== 'string') {
        return currentValue;
      }

      const topLevelField = (fieldPath || '').split('.')[0];
      const fieldRule = routeRules.fields?.[topLevelField] || {};

      const activeTransformRules = {
        ...sanitizeRules.defaults,
        ...(sanitizeRules.behavior.normalizeUnknownStrings ? {} : { normalizeSpaces: false }),
        ...fieldRule,
      };

      const originalValue = currentValue;
      const transformedValue = shouldApplyStringDefaults(activeTransformRules)
        ? applyStringTransforms(currentValue, activeTransformRules)
        : currentValue;

      if (transformedValue !== originalValue) {
        changedFields.push(fieldPath);
        if (forcedIncluded.includes(fieldPath)) {
          sanitizedAfterForce.push(fieldPath);
        }
      }

      const denyKeys = [
        ...sanitizeRules.denyPatternKeysGlobal,
        ...(fieldRule.denyPatternKeys || []),
      ];

      evaluateRegexKeys({
        regexKeys: denyKeys,
        targetValue: transformedValue,
        fieldPath,
        deniedMatches,
      });

      const propertyName = fieldPath.split('.').slice(-1)[0];
      const sensitiveByName = isSensitiveByPropertyName(propertyName);
      const sensitiveByValue = isSensitiveByValue(transformedValue);
      const sensitiveDetected = sensitiveByName || sensitiveByValue;

      if (sensitiveDetected && !allowedSensitivePaths.has(fieldPath)) {
        if (sanitizeRules.sensitivePropertyPolicy.redactReplacement !== transformedValue) {
          changedFields.push(fieldPath);
          if (forcedIncluded.includes(fieldPath)) {
            sanitizedAfterForce.push(fieldPath);
          }
        }
        return sanitizeRules.sensitivePropertyPolicy.redactReplacement;
      }

      return transformedValue;
    };

    const cleanedPayload = walk(workingPayload, '', 0);
    const uniqueChangedFields = [...new Set(changedFields.filter(Boolean))];
    const uniqueSanitizedAfterForce = [...new Set(sanitizedAfterForce.filter(Boolean))];

    const rejected =
      sanitizeRules.behavior.rejectOnDenyPattern && deniedMatches.length > 0;

    if (sanitizeRules.auditPolicy.enabled) {
      const auditPayload = {
        routeKey,
        changedFields: sanitizeRules.auditPolicy.logChangedFields
          ? uniqueChangedFields
          : [],
        deniedRules: sanitizeRules.auditPolicy.logDeniedRules
          ? deniedMatches.map((entry) => ({
              field: entry.field,
              ruleKey: entry.ruleKey,
            }))
          : [],
      };

      console.info('[sanitizer] audit', auditPayload);
    }

    const response = {
      statusCode: sanitizeRules.responsePolicy.statusCode,
      code: sanitizeRules.responsePolicy.errorCode,
      message: sanitizeRules.responsePolicy.message,
      fields: sanitizeRules.responsePolicy.includeFields
        ? deniedMatches.map((entry) => entry.field)
        : [],
      rules: sanitizeRules.responsePolicy.includeRuleKey
        ? deniedMatches.map((entry) => entry.ruleKey)
        : [],
    };

    return {
      cleanedPayload,
      changedFields: uniqueChangedFields,
      deniedMatches,
      rejected,
      forcedIncluded: [...new Set(forcedIncluded)],
      sanitizedAfterForce: uniqueSanitizedAfterForce,
      response,
    };
  };

  return {
    sanitizePayload,
  };
};

export default createSanitizer;
