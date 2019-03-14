import packagejson from './package.json'
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

const name = packagejson.name;
const dist = 'dist'

let config = {
    plugins: [
        resolve(),
        babel({
            runtimeHelpers: true,
            exclude: 'node_modules/**', // only transpile our source code
            presets: [
                [
                    "@babel/env",
                    {
                        useBuiltIns: "usage",
                        forceAllTransforms: true
                    }
                ],
            ],
            "plugins": [
                ["@babel/plugin-proposal-class-properties", { "loose": true }],
                "@babel/plugin-proposal-optional-chaining",
            ]
        }),
    ]
};

if (process.env.DEV) {
    config.input = `docs/script.js`;
    config.output = {
        file: `docs/dist/script.js`, // equivalent to --output
        format: 'es',
    };
} else {

    config.input = `src/main.js`;
    config.output = {
        file: `${dist}/${name}.es5.js`, // equivalent to --output
        format: 'iife',
        name: 'render'
    };
    config.plugins.push(uglify());
}



if (process.env.BUILD == 'es') {
    config.output = {
        file: `${dist}/${name}.min.js`, // equivalent to --output
        format: 'es',
    };
} else if (process.env.BUILD == 'cjs') {
    config.output = {
        file: `${dist}/${name}.cjs.js`, // equivalent to --output
        format: 'cjs',
    };
}

export default config;
