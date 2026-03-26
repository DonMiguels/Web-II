import {
  discoverBoMethods,
  buildSampleParams,
  loadQueries,
} from '../../utils/discovery.mjs';

describe('BO integration positive - SELECT methods on isolated test DB', () => {
  let selectMethods = [];
  let queries = {};

  beforeAll(async () => {
    queries = loadQueries();
    const methods = await discoverBoMethods();
    selectMethods = methods.filter((m) => {
      if (!m.nameQuery || !queries[m.nameQuery]?.query) return false;
      const q = String(queries[m.nameQuery].query).trim().toUpperCase();
      return q.startsWith('SELECT');
    });
  });

  test('should discover SELECT-backed methods', () => {
    expect(selectMethods.length).toBeGreaterThan(0);
  });

  test('all SELECT methods execute without throwing', async () => {
    const failures = [];

    for (const m of selectMethods) {
      const structure = queries[m.nameQuery]?.structure_params || {};
      const params = buildSampleParams(structure);

      try {
        await m.methodFn(params);
      } catch (err) {
        failures.push(`${m.filePath} [${m.nameQuery}] -> ${err.message}`);
      }
    }

    expect(failures).toEqual([]);
  });
});

