import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { execSync } from 'child_process';
import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

let commit = 'dev';
try {
	commit = execSync('git rev-parse --short HEAD').toString().trim();
} catch {}

const buildDate = new Date().toISOString().slice(0, 10);

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		__APP_VERSION__: JSON.stringify(`v${pkg.version}`),
		__APP_COMMIT__: JSON.stringify(commit),
		__APP_BUILD_DATE__: JSON.stringify(buildDate)
	}
});
