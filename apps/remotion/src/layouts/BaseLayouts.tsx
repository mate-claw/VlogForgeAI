import React from 'react';
export const LayoutFrame: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; background?: React.ReactNode }> = ({ children, style, background }) => <>{background}<div style={{ position: 'absolute', overflow: 'hidden', ...style }}>{children}</div></>;
export const blurredBg = (background?: React.ReactNode, opacity = .72) => background ? <div style={{ position: 'absolute', inset: 0, filter: 'blur(34px)', transform: 'scale(1.18)', opacity }}>{background}</div> : null;
export const glassBorder = '1px solid rgba(255,255,255,.28)';
export const softShadow = '0 34px 120px rgba(0,0,0,.46)';
