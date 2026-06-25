import React from 'react';
import type { DirectorScene, VlogPlan } from '@ai-vlog/shared';
import { MediaScene } from '../sceneRoles/MediaScene';
import { PetScene } from '../sceneRoles/PetScene';
import { FoodScene } from '../sceneRoles/FoodScene';
import { CityScene } from '../sceneRoles/CityScene';
import { TravelScene } from '../sceneRoles/TravelScene';
import { KidScene } from '../sceneRoles/KidScene';
import { NightScene } from '../sceneRoles/NightScene';
import { EmotionPeakScene } from '../sceneRoles/EmotionPeakScene';
import { FunnyMomentScene } from '../sceneRoles/FunnyMomentScene';
import { QuietMomentScene } from '../sceneRoles/QuietMomentScene';

export type SceneRendererProps = { scene: DirectorScene; plan: VlogPlan; index: number; durationFrames: number; progress: number };
export const SceneRenderer: React.FC<SceneRendererProps> = (props) => {
  const { scene } = props;
  if (scene.role === 'emotion_peak' || scene.role === 'highlight') return <EmotionPeakScene {...props} />;
  if (scene.role === 'funny') return <FunnyMomentScene {...props} />;
  if (scene.role === 'quiet') return <QuietMomentScene {...props} />;
  if (scene.role === 'pet' || scene.sceneType === 'pet') return <PetScene {...props} />;
  if (scene.role === 'food' || scene.sceneType === 'food') return <FoodScene {...props} />;
  if (scene.role === 'city' || scene.sceneType === 'city') return <CityScene {...props} />;
  if (scene.role === 'travel' || scene.sceneType === 'travel') return <TravelScene {...props} />;
  if (scene.role === 'kid' || scene.sceneType === 'kid') return <KidScene {...props} />;
  if (scene.role === 'night' || scene.sceneType === 'night') return <NightScene {...props} />;
  return <MediaScene {...props} />;
};
