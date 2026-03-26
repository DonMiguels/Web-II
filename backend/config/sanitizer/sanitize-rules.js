const sanitizeRules = {
  version: 1,
  behavior: {
    rejectOnDenyPattern: true,
    executeActions: true,
    sanitizeUnknownFields: true,
    normalizeUnknownStrings: true,
    maxDepth: 10,
    maxStringLength: 10000,
  },
  defaults: {
    trim: true,
    normalizeSpaces: true,
    stripHtml: false,
    toLowerCase: false,
    toUpperCase: false,
  },
  denyPatternKeysGlobal: [
    'xss_script_tag',
    'xss_javascript_protocol',
    'xss_inline_handler',
    'control_chars',
    'sql_union_select',
    'sql_comment_sequence',
    'command_injection_chain',
    'path_traversal',
  ],
  sensitivePropertyPolicy: {
    propertyNameRuleKeys: ['sensitive_property_name'],
    valueHeuristicRuleKeys: [
      'sensitive_jwt_value',
      'sensitive_bearer_token',
      'sensitive_private_key_block',
      'sensitive_high_entropy_keylike',
      'sensitive_credit_card_like',
      'sensitive_iban_like',
      'sensitive_email_like',
      'sensitive_phone_like',
    ],
    redactReplacement: '[REDACTED]',
    allowSensitivePathsByRoute: {
      'session.register': ['username', 'password', 'person_id'],
      'session.login': ['username', 'password'],
      'session.forgotPassword': ['email'],
      'session.resetPassword': ['token', 'password', 'confirmPassword'],
      'dispatcher.root': [],
    },
  },
  actionPolicy: {
    enabled: true,
    onDenyPattern: {
      action: 'sanitize',
      params: {
        replacementRules: [
          {
            pattern:
              '([A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+)|([A-Za-z0-9+/_=-]{24,})',
            flags: 'g',
            replacement: '',
          },
          {
            pattern: '[\\u0000-\\u001F\\u007F]',
            flags: 'g',
            replacement: '',
          },
        ],
        normalizeSpaces: true,
        trim: true,
      },
    },
    onSensitiveDetection: {
      action: 'redact',
      params: {
        replacement: '[REDACTED]',
      },
    },
    actions: {
      keep: {
        description: 'Mantiene el valor sin cambios',
      },
      delete: {
        description: 'Elimina el campo del payload resultante',
      },
      redact: {
        description: 'Reemplaza todo el valor por texto fijo',
        defaultParams: {
          replacement: '[REDACTED]',
        },
      },
      obfuscate: {
        description: 'Enmascara parcialmente el valor',
        defaultParams: {
          visibleStart: 2,
          visibleEnd: 2,
          maskChar: '*',
          minMasked: 4,
        },
      },
      sanitize: {
        description:
          'Aplica reglas regex para remover/substituir partes sensibles',
        defaultParams: {
          replacementRules: [
            {
              pattern:
                '([A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+)|([A-Za-z0-9+/_=-]{24,})',
              flags: 'g',
              replacement: '',
            },
          ],
          normalizeSpaces: true,
          trim: true,
        },
      },
      nullify: {
        description: 'Reemplaza el valor por null',
      },
      empty: {
        description: 'Reemplaza el valor por cadena vacia',
      },
      truncate: {
        description: 'Recorta el valor a una longitud maxima',
        defaultParams: {
          maxLength: 12,
          suffix: '...',
        },
      },
    },
  },
  routeMaps: {
    'session.register': {
      forceIncludePaths: ['username', 'password', 'person_id'],
      actions: {
        onSensitiveDetection: 'redact',
      },
      fields: {
        username: {
          trim: true,
          normalizeSpaces: false,
          denyPatternKeys: ['username_whitespace', 'control_chars'],
        },
        password: {
          trim: true,
          normalizeSpaces: false,
          applyGlobalDenyPatterns: false,
          denyPatternKeys: ['control_chars'],
        },
      },
    },
    'session.login': {
      forceIncludePaths: ['username', 'password'],
      actions: {
        onSensitiveDetection: 'redact',
      },
      fields: {
        username: {
          trim: true,
          normalizeSpaces: false,
          denyPatternKeys: ['username_whitespace', 'control_chars'],
        },
        password: {
          trim: true,
          normalizeSpaces: false,
          applyGlobalDenyPatterns: false,
          denyPatternKeys: ['control_chars'],
        },
      },
    },
    'session.forgotPassword': {
      forceIncludePaths: ['email'],
      actions: {
        onSensitiveDetection: {
          name: 'obfuscate',
          params: {
            visibleStart: 2,
            visibleEnd: 10,
            minMasked: 5,
          },
        },
      },
      fields: {
        email: {
          trim: true,
          toLowerCase: true,
          normalizeSpaces: false,
          denyPatternKeys: [
            'xss_script_tag',
            'xss_javascript_protocol',
            'control_chars',
          ],
        },
      },
    },
    'session.resetPassword': {
      forceIncludePaths: ['token', 'password', 'confirmPassword'],
      actions: {
        onSensitiveDetection: 'redact',
      },
      fields: {
        token: {
          trim: true,
          normalizeSpaces: false,
          denyPatternKeys: ['control_chars'],
          actions: {
            onSensitiveDetection: {
              name: 'truncate',
              params: {
                maxLength: 8,
                suffix: '...',
              },
            },
          },
        },
        password: {
          trim: true,
          normalizeSpaces: false,
          applyGlobalDenyPatterns: false,
          denyPatternKeys: ['control_chars'],
        },
        confirmPassword: {
          trim: true,
          normalizeSpaces: false,
          applyGlobalDenyPatterns: false,
          denyPatternKeys: ['control_chars'],
        },
      },
    },
    'dispatcher.root': {
      forceIncludePaths: [],
      actions: {
        onDenyPattern: 'sanitize',
        onSensitiveDetection: 'redact',
      },
      fields: {},
    },
    'dispatcher.response': {
      forceIncludePaths: [],
      actions: {
        onDenyPattern: {
          name: 'sanitize',
          params: {
            replacementRules: [
              {
                pattern:
                  '([A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+)|([A-Za-z0-9+/_=-]{24,})',
                flags: 'g',
                replacement: '',
              },
            ],
            normalizeSpaces: true,
            trim: true,
          },
        },
        onSensitiveDetection: 'redact',
      },
      fields: {},
    },
    'session.response': {
      forceIncludePaths: [],
      actions: {
        onDenyPattern: 'sanitize',
        onSensitiveDetection: 'redact',
      },
      fields: {},
    },
  },
  responsePolicy: {
    statusCode: 400,
    errorCode: 'INVALID_INPUT_SANITIZATION',
    message: 'invalid_input_sanitization',
    includeFields: true,
    includeRuleKey: true,
  },
  auditPolicy: {
    enabled: true,
    logChangedFields: true,
    logDeniedRules: true,
    logRouteKey: true,
    logValues: false,
  },
};

export default sanitizeRules;
