import React from 'react';
import type { DirectorScene, VisualStabilityMode, VisualStyle, VisualStylePack } from '@ai-vlog/shared';
import { VerticalCropLayout } from './VerticalCropLayout';
import { BlurBackgroundLayout } from './BlurBackgroundLayout';
import { PhotoCardLayout } from './PhotoCardLayout';
import { PolaroidLayout } from './PolaroidLayout';
import { SplitScreenLayout } from './SplitScreenLayout';
import { MosaicGridLayout } from './MosaicGridLayout';
import { PictureInPictureLayout } from './PictureInPictureLayout';
import { FoodCardLayout } from './FoodCardLayout';
import { TravelPostcardLayout } from './TravelPostcardLayout';
import { RecCameraLayout } from './RecCameraLayout';
import { CinematicFrameLayout } from './CinematicFrameLayout';
import { SocialPostLayout } from './SocialPostLayout';
import { MemoryAlbumLayout } from './MemoryAlbumLayout';

export const LayoutEngine: React.FC<{
  scene: DirectorScene;
  children: React.ReactNode;
  background?: React.ReactNode;
  visualStyle?: VisualStyle;
  visualStylePack?: VisualStylePack;
  visualStabilityMode?: VisualStabilityMode;
}> = ({ scene, children, background, visualStyle = 'warm', visualStylePack, visualStabilityMode = 'stable' }) => {
  switch (scene.layout) {
    case 'blur_background': return <BlurBackgroundLayout background={background}>{children}</BlurBackgroundLayout>;
    case 'photo_card': return <PhotoCardLayout background={background} visualStyle={visualStyle} visualStylePack={visualStylePack}>{children}</PhotoCardLayout>;
    case 'polaroid': return <PolaroidLayout background={background} visualStabilityMode={visualStabilityMode}>{children}</PolaroidLayout>;
    case 'split_screen': return <SplitScreenLayout background={background}>{children}</SplitScreenLayout>;
    case 'mosaic_grid': return <MosaicGridLayout background={background}>{children}</MosaicGridLayout>;
    case 'picture_in_picture': return <PictureInPictureLayout background={background}>{children}</PictureInPictureLayout>;
    case 'food_card': return <FoodCardLayout background={background}>{children}</FoodCardLayout>;
    case 'travel_postcard': return <TravelPostcardLayout background={background}>{children}</TravelPostcardLayout>;
    case 'rec_camera': return <RecCameraLayout>{children}</RecCameraLayout>;
    case 'cinematic_frame': return <CinematicFrameLayout>{children}</CinematicFrameLayout>;
    case 'social_post': return <SocialPostLayout background={background}>{children}</SocialPostLayout>;
    case 'memory_album': return <MemoryAlbumLayout background={background}>{children}</MemoryAlbumLayout>;
    case 'vertical_crop':
    default: return <VerticalCropLayout>{children}</VerticalCropLayout>;
  }
};
