import { BuildOptions } from 'esbuild';
interface Options {
    /** `development` will start watching */
    mode: 'dev' | 'production';
    /** @default true disable for debugging prod build */
    prodMinification?: boolean;
    /** Preload script to build seperately from main. Pass `null` to disable
    //  * @default ./electron-out/index.js */
    /** Path to executable @default electron (global or local electron) */
    electronExecutable?: string;
    /** @default node_modules/.electron-esbuild */
    outdir?: string;
    entryPoints?: {
        /** @default src/electron (relative from cwd) */
        base?: string;
        /** @default index.ts */
        main?: string;
        /** @default preload.ts */
        preload?: string;
    };
    esbuildOptions?: Partial<BuildOptions>;
    vitePublicDir?: string;
}
export interface Env {
    NODE_ENV: Options['mode'];
    /** Note that by default `undefined` only in non-GitHub projects */
    GITHUB_REPO_URL?: string;
}
export declare const main: (options: Options) => Promise<void>;
export {};
