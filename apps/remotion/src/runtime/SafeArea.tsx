import React from 'react';
export const SafeArea: React.FC<{ children: React.ReactNode; debug?: boolean }> = ({ children, debug }) => (
  <div style={{ position: 'absolute', inset: 52, border: debug ? '1px dashed rgba(255,255,255,.25)' : undefined, pointerEvents: 'none' }}>{children}</div>
);
