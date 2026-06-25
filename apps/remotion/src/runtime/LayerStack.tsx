import React from 'react';
export const LayerStack: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', isolation: 'isolate' }}>{children}</div>
);
export const Layer: React.FC<{ z?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ z = 1, children, style }) => (
  <div style={{ position: 'absolute', inset: 0, zIndex: z, pointerEvents: 'none', ...style }}>{children}</div>
);
