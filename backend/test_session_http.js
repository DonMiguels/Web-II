const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3000';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function postJson(path, payload) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    body = raw;
  }

  return {
    status: response.status,
    body,
  };
}

async function testLoginWithHashAllowed() {
  const result = await postJson('/user/login', {
    username: 'super_admin',
    password: 'Admin123!@#',
  });

  assert(
    result.status !== 400,
    'login con # no debe fallar por sanitizacion (status 400)',
  );

  if (result.status === 200) {
    assert(result.body?.message, 'login exitoso debe incluir mensaje');
  }
}

async function testResetInvalidTokenNotSanitization() {
  const result = await postJson('/user/reset-password', {
    token: 'invalid.token.value',
    password: 'Admin123!@#',
    confirmPassword: 'Admin123!@#',
  });

  assert(
    result.status === 400,
    'reset con token invalido debe devolver 400 de negocio',
  );
  assert(
    !result.body?.code || result.body?.code !== 'INVALID_INPUT_SANITIZATION',
    'reset con # no debe disparar INVALID_INPUT_SANITIZATION',
  );
}

async function testResetControlCharsRejected() {
  const result = await postJson('/user/reset-password', {
    token: 'invalid.token.value',
    password: 'Admin123!@#\u0001',
    confirmPassword: 'Admin123!@#\u0001',
  });

  assert(result.status === 400, 'reset con control chars debe devolver 400');
  assert(
    result.body?.code === 'INVALID_INPUT_SANITIZATION',
    'reset con control chars debe devolver INVALID_INPUT_SANITIZATION',
  );
}

async function run() {
  const tests = [
    {
      name: 'login admite password con #',
      fn: testLoginWithHashAllowed,
    },
    {
      name: 'reset invalido con # no dispara sanitizacion',
      fn: testResetInvalidTokenNotSanitization,
    },
    {
      name: 'reset rechaza control chars',
      fn: testResetControlCharsRejected,
    },
  ];

  let passed = 0;

  for (const test of tests) {
    try {
      await test.fn();
      passed += 1;
      console.log(`OK - ${test.name}`);
    } catch (error) {
      console.error(`FAIL - ${test.name}: ${error.message}`);
      process.exitCode = 1;
    }
  }

  console.log(`\nResultado HTTP: ${passed}/${tests.length} pruebas exitosas.`);
  if (process.exitCode) {
    process.exit(process.exitCode);
  }
}

run();
