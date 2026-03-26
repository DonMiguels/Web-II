afterAll(async () => {
  try {
    const dbModule = await import('../config/db.js');
    const pool = dbModule?.default;

    if (pool && typeof pool.end === 'function') {
      await pool.end();
    }
  } catch {
    // Some test files may not initialize DB; ignore teardown import errors.
  }
});
