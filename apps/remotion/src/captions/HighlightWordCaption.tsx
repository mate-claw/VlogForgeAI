import React from 'react';
import { captionShell, renderHighlight, useTextEntrance, type CaptionProps } from './common';
export const HighlightWordCaption: React.FC<CaptionProps> = ({ scene, typography, visualStyle }) => { const enter=useTextEntrance('pop'); return <div style={captionShell(typography, visualStyle, { ...enter, fontSize: typography.captionFontSize + 4, padding:'20px 28px', background:'rgba(0,0,0,.44)', borderRadius:24 })}>{renderHighlight(scene.caption,scene.highlightWords,typography.accentColor)}</div>; };
