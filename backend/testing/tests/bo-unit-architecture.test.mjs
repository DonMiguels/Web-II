import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const boRoot = path.resolve(process.cwd(), 'src/bo');
const legacyRoots = new Set(['class', 'method', 'subsystem']);

const expectedSubsystems = [
  'Academic',
  'Audit',
  'Compensations',
  'Components',
  'Inventory',
  'Loans',
  'Notifications',
  'Reports',
  'Reservations',
  'Returns',
  'Security',
  'Users',
];

const expectedClassPairs = [
  'Academic/AcademicPeriod',
  'Audit/Audit',
  'Compensations/Compensation',
  'Compensations/CompensationProcess',
  'Components/Component',
  'Inventory/Equipment',
  'Inventory/EquipmentStatus',
  'Inventory/Inventory',
  'Inventory/Location',
  'Loans/Loan',
  'Loans/LoanProcess',
  'Notifications/Notification',
  'Notifications/NotificationScheduler',
  'Reports/DelinquencyReport',
  'Reports/LoanStatsReport',
  'Reports/LoanReport',
  'Reports/SolvencyReport',
  'Reservations/Reservation',
  'Reservations/ReservationJob',
  'Returns/Return',
  'Returns/ReturnProcess',
  'Security/Person',
  'Security/Profile',
  'Security/SecurityBridge',
  'Security/SecurityClassEntity',
  'Security/SecurityMenu',
  'Security/SecurityMethodEntity',
  'Security/SecurityOption',
  'Security/SecurityProfile',
  'Security/SecuritySubsystem',
  'Security/SecurityTransaction',
  'Security/SecurityUser',
  'Security/User',
  'Users/User',
];

function walk(dirPath, acc = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, acc);
      continue;
    }
    if (entry.isFile() && fullPath.endsWith('.js')) {
      acc.push(fullPath);
    }
  }
  return acc;
}

function sortUnique(list) {
  return [...new Set(list)].sort();
}

function discoverArchitectureFiles() {
  const files = walk(boRoot);
  const subsystemFiles = [];
  const classFiles = [];

  for (const filePath of files) {
    const rel = path.relative(boRoot, filePath);
    const parts = rel.split(path.sep);

    if (parts.length < 2) continue;
    const subsystem = parts[0];
    if (legacyRoots.has(subsystem)) continue;

    if (parts.length === 2 && parts[1] === `${subsystem}.js`) {
      subsystemFiles.push({ subsystem, filePath });
      continue;
    }

    if (parts.length === 3) {
      const className = parts[1];
      const expectedFile = `${className}.js`;
      if (parts[2] === expectedFile) {
        classFiles.push({ subsystem, className, filePath });
      }
    }
  }

  return { subsystemFiles, classFiles };
}

describe('BO unit explicit - subsystems and classes', () => {
  let subsystemFiles = [];
  let classFiles = [];

  beforeAll(() => {
    const discovered = discoverArchitectureFiles();
    subsystemFiles = discovered.subsystemFiles;
    classFiles = discovered.classFiles;
  });

  test('should discover exactly the expected subsystems', () => {
    const discovered = sortUnique(
      subsystemFiles.map((entry) => entry.subsystem),
    );
    expect(discovered).toEqual(sortUnique(expectedSubsystems));
  });

  test('each subsystem should export and instantiate correctly', async () => {
    const failures = [];

    for (const entry of subsystemFiles) {
      try {
        const mod = await import(pathToFileURL(entry.filePath).href);
        const SubsystemCtor = mod[entry.subsystem];

        expect(typeof SubsystemCtor).toBe('function');

        const instance = new SubsystemCtor();
        const keys = Object.keys(instance);
        expect(keys.length).toBeGreaterThan(0);

        for (const key of keys) {
          expect(typeof instance[key]).toBe('function');
        }
      } catch (error) {
        failures.push(`${entry.subsystem} -> ${error.message}`);
      }
    }

    expect(failures).toEqual([]);
  });

  test('should discover exactly the expected class pairs', () => {
    const discovered = sortUnique(
      classFiles.map((entry) => `${entry.subsystem}/${entry.className}`),
    );

    expect(discovered).toEqual(sortUnique(expectedClassPairs));
  });

  test('each class should export and instantiate correctly', async () => {
    const failures = [];

    for (const entry of classFiles) {
      const classId = `${entry.subsystem}/${entry.className}`;
      try {
        const mod = await import(pathToFileURL(entry.filePath).href);
        const ClassCtor = mod[entry.className];

        expect(typeof ClassCtor).toBe('function');

        const instance = new ClassCtor();
        const keys = Object.keys(instance);
        expect(keys.length).toBeGreaterThan(0);

        for (const key of keys) {
          expect(typeof instance[key]).toBe('function');
        }
      } catch (error) {
        failures.push(`${classId} -> ${error.message}`);
      }
    }

    expect(failures).toEqual([]);
  });
});
