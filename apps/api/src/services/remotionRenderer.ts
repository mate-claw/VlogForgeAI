import fs from 'node:fs';
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import type { VlogRenderInput } from '@ai-vlog/shared';
import { config, rootDir } from '../config';
import { prepareStableRenderInput } from './renderProxyService';

export async function renderWithRemotion(params: {
  jobId: string;
  jobDir: string;
  input: VlogRenderInput;
  outputFileName?: string;
  renderMode?: 'preview' | 'final';
}): Promise<{ outputPath: string; renderLog: string[] }> {
  const outputFileName = params.outputFileName || 'final.mp4';
  const outputPath = path.resolve(params.jobDir, outputFileName);
  const inputPath = path.resolve(params.jobDir, `${path.basename(outputFileName, '.mp4')}-input.json`);
  fs.mkdirSync(params.jobDir, { recursive: true });
  const baseInput = { ...params.input, renderMode: params.renderMode || params.input.renderMode || 'final' };
  const prepared = await prepareStableRenderInput({ jobId: params.jobId, jobDir: params.jobDir, input: baseInput });
  const input = prepared.input;
  fs.writeFileSync(inputPath, JSON.stringify(input, null, 2), 'utf-8');

  const entryPoint = path.resolve(rootDir, 'apps/remotion/src/index.tsx');
  const renderLog: string[] = [];
  const log = (message: string) => {
    const line = `[remotion:${outputFileName}] ${message}`;
    renderLog.push(line);
    console.log(line);
  };

  if (!fs.existsSync(entryPoint)) {
    throw new Error(`Remotion entry 不存在：${entryPoint}`);
  }

  log(`entry=${entryPoint}`);
  log(`input=${inputPath}`);
  log(`output=${outputPath}`);
  log(`mode=${input.renderMode}`);
  log(`fpsNormalization=${JSON.stringify(prepared.report)}`);
  log(`composition=DynamicLifeVlog`);
  log(`codec=${config.renderCodec}`);

  try {
    const serveUrl = await bundle({
      entryPoint,
      onProgress: (progress) => log(`bundle ${Math.round(progress * 100)}%`),
      webpackOverride: (currentConfiguration) => currentConfiguration,
    });

    const composition = await selectComposition({
      serveUrl,
      id: 'DynamicLifeVlog',
      inputProps: input,
    });

    log(`durationInFrames=${composition.durationInFrames}, fps=${composition.fps}, ${composition.width}x${composition.height}`);

    await renderMedia({
      composition,
      serveUrl,
      codec: config.renderCodec as 'h264',
      outputLocation: outputPath,
      inputProps: input,
      onProgress: ({ progress }) => log(`render ${Math.round(progress * 100)}%`),
      overwrite: true,
      crf: input.renderMode === 'preview' ? 30 : 18,
    });

    if (!fs.existsSync(outputPath)) {
      throw new Error(`Remotion 渲染完成但没有找到输出文件：${outputPath}`);
    }
    return { outputPath, renderLog };
  } catch (error) {
    const detail = error instanceof Error ? `${error.message}\n${error.stack || ''}` : String(error);
    log(`failed=${detail}`);
    throw new Error(`Remotion 渲染失败：${detail}`);
  }
}
