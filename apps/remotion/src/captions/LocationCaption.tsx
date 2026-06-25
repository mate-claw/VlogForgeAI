import React from 'react';
import type { TypographyDecision } from '@ai-vlog/shared';
export const LocationCaption: React.FC<{ text: string; typography: TypographyDecision }> = ({ text, typography }) => <div style={{position:'absolute',right:64,top:126,fontFamily:typography.fontFamily,fontSize:24,fontWeight:700,color:'rgba(255,255,255,.86)'}}>⌖ {text}</div>;
