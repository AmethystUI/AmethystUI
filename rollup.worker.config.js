// rollup.workers.config.js
import glob from 'glob';
import typescript from '@rollup/plugin-typescript';

const workerFiles = glob.sync('src/workers/**/*.worker.ts');
const inputs = workerFiles.map((workerFile) => ({
	input: workerFile,
	output: {
		sourcemap: true,
		format: 'iife',
		name: workerFile.replace(/src\/workers\//, '').replace(/\.ts$/, ''),
		file: workerFile.replace(/src\/workers\//, 'public/workers/').replace(/\.ts$/, '.js')
	},
	plugins: [
		typescript({ sourceMap: true }),
	]
}));

export default inputs;
