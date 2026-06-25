import type { DirectorScene } from '@ai-vlog/shared';
export function mediaObjectFit(scene: DirectorScene) { return scene.layout === 'vertical_crop' || scene.layout === 'rec_camera' ? 'cover' : 'cover'; }
export function sourceStartFrame(scene: DirectorScene, fps: number) { return Math.max(0, Math.round((scene.sourceStart || 0) * fps)); }
