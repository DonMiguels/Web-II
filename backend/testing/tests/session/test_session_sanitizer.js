import { createSanitizer } from '../../../src/sanitizer/sanitizer.js';
import Validator from '../../../utils/validator.js';
import { initializeRuntimeEnv } from '../../../config/env/runtime.js';

await initializeRuntimeEnv();

const sanitizer = createSanitizer();
const validator = new Validator();

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function testSessionLoginPasswordWithHash() {
  const input = {
    username: 'super_admin',
    password: 'Admin123!@#',
  };

  const result = sanitizer.sanitizePayload(input, {
    routeKey: 'session.login',
  });

  assert(
    !result.rejected,
    'No debe rechazarse password con # en session.login',
  );
  assert(
    result.cleanedPayload.password === input.password,
    'El password debe preservarse sin mutación para autenticación',
  );
}

function testSessionLoginPasswordWithControlChar() {
  const input = {
    username: 'super_admin',
    password: 'Admin123!@#\u0001',
  };

  const result = sanitizer.sanitizePayload(input, {
    routeKey: 'session.login',
  });

  assert(
    result.rejected,
    'Debe rechazarse password con caracteres de control en session.login',
  );
  assert(
    result.deniedMatches.some((entry) => entry.ruleKey === 'control_chars'),
    'La regla control_chars debe activarse',
  );
}

function testSessionRegisterPasswordWithHash() {
  const input = {
    username: 'admin.test',
    password: 'Admin123!@#',
    person_id: 1,
  };

  const result = sanitizer.sanitizePayload(input, {
    routeKey: 'session.register',
  });

  assert(
    !result.rejected,
    'No debe rechazarse password con # en session.register',
  );
  assert(
    result.cleanedPayload.password === input.password,
    'session.register debe preservar password sin mutación',
  );
}

function testSessionResetPasswordPreservesPasswords() {
  const input = {
    token: 'token_demo_123',
    password: 'Admin123!@#',
    confirmPassword: 'Admin123!@#',
  };

  const result = sanitizer.sanitizePayload(input, {
    routeKey: 'session.resetPassword',
  });

  assert(
    !result.rejected,
    'No debe rechazarse password con # en session.resetPassword',
  );
  assert(
    result.cleanedPayload.password === input.password,
    'session.resetPassword debe preservar password',
  );
  assert(
    result.cleanedPayload.confirmPassword === input.confirmPassword,
    'session.resetPassword debe preservar confirmPassword',
  );
}

function testSessionResponseRedactsSensitiveData() {
  const responsePayload = {
    message: 'ok',
    user: {
      username: 'super_admin',
      email: 'admin@example.com',
      token: 'abc.def.ghi',
    },
  };

  const result = sanitizer.sanitizePayload(responsePayload, {
    routeKey: 'session.response.login',
  });

  assert(!result.rejected, 'La sanitización de respuesta no debe rechazar');
  assert(
    result.cleanedPayload.user.email === '[REDACTED]',
    'La respuesta debe redaccionar email sensible',
  );
  assert(
    result.cleanedPayload.user.token === '[REDACTED]',
    'La respuesta debe redaccionar token sensible',
  );
}

function testValidatorAllowsPasswordSymbols() {
  const value = 'Adm!n#123;\'"{}[]()';
  const result = validator.validate(value, 'string', 'password', {
    required: true,
    requireSpecialChars: true,
  });

  assert(
    result.isValid,
    'El validador no debe bloquear simbolos validos en password',
  );
}

function testValidatorRejectsPasswordControlChars() {
  const value = 'Admin123!@#\u0001';
  const result = validator.validate(value, 'string', 'password', {
    required: true,
    requireSpecialChars: true,
  });

  assert(
    !result.isValid,
    'El validador debe rechazar control chars en password',
  );
}

function run() {
  const tests = [
    {
      name: 'session.login permite # en password',
      fn: testSessionLoginPasswordWithHash,
    },
    {
      name: 'session.login rechaza control chars en password',
      fn: testSessionLoginPasswordWithControlChar,
    },
    {
      name: 'session.register permite # en password',
      fn: testSessionRegisterPasswordWithHash,
    },
    {
      name: 'session.resetPassword preserva passwords sensibles',
      fn: testSessionResetPasswordPreservesPasswords,
    },
    {
      name: 'session.response redacciona campos sensibles',
      fn: testSessionResponseRedactsSensitiveData,
    },
    {
      name: 'validator permite simbolos validos en password',
      fn: testValidatorAllowsPasswordSymbols,
    },
    {
      name: 'validator rechaza control chars en password',
      fn: testValidatorRejectsPasswordControlChars,
    },
  ];

  let passed = 0;

  for (const test of tests) {
    try {
      test.fn();
      passed += 1;
      console.log(`OK - ${test.name}`);
    } catch (error) {
      console.error(`FAIL - ${test.name}: ${error.message}`);
      process.exitCode = 1;
    }
  }

  console.log(`\nResultado: ${passed}/${tests.length} pruebas exitosas.`);
}

run();
