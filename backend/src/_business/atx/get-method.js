import Utils from '../../utils/utils.js';
import Config from '../../../config/config.js';
import Business from '../business.js';
import path from 'path';
import { pathToFileURL } from 'url';

export default async function getMethod({ subsystem, className, method }) {
  const utils = new Utils();
  const config = new Config();
  const business = new Business();
  const ERROR_CODES = config.ERROR_CODES;
  let folderPaths = business.getFolderPaths();
  let mappedFiles = business.getMappedFilenames();

  if (folderPaths.length === 0 || Object.keys(mappedFiles).length === 0) {
    business.init();
    folderPaths = business.getFolderPaths();
    mappedFiles = business.getMappedFilenames();
  }

  let importPath = null;

  if (folderPaths.includes(className)) {
    const fileName = mappedFiles[className]?.[method];
    if (!fileName) {
      utils.handleError({
        message: `Método '${method}' no encontrado en clase '${className}'`,
        statusCode: ERROR_CODES.NOT_FOUND,
      });
    }
    importPath = path.resolve(business.rootPath, className, fileName);
  } else if (subsystem === 'ftx') {
    importPath = path.resolve(business.rootPath, subsystem, `${className}.js`);
  } else {
    importPath = path.resolve(business.rootPath, className, `${className}.js`);
  }

  console.log(
    `Importing method from path: ${importPath} ---- ${subsystem} / ${className} / ${method}`,
  );

  const c = await import(pathToFileURL(importPath).href);
  let i = new c.default();
  if (i && typeof i[method] !== 'function') {
    utils.handleError({
      message: `Método '${method}' no encontrado en clase '${className}'`,
      statusCode: ERROR_CODES.NOT_FOUND,
    });
  }
  return i;
}
