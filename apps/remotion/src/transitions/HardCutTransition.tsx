import React from 'react';
import type { VisualStyle } from '@ai-vlog/shared';
export const HardCutTransition: React.FC<{ visualStyle: VisualStyle }> = ({ visualStyle }) => visualStyle === 'beat' ? <div style={{position:'absolute',inset:0,border:'8px solid rgba(255,255,255,.08)',pointerEvents:'none'}}/> : null;
