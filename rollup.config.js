import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import  terser from '@rollup/plugin-terser';

export default {
    input: 'src/useWorker.ts',
    output: [
        {
            file: 'dist/useWorker.js',
            format: 'cjs'
        },
        {
            file: 'dist/useWorker.esm.js',
            format: 'esm'
        }
    ],
    plugins: [
        resolve(),
        commonjs(),
        typescript(),
        terser() // 添加代码混淆插件
    ],
    external: ['vue']
}
