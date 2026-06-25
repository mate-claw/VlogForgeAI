import fs from 'node:fs';
import path from 'node:path';
import type { BgmItem } from '@ai-vlog/shared';
import { bgmDir, publicUrlFor } from '../config';

// 只允许 AI 从这几个你提供的 BGM 候选里选。真实 MP3 文件请放到 apps/api/storage/bgm/。
export const bgmCatalog: BgmItem[] = [
  { id: 'bgm_warm_memory_soft_72bpm_01', title: '温馨回忆', fileNames: ['温馨回忆.mp3', '温暖回忆.mp3'], mood: '温暖、回忆、治愈、家庭、小确幸', bpm: 72, exists: false },
  { id: 'bgm_rec_life_lofi_88bpm_01', title: 'REC生活记录', fileNames: ['REC生活记录.mp3'], mood: '真实、记录、lofi、第一视角、日常', bpm: 88, exists: false },
  { id: 'bgm_kid_family_cute_95bpm_01', title: '萌娃亲子', fileNames: ['萌娃亲子.mp3'], mood: '可爱、亲子、孩子、明亮、家庭互动', bpm: 95, exists: false },
  { id: 'bgm_food_mood_jazz_82bpm_01', title: '餐厅氛围', fileNames: ['餐厅氛围.mp3'], mood: '餐厅、咖啡、用餐、爵士、松弛', bpm: 82, exists: false },
  { id: 'bgm_dynamic_vlog_122bpm_01', title: '动感卡点音乐', fileNames: ['动感卡点音乐.mp3'], mood: '动感、卡点、运动、快节奏、高光', bpm: 122, exists: false },
  { id: 'bgm_cinematic_travel_76bpm_01', title: '电影旅行音乐', fileNames: ['电影旅行音乐.mp3', '电影旅行.mp3'], mood: '电影感、旅行、风景、路上、辽阔', bpm: 76, exists: false },
  { id: 'bgm_summer_outdoor_100bpm_01', title: '夏日户外', fileNames: ['夏日户外.mp3'], mood: '明亮、户外、公园、夏日、清爽', bpm: 100, exists: false },
  { id: 'bgm_weekend_home_70bpm_01', title: '周末慢生活', fileNames: ['周末慢生活.mp3'], mood: '慢生活、居家、放松、安静、周末', bpm: 70, exists: false },
  { id: 'bgm_city_daily_105bpm_01', title: '城市日常', fileNames: ['城市日常.mp3'], mood: '城市、通勤、街道、现代、节奏', bpm: 105, exists: false },
  { id: 'bgm_pet_cute_96bpm_01', title: '宠物可爱', fileNames: ['宠物可爱.mp3'], mood: '宠物、可爱、轻快、治愈、互动', bpm: 96, exists: false },
  { id: 'bgm_night_reflective_68bpm_01', title: '夜晚回顾', fileNames: ['夜晚回顾.mp3'], mood: '夜晚、安静、回顾、独处、反思', bpm: 68, exists: false },
];

export function listBgms(): BgmItem[] {
  return bgmCatalog.map((item) => {
    const found = item.fileNames.find((fileName) => fs.existsSync(path.resolve(bgmDir, fileName)));
    return {
      ...item,
      exists: Boolean(found),
      url: found ? publicUrlFor(`storage/bgm/${encodeURIComponent(found)}`) : undefined,
    };
  });
}

export function getBgmById(bgmId?: string): BgmItem | undefined {
  if (!bgmId) return undefined;
  return listBgms().find((bgm) => bgm.id === bgmId);
}

export function resolveBgmUrl(bgmId?: string): string | undefined {
  return getBgmById(bgmId)?.url;
}
