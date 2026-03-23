const sanitizeRules = {
  version: 1,
  behavior: {
    rejectOnDenyPattern: true,
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
  routeMaps: {
    'session.register': {
      forceIncludePaths: ['username', 'password', 'person_id'],
      fields: {
        username: {
          trim: true,
          normalizeSpaces: false,
          denyPatternKeys: ['username_whitespace', 'control_chars'],
        },
        password: {
          trim: true,
          normalizeSpaces: false,
          denyPatternKeys: ['control_chars'],
        },
      },
    },
    'session.login': {
      forceIncludePaths: ['username', 'password'],
      fields: {
        username: {
          trim: true,
          normalizeSpaces: false,
          denyPatternKeys: ['username_whitespace', 'control_chars'],
        },
        password: {
          trim: true,
          normalizeSpaces: false,
          denyPatternKeys: ['control_chars'],
        },
      },
    },
    'session.forgotPassword': {
      forceIncludePaths: ['email'],
      fields: {
        email: {
          trim: true,
          toLowerCase: true,
          normalizeSpaces: false,
          denyPatternKeys: ['xss_script_tag', 'xss_javascript_protocol', 'control_chars'],
        },
      },
    },
    'session.resetPassword': {
      forceIncludePaths: ['token', 'password', 'confirmPassword'],
      fields: {
        token: {
          trim: true,
          normalizeSpaces: false,
          denyPatternKeys: ['control_chars'],
        },
        password: {
          trim: true,
          normalizeSpaces: false,
          denyPatternKeys: ['control_chars'],
        },
        confirmPassword: {
          trim: true,
          normalizeSpaces: false,
          denyPatternKeys: ['control_chars'],
        },
      },
    },
    'dispatcher.root': {
      forceIncludePaths: [],
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
