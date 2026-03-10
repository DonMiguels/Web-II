import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';


export default class BOService {
    static instance;

    constructor() {
        if (BOService.instance) return BOService.instance;
        const filename = path.dirname(fileURLToPath(import.meta.url));
        this.rootPath = path.resolve(filename, '../method');
        this.mapFiles = {};
        this.folderPaths = [];
        BOService.instance = this;
    }

    initialize() {
        const excludeFolders = [];
        const files = fs.readdirSync(this.rootPath);

        this.folderPaths = files.filter((file) => {
            if (excludeFolders.includes(file)) return false;
            const filePath = path.join(this.rootPath, file);
            return fs.statSync(filePath).isDirectory();
        });

        this.folderPaths.forEach((folderPath) => {
            this.mapFolderSync(path.join(this.rootPath, folderPath));
        });
    }

    init() {
        this.initialize();
    }

    mapFolderSync(directoryPath) {
        try {
            const files = fs.readdirSync(directoryPath);
            files.forEach((file) => {
                const filePath = path.join(directoryPath, file);
                let stat;

                try {
                    stat = fs.statSync(filePath);
                } catch (sErr) {
                    console.error(`Error al acceder ${filePath}:`, sErr);
                    return;
                }

                if (!stat.isFile() || path.extname(file) !== '.js') return;

                let data;
                try {
                    data = fs.readFileSync(filePath);
                } catch (readErr) {
                    console.error(`Error al leer el archivo ${filePath}:`, readErr);
                    return;
                }

                const name = this.getFileExportedFunctionSync(`./${file}`, data);
                const className = path.basename(directoryPath);

                if (!this.mapFiles[className]) this.mapFiles[className] = {};
                if (name) this.mapFiles[className][name] = file;
            });
        } catch (err) {
            console.error('Error al leer el directorio:', directoryPath, err);
        }
    }

    getFileExportedFunctionSync(filePath, data) {
        try {
            const src = data && data.toString ? data.toString('utf8') : '';
            if (!src) {
                console.log(`No se proporciono contenido para ${filePath}`);
                return null;
            }

            const reExportDefaultFunction =
                /export\s+default\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/m;
            const reExportDefaultIdentifier = /export\s+default\s+([A-Za-z_$][\w$]*)\s*;?/m;
            const reNamedFunction = /export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/m;
            const reNamedConst = /export\s+const\s+([A-Za-z_$][\w$]*)\s*=\s*/m;

            const regExps = [
                reExportDefaultFunction,
                reExportDefaultIdentifier,
                reNamedFunction,
                reNamedConst,
            ];

            for (const re of regExps) {
                const match = src.match(re);
                if (match && match[1]) return match[1];
            }

            console.log(`No se encontro una funcion exportada en ${filePath}`);
            return null;
        } catch (err) {
            console.error(`Error al analizar el contenido de ${filePath}:`, err);
            return null;
        }
    }

    getFileName(className, functionName) {
        return this.mapFiles[className]?.[functionName] || null;
    }

    getMappedFilenames() {
        return this.mapFiles;
    }

    getFolderPaths() {
        return this.folderPaths;
    }
}