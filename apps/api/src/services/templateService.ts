import fs from 'node:fs';
import path from 'node:path';
import type { TemplatePreset } from '@ai-vlog/shared';
import { rootDir } from '../config';
import { bgmCatalog } from './bgmCatalog';

type RawTemplate = {
  templateId: string;
  name: string;
  sceneIds?: string[];
  layout?: string;
  defaultTransitions?: string[];
  defaultStickers?: string[];
  defaultBgm?: string;
  style?: { color?: string; pace?: string; captionStyle?: string };
};

const variantMap: Record<string, TemplatePreset['remotionVariant']> = {
  template_warm: 'warm',
  template_rec_life: 'rec',
  template_food_daily: 'warm',
  template_kid_family: 'cute',
  template_food_mood: 'cinematic',
  template_dynamic_beat: 'beat',
  template_cinematic_travel: 'cinematic',
  template_summer_outdoor: 'cute',
  template_weekend_home: 'warm',
  template_city_daily: 'rec',
  template_pet_cute: 'cute',
  template_night_reflective: 'cinematic',
};

const descriptions: Record<string, string> = {
  template_warm: '适合家庭、日常、小确幸，画面温暖柔和。',
  template_rec_life: '带 REC 记录感，适合第一视角生活片段。',
  template_food_daily: '适合居家做饭、餐桌、咖啡等温暖日常。',
  template_kid_family: '适合孩子、亲子、明亮可爱的生活片段。',
  template_food_mood: '适合餐厅、咖啡馆、晚餐氛围。',
  template_dynamic_beat: '适合运动、城市、快节奏卡点。',
  template_cinematic_travel: '适合旅行、风景、路上片段，电影感。',
  template_summer_outdoor: '适合户外、公园、夏日阳光。',
  template_weekend_home: '适合周末、居家、慢生活。',
  template_city_daily: '适合街道、通勤、城市日常。',
  template_pet_cute: '适合宠物、可爱互动、治愈片段。',
  template_night_reflective: '适合夜晚回顾、安静治愈。',
};

export function listTemplates(): TemplatePreset[] {
  const catalogPath = path.resolve(rootDir, 'template_catalog.json');
  const raw = JSON.parse(fs.readFileSync(catalogPath, 'utf-8')) as RawTemplate[];
  return raw.map((item) => {
    const bgm = bgmCatalog.find((b) => b.id === item.defaultBgm);
    return {
      templateId: item.templateId,
      name: item.name,
      description: descriptions[item.templateId] || 'Remotion 竖屏生活 Vlog 模板。',
      sceneIds: item.sceneIds || [],
      remotionVariant: variantMap[item.templateId] || 'warm',
      defaultBgmId: item.defaultBgm || 'bgm_warm_memory_soft_72bpm_01',
      defaultBgmFileNames: bgm?.fileNames || [],
      transitions: item.defaultTransitions || ['crossfade'],
      stickers: item.defaultStickers || [],
      style: {
        color: item.style?.color || 'warm_realistic',
        pace: (item.style?.pace as TemplatePreset['style']['pace']) || 'medium',
        captionStyle: item.style?.captionStyle || 'warm_sentence',
      },
    } satisfies TemplatePreset;
  });
}

export function getTemplate(templateId: string): TemplatePreset {
  return listTemplates().find((tpl) => tpl.templateId === templateId) || listTemplates()[0];
}
