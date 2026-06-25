import React from 'react';
import type { TypographyDecision } from '@ai-vlog/shared';
export const DateCaption: React.FC<{ text: string; typography: TypographyDecision }> = ({ text, typography }) => <div style={{position:'absolute',left:64,top:126,fontFamily:typography.fontFamily,fontSize:26,fontWeight:700,color:'rgba(255,255,255,.86)',letterSpacing:2}}>{text}</div>;
