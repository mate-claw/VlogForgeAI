import fs from 'node:fs';
import path from 'node:path';
import type { AiRuntimeOptions, AssetAnalysis, UploadedAsset } from '@ai-vlog/shared';
import { storageDir } from '../config';
import { analyzeAssetsWithQwen } from './qwenService';

const cacheDir = path.resolve(storageDir, 'analysis-cache');
fs.mkdirSync(cacheDir, { recursive: true });

function cachePath(hash: string, runtime?: AiRuntimeOptions) {
  const provider = runtime?.aiProvider || 'qwen';
  const lang = runtime?.language || 'zh';
  return path.resolve(cacheDir, `${hash}.${provider}.${lang}.json`);
}

function withCurrentAssetId(cached: AssetAnalysis, asset: UploadedAsset): AssetAnalysis {
  return { ...cached, assetId: asset.id };
}

export async function analyzeAssetsWithCache(assets: UploadedAsset[], jobDir: string, runtime?: AiRuntimeOptions): Promise<{ analyses: AssetAnalysis[]; cacheHits: number }> {
  const analyses: AssetAnalysis[] = [];
  let cacheHits = 0;

  for (const asset of assets) {
    const hash = asset.assetHash;
    if (hash) {
      const file = cachePath(hash, runtime);
      if (fs.existsSync(file)) {
        const cached = JSON.parse(fs.readFileSync(file, 'utf-8')) as AssetAnalysis;
        analyses.push(withCurrentAssetId(cached, asset));
        cacheHits += 1;
        continue;
      }
    }

    const singleDir = path.resolve(jobDir, 'analysis-frames', asset.id);
    const [analysis] = await analyzeAssetsWithQwen([asset], singleDir, runtime);
    analyses.push(analysis);
    if (hash) {
      const cacheable = { ...analysis, assetId: '__cached_asset__' };
      fs.writeFileSync(cachePath(hash, runtime), JSON.stringify(cacheable, null, 2), 'utf-8');
    }
  }

  return { analyses, cacheHits };
}
