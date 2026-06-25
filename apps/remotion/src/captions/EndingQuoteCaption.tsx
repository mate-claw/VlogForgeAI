import React from 'react';
import { useTextEntrance } from './common';
import type { TypographyDecision } from '@ai-vlog/shared';
export const EndingQuoteCaption: React.FC<{ text: string; typography: TypographyDecision }> = ({ text, typography }) => { const enter=useTextEntrance('fade_up'); return <div style={{position:'absolute',left:80,right:80,bottom:210,textAlign:'center',fontFamily:typography.fontFamily,color:typography.textColor,fontSize:typography.captionFontSize+2,lineHeight:1.35,...enter}}>“{text}”</div>; };
