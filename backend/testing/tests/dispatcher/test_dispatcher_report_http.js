import { initializeRuntimeEnv } from '../../../config/env/runtime.js';
import bcrypt from 'bcrypt';

await initializeRuntimeEnv();

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3000';
const TEST_PASSWORD = 'Admin123Aa';
const { default: pool } = await import('../../../config/db.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function postJson(path, payload, cookie = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (cookie) headers.Cookie = cookie;

  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    body = raw;
  }

  const setCookie = response.headers.get('set-cookie') || '';

  return {
    status: response.status,
    body,
    setCookie,
  };
}

function extractSessionCookie(setCookieHeader) {
  if (!setCookieHeader) return null;
  const first = setCookieHeader.split(';')[0];
  return first || null;
}

async function ensureUserProfile({ username, profileName }) {
  console.log(`Setup: ensure profile row '${profileName}'`);
  await pool.query(
    `
      INSERT INTO public.profile (name, description, is_active)
      SELECT $1::varchar, $2::varchar, TRUE
      WHERE NOT EXISTS (
        SELECT 1 FROM public.profile WHERE name = $1::varchar
      )
    `,
    [profileName, profileName],
  );

  console.log(
    `Setup: ensure user_profile link '${username}' -> '${profileName}'`,
  );
  const res = await pool.query(
    `
      INSERT INTO public.user_profile (user_id, profile_id)
      SELECT u.id, p.id
      FROM public."user" u
      CROSS JOIN public.profile p
      WHERE u.name = $1
        AND p.name = $2
        AND NOT EXISTS (
          SELECT 1
          FROM public.user_profile up
          WHERE up.user_id = u.id
            AND up.profile_id = p.id
        )
      RETURNING id
    `,
    [username, profileName],
  );

  return res.rowCount;
}

async function ensureHttpTestUser(username, email, profiles = ['user']) {
  const normalizedDoc = String(username)
    .replace(/[^A-Za-z0-9-]/g, '')
    .toUpperCase();
  const personDoc = `DOC${normalizedDoc}`.slice(0, 30);
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);

  console.log(`Setup: person upsert for ${username}`);
  await pool.query(
    `
      INSERT INTO public.person (document_id, first_name, last_name, phone, address)
      SELECT $1::document_identifier, $2::text, $3::text, $4::text, $5::text
      WHERE NOT EXISTS (
        SELECT 1 FROM public.person p WHERE p.document_id = $1::document_identifier
      )
    `,
    [personDoc, username, 'HttpTest', '+1000000000', `Addr ${username}`],
  );

  console.log(`Setup: user upsert for ${username}`);
  await pool.query(
    `
      INSERT INTO public."user" (name, email, password_hash, is_solvency, is_active, person_id)
      SELECT $1::text, $2::text, $3::text, TRUE, TRUE, p.id
      FROM public.person p
      WHERE p.document_id = $4::document_identifier
        AND NOT EXISTS (
          SELECT 1 FROM public."user" u WHERE u.name = $1::text
        )
    `,
    [username, email, passwordHash, personDoc],
  );

  await pool.query(
    `
      UPDATE public."user"
      SET password_hash = $2::text,
          email = $3::text,
          is_solvency = TRUE,
          is_active = TRUE,
          updated_at = NOW()
      WHERE name = $1::text
    `,
    [username, passwordHash, email],
  );

  console.log(`Setup: user profile ensure for ${username}`);
  for (const profileName of profiles) {
    await ensureUserProfile({ username, profileName });
  }

  const user = await pool.query(
    `SELECT id, name FROM public."user" WHERE name = $1 LIMIT 1`,
    [username],
  );

  return user.rows[0];
}

async function resolveReportTransactionId() {
  const tx = await pool.query(
    `
      SELECT t.id AS transaction_id
      FROM public."transaction" t
      JOIN public.subsystem s ON s.id = t.subsystem_id
      JOIN public."class" c ON c.id = t.class_id
      JOIN public."method" m ON m.id = t.method_id
      WHERE s.name = 'Reports'
        AND c.name = 'LoanReport'
        AND m.name = 'getPendingLoansByUser'
      ORDER BY t.id ASC
      LIMIT 1
    `,
  );

  assert(
    tx.rowCount > 0,
    'No se encontro transaction_id para Reports/LoanReport/getPendingLoansByUser',
  );
  return Number(tx.rows[0].transaction_id);
}

async function loginAndGetCookie(username, password) {
  const login = await postJson('/user/login', {
    username,
    password,
  });

  assert(
    login.status === 200,
    `Login fallo para ${username}: ${JSON.stringify(login.body)}`,
  );
  const cookie = extractSessionCookie(login.setCookie);
  assert(cookie, `No se obtuvo cookie de sesion para ${username}`);

  return {
    cookie,
    user: login.body?.user,
  };
}

async function run() {
  const tests = [];

  try {
    console.log('Setup: resolving transaction_id');
    const txId = await resolveReportTransactionId();

    console.log('Setup: ensuring http_user_a');
    const userA = await ensureHttpTestUser(
      'http_user_a',
      'http_user_a@mail.com',
      ['user'],
    );
    console.log('Setup: ensuring http_user_b');
    const userB = await ensureHttpTestUser(
      'http_user_b',
      'http_user_b@mail.com',
      ['user'],
    );
    console.log('Setup: ensuring http_admin');
    const adminUser = await ensureHttpTestUser(
      'http_admin',
      'http_admin@mail.com',
      ['admin'],
    );
    console.log('Setup: ensuring http_operator');
    const operatorUser = await ensureHttpTestUser(
      'http_operator',
      'http_operator@mail.com',
      ['operator'],
    );

    tests.push(async () => {
      const { cookie, user } = await loginAndGetCookie(
        'http_admin',
        TEST_PASSWORD,
      );

      const response = await postJson(
        '/',
        {
          transaction_id: txId,
          profile: 'admin',
          data: {
            user_id: Number(user?.id || adminUser.id),
            pending_state: 'all',
          },
        },
        cookie,
      );

      assert(
        response.status === 200,
        `Dispatcher admin report fallo: ${JSON.stringify(response.body)}`,
      );
      assert(
        response.body?.data?.summary,
        'Dispatcher admin report debe devolver summary',
      );
    });

    tests.push(async () => {
      const { cookie } = await loginAndGetCookie('http_user_a', TEST_PASSWORD);

      const response = await postJson(
        '/',
        {
          transaction_id: txId,
          profile: 'user',
          data: {
            user_id: Number(userB.id),
            pending_state: 'all',
          },
        },
        cookie,
      );

      assert(
        response.status === 403,
        `Dispatcher user cross-user debe rechazar con 403. Recibido: ${response.status} ${JSON.stringify(response.body)}`,
      );
    });

    tests.push(async () => {
      const { cookie } = await loginAndGetCookie(
        'http_operator',
        TEST_PASSWORD,
      );

      const response = await postJson(
        '/',
        {
          transaction_id: txId,
          profile: 'operator',
          data: {
            user_id: Number(userA.id),
            pending_state: 'all',
          },
        },
        cookie,
      );

      assert(
        response.status === 200,
        `Dispatcher operator report fallo: ${JSON.stringify(response.body)}`,
      );
      assert(
        response.body?.data?.summary,
        'Dispatcher operator report debe devolver summary',
      );
      assert(
        Number(response.body?.data?.summary?.user_id) === Number(userA.id),
        'Dispatcher operator report debe responder para el user_id consultado',
      );
    });

    let passed = 0;

    for (const [index, test] of tests.entries()) {
      try {
        await test();
        passed += 1;
        console.log(`OK - test ${index + 1}`);
      } catch (error) {
        console.error(`FAIL - test ${index + 1}: ${error.message}`);
        process.exitCode = 1;
      }
    }

    console.log(
      `\nResultado Dispatcher Report HTTP: ${passed}/${tests.length} pruebas exitosas.`,
    );
  } catch (error) {
    console.error(`FAIL - setup: ${error.message}`);
    if (error?.detail) console.error(`detail: ${error.detail}`);
    if (error?.where) console.error(`where: ${error.where}`);
    if (error?.position) console.error(`position: ${error.position}`);
    if (error?.stack) console.error(error.stack);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }

  if (process.exitCode) {
    process.exit(process.exitCode);
  }
}

run();
