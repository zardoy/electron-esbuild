"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
/* eslint-disable unicorn/no-await-expression-member */
/* eslint-disable @typescript-eslint/naming-convention */
const path_1 = require("path");
const github_remote_info_1 = require("github-remote-info");
const run_electron_1 = require("electron-run/build/main/src/commands/run-electron");
const esbuild_1 = require("esbuild");
const lilconfig_1 = require("lilconfig");
const rambda_1 = require("rambda");
const esbuildDefineEnv = (env) => {
    // TODO use lodash-lib
    const definedEnv = {};
    for (const [name, val] of Object.entries(env)) {
        if (val === undefined)
            continue;
        definedEnv[`process.env.${name}`] = JSON.stringify(val);
    }
    return definedEnv;
};
const main = async (options) => {
    var _a, _b, _c, _d;
    const userConfig = (_b = (_a = (await (0, lilconfig_1.lilconfig)('electron-esbuild').search())) === null || _a === void 0 ? void 0 : _a.config) !== null && _b !== void 0 ? _b : {};
    const { mode = 'dev', 
    // onEveryBuild,
    // onFirstBuild,
    prodMinification = true, outdir = 'node_modules/.electron-esbuild', electronExecutable = 'electron', entryPoints: entryPointsUnmerged = {}, esbuildOptions, vitePublicDir = './src/react/public', } = (0, rambda_1.mergeDeepRight)(options, userConfig);
    const githubRepo = await (0, github_remote_info_1.getGithubRemoteInfo)(process.cwd()).catch(() => undefined);
    const inputPaths = {
        base: 'src/electron',
        main: 'index.ts',
        preload: 'preload.ts',
        ...entryPointsUnmerged,
    };
    const getPath = (paths, component) => (0, path_1.resolve)(process.cwd(), paths.base, paths[component]);
    const esbuildBaseOptions = {
        bundle: true,
        platform: 'node',
        ...esbuildOptions,
        define: esbuildDefineEnv({
            NODE_ENV: mode,
            GITHUB_REPO_URL: githubRepo && `https://github.com/${githubRepo.owner}/${githubRepo.name}`,
            ...esbuildOptions === null || esbuildOptions === void 0 ? void 0 : esbuildOptions.define,
        }),
        external: ['electron', 'original-fs', ...((_c = esbuildOptions === null || esbuildOptions === void 0 ? void 0 : esbuildOptions.external) !== null && _c !== void 0 ? _c : [])],
    };
    // main script
    const result = await (0, esbuild_1.build)({
        entryPoints: [getPath(inputPaths, 'main'), getPath(inputPaths, 'preload')],
        outdir,
        watch: mode === 'dev',
        minify: mode === 'production' && prodMinification,
        metafile: true,
        logLevel: 'info',
        ...esbuildBaseOptions,
        define: {
            'process.env.VITE_PUBLIC_DIR': JSON.stringify(vitePublicDir),
            'process.env.DEV': JSON.stringify(mode === 'dev'),
            ...esbuildBaseOptions.define,
        },
        plugins: [
            {
                name: 'build-end-watch',
                setup(build) {
                    let rebuildCount = 0;
                    let stopPrev;
                    if (mode !== 'dev')
                        return;
                    build.onEnd(async ({ errors }) => {
                        if (errors.length > 0)
                            return;
                        stopPrev === null || stopPrev === void 0 ? void 0 : stopPrev();
                        [, stopPrev] = await (0, run_electron_1.startElectron)({
                            path: (0, path_1.join)(outdir, 'index.js'),
                        });
                        // TODO review and compare with electron forge and electron-run
                        rebuildCount++;
                    });
                },
            },
            nativeNodeModulesPlugin,
            ...((_d = esbuildBaseOptions.plugins) !== null && _d !== void 0 ? _d : []),
        ],
    });
};
exports.main = main;
const nativeNodeModulesPlugin = {
    name: 'native-node-modules',
    setup(build) {
        // If a ".node" file is imported within a module in the "file" namespace, resolve
        // it to an absolute path and put it into the "node-file" virtual namespace.
        build.onResolve({ filter: /\.node$/, namespace: 'file' }, args => ({
            path: require.resolve(args.path, { paths: [args.resolveDir] }),
            namespace: 'node-file',
        }));
        // Files in the "node-file" virtual namespace call "require()" on the
        // path from esbuild of the ".node" file in the output directory.
        build.onLoad({ filter: /.*/, namespace: 'node-file' }, args => ({
            contents: `
        import path from ${JSON.stringify(args.path)}
        try { module.exports = require(path) }
        catch {}
      `,
        }));
        // If a ".node" file is imported within a module in the "node-file" namespace, put
        // it in the "file" namespace where esbuild's default loading behavior will handle
        // it. It is already an absolute path since we resolved it to one above.
        build.onResolve({ filter: /\.node$/, namespace: 'node-file' }, args => ({
            path: args.path,
            namespace: 'file',
        }));
        // Tell esbuild's default loading behavior to use the "file" loader for
        // these ".node" files.
        const opts = build.initialOptions;
        opts.loader = opts.loader || {};
        opts.loader['.node'] = 'file';
    },
};
