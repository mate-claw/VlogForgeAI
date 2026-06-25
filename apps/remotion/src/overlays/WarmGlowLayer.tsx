import React from 'react';
export const WarmGlowLayer: React.FC<{accent:string}> = ({accent}) => <div style={{position:'absolute',inset:0,background:`radial-gradient(circle at 35% 18%, ${accent}3d, transparent 38%), radial-gradient(circle at 85% 70%, rgba(255,170,90,.20), transparent 40%)`,mixBlendMode:'screen',pointerEvents:'none'}}/>;
