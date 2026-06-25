import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const kind = process.argv[2] || 'pet';
const dir = path.resolve(root, 'demo', kind);
fs.mkdirSync(dir, { recursive: true });

const palettes: Record<string, Array<[string,string,string]>> = {
  pet: [['宠物靠近', '#ff9acb', '#95d9ff'], ['可爱互动', '#ffe1a8', '#ff8fb5'], ['安静陪伴', '#7cc6a4', '#f4d3a1']],
  family: [['家庭开场', '#a66cff', '#ffd18c'], ['亲子互动', '#ff9aa2', '#ffe1a8'], ['晚餐时刻', '#b87950', '#ffd7a8']],
  city: [['城市路上', '#202334', '#7aa2ff'], ['光影经过', '#393e46', '#ffd369'], ['夜晚回看', '#0f172a', '#8b5cf6']],
};
const selected = palettes[kind] || palettes.pet;

function svg(label: string, a: string, b: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${a}"/><stop offset="100%" stop-color="${b}"/></linearGradient></defs>
    <rect width="1080" height="1920" fill="url(#g)"/>
    <circle cx="260" cy="380" r="180" fill="rgba(255,255,255,.22)"/>
    <circle cx="820" cy="1320" r="260" fill="rgba(255,255,255,.14)"/>
    <rect x="110" y="560" width="860" height="680" rx="70" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.45)" stroke-width="4"/>
    <text x="540" y="900" text-anchor="middle" font-family="Arial, Microsoft YaHei" font-size="86" font-weight="900" fill="white">${label}</text>
    <text x="540" y="1015" text-anchor="middle" font-family="Arial, Microsoft YaHei" font-size="36" fill="rgba(255,255,255,.82)">Demo素材 · 请替换成真实照片/视频</text>
  </svg>`;
}

selected.forEach(([label, a, b], i) => {
  fs.writeFileSync(path.resolve(dir, `${String(i + 1).padStart(2, '0')}-${label}.svg`), svg(label, a, b), 'utf-8');
});
console.log(`已生成 Demo 素材：${dir}`);
console.log('提示：这些是 SVG 占位图。真实商业测试请上传手机或 AI 硬件拍摄的 MP4/JPG/PNG。');
