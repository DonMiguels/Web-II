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

const DELETE_FIELD_SYMBOL = Symbol('delete_field');

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

  const resolveByRouteKey = (catalog, routeKey) => {
    if (!catalog || !routeKey) return null;
    if (catalog[routeKey]) return catalog[routeKey];

    const parts = String(routeKey).split('.').filter(Boolean);
    while (parts.length > 1) {
      parts.pop();
      const candidate = parts.join('.');
      if (catalog[candidate]) return catalog[candidate];
    }

    return null;
  };

  const getRouteRules = (routeKey) => {
    return resolveByRouteKey(sanitizeRules.routeMaps, routeKey) || {};
  };

  const getActionDefinition = (actionName) => {
    if (!actionName) return null;
    return sanitizeRules.actionPolicy?.actions?.[actionName] || null;
  };

  const normalizeActionSpec = (actionSpecLike) => {
    if (!actionSpecLike) return null;

    if (typeof actionSpecLike === 'string') {
      return {
        name: actionSpecLike,
        params: {},
      };
    }

    if (
      isPlainObject(actionSpecLike) &&
      typeof actionSpecLike.name === 'string'
    ) {
      return {
        name: actionSpecLike.name,
        params: isPlainObject(actionSpecLike.params)
          ? actionSpecLike.params
          : {},
      };
    }

    return null;
  };

  const getEventActionSpec = ({ routeRules, fieldRule, eventName }) => {
    const fieldEventAction = normalizeActionSpec(
      fieldRule?.actions?.[eventName],
    );
    if (fieldEventAction) return fieldEventAction;

    const routeEventAction = normalizeActionSpec(
      routeRules?.actions?.[eventName],
    );
    if (routeEventAction) return routeEventAction;

    const globalEventAction = normalizeActionSpec(
      sanitizeRules.actionPolicy?.[eventName]?.action,
    );

    if (!globalEventAction) return null;

    return {
      ...globalEventAction,
      params: {
        ...(sanitizeRules.actionPolicy?.[eventName]?.params || {}),
        ...(globalEventAction.params || {}),
      },
    };
  };

  const obfuscateValue = (value, params = {}) => {
    const text = String(value || '');
    const visibleStart = Math.max(0, Number(params.visibleStart ?? 2));
    const visibleEnd = Math.max(0, Number(params.visibleEnd ?? 2));
    const minMasked = Math.max(1, Number(params.minMasked ?? 4));
    const maskChar = String(params.maskChar ?? '*').slice(0, 1) || '*';

    if (text.length <= visibleStart + visibleEnd) {
      return maskChar.repeat(Math.max(minMasked, text.length || minMasked));
    }

    const middleLength = Math.max(
      minMasked,
      text.length - visibleStart - visibleEnd,
    );

    return `${text.slice(0, visibleStart)}${maskChar.repeat(middleLength)}${text.slice(text.length - visibleEnd)}`;
  };

  const sanitizeValueWithRules = (value, params = {}) => {
    let next = String(value || '');
    const replacementRules = Array.isArray(params.replacementRules)
      ? params.replacementRules
      : [];

    for (const entry of replacementRules) {
      if (!entry || typeof entry.pattern !== 'string') continue;
      const replacement = String(entry.replacement ?? '');
      const compiled = new RegExp(entry.pattern, entry.flags || '');
      next = next.replace(compiled, replacement);
    }

    if (params.normalizeSpaces) next = normalizeSpaces(next);
    if (params.trim) next = next.trim();

    return next;
  };

  const applyAction = ({
    actionSpec,
    value,
    eventName,
    fieldPath,
    actionsApplied,
  }) => {
    if (!sanitizeRules.behavior.executeActions) return value;
    if (!sanitizeRules.actionPolicy?.enabled) return value;
    if (!actionSpec?.name) return value;

    const actionDefinition = getActionDefinition(actionSpec.name);
    if (!actionDefinition) return value;

    const effectiveParams = {
      ...(actionDefinition.defaultParams || {}),
      ...(actionSpec.params || {}),
    };

    let nextValue = value;

    switch (actionSpec.name) {
      case 'keep': {
        nextValue = value;
        break;
      }
      case 'delete': {
        nextValue = DELETE_FIELD_SYMBOL;
        break;
      }
      case 'redact': {
        nextValue = String(effectiveParams.replacement ?? '[REDACTED]');
        break;
      }
      case 'obfuscate': {
        if (typeof value !== 'string') {
          nextValue = value;
        } else {
          nextValue = obfuscateValue(value, effectiveParams);
        }
        break;
      }
      case 'sanitize': {
        if (typeof value !== 'string') {
          nextValue = value;
        } else {
          nextValue = sanitizeValueWithRules(value, effectiveParams);
        }
        break;
      }
      case 'nullify': {
        nextValue = null;
        break;
      }
      case 'empty': {
        nextValue = '';
        break;
      }
      case 'truncate': {
        if (typeof value !== 'string') {
          nextValue = value;
        } else {
          const maxLength = Math.max(
            0,
            Number(effectiveParams.maxLength ?? 12),
          );
          const suffix = String(effectiveParams.suffix ?? '...');
          nextValue =
            value.length > maxLength
              ? `${value.slice(0, maxLength)}${suffix}`
              : value;
        }
        break;
      }
      default: {
        nextValue = value;
      }
    }

    actionsApplied.push({
      field: fieldPath,
      event: eventName,
      action: actionSpec.name,
    });

    return nextValue;
  };

  const evaluateRegexKeys = ({
    regexKeys,
    targetValue,
    fieldPath,
    deniedMatches,
  }) => {
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
    for (const key of sanitizeRules.sensitivePropertyPolicy
      .propertyNameRuleKeys) {
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

    for (const key of sanitizeRules.sensitivePropertyPolicy
      .valueHeuristicRuleKeys) {
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

  const applyForceIncludePaths = ({
    sourcePayload,
    targetPayload,
    forceIncludePaths,
    forcedIncluded,
  }) => {
    for (const pathValue of forceIncludePaths || []) {
      if (!hasPath(sourcePayload, pathValue)) continue;
      setPath(
        targetPayload,
        pathValue,
        cloneDeep(getPath(sourcePayload, pathValue)),
      );
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
    const actionsApplied = [];

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
      resolveByRouteKey(
        sanitizeRules.sensitivePropertyPolicy.allowSensitivePathsByRoute,
        routeKey,
      ) || [],
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
        const out = [];
        currentValue.forEach((entry, index) => {
          const nextValue = walk(
            entry,
            fieldPath ? `${fieldPath}.${index}` : String(index),
            depth + 1,
          );
          if (nextValue !== DELETE_FIELD_SYMBOL) {
            out.push(nextValue);
          }
        });
        return out;
      }

      if (isPlainObject(currentValue)) {
        const out = {};
        for (const [key, value] of Object.entries(currentValue)) {
          const nextPath = fieldPath ? `${fieldPath}.${key}` : key;
          const nextValue = walk(value, nextPath, depth + 1);
          if (nextValue !== DELETE_FIELD_SYMBOL) {
            out[key] = nextValue;
          }
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
        ...(sanitizeRules.behavior.normalizeUnknownStrings
          ? {}
          : { normalizeSpaces: false }),
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

      const applyGlobalDenyPatterns =
        fieldRule.applyGlobalDenyPatterns ??
        routeRules.applyGlobalDenyPatterns ??
        true;

      const denyKeys = [
        ...(applyGlobalDenyPatterns
          ? sanitizeRules.denyPatternKeysGlobal
          : []),
        ...(fieldRule.denyPatternKeys || []),
      ];

      const denyKeysTriggered = evaluateRegexKeys({
        regexKeys: denyKeys,
        targetValue: transformedValue,
        fieldPath,
        deniedMatches,
      });

      let finalValue = transformedValue;

      if (denyKeysTriggered.length > 0) {
        const denyActionSpec = getEventActionSpec({
          routeRules,
          fieldRule,
          eventName: 'onDenyPattern',
        });

        finalValue = applyAction({
          actionSpec: denyActionSpec,
          value: finalValue,
          eventName: 'onDenyPattern',
          fieldPath,
          actionsApplied,
        });
      }

      const propertyName = fieldPath.split('.').slice(-1)[0];
      const sensitiveByName = isSensitiveByPropertyName(propertyName);
      const sensitiveByValue = isSensitiveByValue(finalValue);
      const sensitiveDetected = sensitiveByName || sensitiveByValue;

      if (sensitiveDetected && !allowedSensitivePaths.has(fieldPath)) {
        const sensitiveActionSpec = getEventActionSpec({
          routeRules,
          fieldRule,
          eventName: 'onSensitiveDetection',
        }) || {
          name: 'redact',
          params: {
            replacement:
              sanitizeRules.sensitivePropertyPolicy.redactReplacement ||
              '[REDACTED]',
          },
        };

        const sensitiveValue = applyAction({
          actionSpec: sensitiveActionSpec,
          value: finalValue,
          eventName: 'onSensitiveDetection',
          fieldPath,
          actionsApplied,
        });

        if (sensitiveValue !== finalValue) {
          changedFields.push(fieldPath);
          if (forcedIncluded.includes(fieldPath)) {
            sanitizedAfterForce.push(fieldPath);
          }
        }

        return sensitiveValue;
      }

      if (finalValue !== transformedValue) {
        changedFields.push(fieldPath);
        if (forcedIncluded.includes(fieldPath)) {
          sanitizedAfterForce.push(fieldPath);
        }
      }

      return finalValue;
    };

    const cleanedPayload = walk(workingPayload, '', 0);
    const uniqueChangedFields = [...new Set(changedFields.filter(Boolean))];
    const uniqueSanitizedAfterForce = [
      ...new Set(sanitizedAfterForce.filter(Boolean)),
    ];

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
      actionsApplied,
      response,
    };
  };

  return {
    sanitizePayload,
  };
};

export default createSanitizer;
