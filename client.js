"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMainPageUrl = exports.getFileFromPublic = exports.compiledAssetsPath = void 0;
const path_1 = __importDefault(require("path"));
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
// eslint-disable-next-line import/no-mutable-exports, prefer-const
exports.compiledAssetsPath = 'dist';
/**
 * Get path to asset, which you should keep in public/ directory
 *
 * @param pathToFile relative path to file from public/
 */
const getFileFromPublic = (pathToFile) => {
    if (electron_is_dev_1.default)
        return path_1.default.join(process.env.VITE_PUBLIC_DIR, pathToFile);
    // todo explain
    return path_1.default.join(__dirname, exports.compiledAssetsPath, pathToFile);
};
exports.getFileFromPublic = getFileFromPublic;
const getMainPageUrl = (devPortOrUrl = 3500) => {
    var _a;
    let host = (_a = process.env.HOST) !== null && _a !== void 0 ? _a : 'localhost';
    if (!host.startsWith('http'))
        host = `http://${host}`;
    const devUrl = typeof devPortOrUrl === 'string' ? devPortOrUrl : `${host}:${devPortOrUrl}`;
    return electron_is_dev_1.default ? devUrl : `file://${(0, exports.getFileFromPublic)('index.html')}`;
};
exports.getMainPageUrl = getMainPageUrl;
