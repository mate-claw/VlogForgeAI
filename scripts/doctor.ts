import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checks: Array<{ name: string; ok: boolean; detail?: string }> = [];
function check(name: string, ok: boolean, detail?: string) { checks.push({ name, ok, detail }); }

check('Node >= 20', Number(process.versions.node.split('.')[0]) >= 20, process.versions.node);
check('package.json exists', fs.existsSync(path.resolve(root, 'package.json')));
check('.env exists', fs.existsSync(path.resolve(root, '.env')), '没有也可以先复制 .env.example');
check('.env.example exists', fs.existsSync(path.resolve(root, '.env.example')));
check('apps/api exists', fs.existsSync(path.resolve(root, 'apps/api/src/server.ts')));
check('apps/worker exists', fs.existsSync(path.resolve(root, 'apps/worker/src/worker.ts')));
check('apps/remotion exists', fs.existsSync(path.resolve(root, 'apps/remotion/src/Root.tsx')));
check('apps/web exists', fs.existsSync(path.resolve(root, 'apps/web/src/main.tsx')));
check('BGM dir exists', fs.existsSync(path.resolve(root, 'apps/api/storage/bgm')));
check('template_catalog.json exists', fs.existsSync(path.resolve(root, 'template_catalog.json')));

console.log('\nAI Vlog v13 Doctor\n');
for (const item of checks) {
  console.log(`${item.ok ? '✅' : '❌'} ${item.name}${item.detail ? ` — ${item.detail}` : ''}`);
}
const failed = checks.filter((item) => !item.ok);
console.log(`\n${failed.length ? `发现 ${failed.length} 个问题，请先修复。` : '基础文件检查通过。'}`);
if (failed.length) process.exit(1);
