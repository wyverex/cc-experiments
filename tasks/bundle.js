'use strict';

const filesize = require('rollup-plugin-filesize');
const path = require('path');
const jetpack = require('fs-jetpack');
const replace = require('rollup-plugin-replace');
const rollup = require('rollup').rollup;

const nodeBuiltInModules = ['assert', 'buffer', 'child_process', 'cluster',
    'console', 'constants', 'crypto', 'dgram', 'dns', 'domain', 'events',
    'fs', 'http', 'https', 'module', 'net', 'os', 'path', 'process', 'punycode',
    'querystring', 'readline', 'repl', 'stream', 'string_decoder', 'timers',
    'tls', 'tty', 'url', 'util', 'v8', 'vm', 'zlib'];

function generateExternalModulesList() {
    const appManifest = jetpack.read('./package.json', 'json');

    return [].concat(
        nodeBuiltInModules,
        Object.keys(appManifest.dependencies || {}),
        Object.keys(appManifest.devDependencies || {})
    );
};

const cached = {};

module.exports = function bundler(src, dest, opts) {
    const appManifest = jetpack.read('./package.json', 'json');

    opts = opts || {};
    opts.rollupPlugins = (opts.rollupPlugins || []).concat([
        filesize(),
        replace({
            VERSION: appManifest.version
        })
    ]);

    return rollup({
        entry: src,
        external: generateExternalModulesList(),
        cache: cached[src],
        plugins: opts.rollupPlugins,
    })
    .then(function (bundle) {
        cached[src] = bundle;

        const jsFile = path.basename(dest);
        const result = bundle.generate({
            format: 'cjs',
            sourceMap: true,
            sourceMapFile: jsFile,
        });
        // Wrap code in self invoking function so the variables don't
        // pollute the global namespace.
        const isolatedCode = `(function autogen() {${result.code}'\n}());`;

        return Promise.all([
            jetpack.writeAsync(dest, `${isolatedCode}\n//# sourceMappingURL=${jsFile}.map`),
            jetpack.writeAsync(`${dest}.map`, result.map.toString()),
        ]);
    })
    .catch(function (err) {
        console.log('No files bundled');
    });
};
