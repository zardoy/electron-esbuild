export declare let compiledAssetsPath: string;
/**
 * Get path to asset, which you should keep in public/ directory
 *
 * @param pathToFile relative path to file from public/
 */
export declare const getFileFromPublic: (pathToFile: string) => string;
export declare const getMainPageUrl: (devPortOrUrl?: string | number) => string;
